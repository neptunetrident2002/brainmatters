"use client";

import { useState, useEffect } from "react";

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
  gold:         "#c9a84c",
  goldDark:     "#1a1a0d",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type DependencySignal = "Independent" | "Slipping" | "Dependent" | "Offloaded";

interface CheckIn {
  date:            string;
  aiUsage:         number;
  cognitiveEffort: number;
  awareness:       number;
  signal:          DependencySignal;
  savedAt:         string;
}

interface JournalEntry {
  id:      string;
  date:    string;
  dateISO: string;
}

interface Challenge {
  id:           string;
  status:       string;
  completed_at?: string | null;
  category?:    string;
  difficulty?:  number;
}

// ─── Data loaders ─────────────────────────────────────────────────────────────

function loadCheckins(): CheckIn[] {
  try { return JSON.parse(localStorage.getItem("ss_checkins") ?? "[]"); }
  catch { return []; }
}

function loadJournalEntries(): JournalEntry[] {
  try { return JSON.parse(localStorage.getItem("ss_journal") ?? "[]"); }
  catch { return []; }
}

function loadChallenges(): Challenge[] {
  try {
    const raw = JSON.parse(localStorage.getItem("ss_challenges") ?? "[]");
    return raw.filter((c: any) => c && c.id && c.status);
  }
  catch { return []; }
}

