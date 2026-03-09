"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  orange:       "#E8520A",
  orangeLight:  "#FFF0E8",
  dark:         "#1A1208",
  mid:          "#5A4A2A",
  muted:        "#8A7A5A",
  border:       "#C8B89A",
  bg:           "#F5F0E8",
  card:         "#FFFEF9",
  cream:        "#FAF6F0",
  success:      "#2E7D32",
  successLight: "#E8F5E9",
  red:          "#C62828",
  redLight:     "#FECACA",
  gold:         "#c9a84c",
  goldDark:     "#1a1a0d",
};

const CAT: Record<string, { bg: string; text: string }> = {
  Coding:  { bg: "#E3F2FD", text: "#1565C0" },
  Writing: { bg: "#F3E5F5", text: "#6A1B9A" },
  Math:    { bg: "#E8F5E9", text: "#1B5E20" },
  Memory:  { bg: "#FFF3E0", text: "#E65100" },
  Logic:   { bg: "#FCE4EC", text: "#880E4F" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckIn {
  date:             string;   // toDateString()
  aiUsage:          number;   // 1–5
  cognitiveEffort:  number;   // 1–5
  awareness:        number;   // 1–5
  signal:           DependencySignal;
  savedAt:          string;   // ISO timestamp
}

type DependencySignal = "Independent" | "Slipping" | "Dependent" | "Offloaded";

// ─── Check-in data ────────────────────────────────────────────────────────────

const AI_USAGE_LABELS: Record<number, string> = {
  1: "Didn't touch it",
  2: "Once or twice, intentionally",
  3: "Several times, mixed intentionality",
  4: "Reached for it most times I had a choice",
  5: "Defaulted to it without thinking",
};

const COGNITIVE_EFFORT_LABELS: Record<number, string> = {
  1: "Delegated most thinking",
  2: "Some effort, outsourced the hard parts",
  3: "Balanced — thought through some, delegated some",
  4: "Did most thinking myself",
  5: "Fully engaged, no shortcuts",
};

const AWARENESS_LABELS: Record<number, string> = {
  1: "No — wasn't paying attention",
  2: "Sometimes noticed, after the fact",
  3: "Noticed in the moment, still did it",
  4: "Noticed and paused before deciding",
  5: "Caught myself and chose deliberately every time",
};

const SIGNAL_CONFIG: Record<DependencySignal, {
  color:       string;
  bg:          string;
  border:      string;
  emoji:       string;
  description: string;
}> = {
  Independent: {
    color:       C.success,
    bg:          C.successLight,
    border:      C.success,
    emoji:       "🧠",
    description: "You're doing the thinking. Keep going.",
  },
  Slipping: {
    color:       "#E65100",
    bg:          "#FFF3E0",
    border:      "#FF9800",
    emoji:       "⚠️",
    description: "Habits drifting. Notice it and course-correct.",
  },
  Dependent: {
    color:       C.red,
    bg:          C.redLight,
    border:      C.red,
    emoji:       "📉",
    description: "Outsourcing regularly. Time to rebuild the muscle.",
  },
  Offloaded: {
    color:       "#6A1B9A",
    bg:          "#F3E5F5",
    border:      "#6A1B9A",
    emoji:       "🚨",
    description: "Not thinking independently. Start with one challenge today.",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveSignal(aiUsage: number, cognitiveEffort: number, awareness: number): DependencySignal {
  // Invert aiUsage so higher = better (less AI = more independent)
  const aiScore = 6 - aiUsage;
  const avg = (aiScore + cognitiveEffort + awareness) / 3;

  if (avg >= 4.0) return "Independent";
  if (avg >= 3.0) return "Slipping";
  if (avg >= 2.0) return "Dependent";
  return "Offloaded";
}

function loadCheckins(): CheckIn[] {
  try {
    const raw = localStorage.getItem("ss_checkins");
    if (!raw) return [];
    return JSON.parse(raw) as CheckIn[];
  } catch { return []; }
}

function saveCheckin(checkin: CheckIn): void {
  const existing = loadCheckins();
  // Replace today's if it already exists, otherwise prepend
  const filtered = existing.filter(c => c.date !== checkin.date);
  localStorage.setItem("ss_checkins", JSON.stringify([checkin, ...filtered]));
}

function todayString(): string {
  return new Date().toDateString();
}

// ─── Score button component ───────────────────────────────────────────────────

function ScoreButton({
  value,
  selected,
  onClick,
}: {
  value:    number;
  selected: boolean;
  onClick:  () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width:           36,
        height:          36,
        borderRadius:    8,
        border:          `2px solid ${selected ? C.orange : C.border}`,
        background:      selected ? C.orange : C.card,
        color:           selected ? "white" : C.muted,
        fontSize:        14,
        fontWeight:      700,
        cursor:          "pointer",
        fontFamily:      "Georgia, serif",
        transition:      "all 0.12s ease",
        flexShrink:      0,
      }}
    >
      {value}
    </button>
  );
}

// ─── Check-in form ────────────────────────────────────────────────────────────

function CheckInForm({ onComplete }: { onComplete: (c: CheckIn) => void }) {
  const [aiUsage,         setAiUsage]         = useState<number | null>(null);
  const [cognitiveEffort, setCognitiveEffort] = useState<number | null>(null);
  const [awareness,       setAwareness]       = useState<number | null>(null);
  const [step,            setStep]            = useState<1 | 2 | 3>(1);
  const [saving,          setSaving]          = useState(false);

  const canAdvance1 = aiUsage !== null;
  const canAdvance2 = cognitiveEffort !== null;
  const canSubmit   = awareness !== null;

  function handleSubmit() {
    if (!aiUsage || !cognitiveEffort || !awareness) return;
    setSaving(true);

    const signal  = deriveSignal(aiUsage, cognitiveEffort, awareness);
    const checkin: CheckIn = {
      date:            todayString(),
      aiUsage,
      cognitiveEffort,
      awareness,
      signal,
      savedAt:         new Date().toISOString(),
    };

    saveCheckin(checkin);
    setTimeout(() => onComplete(checkin), 300); // brief pause feels more considered
  }

  const questions = [
    {
      step:     1 as const,
      label:    "AI Usage",
      question: "How much did you use AI today?",
      sublabel: "Be honest — this is just for you",
      value:    aiUsage,
      set:      setAiUsage,
      labels:   AI_USAGE_LABELS,
      lowNote:  "None",
      highNote: "Constant",
    },
    {
      step:     2 as const,
      label:    "Cognitive Effort",
      question: "How hard did you actually think today?",
      sublabel: "Not how productive — how much did you use your own mind",
      value:    cognitiveEffort,
      set:      setCognitiveEffort,
      labels:   COGNITIVE_EFFORT_LABELS,
      lowNote:  "Delegated",
      highNote: "Full effort",
    },
    {
      step:     3 as const,
      label:    "Awareness",
      question: "Did you notice yourself reaching for AI?",
      sublabel: "Awareness is the first step to changing the habit",
      value:    awareness,
      set:      setAwareness,
      labels:   AWARENESS_LABELS,
      lowNote:  "Not at all",
      highNote: "Fully aware",
    },
  ];

  const current = questions[step - 1];

  return (
    <div style={{
      background:   C.card,
      border:       `2px solid ${C.orange}`,
      borderRadius: 14,
      padding:      24,
      marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Daily Check-In · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif", margin: 0 }}>
            {current.question}
          </h3>
          <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>{current.sublabel}</p>
        </div>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 5, flexShrink: 0, marginLeft: 12, paddingTop: 4 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width:        8,
              height:       8,
              borderRadius: "50%",
              background:   s <= step ? C.orange : C.border,
              transition:   "background 0.2s",
            }} />
          ))}
        </div>
      </div>

      {/* Score buttons */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map(v => (
            <ScoreButton
              key={v}
              value={v}
              selected={current.value === v}
              onClick={() => current.set(v)}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: C.muted }}>{current.lowNote}</span>
          <span style={{ fontSize: 10, color: C.muted }}>{current.highNote}</span>
        </div>
      </div>

      {/* Selected label */}
      <div style={{
        minHeight:    40,
        padding:      "8px 12px",
        background:   current.value ? C.bg : "transparent",
        border:       `1.5px solid ${current.value ? C.border : "transparent"}`,
        borderRadius: 8,
        marginBottom: 16,
        transition:   "all 0.15s ease",
      }}>
        {current.value && (
          <p style={{ fontSize: 13, color: C.mid, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
            "{current.labels[current.value]}"
          </p>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {step > 1 ? (
          <button
            onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
            style={{ padding: "8px 16px", background: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            ← Back
          </button>
        ) : (
          <div /> // spacer
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep(s => (s + 1) as 1 | 2 | 3)}
            disabled={step === 1 ? !canAdvance1 : !canAdvance2}
            style={{
              padding:    "8px 20px",
              background: (step === 1 ? canAdvance1 : canAdvance2) ? C.dark : C.border,
              border:     "none",
              borderRadius: 8,
              color:      C.cream,
              fontSize:   12,
              fontWeight: 700,
              cursor:     (step === 1 ? canAdvance1 : canAdvance2) ? "pointer" : "not-allowed",
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || saving}
            style={{
              padding:    "8px 20px",
              background: canSubmit && !saving ? C.orange : C.border,
              border:     "none",
              borderRadius: 8,
              color:      "white",
              fontSize:   12,
              fontWeight: 700,
              cursor:     canSubmit && !saving ? "pointer" : "not-allowed",
            }}
          >
            {saving ? "Saving…" : "Submit Check-In ✓"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Today's signal card ──────────────────────────────────────────────────────

function TodaySignalCard({ checkin }: { checkin: CheckIn }) {
  const config  = SIGNAL_CONFIG[checkin.signal];
  const avg     = ((6 - checkin.aiUsage) + checkin.cognitiveEffort + checkin.awareness) / 3;
  const pct     = Math.round(((avg - 1) / 4) * 100);

  return (
    <div style={{
      background:   C.card,
      border:       `2px solid ${config.border}`,
      borderRadius: 14,
      padding:      20,
      marginBottom: 20,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Today's Dependency Signal
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>{config.emoji}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: config.color, fontFamily: "Georgia, serif" }}>
              {checkin.signal}
            </span>
          </div>
          <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>{config.description}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: config.color, fontFamily: "Georgia, serif" }}>
            {pct}%
          </div>
          <div style={{ fontSize: 10, color: C.muted }}>independence<br />score</div>
        </div>
      </div>

      {/* Score breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {[
          { label: "AI Usage",         value: 6 - checkin.aiUsage,         raw: checkin.aiUsage,         note: AI_USAGE_LABELS[checkin.aiUsage] },
          { label: "Cognitive Effort", value: checkin.cognitiveEffort,      raw: checkin.cognitiveEffort, note: COGNITIVE_EFFORT_LABELS[checkin.cognitiveEffort] },
          { label: "Awareness",        value: checkin.awareness,            raw: checkin.awareness,       note: AWARENESS_LABELS[checkin.awareness] },
        ].map(({ label, value, raw, note }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{label}</span>
              <span style={{ fontSize: 11, color: C.mid, fontWeight: 700 }}>{raw}/5</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 5, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height:     "100%",
                width:      `${(value / 5) * 100}%`,
                background: config.color,
                borderRadius: 4,
                transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, fontStyle: "italic" }}>{note}</div>
          </div>
        ))}
      </div>

      {/* CTA based on signal */}
      {(checkin.signal === "Dependent" || checkin.signal === "Offloaded") && (
        <div style={{ padding: "8px 12px", background: config.bg, border: `1.5px solid ${config.border}`, borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: config.color, margin: 0, fontWeight: 600 }}>
            {checkin.signal === "Offloaded"
              ? "One challenge today. That's all it takes to start."
              : "Try a challenge without reaching for AI. Notice how it feels."}
            {" "}<Link href="/challenges" style={{ color: config.color, fontWeight: 700 }}>Start a challenge →</Link>
          </p>
        </div>
      )}
      {checkin.signal === "Slipping" && (
        <div style={{ padding: "8px 12px", background: config.bg, border: `1.5px solid ${config.border}`, borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: config.color, margin: 0, fontWeight: 600 }}>
            You noticed the drift. That awareness is worth something.{" "}
            <Link href="/daily" style={{ color: config.color, fontWeight: 700 }}>Complete today's task →</Link>
          </p>
        </div>
      )}
      {checkin.signal === "Independent" && (
        <div style={{ padding: "8px 12px", background: config.bg, border: `1.5px solid ${config.border}`, borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: config.color, margin: 0, fontWeight: 600 }}>
            This is what it feels like. Build on it.{" "}
            <Link href="/progress" style={{ color: config.color, fontWeight: 700 }}>View your trend →</Link>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Trend summary (if ≥3 checkins) ──────────────────────────────────────────

function TrendSummary({ checkins }: { checkins: CheckIn[] }) {
  if (checkins.length < 3) return null;

  const recent  = checkins.slice(0, 7); // last 7 days
  const signals = recent.map(c => c.signal);

  const counts: Record<DependencySignal, number> = {
    Independent: 0, Slipping: 0, Dependent: 0, Offloaded: 0,
  };
  signals.forEach(s => counts[s]++);

  const dominant = (Object.entries(counts) as [DependencySignal, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  // Simple trend: compare first half avg vs second half avg
  const avgScore = (c: CheckIn) => ((6 - c.aiUsage) + c.cognitiveEffort + c.awareness) / 3;
  const half     = Math.floor(recent.length / 2);
  const recentAvg  = recent.slice(0, half).reduce((s, c) => s + avgScore(c), 0) / half;
  const olderAvg   = recent.slice(half).reduce((s, c)  => s + avgScore(c), 0) / (recent.length - half);
  const improving  = recentAvg > olderAvg + 0.1;
  const declining  = recentAvg < olderAvg - 0.1;

  return (
    <div style={{ background: C.goldDark, border: `1.5px solid ${C.gold}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
      <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
        Last {recent.length} Days
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {recent.map((c, i) => {
          const cfg = SIGNAL_CONFIG[c.signal];
          return (
            <div key={i} title={`${c.date}: ${c.signal}`} style={{
              width:        28,
              height:       28,
              borderRadius: 6,
              background:   cfg.bg,
              border:       `1.5px solid ${cfg.border}`,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              fontSize:     13,
              cursor:       "default",
            }}>
              {cfg.emoji}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: "#f0e8c0", margin: 0 }}>
        Mostly <b style={{ color: SIGNAL_CONFIG[dominant].color }}>{dominant}</b>.{" "}
        {improving && "Trend is improving — keep going."}
        {declining && "Trend is slipping — time to recommit."}
        {!improving && !declining && "Holding steady."}
      </p>
    </div>
  );
}

// ─── Feed items (static for now, wired to Supabase in post-MVP) ───────────────

const FEED_ITEMS = [
  { id: 1, type: "daily",      title: "Debug this without Stack Overflow", completions: 34 },
  { id: 2, type: "completion", user: "Arjun S.",  challenge: "Explain recursion without notes",       category: "Memory",  time: "18 min", mins: 12,  aiFree: true  },
  { id: 3, type: "completion", user: "Priya M.",  challenge: "Write a cold email from scratch",       category: "Writing", time: "22 min", mins: 28,  aiFree: true  },
  { id: 4, type: "streak",     user: "Dev K.",    days: 14 },
  { id: 5, type: "credit",     user: "Sneha R." },
  { id: 6, type: "completion", user: "Rahul T.",  challenge: "Mental math: invoice calculations",    category: "Math",    time: "9 min",  mins: 45,  aiFree: false },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const [todayCheckin, setTodayCheckin] = useState<CheckIn | null>(null);
  const [allCheckins,  setAllCheckins]  = useState<CheckIn[]>([]);
  const [loaded,       setLoaded]       = useState(false);

  useEffect(() => {
    const checkins = loadCheckins();
    setAllCheckins(checkins);
    const today = checkins.find(c => c.date === todayString()) ?? null;
    setTodayCheckin(today);
    setLoaded(true);
  }, []);

  function handleCheckinComplete(checkin: CheckIn) {
    setTodayCheckin(checkin);
    setAllCheckins(prev => {
      const filtered = prev.filter(c => c.date !== checkin.date);
      return [checkin, ...filtered];
    });
  }

  if (!loaded) return null;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>

      {/* Check-in or signal card — always first */}
      {todayCheckin
        ? <TodaySignalCard checkin={todayCheckin} />
        : <CheckInForm onComplete={handleCheckinComplete} />
      }

      {/* Trend summary — shows after 3+ checkins */}
      <TrendSummary checkins={allCheckins} />

      {/* Feed header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif", margin: 0 }}>
          Activity Feed
        </h2>
        <p style={{ color: C.muted, fontSize: 12, margin: "4px 0 0" }}>
          Watch others do the hard work — chronological, no algorithm.
        </p>
      </div>

      {/* Feed items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FEED_ITEMS.map(item => (
          <div key={item.id} style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "14px 18px" }}>

            {item.type === "daily" && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>📅</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Task of the Day</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, fontFamily: "Georgia, serif" }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>✓ {item.completions} people completed this today</div>
                </div>
                <Link href="/daily" style={{ padding: "6px 14px", background: C.orange, border: "none", borderRadius: 7, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", textDecoration: "none", flexShrink: 0 }}>
                  Try It
                </Link>
              </div>
            )}

            {item.type === "completion" && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: item.aiFree ? C.successLight : C.orangeLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `2px solid ${item.aiFree ? C.success : C.orange}` }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.aiFree ? C.success : C.orange }}>
                    {item.user!.split(" ").map((n: string) => n[0]).join("")}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{item.user}</span>
                    <span style={{ fontSize: 10, color: C.muted }}>{item.mins}m ago</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.mid, fontFamily: "Georgia, serif" }}>{item.challenge}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ padding: "2px 8px", background: CAT[item.category!]?.bg, color: CAT[item.category!]?.text, borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{item.category}</span>
                    <span style={{ fontSize: 10, color: C.muted }}>⏱ {item.time}</span>
                    {item.aiFree
                      ? <span style={{ fontSize: 10, color: C.success, fontWeight: 700 }}>✓ AI-Free</span>
                      : <span style={{ fontSize: 10, color: C.orange, fontWeight: 700 }}>⚡ Used AI Credit</span>
                    }
                  </div>
                </div>
              </div>
            )}

            {item.type === "streak" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>🔥</span>
                <span style={{ fontSize: 13, color: C.dark }}>
                  <b>{item.user}</b> is on a <b style={{ color: C.orange }}>{item.days}-day streak</b>
                </span>
              </div>
            )}

            {item.type === "credit" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>⚡</span>
                <span style={{ fontSize: 13, color: C.dark }}>
                  <b>{item.user}</b> earned an <b style={{ color: C.orange }}>AI Credit</b> after 10 AI-free completions
                </span>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}