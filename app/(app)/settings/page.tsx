"use client";

import { useState, useEffect, useRef } from "react";
import { llmCall } from "@/lib/utils/llm";

const C = {
  orange:"#E8520A", orangeLight:"#FFF0E8", orangeDim:"#B84008",
  dark:"#1A1208", mid:"#5A4A2A", muted:"#8A7A5A",
  border:"#C8B89A", bg:"#F5F0E8", card:"#FFFEF9", cream:"#FAF6F0",
  success:"#2E7D32", successLight:"#E8F5E9", red:"#C62828", redLight:"#FECACA",
  gold:"#c9a84c", goldDark:"#0d1a0d",
};

// ─── Export parser ────────────────────────────────────────────────────────────
function extractQueriesFromChatGPT(json: any): string[] {
  const queries: string[] = [];
  try {
    const conversations = Array.isArray(json) ? json : [];
    for (const conv of conversations) {
      const mapping = conv.mapping ?? {};
      for (const node of Object.values(mapping) as any[]) {
        const msg = node?.message;
        if (msg?.role === "user" && msg?.content?.parts) {
          const text = msg.content.parts.filter((p: any) => typeof p === "string").join(" ").trim();
          if (text.length > 10 && text.length < 2000) queries.push(text);
        }
      }
    }
  } catch {}
  return queries.slice(-200); // last 200 queries
}

function extractQueriesFromClaude(json: any): string[] {
  const queries: string[] = [];
  try {
    const conversations = Array.isArray(json) ? json : json.conversations ?? [];
    for (const conv of conversations) {
      const messages = conv.messages ?? [];
      for (const msg of messages) {
        if (msg.role === "human" || msg.sender === "human") {
          const text = (msg.text ?? msg.content ?? "").trim();
          if (text.length > 10 && text.length < 2000) queries.push(text);
        }
      }
    }
  } catch {}
  return queries.slice(-200);
}

async function buildThemesFromQueries(queries: string[]): Promise<string> {
  const sample = queries.slice(-80).join("\n---\n");
  try {
    const text = await llmCall(
      "You analyse AI usage patterns. Return ONLY valid JSON. No preamble.",
      `Here are up to 80 prompts a user sent to AI assistants:\n\n${sample}\n\nIdentify their dependency patterns. Return ONLY this JSON:\n{"topDomains":["domain1","domain2","domain3"],"outsourcedSkills":["skill1","skill2","skill3"],"dependencyLevel":"low|medium|high","primaryWeakness":"one sentence describing the main skill being outsourced","suggestedFocus":"one sentence on what to train first"}`,
      400,
    );
    const clean  = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return `Domains: ${parsed.topDomains?.join(", ")}. Skills outsourced: ${parsed.outsourcedSkills?.join(", ")}. Primary weakness: ${parsed.primaryWeakness}. Suggested focus: ${parsed.suggestedFocus}`;
  } catch {
    return `Analysed ${queries.length} prompts. Manual review recommended.`;
  }
}

