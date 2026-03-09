"use client";

import { useState, useEffect, useRef } from "react";
import { llmCall } from "@/lib/utils/llm";
import { getCredits, spendCredits } from "@/lib/utils/credits";
import { AuthGateModal, SpendModal } from "@/components/CreditModals";
import { createClient } from "@/lib/supabase/client";

async function checkIsAuthed(): Promise<boolean> {
  try { const { data: { user } } = await createClient().auth.getUser(); return !!user; }
  catch { return false; }
}

const C = {
  orange:"#E8520A", orangeLight:"#FFF0E8", dark:"#1A1208", mid:"#5A4A2A",
  muted:"#8A7A5A", border:"#C8B89A", bg:"#F5F0E8", card:"#FFFEF9",
  cream:"#FAF6F0", success:"#2E7D32", successLight:"#E8F5E9",
  gold:"#c9a84c", goldDark:"#1a1a0d",
};

interface JournalEntry {
  id:        string;
  date:      string;
  dateISO:   string;
  prompt:    string;
  response:  string;
  wordCount: number;
  savedAt:   string;
}

interface MonthlySynthesis {
  monthKey:  string;
  text:      string;
  entryIds:  string[];
  createdAt: string;
}

const PROMPTS = [
  "What did you almost give up on today — and what made you keep going?",
  "What's something you know but still can't explain clearly?",
  "What decision are you avoiding? What's actually stopping you?",
  "Describe the last time you felt genuinely absorbed in something. What was different about that?",
  "What have you changed your mind about recently? What shifted?",
  "What are you pretending not to know?",
  "Where did your attention keep going today when you didn't want it to?",
  "What's the most honest thing you could say about how you spent today?",
  "What would you do differently if no one was watching or judging?",
  "What's something you've been meaning to think through that you keep putting off?",
  "What bothers you that you haven't admitted bothers you?",
  "Describe a small thing that went right today. Why did it go right?",
  "What are you most uncertain about right now? Sit with it.",
  "Who are you being when you're at your best? What does that version of you do differently?",
  "What's a belief you hold that you've never really tested?",
  "What have you been consuming without creating anything in return?",
  "What's draining you that you haven't named yet?",
  "What would you tell yourself six months ago?",
  "What's something hard you've been doing quietly, without recognition?",
  "Where are you being too careful? Where are you not being careful enough?",
  "What's something you learned recently that changed how you see something else?",
  "What have you been waiting for permission to do?",
  "What do you keep almost saying but don't?",
  "Describe a moment this week when you felt out of your depth. What did you do with that?",
  "What are you building, slowly, that most people can't see yet?",
  "What's the gap between who you're trying to be and who you've been this week?",
  "What would it look like to take your own thinking seriously today?",
  "What's one thing you want to remember about this period of your life?",
];

function getDailyPrompt(): string {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((Date.now() - start) / 86400000);
  return PROMPTS[dayOfYear % PROMPTS.length];
}

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem("ss_journal");
    if (!raw) return [];
    return (JSON.parse(raw) as JournalEntry[]).sort(
      (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    );
  } catch { return []; }
}

function saveEntry(entry: JournalEntry): void {
  const entries = loadEntries().filter(e => e.id !== entry.id);
  localStorage.setItem("ss_journal", JSON.stringify([entry, ...entries]));
}

function deleteEntry(id: string): void {
  localStorage.setItem("ss_journal", JSON.stringify(loadEntries().filter(e => e.id !== id)));
}

