"use client";

import { useState, useEffect, useRef } from "react";
import { generateTask, evaluateWriting, recordTaskType, type GeneratedTask } from "@/lib/utils/taskgen";

const C = {
  orange:"#E8520A", orangeLight:"#FFF0E8", orangeDim:"#B84008",
  dark:"#1A1208", mid:"#5A4A2A", muted:"#8A7A5A",
  border:"#C8B89A", bg:"#F5F0E8", card:"#FFFEF9", cream:"#FAF6F0",
  success:"#2E7D32", successLight:"#E8F5E9", red:"#C62828",
};

const TYPE_LABELS: Record<string, string> = {
  writing: "Writing Sprint",
  recall:  "Cold Recall",
  logic:   "Logic Chain",
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  writing: { bg:"#F3E5F5", text:"#6A1B9A" },
  recall:  { bg:"#E3F2FD", text:"#1565C0" },
  logic:   { bg:"#E8F5E9", text:"#1B5E20" },
};

export default function DailyPage() {
  const [task, setTask]             = useState<GeneratedTask | null>(null);
  const [loading, setLoading]       = useState(true);
  const [started, setStarted]       = useState(false);
  const [completed, setCompleted]   = useState(false);
  const [elapsed, setElapsed]       = useState(0);
  const [text, setText]             = useState("");
  const [tooFast, setTooFast]       = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [credits, setCredits]       = useState(0);
  const timerRef = useRef<any>(null);

  const alreadyDone = typeof window !== "undefined"
    ? localStorage.getItem("ss_daily_done") === new Date().toDateString()
    : false;

  useEffect(() => {
    setCredits(parseInt(localStorage.getItem("ss_credits") ?? "0"));
    loadTask();
  }, []);

  useEffect(() => {
    if (started && !completed) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, completed]);

  async function loadTask() {
    setLoading(true);
    const cacheKey = `ss_daily_task_${new Date().toDateString()}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try { setTask(JSON.parse(cached)); setLoading(false); return; } catch {}
    }
    const t = await generateTask();
    sessionStorage.setItem(cacheKey, JSON.stringify(t));
    setTask(t);
    setLoading(false);
  }

  async function handleComplete() {
    if (elapsed < 120) { setTooFast(true); return; }
    clearInterval(timerRef.current);

    if (task?.evalType === "claude" && text.trim().length > 20) {
      setEvaluating(true);
      const ev = await evaluateWriting(task, text);
      setEvaluation(ev);
      setEvaluating(false);
    }

    setCompleted(true);
    localStorage.setItem("ss_daily_done", new Date().toDateString());
    if (task) recordTaskType(task.type);

    const np = parseInt(localStorage.getItem("ss_progress") ?? "0") + 1;
    if (np >= 10) {
      const nc = credits + 1;
      setCredits(nc);
      localStorage.setItem("ss_credits", String(nc));
      localStorage.setItem("ss_progress", "0");
    } else {
      localStorage.setItem("ss_progress", String(np));
    }

    const lastDone = localStorage.getItem("ss_last_done_date");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = lastDone === yesterday.toDateString();
    const currentStreak = parseInt(localStorage.getItem("ss_streak") ?? "0");
    localStorage.setItem("ss_streak", String(isConsecutive ? currentStreak + 1 : 1));
    localStorage.setItem("ss_last_done_date", new Date().toDateString());
  }

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const pct  = task ? Math.min(elapsed / task.timeLimit * 100, 100) : 0;
  const now  = new Date();
  const secsLeft = (24*3600) - (now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds());
  const hh = Math.floor(secsLeft/3600), mm = Math.floor((secsLeft%3600)/60);

  return (
    <div style={{ maxWidth:640, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:0 }}>Task of the Day</h2>
        <p style={{ color:C.muted, fontSize:13, margin:"4px 0 0" }}>
          {loading ? "Generating your task…" : `Personalised to your profile · Resets in ${hh}h ${mm}m`}
        </p>
      </div>

      {loading && (
        <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:14, padding:40, textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:12 }}>⚙️</div>
          <p style={{ color:C.muted, fontSize:13, fontFamily:"Georgia, serif", fontStyle:"italic" }}>Building a task from your profile…</p>
        </div>
      )}

      {!loading && alreadyDone && !completed && (
        <div style={{ background:C.successLight, border:`2px solid ${C.success}`, borderRadius:14, padding:28, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
          <h3 style={{ fontSize:16, fontWeight:700, color:C.success, fontFamily:"Georgia, serif", margin:"0 0 6px" }}>Already done today</h3>
          <p style={{ color:C.mid, fontSize:13 }}>Come back tomorrow. The discipline is in the consistency.</p>
        </div>
      )}

      {!loading && task && !alreadyDone && (
        <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:14, padding:24, marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            <span style={{ padding:"2px 10px", background:TYPE_COLORS[task.type]?.bg, color:TYPE_COLORS[task.type]?.text, borderRadius:4, fontSize:10, fontWeight:700, textTransform:"uppercase" }}>
              {TYPE_LABELS[task.type]}
            </span>
            <span style={{ fontSize:11, color:C.muted }}>{task.evalType === "claude" ? "Claude evaluates" : "Self-assessed"}</span>
            {started && !completed && (
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:80, height:4, background:C.border, borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:elapsed>=120?C.success:C.orange, borderRadius:2, transition:"width 1s" }}/>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:elapsed>=120?C.success:C.orange }}>{fmt(elapsed)}</span>
              </div>
            )}
          </div>

          <h3 style={{ fontSize:18, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:"0 0 10px", lineHeight:1.4 }}>{task.title}</h3>
          <p style={{ fontSize:14, color:C.mid, lineHeight:1.75, margin:"0 0 10px" }}>{task.prompt}</p>

          <div style={{ padding:"8px 12px", background:"#1a1a0d", border:`1.5px solid #8a6f2e`, borderRadius:6, marginBottom:16 }}>
            <span style={{ fontSize:10, color:"#c9a84c", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>Constraint · </span>
            <span style={{ fontSize:12, color:"#f0e8c0" }}>{task.constraint}</span>
          </div>

          {!started && (
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button onClick={()=>setStarted(true)} style={{ padding:"10px 24px", background:C.dark, border:"none", borderRadius:8, color:C.cream, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Georgia, serif" }}>
                Start Challenge
              </button>
              <span style={{ fontSize:11, color:C.muted }}>{Math.floor(task.timeLimit/60)} min · timer starts now</span>
            </div>
          )}

          {started && !completed && (
            <div>
              {elapsed < 120
                ? <div style={{ padding:"8px 12px", background:C.orangeLight, border:`1.5px solid ${C.orange}`, borderRadius:6, marginBottom:12, fontSize:12, color:C.orangeDim }}>⏳ Minimum 2:00 required — the discomfort is the point.</div>
                : <div style={{ padding:"8px 12px", background:C.successLight, border:`1.5px solid ${C.success}`, borderRadius:6, marginBottom:12, fontSize:12, color:C.success, fontWeight:700 }}>✓ Ready to submit whenever you're done.</div>
              }
              <textarea value={text} onChange={e=>setText(e.target.value)}
                placeholder="Write your response here — commit to your first thoughts. No editing, no AI."
                style={{ width:"100%", minHeight:130, padding:"12px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, color:C.dark, background:C.bg, fontFamily:"Georgia, serif", outline:"none", resize:"vertical", lineHeight:1.75, boxSizing:"border-box", marginBottom:12 }}/>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:C.muted }}>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
                <button onClick={handleComplete} style={{ padding:"10px 24px", background:C.success, border:"none", borderRadius:8, color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>Mark Complete ✓</button>
              </div>
              {task.whatGoodLooksLike && <p style={{ fontSize:11, color:C.muted, marginTop:10, fontStyle:"italic" }}>What good looks like: {task.whatGoodLooksLike}</p>}
            </div>
          )}

          {evaluating && <div style={{ textAlign:"center", padding:20 }}><p style={{ color:C.muted, fontSize:13, fontStyle:"italic" }}>Evaluating your work…</p></div>}

          {completed && !evaluating && (
            <div>
              <div style={{ padding:"16px 20px", background:C.successLight, border:`2px solid ${C.success}`, borderRadius:10, marginBottom:evaluation?16:0 }}>
                <div style={{ fontSize:24, marginBottom:6 }}>🎉</div>
                <div style={{ fontSize:15, fontWeight:700, color:C.success, fontFamily:"Georgia, serif" }}>Challenge complete — {fmt(elapsed)} elapsed</div>
                <div style={{ fontSize:12, color:C.mid, marginTop:4 }}>+1 toward your next AI Credit.</div>
              </div>
              {evaluation && (
                <div style={{ padding:"16px 20px", background:"#0d1a0d", border:`1.5px solid ${C.success}`, borderRadius:10 }}>
                  <p style={{ fontSize:10, color:"#70c878", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", margin:"0 0 10px" }}>Claude's Evaluation</p>
                  <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                    {[["Clarity",evaluation.clarity],["Depth",evaluation.depth],["Originality",evaluation.originality]].map(([l,v])=>(
                      <div key={l} style={{ flex:1, textAlign:"center", padding:"8px 4px", background:"#1a2c1a", borderRadius:6 }}>
                        <div style={{ fontSize:20, fontWeight:700, color:Number(v)>=4?"#4caf50":Number(v)>=3?"#c9a84c":"#ef5350", fontFamily:"Georgia, serif" }}>{v}</div>
                        <div style={{ fontSize:9, color:"#70c878", textTransform:"uppercase", letterSpacing:"0.08em" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize:13, color:"#c0e0c0", lineHeight:1.7, margin:0 }}>{evaluation.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tooFast && (
        <div style={{ position:"fixed", inset:0, background:"rgba(26,18,8,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20 }}>
          <div style={{ background:C.card, border:`2px solid ${C.border}`, borderRadius:16, padding:28, maxWidth:340, width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>⏳</div>
            <h3 style={{ fontFamily:"Georgia, serif", color:C.dark, margin:"0 0 8px", fontSize:18 }}>Too fast.</h3>
            <p style={{ color:C.mid, fontSize:13, lineHeight:1.65, margin:"0 0 20px" }}>Minimum 2 minutes required. The resistance you feel right now is the whole point.</p>
            <button onClick={()=>setTooFast(false)} style={{ padding:"9px 24px", background:C.dark, border:"none", borderRadius:8, color:C.cream, fontSize:12, fontWeight:700, cursor:"pointer" }}>Back to work</button>
          </div>
        </div>
      )}
    </div>
  );
}