// ─── Export Upload Card ───────────────────────────────────────────────────────
function ExportUploadCard() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle"|"parsing"|"analysing"|"done"|"error">("idle");
  const [queryCount, setQueryCount] = useState(0);
  const [themes, setThemes] = useState("");
  const [source, setSource] = useState<"chatgpt"|"claude"|null>(null);
  const [hasExport, setHasExport] = useState(false);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("ss_profile") ?? "{}");
    if (profile.exportThemes) {
      setThemes(profile.exportThemes);
      setHasExport(true);
      setState("done");
    }
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setState("parsing");
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Detect source
      let queries: string[] = [];
      if (Array.isArray(json) && json[0]?.mapping !== undefined) {
        setSource("chatgpt");
        queries = extractQueriesFromChatGPT(json);
      } else {
        setSource("claude");
        queries = extractQueriesFromClaude(json);
      }

      if (queries.length === 0) { setState("error"); return; }
      setQueryCount(queries.length);
      setState("analysing");

      const themeString = await buildThemesFromQueries(queries);
      setThemes(themeString);

      // Merge into existing profile
      const profile = JSON.parse(localStorage.getItem("ss_profile") ?? "{}");
      profile.exportThemes = themeString;
      profile.exportQueryCount = queries.length;
      profile.exportDate = new Date().toISOString();
      localStorage.setItem("ss_profile", JSON.stringify(profile));

      // Clear today's cached task so it regenerates with new profile
      const cacheKey = `ss_daily_task_${new Date().toDateString()}`;
      sessionStorage.removeItem(cacheKey);

      setHasExport(true);
      setState("done");
    } catch {
      setState("error");
    }

    // Reset input
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleRemove() {
    const profile = JSON.parse(localStorage.getItem("ss_profile") ?? "{}");
    delete profile.exportThemes;
    delete profile.exportQueryCount;
    delete profile.exportDate;
    localStorage.setItem("ss_profile", JSON.stringify(profile));
    const cacheKey = `ss_daily_task_${new Date().toDateString()}`;
    sessionStorage.removeItem(cacheKey);
    setThemes("");
    setHasExport(false);
    setState("idle");
    setSource(null);
  }

  return (
    <div style={{ background:C.card, border:`2px solid ${state==="done"?C.gold:C.orange}`, borderRadius:12, padding:20, marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
        <div>
          <h3 style={{ fontSize:14, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:"0 0 4px" }}>
            🧠 Personalise My Training
          </h3>
          <p style={{ fontSize:12, color:C.muted, margin:0 }}>
            Upload your ChatGPT or Claude conversation export for tasks built around your actual AI usage.
          </p>
        </div>
        {state==="done" && (
          <span style={{ padding:"2px 10px", background:C.successLight, color:C.success, borderRadius:20, fontSize:10, fontWeight:700, flexShrink:0, marginLeft:10 }}>
            ✓ Active
          </span>
        )}
      </div>

      {/* Privacy notice */}
      <div style={{ padding:"8px 12px", background:C.goldDark, border:`1.5px solid ${C.gold}`, borderRadius:6, marginBottom:14 }}>
        <p style={{ fontSize:11, color:"#f0e8c0", margin:0, lineHeight:1.7 }}>
          🔒 Your conversations never leave your device. We extract themes locally, send only a pattern summary to generate tasks, then discard everything. We see patterns, not content.
        </p>
      </div>

      {/* How to export */}
      {state === "idle" && (
        <div style={{ marginBottom:14 }}>
          <p style={{ fontSize:11, color:C.mid, fontWeight:700, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.08em" }}>How to export:</p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ padding:"8px 12px", background:C.bg, borderRadius:6, fontSize:12, color:C.mid, lineHeight:1.6 }}>
              <b>ChatGPT:</b> Settings → Data Controls → Export Data → Download → unzip → upload <code style={{ background:C.border, padding:"1px 4px", borderRadius:3 }}>conversations.json</code>
            </div>
            <div style={{ padding:"8px 12px", background:C.bg, borderRadius:6, fontSize:12, color:C.mid, lineHeight:1.6 }}>
              <b>Claude:</b> claude.ai → Settings → Privacy → Export Data → upload the JSON file
            </div>
          </div>
        </div>
      )}

      {/* Upload button */}
      {(state === "idle" || state === "error") && (
        <div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{ display:"none" }} id="export-upload"/>
          <label htmlFor="export-upload" style={{ display:"inline-block", padding:"10px 22px", background:C.orange, border:"none", borderRadius:8, color:"white", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Georgia, serif" }}>
            Upload conversations.json →
          </label>
          {state === "error" && (
            <p style={{ fontSize:12, color:C.red, marginTop:8 }}>
              Could not parse that file. Make sure it's the raw JSON export from ChatGPT or Claude.
            </p>
          )}
        </div>
      )}

      {/* Parsing */}
      {state === "parsing" && (
        <div style={{ padding:"12px 16px", background:C.bg, borderRadius:8, fontSize:13, color:C.muted, fontStyle:"italic" }}>
          Reading your conversations locally…
        </div>
      )}

      {/* Analysing */}
      {state === "analysing" && (
        <div style={{ padding:"12px 16px", background:C.bg, borderRadius:8 }}>
          <p style={{ fontSize:13, color:C.mid, margin:"0 0 6px" }}>Found <b>{queryCount}</b> prompts. Extracting patterns…</p>
          <p style={{ fontSize:11, color:C.muted, margin:0, fontStyle:"italic" }}>This takes 10–20 seconds.</p>
        </div>
      )}

      {/* Done */}
      {state === "done" && themes && (
        <div>
          <div style={{ padding:"12px 14px", background:C.successLight, border:`1.5px solid ${C.success}`, borderRadius:8, marginBottom:10 }}>
            <p style={{ fontSize:11, color:C.success, fontWeight:700, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Profile updated — tasks are now tailored to your actual AI usage
            </p>
            <p style={{ fontSize:12, color:C.mid, margin:0, lineHeight:1.65 }}>{themes}</p>
          </div>
          <button onClick={handleRemove} style={{ background:"transparent", border:"none", fontSize:11, color:C.muted, cursor:"pointer", textDecoration:"underline", padding:0 }}>
            Remove export data
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  const [name,          setName]          = useState("");
  const [notify,        setNotify]        = useState(false);
  const [confirmReset,  setConfirmReset]  = useState(false);
  const [resetDone,     setResetDone]     = useState(false);
  const [saved,         setSaved]         = useState(false);

  useEffect(() => {
    setName(localStorage.getItem("ss_display_name") ?? "");
    setNotify(localStorage.getItem("ss_notify") === "true");
  }, []);

  function saveName() {
    localStorage.setItem("ss_display_name", name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleNotify() {
    const next = !notify;
    setNotify(next);
    localStorage.setItem("ss_notify", String(next));
  }

  function handleReset() {
    ["ss_credits","ss_progress","ss_streak","ss_challenges","ss_daily_done",
     "ss_last_done_date","ss_display_name","ss_notify","ss_profile","ss_onboarding_done"]
      .forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
    setConfirmReset(false);
    setResetDone(true);
    setName("");
    setNotify(false);
  }

  return (
    <div style={{ maxWidth:640, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:0 }}>Settings</h2>
        <p style={{ color:C.muted, fontSize:13, margin:"4px 0 0" }}>Your data lives in your browser. Always.</p>
      </div>

      {/* Export upload — first, prominent */}
      <ExportUploadCard />

      {/* Display name */}
      <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:14 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:"0 0 12px" }}>Display Name</h3>
        <div style={{ display:"flex", gap:8 }}>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveName()}
            placeholder="What should we call you?"
            style={{ flex:1, padding:"9px 12px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.dark, background:C.bg, fontFamily:"Georgia, serif", outline:"none" }}/>
          <button onClick={saveName} style={{ padding:"9px 18px", background:C.dark, border:"none", borderRadius:8, color:C.cream, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Georgia, serif", flexShrink:0 }}>
            {saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h3 style={{ fontSize:14, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:"0 0 3px" }}>Daily Reminder</h3>
            <p style={{ fontSize:12, color:C.muted, margin:0 }}>Nudge yourself to complete the daily task.</p>
          </div>
          <button onClick={toggleNotify} style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", background:notify?C.orange:C.border, position:"relative", flexShrink:0, transition:"background 0.2s" }}>
            <div style={{ width:18, height:18, borderRadius:"50%", background:"white", position:"absolute", top:3, left:notify?23:3, transition:"left 0.2s" }}/>
          </button>
        </div>
      </div>

      {/* About */}
      <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:14 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:"0 0 10px" }}>About BrainMatters</h3>
        <p style={{ fontSize:13, color:C.mid, lineHeight:1.75, margin:"0 0 10px" }}>
          BrainMatters exists because AI is making us cognitively dependent. Every challenge you complete without AI is a small act of resistance.
        </p>
        <p style={{ fontSize:13, color:C.mid, lineHeight:1.75, margin:"0 0 10px" }}>
          The AI Credit system isn't anti-AI — it's pro-deliberate. Use AI when it's truly worth a credit. Otherwise, do the work yourself.
        </p>
        <p style={{ fontSize:12, color:C.muted, margin:0, fontStyle:"italic" }}>
          "No man was ever wise by chance." — Seneca
        </p>
      </div>

      {/* Data & Privacy */}
      <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:14 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:"0 0 10px" }}>Data & Privacy</h3>
        <p style={{ fontSize:12, color:C.muted, lineHeight:1.7, margin:"0 0 14px" }}>
          All progress data — credits, streaks, challenges, your profile — is stored locally in your browser. Nothing is sent to a server without your action. Export analysis happens client-side.
        </p>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {["✓ Local only","✓ No tracking","✓ No ads","✓ Export processed on-device"].map(t=>(
            <span key={t} style={{ fontSize:11, padding:"3px 10px", background:C.successLight, color:C.success, borderRadius:20, fontWeight:700 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div style={{ background:C.card, border:`1.5px solid ${confirmReset?C.red:C.border}`, borderRadius:12, padding:20 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:confirmReset?C.red:C.dark, fontFamily:"Georgia, serif", margin:"0 0 8px" }}>
          {confirmReset ? "⚠️ This cannot be undone" : "Reset All Progress"}
        </h3>

        {!confirmReset && !resetDone && (
          <>
            <p style={{ fontSize:12, color:C.muted, lineHeight:1.7, margin:"0 0 14px" }}>
              Clears your credits, streak, challenges, profile, and onboarding. You'll restart from scratch including onboarding.
            </p>
            <button onClick={()=>setConfirmReset(true)} style={{ padding:"9px 18px", background:"transparent", border:`1.5px solid ${C.red}`, borderRadius:8, color:C.red, fontSize:12, fontWeight:700, cursor:"pointer" }}>
              Reset All Data
            </button>
          </>
        )}

        {confirmReset && (
          <>
            <p style={{ fontSize:13, color:C.mid, lineHeight:1.7, margin:"0 0 16px" }}>
              Your streak, credits, profile, and all challenges will be permanently deleted. Are you sure?
            </p>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handleReset} style={{ padding:"9px 18px", background:C.red, border:"none", borderRadius:8, color:"white", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                Yes, Reset Everything
              </button>
              <button onClick={()=>setConfirmReset(false)} style={{ padding:"9px 18px", background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:8, color:C.mid, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                Cancel
              </button>
            </div>
          </>
        )}

        {resetDone && (
          <div style={{ padding:"12px 16px", background:C.successLight, border:`1.5px solid ${C.success}`, borderRadius:8, fontSize:13, color:C.success, fontWeight:700 }}>
            ✓ All data cleared. You'll be redirected to onboarding on next visit.
          </div>
        )}
      </div>
    </div>
  );
}