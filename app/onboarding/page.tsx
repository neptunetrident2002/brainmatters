"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCredits } from "@/lib/utils/credits";

const C = {
  orange:"#E8520A", orangeLight:"#FFF0E8", orangeDim:"#B84008",
  dark:"#1A1208", mid:"#5A4A2A", muted:"#8A7A5A",
  border:"#C8B89A", bg:"#F5F0E8", card:"#FFFEF9", cream:"#FAF6F0",
  success:"#2E7D32",
};

const AI_BEHAVIORS = [
  "Write or rewrite my emails / messages",
  "Explain a concept I don't fully understand",
  "Debug or fix my code",
  "Summarize a document or article",
  "Help me make a decision",
  "Draft content — posts, reports, proposals",
  "Search for information I should probably know",
  "Proofread or improve my writing",
  "Break down a complex problem",
  "Generate ideas when I'm stuck",
  "Do mental math or quick calculations",
  "Write code I could figure out myself",
  "Plan or structure my thinking",
  "Answer questions I haven't tried to answer first",
];

const RUSTY_SKILLS = [
  "Writing from scratch",
  "Problem solving step by step",
  "Memory and recall",
  "Critical thinking",
  "Making decisions confidently",
  "Spelling and grammar",
  "Mental math",
  "All of it, honestly",
];

const TIME_OPTIONS = [
  { value: 5,  label: "5 min",  desc: "Quick hits on busy days" },
  { value: 15, label: "15 min", desc: "Focused sessions" },
  { value: 30, label: "30 min", desc: "Deep work" },
];

const STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();

  // Core state — one declaration each, no duplicates
  const [step,          setStep]          = useState(0);
  const [saving,        setSaving]        = useState(false);
  const [lastQuery,     setLastQuery]     = useState("");
  const [behaviors,     setBehaviors]     = useState<string[]>([]);
  const [rustySkill,    setRustySkill]    = useState("");
  const [timeLimit,     setTimeLimit]     = useState<number|null>(null);
  const [recentPrompts, setRecentPrompts] = useState("");

  // Step 5 — optional account creation
  const [authEmail,    setAuthEmail]    = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError,    setAuthError]    = useState("");
  const [authLoading,  setAuthLoading]  = useState(false);

  function toggleBehavior(b: string) {
    setBehaviors(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  }

  function canAdvance() {
    if (step === 0) return lastQuery.trim().length > 10;
    if (step === 1) return behaviors.length > 0;
    if (step === 2) return rustySkill !== "";
    if (step === 3) return timeLimit !== null;
    if (step === 4) return true; // optional step
    return false;
  }

  async function finish() {
    setSaving(true);
    const profile = {
      lastQuery:     lastQuery.trim(),
      behaviors,
      rustySkill,
      timeLimit,
      recentPrompts: recentPrompts.trim(),
      createdAt:     new Date().toISOString(),
    };
    localStorage.setItem("ss_profile",         JSON.stringify(profile));
    localStorage.setItem("ss_onboarding_done", "true");
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    setStep(5); // advance to optional auth step
  }

  async function handleSignUp() {
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Please enter an email and password."); return;
    }
    setAuthLoading(true); setAuthError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email:    authEmail.trim(),
      password: authPassword.trim(),
    });
    if (error) { setAuthError(error.message); setAuthLoading(false); return; }
    if (data.user) {
      const { credits } = getCredits();
      try {
        await supabase.from("users").upsert({
          id:         data.user.id,
          email:      data.user.email,
          credits,
          created_at: new Date().toISOString(),
        });
      } catch {}
    }
    router.push("/feed");
  }

  function skipAuth() {
    router.push("/feed");
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Georgia, serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>

      {/* Logo */}
      <div style={{ marginBottom:32, textAlign:"center" }}>
        <span style={{ fontSize:22, fontWeight:700, color:C.orange, letterSpacing:"-0.02em" }}>BrainMatters</span>
        <p style={{ fontSize:12, color:C.muted, margin:"4px 0 0", letterSpacing:"0.06em" }}>Train Your Brain. Earn Your AI.</p>
      </div>

      {/* Progress bar */}
      <div style={{ width:"100%", maxWidth:520, marginBottom:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:11, color:C.muted }}>{step < 5 ? `Step ${step+1} of 5` : "Almost done"}</span>
          <span style={{ fontSize:11, color:C.muted }}>{step < 5 ? `${Math.round((step/5)*100)}% complete` : "Save your progress"}</span>
        </div>
        <div style={{ height:3, background:C.border, borderRadius:2 }}>
          <div style={{ height:"100%", width:`${step < 5 ? ((step+1)/5)*100 : 100}%`, background:C.orange, borderRadius:2, transition:"width 0.4s" }}/>
        </div>
      </div>

      {/* Card */}
      <div style={{ width:"100%", maxWidth:520, background:C.card, border:`1.5px solid ${C.border}`, borderRadius:16, padding:"28px 28px 24px" }}>

        {/* Step 0 */}
        {step===0 && (
          <div>
            <StepLabel>The last 24 hours</StepLabel>
            <h2 style={QStyle}>What's the last thing you asked AI to do that you could have done yourself?</h2>
            <p style={HintStyle}>Be specific. "Write a reply to my manager about the deadline" is better than "writing."</p>
            <textarea
              value={lastQuery}
              onChange={e => setLastQuery(e.target.value)}
              placeholder="e.g. Wrote a cold email to a potential client because I didn't want to think about the wording..."
              style={{ width:"100%", minHeight:110, padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.dark, background:C.bg, fontFamily:"Georgia, serif", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }}
              autoFocus
            />
            <p style={{ fontSize:11, color:C.muted, marginTop:6 }}>{lastQuery.trim().length}/10 characters minimum</p>
          </div>
        )}

        {/* Step 1 */}
        {step===1 && (
          <div>
            <StepLabel>Your dependency pattern</StepLabel>
            <h2 style={QStyle}>Which of these do you ask AI to do at least once a week?</h2>
            <p style={HintStyle}>Select all that apply. Honesty here makes your training actually useful.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:340, overflowY:"auto", paddingRight:4 }}>
              {AI_BEHAVIORS.map(b => {
                const selected = behaviors.includes(b);
                return (
                  <button key={b} onClick={() => toggleBehavior(b)} style={{ padding:"10px 14px", border:`1.5px solid ${selected?C.orange:C.border}`, borderRadius:8, background:selected?C.orangeLight:"white", color:selected?C.orangeDim:C.mid, fontSize:13, cursor:"pointer", textAlign:"left", fontFamily:"Georgia, serif", transition:"all 0.15s", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ width:16, height:16, borderRadius:4, border:`2px solid ${selected?C.orange:C.border}`, background:selected?C.orange:"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {selected && <span style={{ color:"white", fontSize:10, fontWeight:700 }}>✓</span>}
                    </span>
                    {b}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize:11, color:C.orange, marginTop:8, fontWeight:700 }}>{behaviors.length} selected</p>
          </div>
        )}

        {/* Step 2 */}
        {step===2 && (
          <div>
            <StepLabel>The honest question</StepLabel>
            <h2 style={QStyle}>Is there something you used to be able to do without help that you now reach for AI to do?</h2>
            <p style={HintStyle}>This becomes your primary training focus. The thing you're working to reclaim.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {RUSTY_SKILLS.map(s => {
                const selected = rustySkill === s;
                return (
                  <button key={s} onClick={() => setRustySkill(s)} style={{ padding:"12px 16px", border:`1.5px solid ${selected?C.orange:C.border}`, borderRadius:8, background:selected?C.orangeLight:"white", color:selected?C.orangeDim:C.mid, fontSize:13, cursor:"pointer", textAlign:"left", fontFamily:"Georgia, serif", transition:"all 0.15s", fontWeight:selected?700:400 }}>
                    {selected ? "→ " : ""}{s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step===3 && (
          <div>
            <StepLabel>Your commitment</StepLabel>
            <h2 style={QStyle}>How much time can you give to a single challenge?</h2>
            <p style={HintStyle}>This shapes the format of your tasks — not just the difficulty. Be realistic.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {TIME_OPTIONS.map(({ value, label, desc }) => {
                const selected = timeLimit === value;
                return (
                  <button key={value} onClick={() => setTimeLimit(value)} style={{ padding:"16px 20px", border:`2px solid ${selected?C.orange:C.border}`, borderRadius:10, background:selected?C.orangeLight:"white", cursor:"pointer", textAlign:"left", fontFamily:"Georgia, serif", transition:"all 0.15s", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <span style={{ fontSize:16, fontWeight:700, color:selected?C.orange:C.dark }}>{label}</span>
                      <span style={{ fontSize:12, color:C.muted, marginLeft:10 }}>{desc}</span>
                    </div>
                    {selected && <span style={{ color:C.orange, fontSize:18 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step===4 && (
          <div>
            <StepLabel>Optional — but powerful</StepLabel>
            <h2 style={QStyle}>Paste your 3 most recent AI prompts here.</h2>
            <p style={HintStyle}>This is the single biggest quality jump for your tasks. Copy them from ChatGPT, Claude, or wherever. Processed locally — never stored on our servers.</p>
            <div style={{ padding:"10px 14px", background:"#0d1a0d", border:`1.5px solid ${C.success}`, borderRadius:8, marginBottom:12 }}>
              <p style={{ fontSize:11, color:"#c0e0c0", margin:0, lineHeight:1.7 }}>
                Your prompts are processed in your browser only. We extract patterns, not content. Nothing leaves your device raw.
              </p>
            </div>
            <textarea
              value={recentPrompts}
              onChange={e => setRecentPrompts(e.target.value)}
              placeholder={"Prompt 1: Write a LinkedIn post about our product launch...\nPrompt 2: Explain why my React component isn't re-rendering...\nPrompt 3: Summarise this article for me..."}
              style={{ width:"100%", minHeight:140, padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.dark, background:C.bg, fontFamily:"Georgia, serif", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }}
            />
            <p style={{ fontSize:12, color:C.muted, marginTop:8, fontStyle:"italic" }}>
              Skip this and your tasks will still be personalised — just less precisely. You can always add this later in Settings.
            </p>
          </div>
        )}

        {/* Step 5 — optional account creation */}
        {step===5 && (
          <div>
            <StepLabel>Optional — but worth it</StepLabel>
            <h2 style={QStyle}>Save your progress.</h2>
            <p style={HintStyle}>
              Your profile and credits live in this browser right now. Create a free account to keep them safe across devices — and to unlock credit spending.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
              <input
                type="email"
                value={authEmail}
                onChange={e => { setAuthEmail(e.target.value); setAuthError(""); }}
                placeholder="Email"
                style={{ padding:"11px 14px", border:`1.5px solid ${authError?C.orange:C.border}`, borderRadius:8, fontSize:13, color:C.dark, background:C.bg, fontFamily:"Georgia, serif", outline:"none" }}
              />
              <input
                type="password"
                value={authPassword}
                onChange={e => { setAuthPassword(e.target.value); setAuthError(""); }}
                placeholder="Password (min 6 characters)"
                style={{ padding:"11px 14px", border:`1.5px solid ${authError?C.orange:C.border}`, borderRadius:8, fontSize:13, color:C.dark, background:C.bg, fontFamily:"Georgia, serif", outline:"none" }}
              />
              {authError && <p style={{ fontSize:12, color:C.orange, margin:0, fontWeight:600 }}>{authError}</p>}
            </div>
            <button
              onClick={handleSignUp}
              disabled={authLoading || !authEmail.trim() || !authPassword.trim()}
              style={{ width:"100%", padding:"11px", background:authLoading||!authEmail.trim()||!authPassword.trim()?C.border:C.dark, border:"none", borderRadius:9, color:C.cream, fontSize:13, fontWeight:700, cursor:authLoading||!authEmail.trim()||!authPassword.trim()?"not-allowed":"pointer", fontFamily:"Georgia, serif", marginBottom:10 }}
            >
              {authLoading ? "Creating account..." : "Create free account →"}
            </button>
            <button
              onClick={skipAuth}
              style={{ width:"100%", padding:"10px", background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:9, color:C.muted, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Georgia, serif" }}
            >
              Skip for now — continue without account
            </button>
            <p style={{ fontSize:11, color:C.muted, marginTop:12, textAlign:"center", lineHeight:1.6 }}>
              Already have an account? <a href="/login" style={{ color:C.orange, textDecoration:"none", fontWeight:700 }}>Sign in →</a>
            </p>
          </div>
        )}

        {/* Nav — hidden on step 5 which has its own buttons */}
        {step < 5 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:24 }}>
            {step > 0
              ? <button onClick={() => setStep(s => s-1)} style={{ background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"9px 18px", color:C.mid, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Georgia, serif" }}>← Back</button>
              : <div/>
            }
            {step < 4 && (
              <button onClick={() => setStep(s => s+1)} disabled={!canAdvance()} style={{ padding:"10px 24px", background:canAdvance()?C.dark:C.border, border:"none", borderRadius:8, color:C.cream, fontSize:13, fontWeight:700, cursor:canAdvance()?"pointer":"not-allowed", fontFamily:"Georgia, serif", transition:"background 0.2s" }}>
                Continue →
              </button>
            )}
            {step === 4 && (
              <button onClick={finish} disabled={saving} style={{ padding:"10px 28px", background:saving?C.muted:C.orange, border:"none", borderRadius:8, color:"white", fontSize:13, fontWeight:700, cursor:saving?"not-allowed":"pointer", fontFamily:"Georgia, serif", transition:"background 0.2s" }}>
                {saving ? "Building your profile..." : "Start Training →"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={{ fontSize:11, color:C.muted, marginTop:20, textAlign:"center", maxWidth:400, lineHeight:1.7 }}>
        No account needed. Your profile stays in your browser until you choose to create one.
      </p>
    </div>
  );
}

function StepLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize:10, color:C.orange, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", margin:"0 0 8px" }}>{children}</p>;
}

const QStyle: React.CSSProperties = {
  fontSize:18, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif",
  margin:"0 0 8px", lineHeight:1.4,
};

const HintStyle: React.CSSProperties = {
  fontSize:12, color:C.muted, margin:"0 0 16px", lineHeight:1.65,
};