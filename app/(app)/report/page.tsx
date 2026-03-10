"use client";

import { useState, useEffect } from "react";
import { llmCall } from "@/lib/utils/llm";
import { getCredits, spendCredits } from "@/lib/utils/credits";
import { AuthGateModal, SpendModal } from "@/components/CreditModals";
import { createClient } from "@/lib/supabase/client";

const C = {
  orange:"#E8520A", orangeLight:"#FFF0E8", dark:"#1A1208", mid:"#5A4A2A",
  muted:"#8A7A5A", border:"#C8B89A", bg:"#F5F0E8", card:"#FFFEF9",
  cream:"#FAF6F0", success:"#2E7D32", successLight:"#E8F5E9",
  gold:"#c9a84c", goldDark:"#1a1a0d",
};

const REPORT_COST = 3;

// ─── Types ────────────────────────────────────────────────────────────────────

interface BehaviourReport {
  text:          string;
  generatedAt:   string;
  snapshotHash:  string;  // used to detect new data
}

interface CheckIn {
  date: string; aiUsage: number; cognitiveEffort: number; awareness: number;
  signal: string; savedAt: string;
}

// ─── Snapshot hash ────────────────────────────────────────────────────────────
// Simple string that changes meaningfully when enough new data exists.
// Regeneration unlocks when completions grow by 5+ OR checkins grow by 3+.

function buildSnapshotHash(completions: number, checkinCount: number, journalCount: number): string {
  // Round down to thresholds so small increments don't trigger regeneration
  const cBucket = Math.floor(completions / 5) * 5;
  const chBucket = Math.floor(checkinCount / 3) * 3;
  return `c${cBucket}_ch${chBucket}_j${journalCount}`;
}

// ─── Data collection ──────────────────────────────────────────────────────────

function collectData() {
  const credits   = parseInt(localStorage.getItem("ss_credits")  ?? "0");
  const progress  = parseInt(localStorage.getItem("ss_progress") ?? "0");
  const streak    = parseInt(localStorage.getItem("ss_streak")   ?? "0");
  const completions = credits * 10 + progress;

  let checkins: CheckIn[] = [];
  try { checkins = JSON.parse(localStorage.getItem("ss_checkins") ?? "[]"); } catch {}

  let challenges: any[] = [];
  try { challenges = JSON.parse(localStorage.getItem("ss_challenges") ?? "[]"); } catch {}

  let journalEntries: any[] = [];
  try { journalEntries = JSON.parse(localStorage.getItem("ss_journal") ?? "[]"); } catch {}

  let profile: any = null;
  try { profile = JSON.parse(localStorage.getItem("ss_profile") ?? "null"); } catch {}

  return { credits, progress, streak, completions, checkins, challenges, journalEntries, profile };
}