function loadSyntheses(): MonthlySynthesis[] {
  try {
    const raw = localStorage.getItem("ss_monthly_synthesis");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSynthesis(s: MonthlySynthesis): void {
  const all = loadSyntheses().filter(x => x.monthKey !== s.monthKey);
  localStorage.setItem("ss_monthly_synthesis", JSON.stringify([s, ...all]));
}

function todayKey(): string { return new Date().toDateString(); }
function wc(text: string): number { return text.trim().split(/\s+/).filter(Boolean).length; }
function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short", year:"numeric" });
}

async function generateSynthesis(entries: JournalEntry[]): Promise<string> {
  const body = entries.slice(0, 8).map((e, i) =>
    `Entry ${i + 1} (${e.date}):\nPrompt: "${e.prompt}"\nResponse: "${e.response}"`
  ).join("\n\n---\n\n");
  try {
    return await llmCall(
      `You read someone's private journal and reflect back what you notice. Not analysis, not advice — honest observation. Like a trusted friend who pays attention. Write in second person, past tense. Reference what they actually wrote. No flattery. No bullet points. 3-4 sentences only. Quiet, not dramatic.`,
      `Here are ${entries.length} journal entries:\n\n${body}\n\nWhat do you notice?`,
      300,
    );
  } catch {
    return "Synthesis unavailable right now. Your entries are safe and saved locally.";
  }
}

// ─── Write entry ──────────────────────────────────────────────────────────────

function WriteEntry({ prompt, existing, onSave }: {
  prompt: string; existing: JournalEntry | null; onSave: (e: JournalEntry) => void;
}) {
  const [text,    setText]    = useState(existing?.response ?? "");
  const [saved,   setSaved]   = useState(!!existing);
  const [saving,  setSaving]  = useState(false);
  const [editing, setEditing] = useState(!existing);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    const entry: JournalEntry = {
      id:        existing?.id ?? `j_${Date.now()}`,
      date:      todayKey(),
      dateISO:   new Date().toISOString(),
      prompt,
      response:  text.trim(),
      wordCount: wc(text),
      savedAt:   new Date().toISOString(),
    };
    saveEntry(entry);
    onSave(entry);
    setSaved(true);
    setEditing(false);
    setSaving(false);
  }

  if (saved && !editing) {
    return (
      <div style={{ background:C.card, border:`2px solid ${C.border}`, borderRadius:14, padding:24, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:10, color:C.orange, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>
              Today · {new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"short" })}
            </div>
            <p style={{ fontSize:13, color:C.muted, fontStyle:"italic", margin:0, lineHeight:1.7 }}>"{prompt}"</p>
          </div>
          <button onClick={() => setEditing(true)} style={{ fontSize:11, color:C.muted, background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:6, padding:"4px 10px", cursor:"pointer", flexShrink:0, marginLeft:12 }}>
            Edit
          </button>
        </div>
        <div style={{ padding:"14px 16px", background:C.bg, borderRadius:10, borderLeft:`3px solid ${C.orange}` }}>
          <p style={{ fontSize:14, color:C.dark, margin:0, lineHeight:1.85, fontFamily:"Georgia, serif", whiteSpace:"pre-wrap" }}>{text}</p>
        </div>
        <div style={{ fontSize:11, color:C.muted, marginTop:8, textAlign:"right" }}>{wc(text)} words</div>
      </div>
    );
  }

  return (
    <div style={{ background:C.card, border:`2px solid ${C.orange}`, borderRadius:14, padding:24, marginBottom:20 }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:10, color:C.orange, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>
          {editing && existing ? "Editing today's entry" : new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"short" })}
        </div>
        <p style={{ fontSize:16, color:C.dark, fontFamily:"Georgia, serif", margin:0, lineHeight:1.75, fontStyle:"italic" }}>
          "{prompt}"
        </p>
      </div>
      <textarea
        ref={ref}
        value={text}
        onChange={e => { setText(e.target.value); setSaved(false); }}
        placeholder="Start writing. This is private — just for you."
        style={{ width:"100%", minHeight:200, padding:"14px 16px", border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:14, color:C.dark, background:C.bg, fontFamily:"Georgia, serif", lineHeight:1.85, outline:"none", resize:"vertical", boxSizing:"border-box", marginBottom:12 }}
      />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:11, color:C.muted }}>{wc(text)} words</span>
          {editing && existing && (
            <button onClick={() => { setEditing(false); setText(existing.response); }} style={{ fontSize:11, color:C.muted, background:"transparent", border:"none", cursor:"pointer", padding:0, textDecoration:"underline" }}>
              Cancel
            </button>
          )}
        </div>
        <button onClick={handleSave} disabled={!text.trim() || saving} style={{ padding:"9px 22px", background:text.trim() && !saving ? C.dark : C.border, border:"none", borderRadius:8, color:C.cream, fontSize:12, fontWeight:700, cursor:text.trim() && !saving ? "pointer" : "not-allowed", fontFamily:"Georgia, serif" }}>
          {saving ? "Saving…" : "Save entry"}
        </button>
      </div>
      <p style={{ fontSize:11, color:C.muted, margin:"10px 0 0", fontStyle:"italic" }}>
        Private. Stored only on this device. Never sent anywhere.
      </p>
    </div>
  );
}

// ─── Past entry ───────────────────────────────────────────────────────────────