async function fetchChallengesFromAPI(): Promise<Challenge[]> {
  try {
    const res = await fetch("/api/challenges", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    // API returns { data: [...], error: null }
    const arr: any[] = Array.isArray(json) ? json : (json.data ?? []);
    return arr.filter((c: any) => c && c.id && c.status);
  } catch {
    return [];
  }
}

// ─── Derived calculations ─────────────────────────────────────────────────────

// Independence score 0–100 from a single check-in
function checkinScore(c: CheckIn): number {
  const aiScore = 6 - c.aiUsage;
  const avg = (aiScore + c.cognitiveEffort + c.awareness) / 3;
  return Math.round(((avg - 1) / 4) * 100);
}

// Build a map of dateString → activity level (0–4) for the activity grid
// Sources: challenges completed, daily done, journal entries, check-ins
function buildActivityMap(
  challenges: Challenge[],
  journalEntries: JournalEntry[],
  checkins: CheckIn[],
): Map<string, number> {
  const map = new Map<string, number>();

  const bump = (dateStr: string, amount: number) => {
    if (!dateStr || dateStr === "Invalid Date") return;
    map.set(dateStr, Math.min(4, (map.get(dateStr) ?? 0) + amount));
  };

  // Completed challenges — status is "completed_free" or "completed_credit", field is completed_at
  challenges
    .filter(c => (c.status === "completed_free" || c.status === "completed_credit") && c.completed_at != null)
    .forEach(c => {
      const ts = Date.parse(c.completed_at as string);
      if (!isNaN(ts)) {
        const d = new Date(ts).toDateString();
        bump(d, 2);
      }
    });

  // Journal entries
  journalEntries.forEach(e => bump(e.date, 1));

  // Check-ins
  checkins.forEach(c => bump(c.date, 1));

  // Daily task completions (only safe to call on client)
  try {
    const dailyDone = localStorage.getItem("ss_daily_done");
    if (dailyDone) bump(dailyDone, 2);
  } catch { /* SSR guard */ }

  return map;
}

// Compute journal streak (consecutive days with entries)
function journalStreak(entries: JournalEntry[]): number {
  if (!entries.length) return 0;
  const dates = new Set(entries.map(e => e.date));
  let streak = 0;
  const d = new Date();
  // start from today or yesterday (don't penalise if today not done yet)
  if (!dates.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (dates.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// Compute longest challenge streak from completedAt timestamps
function longestStreak(challenges: Challenge[]): number {
  const done = challenges
    .filter(c => (c.status === "completed_free" || c.status === "completed_credit") && c.completed_at != null)
    .map(c => {
      const ts = Date.parse(c.completed_at as string);
      return isNaN(ts) ? null : new Date(ts).toDateString();
    })
    .filter(Boolean) as string[];
  const unique = Array.from(new Set(done)).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  let max = 0, curr = 0;
  for (let i = 0; i < unique.length; i++) {
    if (i === 0) { curr = 1; continue; }
    const prev = new Date(unique[i - 1]);
    const cur  = new Date(unique[i]);
    const diff = (cur.getTime() - prev.getTime()) / 86400000;
    curr = diff === 1 ? curr + 1 : 1;
    max  = Math.max(max, curr);
  }
  return Math.max(max, curr);
}

// ─── Activity Grid (GitHub style — fills full container width) ───────────────

function ActivityGrid({ activityMap }: { activityMap: Map<string, number> }) {
  // Build 52 weeks × 7 days grid, ending today
  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  const WEEKS    = 52;
  const DAYS     = 7;

  // Start from the Sunday 52 weeks ago
  const start = new Date(today);
  start.setDate(today.getDate() - (WEEKS * DAYS - 1) - today.getDay());

  // Build flat array of all days
  const allDays: { date: Date; level: number }[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < WEEKS * DAYS; i++) {
    allDays.push({
      date:  new Date(cursor),
      level: activityMap.get(cursor.toDateString()) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Group into weeks (columns)
  const weeks: typeof allDays[] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(allDays.slice(w * DAYS, (w + 1) * DAYS));
  }

  // Month labels — find first day of each month in the grid
  const monthLabels: { label: string; weekIndex: number }[] = [];
  weeks.forEach((week, wi) => {
    week.forEach(day => {
      if (day.date.getDate() === 1) {
        monthLabels.push({
          label:     day.date.toLocaleDateString("en-GB", { month: "short" }),
          weekIndex: wi,
        });
      }
    });
  });

  const LEVEL_COLORS = [
    C.bg,           // 0 — no activity
    "#c6e8b3",      // 1 — light
    "#7bc96f",      // 2 — medium
    "#239a3b",      // 3 — good
    C.orange,       // 4 — great
  ];

  const todayStr = today.toDateString();

  return (
    <div style={{ width: "100%" }}>
      {/* Month labels */}
      <div style={{ display: "flex", marginBottom: 4, paddingLeft: 20 }}>
        {weeks.map((_, wi) => {
          const label = monthLabels.find(m => m.weekIndex === wi);
          return (
            <div
              key={wi}
              style={{
                flex:      1,
                fontSize:  9,
                color:     C.muted,
                textAlign: "left",
                minWidth:  0,
              }}
            >
              {label?.label ?? ""}
            </div>
          );
        })}
      </div>

      {/* Day labels + grid */}
      <div style={{ display: "flex", gap: 0 }}>
        {/* Day-of-week labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 4, paddingTop: 0 }}>
          {["", "M", "", "W", "", "F", ""].map((d, i) => (
            <div key={i} style={{ height: 11, fontSize: 8, color: C.muted, lineHeight: "11px", textAlign: "right", width: 12 }}>
              {d}
            </div>
          ))}
        </div>

        {/* The grid itself — fills remaining width */}
        <div style={{ flex: 1, display: "flex", gap: 2 }}>
          {weeks.map((week, wi) => (
            <div
              key={wi}
              style={{
                flex:            1,
                display:         "flex",
                flexDirection:   "column",
                gap:             2,
              }}
            >
              {week.map((day, di) => {
                const isToday  = day.date.toDateString() === todayStr;
                const isFuture = day.date > today;
                return (
                  <div
                    key={di}
                    title={`${day.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${
                      isFuture ? "future" : day.level === 0 ? "no activity" : `level ${day.level} activity`
                    }`}
                    style={{
                      width:        "100%",
                      paddingTop:   "100%",  // square via aspect ratio trick
                      borderRadius: 2,
                      background:   isFuture ? "transparent" : LEVEL_COLORS[day.level],
                      border:       isToday ? `1.5px solid ${C.orange}` : "none",
                      boxSizing:    "border-box",
                      cursor:       "default",
                      opacity:      isFuture ? 0 : 1,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 9, color: C.muted }}>Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: color, border: i === 0 ? `1px solid ${C.border}` : "none" }} />
        ))}
        <span style={{ fontSize: 9, color: C.muted }}>More</span>
      </div>
    </div>
  );
}

// ─── Dependency trend chart ───────────────────────────────────────────────────

function DependencyTrend({ checkins }: { checkins: CheckIn[] }) {
  if (checkins.length < 3) {
    return (
      <div style={{ padding: "24px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: C.muted, fontStyle: "italic", margin: 0 }}>
          Complete {3 - checkins.length} more daily check-in{3 - checkins.length !== 1 ? "s" : ""} to see your trend.
        </p>
      </div>
    );
  }

  // Last 30 check-ins, oldest first
  const recent = [...checkins]
    .sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime())
    .slice(-30);

  const scores  = recent.map(checkinScore);
  const maxScore = 100;
  const H = 80;  // chart height px
  const W = 100; // viewBox width (percentage-based)

  const points = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * W;
    const y = H - (s / maxScore) * H;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${H} ${points} ${W},${H}`;

  const SIGNAL_COLORS: Record<DependencySignal, string> = {
    Independent: C.success,
    Slipping:    "#E65100",
    Dependent:   "#C62828",
    Offloaded:   "#6A1B9A",
  };

  const latest  = recent[recent.length - 1];
  const oldest  = recent[0];
  const latestScore = checkinScore(latest);
  const oldestScore = checkinScore(oldest);
  const trend   = latestScore - oldestScore;
  const lineColor = latest.signal === "Independent" ? C.success
    : latest.signal === "Slipping" ? "#E65100"
    : "#C62828";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 28, fontWeight: 700, color: lineColor, fontFamily: "Georgia, serif" }}>
            {latestScore}%
          </span>
          <span style={{ fontSize: 12, color: C.muted, marginLeft: 6 }}>independence today</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{
            fontSize:     11,
            fontWeight:   700,
            color:        trend > 0 ? C.success : trend < 0 ? "#C62828" : C.muted,
            padding:      "3px 8px",
            background:   trend > 0 ? C.successLight : trend < 0 ? "#FECACA" : C.bg,
            borderRadius: 20,
          }}>
            {trend > 0 ? `↑ +${trend}` : trend < 0 ? `↓ ${trend}` : "→ steady"} over {recent.length} check-ins
          </span>
        </div>
      </div>

      {/* SVG chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 80, display: "block" }}
      >
        {/* Reference lines */}
        {[25, 50, 75].map(y => (
          <line
            key={y}
            x1="0" y1={H - (y / maxScore) * H}
            x2={W}  y2={H - (y / maxScore) * H}
            stroke={C.border} strokeWidth="0.5" strokeDasharray="2,2"
          />
        ))}
        {/* Area fill */}
        <polygon
          points={areaPoints}
          fill={lineColor}
          fillOpacity="0.08"
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Latest dot */}
        <circle
          cx={(scores.length - 1) / (scores.length - 1) * W}
          cy={H - (scores[scores.length - 1] / maxScore) * H}
          r="2"
          fill={lineColor}
        />
      </svg>

      {/* Signal breakdown for last 7 */}
      <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
        {recent.slice(-7).map((c, i) => {
          const color = SIGNAL_COLORS[c.signal];
          return (
            <div
              key={i}
              title={`${c.date}: ${c.signal} (${checkinScore(c)}%)`}
              style={{
                padding:      "2px 8px",
                background:   `${color}22`,
                border:       `1px solid ${color}66`,
                borderRadius: 12,
                fontSize:     9,
                color:        color,
                fontWeight:   700,
              }}
            >
              {c.signal.slice(0, 3).toUpperCase()}
            </div>
          );
        })}
        <span style={{ fontSize: 9, color: C.muted, alignSelf: "center" }}>last 7</span>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: string | number; sub?: string; accent?: boolean;
}) {
  return (
    <div style={{
      background:   C.card,
      border:       `1.5px solid ${accent ? C.orange : C.border}`,
      borderRadius: 12,
      padding:      "16px 18px",
      flex:         1,
      minWidth:     0,
    }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent ? C.orange : C.dark, fontFamily: "Georgia, serif", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 2, fontStyle: "italic" }}>{sub}</div>}
    </div>
  );
}

// ─── Milestone ────────────────────────────────────────────────────────────────

interface Milestone {
  id:        string;
  icon:      string;
  title:     string;
  desc:      string;
  check:     (data: MilestoneData) => boolean;
  reward:    string;
}

interface MilestoneData {
  completions: number;
  streak:      number;
  credits:     number;
  journalDays: number;
  challenges:  Challenge[];
  checkins:    CheckIn[];
}

const MILESTONES: Milestone[] = [
  {
    id: "first_completion",
    icon: "✦",
    title: "First Blood",
    desc: "Complete your first challenge without AI",
    check: d => d.completions >= 1,
    reward: "You started. Most don't.",
  },
  {
    id: "three_streak",
    icon: "🔥",
    title: "Three Days",
    desc: "3-day streak",
    check: d => d.streak >= 3,
    reward: "Habit is forming.",
  },
  {
    id: "first_credit",
    icon: "⚡",
    title: "Earned It",
    desc: "Earn your first AI Credit",
    check: d => d.credits >= 1,
    reward: "10 completions. You earned that credit.",
  },
  {
    id: "first_journal",
    icon: "✐",
    title: "Put It Down",
    desc: "Write your first journal entry",
    check: d => d.journalDays >= 1,
    reward: "Writing without AI is the practice.",
  },
  {
    id: "first_checkin",
    icon: "◎",
    title: "Self-Aware",
    desc: "Complete your first daily check-in",
    check: d => d.checkins.length >= 1,
    reward: "Awareness is the foundation.",
  },
  {
    id: "independent_signal",
    icon: "🧠",
    title: "Independent",
    desc: "Score 'Independent' on a daily check-in",
    check: d => d.checkins.some(c => c.signal === "Independent"),
    reward: "You felt it. Now build on it.",
  },
  {
    id: "week_streak",
    icon: "📅",
    title: "One Week",
    desc: "7-day streak",
    check: d => d.streak >= 7,
    reward: "A week of showing up.",
  },
  {
    id: "ten_completions",
    icon: "💪",
    title: "Ten Strong",
    desc: "10 challenge completions",
    check: d => d.completions >= 10,
    reward: "Your first full credit cycle.",
  },
  {
    id: "five_journal",
    icon: "📖",
    title: "Five Entries",
    desc: "5 journal entries",
    check: d => d.journalDays >= 5,
    reward: "You're building a record.",
  },
  {
    id: "advanced_tier",
    icon: "🎯",
    title: "Advanced",
    desc: "Reach the Advanced difficulty tier (30 completions)",
    check: d => d.completions >= 30,
    reward: "The tasks are harder now. You asked for it.",
  },
  {
    id: "month_streak",
    icon: "🏆",
    title: "One Month",
    desc: "30-day streak",
    check: d => d.streak >= 30,
    reward: "This is who you are now.",
  },
  {
    id: "fifty_completions",
    icon: "⚔️",
    title: "Fifty",
    desc: "50 challenge completions",
    check: d => d.completions >= 50,
    reward: "Five full credit cycles. You know what this costs.",
  },
];

function MilestoneCard({ milestone, unlocked }: { milestone: Milestone; unlocked: boolean }) {
  return (
    <div style={{
      background:   unlocked ? C.card : C.bg,
      border:       `1.5px solid ${unlocked ? C.gold : C.border}`,
      borderRadius: 10,
      padding:      "12px 16px",
      display:      "flex",
      alignItems:   "flex-start",
      gap:          12,
      opacity:      unlocked ? 1 : 0.6,
    }}>
      <div style={{
        width:        36,
        height:       36,
        borderRadius: 8,
        background:   unlocked ? C.goldDark : C.bg,
        border:       `1.5px solid ${unlocked ? C.gold : C.border}`,
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        fontSize:     18,
        flexShrink:   0,
      }}>
        {unlocked ? milestone.icon : "🔒"}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: unlocked ? C.dark : C.muted, fontFamily: "Georgia, serif" }}>
            {milestone.title}
          </span>
          {unlocked && <span style={{ fontSize: 9, color: C.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Unlocked</span>}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: unlocked ? 3 : 0 }}>{milestone.desc}</div>
        {unlocked && <div style={{ fontSize: 11, color: C.gold, fontStyle: "italic" }}>{milestone.reward}</div>}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const [loaded, setLoaded] = useState(false);

  // All state derived from localStorage
  const [credits,      setCredits]      = useState(0);
  const [progress,     setProgress]     = useState(0);
  const [streak,       setStreak]       = useState(0);
  const [completions,  setCompletions]  = useState(0);
  const [checkins,     setCheckins]     = useState<CheckIn[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [challenges,   setChallenges]   = useState<Challenge[]>([]);
  const [activityMap,  setActivityMap]  = useState<Map<string, number>>(new Map());

  useEffect(() => {
    async function loadAll() {
      const cr  = parseInt(localStorage.getItem("ss_credits")  ?? "0");
      const pr  = parseInt(localStorage.getItem("ss_progress") ?? "0");
      const st  = parseInt(localStorage.getItem("ss_streak")   ?? "0");
      const ci  = loadCheckins();
      const je  = loadJournalEntries();

      // Fetch from API (Supabase); fall back to localStorage cache
      let ch = await fetchChallengesFromAPI();
      if (ch.length === 0) ch = loadChallenges();


      setCredits(cr);
      setProgress(pr);
      setStreak(st);
      setCompletions(cr * 10 + pr);
      setCheckins(ci);
      setJournalEntries(je);
      setChallenges(ch);
      setActivityMap(buildActivityMap(ch, je, ci));
      setLoaded(true);
    }

    loadAll();

    // Re-load when user navigates back to this tab from /challenges
    const onVisible = () => { if (document.visibilityState === "visible") loadAll(); };
    document.addEventListener("visibilitychange", onVisible);

    // Cross-tab localStorage changes
    window.addEventListener("storage", loadAll);
    // Same-tab custom event
    window.addEventListener("ss_data_updated", loadAll);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", loadAll);
      window.removeEventListener("ss_data_updated", loadAll);
    };
  }, []);

  if (!loaded) return null;

  const completedChallenges = challenges.filter(c => c.status === "completed_free" || c.status === "completed_credit");
  const jStreak             = journalStreak(journalEntries);
  const longestCStreak      = longestStreak(challenges);
  const totalWords          = journalEntries.reduce((s, e: any) => s + (e.wordCount ?? 0), 0);

  const milestoneData: MilestoneData = {
    completions,
    streak,
    credits,
    journalDays: journalEntries.length,
    challenges,
    checkins,
  };

  const unlockedCount = MILESTONES.filter(m => m.check(milestoneData)).length;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif", margin: 0 }}>
          Progress
        </h2>
        <p style={{ color: C.muted, fontSize: 13, margin: "4px 0 0" }}>
          What you've built, in numbers that actually mean something.
        </p>
      </div>

      {/* Stat cards — top row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <StatCard icon="⚡" label="AI Credits" value={credits} sub="10 completions each" accent />
        <StatCard icon="🔥" label="Day Streak"  value={streak}  sub={streak >= 7 ? "One week+" : streak >= 3 ? "Building" : "Keep going"} />
        <StatCard icon="✦"  label="Completions" value={completions} sub={`${progress}/10 to next credit`} />
      </div>

      {/* Second row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard icon="✐" label="Journal Days"  value={journalEntries.length} sub={jStreak > 0 ? `${jStreak}-day writing streak` : "Start today"} />
        <StatCard icon="◎" label="Check-ins"     value={checkins.length}       sub={checkins.length > 0 ? `Latest: ${checkins[0]?.signal}` : "Daily reflection"} />
        <StatCard icon="📖" label="Words Written" value={totalWords > 999 ? `${(totalWords/1000).toFixed(1)}k` : totalWords} sub="without AI" />
      </div>

      {/* Next credit progress */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif" }}>Next AI Credit</div>
            <div style={{ fontSize: 11, color: C.muted }}>{progress} of 10 completions</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.orange, fontFamily: "Georgia, serif" }}>
            {10 - progress} to go
          </div>
        </div>
        <div style={{ height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(progress / 10) * 100}%`, background: C.orange, borderRadius: 4, transition: "width 0.5s ease" }} />
        </div>
      </div>

      {/* Dependency trend */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif", marginBottom: 14 }}>
          Dependency Trend
        </div>
        <DependencyTrend checkins={checkins} />
      </div>

      {/* Activity grid */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif" }}>
            Activity — Last 52 Weeks
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>
            challenges · journal · check-ins
          </div>
        </div>
        <ActivityGrid activityMap={activityMap} />
        {activityMap.size === 0 && (
          <p style={{ fontSize: 12, color: C.muted, fontStyle: "italic", textAlign: "center", margin: "16px 0 0" }}>
            Your activity will appear here as you complete challenges and write journal entries.
          </p>
        )}
      </div>

      {/* Challenge breakdown */}
      {completedChallenges.length > 0 && (
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif", marginBottom: 14 }}>
            Challenge Breakdown
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(["Writing", "Logic", "Coding"] as const).map(type => {
              const count = completedChallenges.filter(c => c.category === type).length;
              const pct   = completedChallenges.length > 0 ? Math.round((count / completedChallenges.length) * 100) : 0;
              const TYPE_COLOR: Record<string,string> = { Writing:"#6A1B9A", Logic:"#1B5E20", Coding:"#1565C0" };
              const TYPE_BG:    Record<string,string> = { Writing:"#F3E5F5", Logic:"#E8F5E9", Coding:"#E3F2FD" };
              return (
                <div key={type} style={{ flex: 1, minWidth: 80, textAlign: "center", padding: "12px 8px", background: TYPE_BG[type], borderRadius: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: TYPE_COLOR[type], fontFamily: "Georgia, serif" }}>{count}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: TYPE_COLOR[type], textTransform: "uppercase", letterSpacing: "0.08em" }}>{type}</div>
                  <div style={{ fontSize: 10, color: TYPE_COLOR[type], opacity: 0.7 }}>{pct}%</div>
                </div>
              );
            })}
            <div style={{ flex: 1, minWidth: 80, textAlign: "center", padding: "12px 8px", background: C.bg, borderRadius: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.orange, fontFamily: "Georgia, serif" }}>{longestCStreak}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: "0.08em" }}>Best Streak</div>
              <div style={{ fontSize: 10, color: C.muted }}>days</div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "Georgia, serif" }}>
            Milestones
          </div>
          <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>
            {unlockedCount} / {MILESTONES.length} unlocked
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Unlocked first, then locked */}
          {[
            ...MILESTONES.filter(m => m.check(milestoneData)),
            ...MILESTONES.filter(m => !m.check(milestoneData)),
          ].map(m => (
            <MilestoneCard
              key={m.id}
              milestone={m}
              unlocked={m.check(milestoneData)}
            />
          ))}
        </div>
      </div>

      {/* Behaviour Report CTA */}
      <div style={{ marginTop:16, background:C.goldDark, border:`1.5px solid ${C.gold}`, borderRadius:12, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4 }}>Behaviour Report</div>
          <p style={{ fontSize:13, color:"#c9b87a", margin:0, lineHeight:1.5 }}>
            Everything above, synthesised into honest behavioural feedback.
          </p>
        </div>
        <a href="/report" style={{ padding:"8px 18px", background:C.gold, border:"none", borderRadius:8, color:"#1a1208", fontSize:12, fontWeight:700, cursor:"pointer", textDecoration:"none", flexShrink:0 }}>
          View Report ⊞
        </a>
      </div>

    </div>
  );
}