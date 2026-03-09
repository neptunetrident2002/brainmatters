"use client";

import { useState, useEffect, useRef } from "react";
import { generateTask, recordTaskType, getDifficultyTier, type GeneratedTask } from "@/lib/utils/taskgen";
import { llmCall } from "@/lib/utils/llm";
import { getCredits, spendCredits, earnCompletion, refreshIsFree, freeRefreshesRemaining, incrementRefreshCount } from "@/lib/utils/credits";
import { AuthGateModal, SpendModal } from "@/components/CreditModals";
import { createClient } from "@/lib/supabase/client";

const C = {
  orange:"#E8520A", orangeLight:"#FFF0E8", orangeDim:"#B84008",
  dark:"#1A1208", mid:"#5A4A2A", muted:"#8A7A5A",
  border:"#C8B89A", bg:"#F5F0E8", card:"#FFFEF9", cream:"#FAF6F0",
  success:"#2E7D32", successLight:"#E8F5E9",
  gold:"#c9a84c", goldDark:"#1a1a0d",
};

const TIER_BADGE: Record<string, { bg:string; text:string; label:string }> = {
  beginner:     { bg:"#E8F5E9", text:"#2E7D32", label:"Beginner" },
  intermediate: { bg:"#FFF3E0", text:"#E65100", label:"Intermediate" },
  advanced:     { bg:"#FCE4EC", text:"#880E4F", label:"Advanced" },
};

const TYPE_BADGE: Record<string, { bg:string; text:string }> = {
  writing: { bg:"#F3E5F5", text:"#6A1B9A" },
  recall:  { bg:"#E3F2FD", text:"#1565C0" },
  logic:   { bg:"#E8F5E9", text:"#1B5E20" },
};

interface Challenge {
  id: string; title: string; prompt: string; constraint: string;
  type: string; tier: string; timeLimit: number; evalType: string;
  whatGoodLooksLike: string; status: "pending"|"active"|"done";
  startedAt?: number; completedAt?: number; elapsed?: number;
}

function fromTask(task: GeneratedTask): Challenge {
  return {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    title: task.title, prompt: task.prompt, constraint: task.constraint,
    type: task.type, tier: task.tier, timeLimit: task.timeLimit,
    evalType: task.evalType, whatGoodLooksLike: task.whatGoodLooksLike, status: "pending",
  };
}

function saveChallenges(list: Challenge[]) { localStorage.setItem("ss_challenges", JSON.stringify(list)); }

function loadChallenges(): Challenge[] {
  try {
    const raw = localStorage.getItem("ss_challenges");
    if (!raw) return [];
    return (JSON.parse(raw) as Challenge[]).filter(c => c && c.id && c.title && c.prompt && c.status);
  } catch { return []; }
}

function loadHint(id: string): string|null { return localStorage.getItem(`ss_hint_${id}`); }
function saveHint(id: string, hint: string) { localStorage.setItem(`ss_hint_${id}`, hint); }

async function checkIsAuthed(): Promise<boolean> {
  try {
    const { data: { user } } = await createClient().auth.getUser();
    return !!user;
  } catch { return false; }
}