function buildPromptData(): { summary: string; completions: number; checkinCount: number; journalCount: number } {
  const { credits, progress, streak, completions, checkins, challenges, journalEntries, profile } = collectData();

  // Challenge breakdown
  const done       = challenges.filter((c: any) => c.status === "done");
  const byType     = { writing: 0, recall: 0, logic: 0 } as Record<string, number>;
  done.forEach((c: any) => { if (byType[c.type] !== undefined) byType[c.type]++; });

  // Check-in trends
  const sortedCI = [...checkins].sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime());
  const recentCI = sortedCI.slice(-14);
  const signalCounts: Record<string, number> = { Independent:0, Slipping:0, Dependent:0, Offloaded:0 };
  recentCI.forEach(c => { if (signalCounts[c.signal] !== undefined) signalCounts[c.signal]++; });

  // Chronological signal sequence — lets the LLM detect direction of travel,
  // not just aggregate counts (e.g. was Dependent last week, Independent this week)
  const signalSequence = recentCI.map(c => c.signal).join(" → ");

  const avgAI  = recentCI.length ? (recentCI.reduce((s, c) => s + c.aiUsage, 0) / recentCI.length).toFixed(1) : "N/A";
  const avgEff = recentCI.length ? (recentCI.reduce((s, c) => s + c.cognitiveEffort, 0) / recentCI.length).toFixed(1) : "N/A";
  const avgAw  = recentCI.length ? (recentCI.reduce((s, c) => s + c.awareness, 0) / recentCI.length).toFixed(1) : "N/A";

  // AI usage trend: compare first half vs second half
  let aiTrend = "stable";
  if (recentCI.length >= 6) {
    const half = Math.floor(recentCI.length / 2);
    const older  = recentCI.slice(0, half).reduce((s, c) => s + c.aiUsage, 0) / half;
    const newer  = recentCI.slice(half).reduce((s, c) => s + c.aiUsage, 0) / half;
    if (newer < older - 0.3) aiTrend = "improving (using AI less)";
    else if (newer > older + 0.3) aiTrend = "worsening (using AI more)";
  }

  // Journal stats
  const totalWords  = journalEntries.reduce((s: number, e: any) => s + (e.wordCount ?? 0), 0);
  const journalFreq = journalEntries.length > 0
    ? `${journalEntries.length} entries, ${totalWords} words total`
    : "no journal entries";

  // Difficulty tier
  const tier = completions >= 30 ? "advanced" : completions >= 10 ? "intermediate" : "beginner";

  // Submission texts from completed challenges — the most direct signal of
  // how the user actually thinks and writes without AI assistance
  const submissionSamples = done
    .filter((c: any) => c.submissionText && c.submissionText.trim().length > 0)
    .slice(-3)  // last 3 to keep the prompt focused
    .map((c: any) => `[${c.type} · ${c.tier}] "${c.title}"\n${c.submissionText.trim()}`)
    .join("\n\n");

  const summary = `
USER BEHAVIOUR DATA — BrainMatters has analysed your interactions to identify patterns in how you engage with AI. This summary is an honest reflection of your current relationship with AI, based on the data you've generated through your completions, check-ins, and journal entries.

PROFILE (from onboarding):
- Last AI task they admitted to: ${profile?.lastQuery ?? "not set"}
- Rusty skill they want to reclaim: ${profile?.rustySkill ?? "not set"}
- Self-identified AI behaviours: ${profile?.behaviors?.join(", ") ?? "not set"}
- Time commitment: ${profile?.timeLimit ?? "?"} minutes/day
${profile?.exportThemes ? `- Behavioural themes extracted from their prompt history: ${profile.exportThemes}` : ""}

ACTIVITY SUMMARY:
- Total AI-free completions: ${completions} (${credits} credits earned)
- Current streak: ${streak} days
- Difficulty tier reached: ${tier}
- Challenge types completed: Writing ${byType.writing}, Recall ${byType.recall}, Logic ${byType.logic}

DEPENDENCY SIGNALS (last ${recentCI.length} check-ins):
- Signal sequence oldest → newest: ${signalSequence || "no data"}
- Counts: Independent:${signalCounts.Independent}, Slipping:${signalCounts.Slipping}, Dependent:${signalCounts.Dependent}, Offloaded:${signalCounts.Offloaded}
- Avg AI usage score: ${avgAI}/5 (1=none, 5=constant)
- Avg cognitive effort: ${avgEff}/5 (1=delegated, 5=full effort)
- Avg self-awareness: ${avgAw}/5 (1=not aware, 5=fully deliberate)
- AI usage trend: ${aiTrend}

JOURNAL:
- ${journalFreq}
${submissionSamples ? `\nSAMPLE SUBMISSIONS (user's own words, written without AI):\n${submissionSamples}` : ""}
`.trim();

  return { summary, completions, checkinCount: checkins.length, journalCount: journalEntries.length };
}

// ─── Storage ──────────────────────────────────────────────────────────────────

function loadReport(): BehaviourReport | null {
  try {
    const raw = localStorage.getItem("ss_behaviour_report");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveReport(r: BehaviourReport) {
  localStorage.setItem("ss_behaviour_report", JSON.stringify(r));
}

async function checkIsAuthed(): Promise<boolean> {
  try { const { data: { user } } = await createClient().auth.getUser(); return !!user; }
  catch { return false; }
}

// ─── Report renderer ──────────────────────────────────────────────────────────
// Parses the 4-section report from LLM and renders each section distinctly.

const SECTION_HEADERS = ["Overview", "Patterns You're Building", "Patterns Worth Examining", "One Thing To Focus On"];

function parseReportSections(text: string): { header: string; body: string }[] {
  const sections: { header: string; body: string }[] = [];

  let remaining = text;
  for (let i = 0; i < SECTION_HEADERS.length; i++) {
    const header    = SECTION_HEADERS[i];
    const nextHeader = SECTION_HEADERS[i + 1];
    const start     = remaining.indexOf(header);
    if (start === -1) {
      // Header not found — treat whole remaining as one block
      if (remaining.trim()) sections.push({ header, body: remaining.trim() });
      break;
    }
    const bodyStart = start + header.length;
    const end       = nextHeader ? remaining.indexOf(nextHeader, bodyStart) : remaining.length;
    const body      = remaining.slice(bodyStart, end).replace(/^[\s:–—]+/, "").trim();
    sections.push({ header, body });
    remaining = remaining.slice(end);
  }

  // If parsing failed (LLM didn't follow structure), return the whole text as one block
  if (sections.length === 0) return [{ header: "Your Report", body: text.trim() }];
  return sections;
}

const SECTION_STYLES: Record<string, { border: string; bg: string; headerColor: string }> = {
  "Overview":                    { border: C.border,   bg: C.card,         headerColor: C.dark    },
  "Patterns You're Building":    { border: "#2E7D32",  bg: "#f0faf0",      headerColor: "#2E7D32" },
  "Patterns Worth Examining":    { border: C.orange,   bg: C.orangeLight,  headerColor: C.orange  },
  "One Thing To Focus On":       { border: C.gold,     bg: C.goldDark,     headerColor: C.gold    },
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const [report,          setReport]          = useState<BehaviourReport | null>(null);
  const [credits,         setCredits]         = useState(0);
  const [generating,      setGenerating]      = useState(false);
  const [showAuthGate,    setShowAuthGate]     = useState(false);
  const [showSpendModal,  setShowSpendModal]   = useState(false);
  const [newDataAvailable, setNewDataAvailable] = useState(false);
  const [loaded,          setLoaded]           = useState(false);
  const [dataSnapshot,    setDataSnapshot]     = useState({ completions:0, checkinCount:0, journalCount:0 });

  useEffect(() => {
    const existing = loadReport();
    const { credits: c } = getCredits();
    const { summary: _, ...snap } = buildPromptData();
    setReport(existing);
    setCredits(c);
    setDataSnapshot(snap);

    if (existing) {
      const currentHash = buildSnapshotHash(snap.completions, snap.checkinCount, snap.journalCount);
      setNewDataAvailable(currentHash !== existing.snapshotHash);
    }
    setLoaded(true);
  }, []);

  async function handleGenerateClick() {
    if (credits < REPORT_COST) return;
    setShowSpendModal(true);
  }

  async function confirmGenerate() {
    setShowSpendModal(false);
    if (!spendCredits(REPORT_COST)) return;
    setCredits(c => c - REPORT_COST);
    setGenerating(true);

    const { summary, completions, checkinCount, journalCount } = buildPromptData();
    const hash = buildSnapshotHash(completions, checkinCount, journalCount);

    try {
      const text = await llmCall(
        `You write honest behavioural feedback reports. No flattery. No bullet points in the main analysis. Write in second person ("you"). Structure your response with exactly these four section headers on their own lines: "Overview", "Patterns You're Building", "Patterns Worth Examining", "One Thing To Focus On". Each section is prose. Total 250-350 words. Be specific — reference the actual data. Overview: 2 sentences summarising who this person is in relation to AI use. Patterns You're Building: what the data shows they're doing well. Patterns Worth Examining: honest friction points, specific not generic. One Thing To Focus On: single concrete recommendation.`,
        `${summary}\n\nWrite the behaviour report.`,
        600,
      );

      const r: BehaviourReport = {
        text:         text.trim(),
        generatedAt:  new Date().toISOString(),
        snapshotHash: hash,
      };
      saveReport(r);
      setReport(r);
      setNewDataAvailable(false);
    } catch {
      // Refund
      const cur = parseInt(localStorage.getItem("ss_credits") ?? "0") + REPORT_COST;
      localStorage.setItem("ss_credits", String(cur));
      setCredits(cur);
    }
    setGenerating(false);
  }

  if (!loaded) return null;

  const hasReport    = !!report;
  const canAfford    = credits >= REPORT_COST;
  const sections     = hasReport ? parseReportSections(report!.text) : [];

  return (
    <div style={{ maxWidth:640, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:0 }}>
          Behaviour Report
        </h2>
        <p style={{ color:C.muted, fontSize:13, margin:"4px 0 0" }}>
          Everything you've done, reflected back honestly.
        </p>
      </div>

      {/* No report yet */}
      {!hasReport && !generating && (
        <div style={{ background:C.card, border:`2px solid ${C.border}`, borderRadius:14, padding:32, textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:14 }}>⊞</div>
          <h3 style={{ fontSize:18, fontWeight:700, color:C.dark, fontFamily:"Georgia, serif", margin:"0 0 10px" }}>
            Your first report
          </h3>
          <p style={{ fontSize:13, color:C.mid, lineHeight:1.75, maxWidth:400, margin:"0 auto 20px" }}>
            BrainMatters analyses your completions, check-ins, journal entries, and dependency signals to build an honest behavioural profile. Not flattery — patterns.
          </p>

          {/* Data snapshot */}
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:24 }}>
            {[
              { label: "completions", value: dataSnapshot.completions },
              { label: "check-ins",   value: dataSnapshot.checkinCount },
              { label: "journal entries", value: dataSnapshot.journalCount },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding:"6px 14px", background:C.bg, border:`1.5px solid ${C.border}`, borderRadius:20 }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.dark }}>{value}</span>
                <span style={{ fontSize:11, color:C.muted, marginLeft:5 }}>{label}</span>
              </div>
            ))}
          </div>

          {dataSnapshot.completions < 5 ? (
            <div style={{ padding:"12px 16px", background:C.bg, borderRadius:10, marginBottom:16 }}>
              <p style={{ fontSize:12, color:C.muted, margin:0, fontStyle:"italic" }}>
                Complete a few more challenges first — the report needs real data to be meaningful.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:16 }}>
                <span style={{ fontSize:13, color:C.orange, fontWeight:700 }}>3 credits</span>
                <span style={{ fontSize:12, color:C.muted }}>· one-time generation</span>
              </div>
              {!canAfford && (
                <p style={{ fontSize:12, color:C.muted, marginBottom:12, fontStyle:"italic" }}>
                  You have {credits} credit{credits !== 1 ? "s" : ""}. Need {REPORT_COST - credits} more.
                </p>
              )}
              <button onClick={handleGenerateClick} disabled={!canAfford}
                style={{ padding:"11px 28px", background:canAfford?C.dark:C.border, border:"none", borderRadius:9, color:C.cream, fontSize:13, fontWeight:700, cursor:canAfford?"pointer":"not-allowed", fontFamily:"Georgia, serif" }}>
                Generate Report ⚡
              </button>
            </>
          )}
        </div>
      )}

      {/* Generating */}
      {generating && (
        <div style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:14, padding:40, textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:12 }}>⊞</div>
          <p style={{ color:C.muted, fontSize:14, fontFamily:"Georgia, serif", fontStyle:"italic", lineHeight:1.7 }}>
            Reading your data…<br/>
            <span style={{ fontSize:12 }}>This takes a moment.</span>
          </p>
        </div>
      )}

      {/* Report */}
      {hasReport && !generating && (
        <>
          {/* Report header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
            <div style={{ fontSize:11, color:C.muted }}>
              Generated {new Date(report!.generatedAt).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}
            </div>
            {newDataAvailable && (
              <button onClick={handleGenerateClick} disabled={!canAfford}
                style={{ padding:"5px 14px", background:"transparent", border:`1.5px solid ${canAfford?C.orange:C.border}`, borderRadius:7, color:canAfford?C.orange:C.muted, fontSize:11, fontWeight:700, cursor:canAfford?"pointer":"not-allowed" }}>
                New data available — regenerate ⚡ {REPORT_COST} credits
              </button>
            )}
          </div>

          {/* Sections */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {sections.map(({ header, body }, i) => {
              const style = SECTION_STYLES[header] ?? { border:C.border, bg:C.card, headerColor:C.dark };
              const isLastSection = header === "One Thing To Focus On";
              return (
                <div key={i} style={{ background: isLastSection ? style.bg : style.bg, border:`2px solid ${style.border}`, borderRadius:12, padding:"18px 20px" }}>
                  <div style={{ fontSize:10, color:style.headerColor, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>
                    {header}
                  </div>
                  <p style={{ fontSize:14, color: isLastSection ? "#f0e8c0" : C.dark, margin:0, lineHeight:1.85, fontFamily:"Georgia, serif", whiteSpace:"pre-wrap" }}>
                    {body}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Data footnote */}
          <div style={{ marginTop:20, padding:"10px 14px", background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
            <p style={{ fontSize:11, color:C.muted, margin:0, fontStyle:"italic" }}>
              Data snapshot: {dataSnapshot.completions} completions · {dataSnapshot.checkinCount} check-ins · {dataSnapshot.journalCount} journal entries
            </p>
          </div>
        </>
      )}

      {showAuthGate  && <AuthGateModal credits={credits} onDismiss={() => setShowAuthGate(false)} />}
      {showSpendModal && (
        <SpendModal
          icon="⊞"
          title={hasReport ? "Regenerate your report?" : "Generate your report?"}
          description={hasReport
            ? "Runs across all current data. Overwrites the existing report."
            : "Analyses your completions, check-ins, journal, and dependency signals. Honest, not flattering."}
          cost={REPORT_COST}
          credits={credits}
          confirmLabel={`Yes, spend ${REPORT_COST} credits`}
          onConfirm={confirmGenerate}
          onCancel={() => setShowSpendModal(false)}
        />
      )}
    </div>
  );
}