function PastEntry({ entry, onDelete }: { entry: JournalEntry; onDelete: (id: string) => void }) {
  const [expanded, setExpanded]             = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(false);

  return (
    <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:12, overflow:"hidden", marginBottom:8 }}>
      <button onClick={() => setExpanded(e => !e)} style={{ width:"100%", padding:"14px 18px", background:"transparent", border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", textAlign:"left" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:3 }}>{fmtDate(entry.dateISO)}</div>
          <p style={{ fontSize:13, color:C.mid, fontStyle:"italic", margin:0, lineHeight:1.5 }}>
            "{entry.prompt.length > 70 ? entry.prompt.slice(0,70)+"…" : entry.prompt}"
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, marginLeft:12 }}>
          <span style={{ fontSize:10, color:C.muted }}>{entry.wordCount}w</span>
          <span style={{ fontSize:12, color:C.muted, display:"inline-block", transform:expanded?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
        </div>
      </button>
      {expanded && (
        <div style={{ padding:"0 18px 16px" }}>
          <div style={{ height:1, background:C.border, marginBottom:14 }} />
          <p style={{ fontSize:14, color:C.dark, margin:"0 0 14px", lineHeight:1.85, fontFamily:"Georgia, serif", whiteSpace:"pre-wrap" }}>
            {entry.response}
          </p>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            {!confirmDelete
              ? <button onClick={() => setConfirmDelete(true)} style={{ fontSize:11, color:C.muted, background:"transparent", border:"none", cursor:"pointer", textDecoration:"underline" }}>Delete</button>
              : <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:C.muted }}>Delete this entry?</span>
                  <button onClick={() => onDelete(entry.id)} style={{ fontSize:11, color:"#C62828", background:"transparent", border:"none", cursor:"pointer", fontWeight:700 }}>Yes</button>
                  <button onClick={() => setConfirmDelete(false)} style={{ fontSize:11, color:C.muted, background:"transparent", border:"none", cursor:"pointer" }}>Cancel</button>
                </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Monthly synthesis ────────────────────────────────────────────────────────

function SynthesisCard({ entries, existing, credits, onGenerated, onCreditSpent }: {
  entries: JournalEntry[]; existing: MonthlySynthesis | null;
  credits: number; onGenerated: (s: MonthlySynthesis) => void; onCreditSpent: () => void;
}) {
  const [generating,    setGenerating]    = useState(false);
  const [showAuthGate,  setShowAuthGate]  = useState(false);
  const [showSpendModal,setShowSpendModal]= useState(false);

  const mk          = monthKey();
  const thisMonth   = entries.filter(e => e.dateISO.startsWith(mk.slice(0,7)));
  const freeEligible = thisMonth.length >= 4 && !existing;  // free path
  const paidEligible = existing || thisMonth.length < 4;    // on-demand path

  async function doGenerate(allEntries: boolean) {
    setGenerating(true);
    const source = allEntries ? entries : thisMonth;
    const text   = await generateSynthesis(source.length > 0 ? source : entries);
    const s: MonthlySynthesis = { monthKey:mk, text, entryIds:source.map(e=>e.id), createdAt:new Date().toISOString() };
    saveSynthesis(s);
    onGenerated(s);
    setGenerating(false);
  }

  async function handleFreeGenerate() {
    await doGenerate(false);
  }

  async function handlePaidClick() {
    const authed = await checkIsAuthed();
    if (!authed) { setShowAuthGate(true); return; }
    if (credits < 1) return;
    setShowSpendModal(true);
  }

  async function confirmPaidGenerate() {
    setShowSpendModal(false);
    if (!spendCredits(1)) return;
    onCreditSpent();
    await doGenerate(true);
  }

  const remaining = Math.max(0, 4 - thisMonth.length);

  return (
    <>
      <div style={{ background:C.goldDark, border:`1.5px solid ${freeEligible ? C.gold : `${C.gold}55`}`, borderRadius:12, padding:20, marginBottom:20 }}>
        <div style={{ fontSize:10, color:C.gold, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>
          {existing
            ? `Reflection · ${new Date(existing.createdAt).toLocaleDateString("en-GB", { month:"long", year:"numeric" })}`
            : "Monthly Reflection"}
        </div>

        {/* Existing synthesis text */}
        {existing && (
          <p style={{ fontSize:14, color:"#f0e8c0", margin:"0 0 14px", lineHeight:1.9, fontFamily:"Georgia, serif" }}>
            {existing.text}
          </p>
        )}

        {/* Free path — 4+ entries, no synthesis yet */}
        {freeEligible && !generating && (
          <>
            <p style={{ fontSize:13, color:"#c9b87a", margin:"0 0 14px", lineHeight:1.7 }}>
              You have {thisMonth.length} entries this month. Reflect back what it notices — not analysis, just honest observation.
            </p>
            <button onClick={handleFreeGenerate}
              style={{ padding:"9px 20px", background:C.gold, border:"none", borderRadius:8, color:"#1a1208", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              Generate reflection →
            </button>
          </>
        )}

        {/* On-demand paid path */}
        {!freeEligible && !generating && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <p style={{ fontSize:12, color:`${C.gold}88`, margin:0, fontStyle:"italic", flex:1 }}>
              {existing
                ? "Regenerate with all your entries across all time."
                : `${remaining} more ${remaining===1?"entry":"entries"} for a free reflection — or regenerate now.`}
            </p>
            <button onClick={handlePaidClick} disabled={credits < 1}
              title={credits < 1 ? "Earn credits by completing challenges" : "Spend 1 credit to generate now"}
              style={{ padding:"7px 16px", background:"transparent", border:`1.5px solid ${credits>=1?C.gold:`${C.gold}44`}`, borderRadius:8, color:credits>=1?C.gold:`${C.gold}44`, fontSize:11, fontWeight:700, cursor:credits>=1?"pointer":"not-allowed", flexShrink:0, whiteSpace:"nowrap" }}>
              {existing ? "Regenerate ⚡ 1 credit" : "Generate now ⚡ 1 credit"}
            </button>
          </div>
        )}

        {generating && (
          <p style={{ fontSize:12, color:C.gold, margin:0, fontStyle:"italic" }}>Reading your entries…</p>
        )}
      </div>

      {showAuthGate   && <AuthGateModal credits={credits} onDismiss={()=>setShowAuthGate(false)} />}
      {showSpendModal && (
        <SpendModal
          icon="✐"
          title={existing ? "Regenerate reflection?" : "Generate reflection now?"}
          description={existing ? "Runs across all your entries, not just this month. Overwrites the current reflection." : "Runs across all your entries. Bypasses the 4-entry monthly gate."}
          cost={1} credits={credits}
          confirmLabel="Yes, spend 1 credit"
          onConfirm={confirmPaidGenerate}
          onCancel={()=>setShowSpendModal(false)}
        />
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const [entries,   setEntries]   = useState<JournalEntry[]>([]);
  const [syntheses, setSyntheses] = useState<MonthlySynthesis[]>([]);
  const [credits,   setCredits]   = useState(0);
  const [loaded,    setLoaded]    = useState(false);

  const prompt        = getDailyPrompt();
  const todayEntry    = entries.find(e => e.date === todayKey()) ?? null;
  const pastEntries   = entries.filter(e => e.date !== todayKey());
  const thisSynthesis = syntheses.find(s => s.monthKey === monthKey()) ?? null;

  useEffect(() => {
    setEntries(loadEntries());
    setSyntheses(loadSyntheses());
    const { credits: c } = getCredits();
    setCredits(c);
    setLoaded(true);
  }, []);

  function handleSaved(entry: JournalEntry) {
    setEntries(prev =>
      [entry, ...prev.filter(e => e.id !== entry.id)]
        .sort((a,b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
    );
  }

  function handleDeleted(id: string) {
    deleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  if (!loaded) return null;

  return (
    <div style={{ maxWidth:640, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:0 }}>Journal</h2>
        <p style={{ color:C.muted, fontSize:13, margin:"4px 0 0" }}>Private. Local. Just for you.</p>
      </div>

      <WriteEntry prompt={prompt} existing={todayEntry} onSave={handleSaved} />

      <SynthesisCard
        entries={entries}
        existing={thisSynthesis}
        credits={credits}
        onCreditSpent={() => setCredits(c => c - 1)}
        onGenerated={s => setSyntheses(prev => [s, ...prev.filter(x => x.monthKey !== s.monthKey)])}
      />

      {pastEntries.length > 0 && (
        <div>
          <h3 style={{ fontSize:13, fontWeight:700, color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase", margin:"0 0 12px" }}>
            Past Entries ({pastEntries.length})
          </h3>
          {pastEntries.map(e => <PastEntry key={e.id} entry={e} onDelete={handleDeleted} />)}
        </div>
      )}

      {entries.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 20px" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>✦</div>
          <p style={{ fontSize:14, color:C.muted, fontFamily:"Georgia, serif", fontStyle:"italic", margin:0 }}>
            Your first entry is above. Come back tomorrow for a new prompt.
          </p>
        </div>
      )}
    </div>
  );
}