export default function ChallengesPage() {
  const [challenges,       setChallenges]       = useState<Challenge[]>([]);
  const [activeId,         setActiveId]         = useState<string|null>(null);
  const [elapsed,          setElapsed]          = useState(0);
  const [text,             setText]             = useState("");
  const [tooFast,          setTooFast]          = useState(false);
  const [credits,          setCredits]          = useState(0);
  const [seeding,          setSeeding]          = useState(false);
  const [generating,       setGenerating]       = useState(false);
  const [freeLeft,         setFreeLeft]         = useState(2);
  const [hintLoading,      setHintLoading]      = useState(false);
  const [hints,            setHints]            = useState<Record<string,string>>({});
  const [showAuthGate,     setShowAuthGate]     = useState(false);
  const [showHintModal,    setShowHintModal]    = useState(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const timerRef = useRef<any>(null);
  const [tier,   setTier]   = useState<string>("beginner");
  const [isFree, setIsFree] = useState<boolean>(true);

  useEffect(() => {
    setTier(getDifficultyTier());
    setIsFree(refreshIsFree());
    const { credits: c } = getCredits();
    setCredits(c);
    setFreeLeft(freeRefreshesRemaining());
    const saved = loadChallenges();
    const hintMap: Record<string,string> = {};
    saved.forEach(ch => { const h = loadHint(ch.id); if (h) hintMap[ch.id] = h; });
    setHints(hintMap);
    if (saved.length === 0) { localStorage.removeItem("ss_challenges"); seedChallenges(); }
    else setChallenges(saved);
  }, []);

  useEffect(() => {
    if (activeId) { timerRef.current = setInterval(() => setElapsed(e => e+1), 1000); }
    else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [activeId]);

  async function seedChallenges() {
    setSeeding(true);
    const types: Array<"writing"|"recall"|"logic"> = ["writing","recall","logic"];
    const seeded: Challenge[] = [];
    for (const type of types) {
      const task = await generateTask(type);
      const ch   = fromTask(task);
      const isDupe = seeded.some(c => c.title === ch.title);
      seeded.push(isDupe ? fromTask(await generateTask(type)) : ch);
    }
    setChallenges(seeded); saveChallenges(seeded); setSeeding(false);
  }

  async function handleSuggestClick() {
    if (refreshIsFree()) { await doGenerate(); return; }
    const authed = await checkIsAuthed();
    if (!authed) { setShowAuthGate(true); return; }
    if (credits < 1) return;
    setShowRefreshModal(true);
  }

  async function doGenerate() {
    setGenerating(true);
    incrementRefreshCount();
    setFreeLeft(freeRefreshesRemaining());
    setIsFree(refreshIsFree());
    const nc = fromTask(await generateTask());
    setChallenges(prev => { const u = [nc,...prev]; saveChallenges(u); return u; });
    setGenerating(false);
  }

  async function confirmRefreshSpend() {
    setShowRefreshModal(false);
    if (!spendCredits(1)) return;
    setCredits(c => c-1);
    await doGenerate();
  }

  async function handleHintClick() {
    const authed = await checkIsAuthed();
    if (!authed) { setShowAuthGate(true); return; }
    if (credits < 1) return;
    setShowHintModal(true);
  }

  async function confirmHintSpend() {
    setShowHintModal(false);
    const active = challenges.find(c => c.id === activeId);
    if (!active || !spendCredits(1)) return;
    setCredits(c => c-1);
    setHintLoading(true);
    try {
      const hint = await llmCall(
        "You give Socratic hints. Never give the answer. One nudge that helps the person think, not do. Max 2 sentences.",
        `Challenge: "${active.title}". Prompt: "${active.prompt}". Constraint: "${active.constraint}". Give one Socratic hint.`,
        120,
      );
      const h = hint.trim();
      saveHint(active.id, h);
      setHints(prev => ({ ...prev, [active.id]: h }));
    } catch {
      // Refund on failure
      const cur = parseInt(localStorage.getItem("ss_credits") ?? "0") + 1;
      localStorage.setItem("ss_credits", String(cur));
      setCredits(cur);
    }
    setHintLoading(false);
  }

  function startChallenge(id: string) {
    setChallenges(prev => {
      const u = prev.map(c => c.id===id ? {...c, status:"active" as const, startedAt:Date.now()} : c);
      saveChallenges(u); return u;
    });
    setActiveId(id); setElapsed(0); setText("");
  }

  function completeChallenge(id: string) {
    if (elapsed < 120) { setTooFast(true); return; }
    clearInterval(timerRef.current);
    const ch = challenges.find(c => c.id===id);
    if (ch) recordTaskType(ch.type as any);
    setChallenges(prev => {
      const u = prev.map(c => c.id===id ? {...c, status:"done" as const, completedAt:Date.now(), elapsed} : c);
      saveChallenges(u); return u;
    });
    setActiveId(null);
    const { state } = earnCompletion();
    setCredits(state.credits);
    const lastDone  = localStorage.getItem("ss_last_done_date");
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const streak    = parseInt(localStorage.getItem("ss_streak") ?? "0");
    localStorage.setItem("ss_streak", String(lastDone===yesterday.toDateString() ? streak+1 : 1));
    localStorage.setItem("ss_last_done_date", new Date().toDateString());
  }

  const fmt        = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const pending    = challenges.filter(c => c.status==="pending");
  const active     = challenges.find(c => c.id===activeId);
  const done       = challenges.filter(c => c.status==="done");
  const activeHint = active ? hints[active.id] : null;

  return (
    <div style={{ maxWidth:680, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:0 }}>Challenges</h2>
          <p style={{ color:C.muted, fontSize:13, margin:"4px 0 0" }}>Personalised · {TIER_BADGE[tier]?.label} tier</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
          <button onClick={handleSuggestClick} disabled={generating||(!isFree&&credits<1)}
            style={{ padding:"8px 16px", background:generating||(!isFree&&credits<1)?C.border:C.orange, border:"none", borderRadius:8, color:"white", fontSize:12, fontWeight:700, cursor:generating||(!isFree&&credits<1)?"not-allowed":"pointer" }}>
            {generating ? "Generating…" : isFree ? "+ New Challenge" : "+ New Challenge (1 ⚡)"}
          </button>
          {isFree && freeLeft > 0 && <span style={{ fontSize:10, color:C.muted }}>{freeLeft} free today</span>}
          {!isFree && credits < 1 && <span style={{ fontSize:10, color:C.muted }}>Complete challenges to earn credits</span>}
        </div>
      </div>

      {/* Tier */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
        <span style={{ padding:"3px 10px", background:TIER_BADGE[tier]?.bg, color:TIER_BADGE[tier]?.text, borderRadius:20, fontSize:11, fontWeight:700 }}>{TIER_BADGE[tier]?.label}</span>
        <span style={{ fontSize:12, color:C.muted }}>
          {tier==="beginner"&&"0–9 completions · clear scope"}{tier==="intermediate"&&"10–29 completions · tighter constraints"}{tier==="advanced"&&"30+ completions · compound constraints"}
        </span>
      </div>

      {/* Seeding */}
      {seeding && (
        <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:12, padding:32, textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:24, marginBottom:10 }}>⚙️</div>
          <p style={{ color:C.muted, fontSize:13, fontStyle:"italic", fontFamily:"Georgia, serif" }}>Building your first challenges…</p>
        </div>
      )}

      {/* Active challenge */}
      {active && (
        <div style={{ background:C.card, border:`2px solid ${C.orange}`, borderRadius:14, padding:24, marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <div style={{ display:"flex", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                <span style={{ padding:"2px 8px", background:TYPE_BADGE[active.type]?.bg, color:TYPE_BADGE[active.type]?.text, borderRadius:4, fontSize:10, fontWeight:700, textTransform:"uppercase" }}>{active.type}</span>
                <span style={{ padding:"2px 8px", background:TIER_BADGE[active.tier]?.bg, color:TIER_BADGE[active.tier]?.text, borderRadius:4, fontSize:10, fontWeight:700 }}>{TIER_BADGE[active.tier]?.label}</span>
              </div>
              <h3 style={{ fontSize:17, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:0 }}>{active.title}</h3>
            </div>
            <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
              <div style={{ fontSize:20, fontWeight:700, color:elapsed>=120?C.success:C.orange, fontFamily:"Georgia, serif" }}>{fmt(elapsed)}</div>
              <div style={{ fontSize:10, color:C.muted }}>{elapsed>=120?"ready":"min 2:00"}</div>
            </div>
          </div>

          <p style={{ fontSize:13, color:C.mid, lineHeight:1.75, margin:"0 0 10px" }}>{active.prompt}</p>

          <div style={{ padding:"7px 12px", background:"#1a1a0d", border:`1.5px solid #8a6f2e`, borderRadius:6, marginBottom:14 }}>
            <span style={{ fontSize:10, color:"#c9a84c", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Constraint · </span>
            <span style={{ fontSize:12, color:"#f0e8c0" }}>{active.constraint}</span>
          </div>

          {/* Hint area */}
          {hintLoading && (
            <div style={{ padding:"10px 14px", background:C.goldDark, border:`1.5px solid ${C.gold}`, borderRadius:8, marginBottom:14 }}>
              <p style={{ fontSize:12, color:C.gold, margin:0, fontStyle:"italic" }}>Getting your hint…</p>
            </div>
          )}
          {!hintLoading && activeHint && (
            <div style={{ padding:"10px 14px", background:C.goldDark, border:`1.5px solid ${C.gold}`, borderRadius:8, marginBottom:14 }}>
              <div style={{ fontSize:9, color:C.gold, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:5 }}>Hint ⚡</div>
              <p style={{ fontSize:13, color:"#f0e8c0", margin:0, lineHeight:1.7, fontFamily:"Georgia, serif", fontStyle:"italic" }}>{activeHint}</p>
            </div>
          )}
          {!hintLoading && !activeHint && (
            <div style={{ marginBottom:14 }}>
              <button onClick={handleHintClick} disabled={credits<1}
                title={credits<1?"Earn credits by completing challenges":"Spend 1 credit for a Socratic hint"}
                style={{ padding:"6px 14px", background:"transparent", border:`1.5px solid ${credits>=1?C.gold:C.border}`, borderRadius:7, color:credits>=1?C.gold:C.muted, fontSize:11, fontWeight:700, cursor:credits>=1?"pointer":"not-allowed" }}>
                Get hint ⚡ · 1 credit
              </button>
              {credits<1 && <span style={{ fontSize:10, color:C.muted, marginLeft:8 }}>Complete challenges to earn credits</span>}
            </div>
          )}

          <textarea value={text} onChange={e=>setText(e.target.value)}
            placeholder="Work through it here. No AI, no lookup — just you."
            style={{ width:"100%", minHeight:120, padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.dark, background:C.bg, fontFamily:"Georgia, serif", outline:"none", resize:"vertical", lineHeight:1.75, boxSizing:"border-box", marginBottom:12 }}/>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
            <span style={{ fontSize:11, color:C.muted }}>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { setActiveId(null); setChallenges(prev => { const u=prev.map(c=>c.id===active.id?{...c,status:"pending" as const}:c); saveChallenges(u); return u; }); }}
                style={{ padding:"8px 14px", background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:7, color:C.mid, fontSize:11, fontWeight:700, cursor:"pointer" }}>Pause</button>
              <button onClick={()=>completeChallenge(active.id)}
                style={{ padding:"8px 20px", background:C.success, border:"none", borderRadius:7, color:"white", fontSize:12, fontWeight:700, cursor:"pointer" }}>Mark Complete ✓</button>
            </div>
          </div>
          {active.whatGoodLooksLike && <p style={{ fontSize:11, color:C.muted, marginTop:10, fontStyle:"italic" }}>What good looks like: {active.whatGoodLooksLike}</p>}
        </div>
      )}

      {/* Pending */}
      {!seeding && pending.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase", margin:"0 0 10px" }}>Your Challenges ({pending.length})</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {pending.map(c => (
              <div key={c.id} style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                      <span style={{ padding:"2px 8px", background:TYPE_BADGE[c.type]?.bg, color:TYPE_BADGE[c.type]?.text, borderRadius:4, fontSize:10, fontWeight:700, textTransform:"uppercase" }}>{c.type}</span>
                      <span style={{ padding:"2px 8px", background:TIER_BADGE[c.tier]?.bg, color:TIER_BADGE[c.tier]?.text, borderRadius:4, fontSize:10, fontWeight:700 }}>{TIER_BADGE[c.tier]?.label}</span>
                      <span style={{ fontSize:10, color:C.muted, padding:"2px 0" }}>{Math.floor(c.timeLimit/60)}m</span>
                    </div>
                    <h4 style={{ fontSize:14, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:"0 0 4px" }}>{c.title}</h4>
                    <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.6 }}>{(c.prompt??"").slice(0,120)}{(c.prompt??"").length>120?"…":""}</p>
                  </div>
                  <button onClick={()=>startChallenge(c.id)} disabled={!!activeId}
                    style={{ padding:"7px 16px", background:activeId?C.border:C.dark, border:"none", borderRadius:7, color:C.cream, fontSize:11, fontWeight:700, cursor:activeId?"not-allowed":"pointer", flexShrink:0 }}>
                    Start →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div>
          <h3 style={{ fontSize:13, fontWeight:700, color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase", margin:"0 0 10px" }}>Completed ({done.length})</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {done.slice().reverse().map(c => (
              <div key={c.id} style={{ background:C.successLight, border:`1.5px solid ${C.success}`, borderRadius:10, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ display:"flex", gap:6, marginBottom:3 }}>
                    <span style={{ padding:"1px 7px", background:TYPE_BADGE[c.type]?.bg, color:TYPE_BADGE[c.type]?.text, borderRadius:3, fontSize:9, fontWeight:700, textTransform:"uppercase" }}>{c.type}</span>
                    <span style={{ padding:"1px 7px", background:TIER_BADGE[c.tier]?.bg, color:TIER_BADGE[c.tier]?.text, borderRadius:3, fontSize:9, fontWeight:700 }}>{c.tier}</span>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:C.success, fontFamily:"Georgia, serif" }}>{c.title}</span>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.success }}>✓ {c.elapsed?fmt(c.elapsed):"done"}</div>
                  <div style={{ fontSize:10, color:C.muted }}>+1 progress</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tooFast && (
        <div style={{ position:"fixed", inset:0, background:"rgba(26,18,8,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20 }}>
          <div style={{ background:C.card, border:`2px solid ${C.border}`, borderRadius:16, padding:28, maxWidth:340, width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>⏳</div>
            <h3 style={{ fontFamily:"Georgia, serif", color:C.dark, margin:"0 0 8px", fontSize:18 }}>Too fast.</h3>
            <p style={{ color:C.mid, fontSize:13, lineHeight:1.65, margin:"0 0 20px" }}>Minimum 2 minutes required. The resistance is the point.</p>
            <button onClick={()=>setTooFast(false)} style={{ padding:"9px 24px", background:C.dark, border:"none", borderRadius:8, color:C.cream, fontSize:12, fontWeight:700, cursor:"pointer" }}>Back to work</button>
          </div>
        </div>
      )}
      {showAuthGate    && <AuthGateModal credits={credits} onDismiss={()=>setShowAuthGate(false)} />}
      {showHintModal   && <SpendModal icon="💡" title="Get a hint?" description="One Socratic nudge — not the answer. Helps you think, not do." cost={1} credits={credits} confirmLabel="Yes, spend 1 credit" onConfirm={confirmHintSpend} onCancel={()=>setShowHintModal(false)} />}
      {showRefreshModal && <SpendModal icon="✦" title="Generate new challenge?" description="You\'ve used your 2 free refreshes today. Spend 1 credit for another." cost={1} credits={credits} confirmLabel="Generate it" onConfirm={confirmRefreshSpend} onCancel={()=>setShowRefreshModal(false)} />}
    </div>
  );
}