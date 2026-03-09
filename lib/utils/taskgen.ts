// ─── taskgen.ts ───────────────────────────────────────────────────────────────
//
// Centralised task generation for BrainMatters.
//
// Reads from localStorage:
//   ss_profile       — onboarding answers + export themes
//   ss_credits       — AI credits earned
//   ss_progress      — completions toward next credit (0-9)
//   ss_streak        — consecutive days active
//   ss_recent_tasks  — last 5 task types completed (for rotation)
//
// Exports:
//   generateTask(overrideType?)  — main entry point for all pages
//   evaluateWriting(task, text)  — Claude evaluation for writing tasks
//   recordTaskType(type)         — call after every completion
//   getDifficultyTier()          — current tier based on completions
//   loadProfile()                — read ss_profile from localStorage

export type TaskType       = "writing" | "recall" | "logic";
export type DifficultyTier = "beginner" | "intermediate" | "advanced";

export interface GeneratedTask {
  type:               TaskType;
  title:              string;
  prompt:             string;
  constraint:         string;
  timeLimit:          number;
  evalType:           "self" | "claude";
  whatGoodLooksLike:  string;
  tier:               DifficultyTier;
}

export interface UserProfile {
  lastQuery:      string;
  behaviors:      string[];
  rustySkill:     string;
  timeLimit:      number;
  recentPrompts:  string;
  exportThemes?:  string;
  createdAt:      string;
}

// ─── 1. localStorage readers ──────────────────────────────────────────────────

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem("ss_profile");
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch { return null; }
}

function getTotalCompletions(): number {
  const credits  = parseInt(localStorage.getItem("ss_credits")  ?? "0");
  const progress = parseInt(localStorage.getItem("ss_progress") ?? "0");
  return (credits * 10) + progress;
}

function getStreak(): number {
  return parseInt(localStorage.getItem("ss_streak") ?? "0");
}

function getRecentTaskTypes(): TaskType[] {
  try {
    const raw = localStorage.getItem("ss_recent_tasks");
    if (!raw) return [];
    return JSON.parse(raw) as TaskType[];
  } catch { return []; }
}

export function recordTaskType(type: TaskType): void {
  try {
    const recent  = getRecentTaskTypes();
    const updated = [type, ...recent].slice(0, 5);
    localStorage.setItem("ss_recent_tasks", JSON.stringify(updated));
  } catch {}
}

// ─── 2. Difficulty tier ───────────────────────────────────────────────────────

export function getDifficultyTier(): DifficultyTier {
  const completions = getTotalCompletions();
  if (completions >= 30) return "advanced";
  if (completions >= 10) return "intermediate";
  return "beginner";
}

interface TierConfig {
  label:           string;
  timeMult:        number;
  difficultyNote:  string;
  constraintNote:  string;
  streakNote:      (streak: number) => string;
}

const TIER_CONFIG: Record<DifficultyTier, TierConfig> = {
  beginner: {
    label:    "Beginner",
    timeMult: 1.0,
    difficultyNote: `
    - Task scope must be narrow and unambiguous — no open-ended interpretation
    - One clear thing to do, with a clear finish line
    - Difficulty comes from doing it without AI, not from complexity of the task itself
    - Do NOT make it trivial. Make it uncomfortable but achievable in the time given.`,
    constraintNote: `
    - Set a minimum floor (e.g. "at least 80 words") not a ceiling
    - One rule only — do not compound constraints at this tier
    - The constraint should be easy to understand and verify`,
    streakNote: (streak) => streak >= 3
      ? `The user is on a ${streak}-day streak — they are building consistency. Reward that with a slightly more interesting task than baseline, but keep it completable.`
      : `The user is early in their habit. Keep the task achievable so they complete it and build momentum.`,
  },
  intermediate: {
    label:    "Intermediate",
    timeMult: 1.0,
    difficultyNote: `
    - Narrow the scope to force depth — broad tasks allow surface answers
    - There should be no way to fake completion with a shallow response
    - Push into the specific skill they said is rusty — do not let them avoid it
    - The task should feel slightly uncomfortable to start`,
    constraintNote: `
    - Constraint must be exact and unambiguous (e.g. "exactly 100 words" not "about 100 words")
    - At least one structural rule in addition to any length rule
    - Must be possible to objectively check whether the constraint was met`,
    streakNote: (streak) => streak >= 7
      ? `The user has a ${streak}-day streak — they are consistent and can handle more pressure. Push them harder than you otherwise would.`
      : streak >= 3
      ? `The user has a ${streak}-day streak — consistent enough to be challenged. Don't make it easy.`
      : `The user's streak is short. Make the task genuinely demanding but ensure it's completable.`,
  },
  advanced: {
    label:    "Advanced",
    timeMult: 0.85,
    difficultyNote: `
    - Task must require synthesis across concepts, not just recall or description
    - Push into adjacent skills — if they are a writer, make them think structurally; if a coder, make them write
    - The task should feel genuinely hard to start. That discomfort is correct.
    - There should be no way to complete this task well in under the time given — depth is required`,
    constraintNote: `
    - Constraint must be compound — at least two simultaneous rules that create tension
    - Both rules must be possible to satisfy, but satisfying one should make the other harder
    - Example: "exactly 100 words AND no passive voice AND must include a concrete counterexample"`,
    streakNote: (streak) => streak >= 14
      ? `The user has an exceptional ${streak}-day streak. They are genuinely committed. Generate a task that respects that — something they will remember completing.`
      : streak >= 7
      ? `The user has a ${streak}-day streak at advanced level. They have earned difficulty. Do not hold back.`
      : `The user is at advanced tier but streak is short — they may have returned after a break. Challenging but not demoralising.`,
  },
};

// ─── 3. Task type selection ───────────────────────────────────────────────────

function selectTaskType(profile: UserProfile | null, overrideType?: TaskType): TaskType {
  if (overrideType) return overrideType;

  const all: TaskType[] = ["writing", "recall", "logic"];
  const recent          = getRecentTaskTypes();
  const lastTwo         = recent.slice(0, 2);
  const available       = all.filter(t => !lastTwo.includes(t));
  const pool            = available.length > 0 ? available : all;

  if (!profile) return pool[Math.floor(Math.random() * pool.length)];

  const behaviors = profile.behaviors.join(" ").toLowerCase();
  const rusty     = profile.rustySkill.toLowerCase();

  let preferred: TaskType = "writing";

  const isLogic = behaviors.includes("debug") ||
                  behaviors.includes("code")  ||
                  behaviors.includes("problem solving") ||
                  rusty.includes("problem") ||
                  rusty.includes("critical thinking");

  const isRecall = behaviors.includes("summarize") ||
                   behaviors.includes("explain")   ||
                   behaviors.includes("information i should") ||
                   rusty.includes("memory") ||
                   rusty.includes("recall");

  if (isLogic)       preferred = "logic";
  else if (isRecall) preferred = "recall";

  return pool.includes(preferred)
    ? preferred
    : pool[Math.floor(Math.random() * pool.length)];
}

// ─── 4. System prompt ─────────────────────────────────────────────────────────

function buildSystemPrompt(
  profile:      UserProfile | null,
  taskType:     TaskType,
  tier:         DifficultyTier,
  streak:       number,
  completions:  number,
  recentTypes:  TaskType[],
): string {
  const config        = TIER_CONFIG[tier];
  const timeLimitMins = profile?.timeLimit ?? 15;
  const timeLimitSecs = Math.round(timeLimitMins * 60 * config.timeMult);

  const profileSection = profile
    ? `
═══ USER PROFILE ════════════════════════════════════════════════════════════
The user gave these answers during onboarding. Use them to make the task
feel uncomfortably specific — like it was written for this person, not a
generic "professional".

Last thing they asked AI to do (their most recent dependency):
  "${profile.lastQuery}"

Skills they outsource to AI at least weekly:
  ${profile.behaviors.slice(0, 8).map(b => `• ${b}`).join("\n  ")}

Skill they explicitly said they want to reclaim:
  "${profile.rustySkill}"

Their preferred session length: ${timeLimitMins} minutes
${profile.recentPrompts
  ? `\nRecent AI prompts they have actually sent (high-signal for task targeting):\n${profile.recentPrompts}`
  : ""}
${profile.exportThemes
  ? `\nThemes extracted from their full AI conversation history:\n${profile.exportThemes}`
  : ""}
`
    : `
═══ USER PROFILE ════════════════════════════════════════════════════════════
No profile data yet. Generate a high-quality general task that would be
relevant to a knowledge worker who uses AI regularly.
`;

  const recentTypesNote = recentTypes.length > 0
    ? `Recent task types completed (avoid repeating these): ${recentTypes.slice(0, 3).join(", ")}`
    : "No recent tasks — this may be their first.";

  const progressSection = `
═══ USER PROGRESS ═══════════════════════════════════════════════════════════
Total completions:  ${completions}
Current streak:     ${streak} day${streak !== 1 ? "s" : ""}
Difficulty tier:    ${config.label}
${recentTypesNote}

STREAK GUIDANCE:
${config.streakNote(streak)}
`;

  const difficultySection = `
═══ DIFFICULTY: ${config.label.toUpperCase()} ══════════════════════════════
Task difficulty:
${config.difficultyNote}

Constraint rules:
${config.constraintNote}

TIME LIMIT: The timeLimit field in your JSON must be exactly ${timeLimitSecs} seconds.
Do not deviate from this. The UI enforces it.
`;

  const outputRules = `
═══ OUTPUT RULES ════════════════════════════════════════════════════════════
1. Task type to generate: ${taskType}
2. evalType must be "claude" for writing tasks, "self" for recall and logic.
3. The prompt must feel written for THIS user, not a generic professional.
   If you have profile data, reference their specific dependency directly.
4. whatGoodLooksLike must be one honest sentence. Not flattering. Specific.
5. Return ONLY valid JSON. No markdown fences. No explanation. No preamble.
`;

  return [
    "You are a cognitive independence trainer. Your job is to generate one specific,",
    "timed challenge that forces the user to practise a skill they are currently",
    "outsourcing to AI. The task must be hard enough to matter, specific enough to",
    "feel personal, and completable within the time limit given.",
    profileSection,
    progressSection,
    difficultySection,
    outputRules,
  ].join("\n");
}

// ─── 5. User message ──────────────────────────────────────────────────────────

function buildUserMessage(taskType: TaskType, tier: DifficultyTier, timeLimitSecs: number): string {
  const baseFields = `  "type":              "${taskType}",
  "title":             "[3–5 word punchy title — not generic]",
  "prompt":            "[the task itself — 2–3 sentences, specific to their profile]",
  "timeLimit":         ${timeLimitSecs},
  "whatGoodLooksLike": "[one honest sentence — what does a good response look like]",
  "tier":              "${tier}"`;

  const schemas: Record<TaskType, string> = {
    writing: `Generate a WRITING task. The user must produce original written work without AI.

Return this exact JSON:
{
${baseFields},
  "evalType":   "claude",
  "constraint": "[${tier === "advanced"
    ? "two simultaneous rules — e.g. word count AND a forbidden word type AND a structural requirement. All must be checkable."
    : tier === "intermediate"
    ? "one exact rule — word count must be exact (e.g. 'exactly 100 words'), or a clear structural rule with no ambiguity"
    : "one achievable rule — a minimum floor (e.g. 'at least 80 words') and one simple structural requirement"
  }]"
}`,
    recall: `Generate a COLD RECALL task. The user must write from memory — no lookup, no AI, no notes.

Return this exact JSON:
{
${baseFields},
  "evalType":   "self",
  "constraint": "[${tier === "advanced"
    ? "must address three specific components: (1) the mechanism, (2) at least one exception or edge case, (3) a real-world application. Missing any one component is an incomplete answer."
    : tier === "intermediate"
    ? "must cover at least 3 distinct aspects of the topic. No external resources. Time limit enforced."
    : "write continuously for the full time. No external resources. No stopping to look anything up."
  }]"
}`,
    logic: `Generate a LOGIC / REASONING task. The user must reason through a problem or argument without AI or search.

Return this exact JSON:
{
${baseFields},
  "evalType":   "self",
  "constraint": "[${tier === "advanced"
    ? "three parts required in the response: (1) identify every flaw with precise explanation, (2) steelman the argument — make the best possible version of it, (3) write a repaired argument that avoids the flaws. All three are required. Missing one means incomplete."
    : tier === "intermediate"
    ? "identify at least 3 distinct flaws. For each: 2 sentences of explanation minimum, plus one real-world counterexample."
    : "identify at least 2 distinct flaws. One sentence explanation for each. Be specific — 'it is wrong' is not an explanation."
  }]"
}`,
  };

  return schemas[taskType];
}

// ─── 6. Fallback library ──────────────────────────────────────────────────────

const FALLBACKS: Record<TaskType, Record<DifficultyTier, GeneratedTask>> = {
  writing: {
    beginner: {
      type: "writing", tier: "beginner", title: "The Cold Email",
      prompt: "Write a cold outreach email to a potential client or collaborator in your field. No templates, no AI, no examples to copy. The email must come entirely from your own thinking about what would actually make this specific person respond.",
      constraint: "150 words maximum. Must end with a single, specific ask — not 'let me know if you're interested'.",
      timeLimit: 600, evalType: "claude",
      whatGoodLooksLike: "An opening that isn't about you, one clear reason why them specifically, one concrete ask in the final sentence.",
    },
    intermediate: {
      type: "writing", tier: "intermediate", title: "Explain Your Work",
      prompt: "Write an explanation of what you do professionally for someone who has never heard of your field. No jargon, no buzzwords, no AI-polished language. Use the first words that come to mind.",
      constraint: "Exactly 100 words — not 99, not 101. No industry jargon. Must include one concrete, specific example.",
      timeLimit: 480, evalType: "claude",
      whatGoodLooksLike: "A 10-year-old could understand it and find it interesting.",
    },
    advanced: {
      type: "writing", tier: "advanced", title: "The Dual Argument",
      prompt: "Pick a significant decision you have made in your work recently. Write the case for why it was the right call. Then immediately write the strongest possible case against it — as if written by someone who genuinely disagrees. No hedging in either direction.",
      constraint: "Exactly 100 words per side. Neither side may reference the other. Both must be independently convincing to a neutral reader.",
      timeLimit: 720, evalType: "claude",
      whatGoodLooksLike: "A neutral reader would find both sides genuinely compelling — not one strong and one obviously weak.",
    },
  },
  recall: {
    beginner: {
      type: "recall", tier: "beginner", title: "First Principles",
      prompt: "Write down everything you know about how the internet works — from the moment you click a link to the moment the page appears on your screen. No lookup, no AI. Just what is in your head right now.",
      constraint: "10 minutes. No external resources of any kind. Write continuously — do not stop to think for more than 30 seconds.",
      timeLimit: 600, evalType: "self",
      whatGoodLooksLike: "At least 3 distinct layers of the process named with reasonable accuracy.",
    },
    intermediate: {
      type: "recall", tier: "intermediate", title: "The Mental Map",
      prompt: "From memory only: write out the key steps, concepts, and principles of the primary skill you use in your work. Pretend you are teaching it to a new colleague on their first day. They need to be able to actually use what you write.",
      constraint: "8 minutes. No notes or lookup. Must cover: the core mechanism, at least 2 common mistakes, and one non-obvious insight a beginner would not know.",
      timeLimit: 480, evalType: "self",
      whatGoodLooksLike: "A logical sequence a beginner could follow, containing at least one genuinely non-obvious point.",
    },
    advanced: {
      type: "recall", tier: "advanced", title: "Depth Under Pressure",
      prompt: "From memory only: explain a core concept in your field thoroughly enough that an expert in that field would find nothing factually wrong with what you wrote. Do not simplify for a lay audience — write for someone who knows the field.",
      constraint: "10 minutes. Must address all three: (1) the mechanism or underlying principle, (2) at least one exception or edge case, (3) a real-world application or example. A response missing any of these is incomplete.",
      timeLimit: 600, evalType: "self",
      whatGoodLooksLike: "An expert finds it accurate. A motivated beginner finds it useful.",
    },
  },
  logic: {
    beginner: {
      type: "logic", tier: "beginner", title: "Find the Flaw",
      prompt: "Read this argument carefully: 'Studies show that remote workers complete more tasks per day than office workers. Therefore, all companies should switch to fully remote work to maximise productivity.' Identify the weak assumptions and logical flaws in this argument.",
      constraint: "Identify at least 2 distinct flaws. Write one sentence of explanation for each. 'It's wrong' is not an explanation — say specifically why it fails.",
      timeLimit: 480, evalType: "self",
      whatGoodLooksLike: "Correlation vs causation identified, at least one unstated assumption named, each flaw explained specifically.",
    },
    intermediate: {
      type: "logic", tier: "intermediate", title: "The Other Side",
      prompt: "Think of a belief you hold strongly about your field or your work — something you would defend in a meeting. Now write the strongest possible case against it, as if you were someone who genuinely disagreed. No strawmanning — the argument must be one that a thoughtful person could actually hold.",
      constraint: "At least 3 distinct points. Each point must have: a 2-sentence explanation of the argument AND one real-world counterexample. No dismissing your own points at the end.",
      timeLimit: 600, evalType: "self",
      whatGoodLooksLike: "Arguments that would make a neutral observer genuinely pause — not ones you have clearly pre-dismissed.",
    },
    advanced: {
      type: "logic", tier: "advanced", title: "Fix the Argument",
      prompt: "Read this argument: 'Countries with higher chocolate consumption per capita have significantly more Nobel Prize winners per capita. Therefore, chocolate consumption must stimulate the cognitive processes required for Nobel-level achievement. Governments should consider subsidising chocolate to increase national scientific output.' Your response has three required parts.",
      constraint: "Part 1 — Flaws: identify every logical flaw with precise explanation. Part 2 — Steelman: make the strongest possible version of the argument (be genuinely charitable). Part 3 — Repair: write a corrected version of the argument that avoids the flaws you identified. All three parts are required. Each minimum 3 sentences.",
      timeLimit: 720, evalType: "self",
      whatGoodLooksLike: "Flaws are named precisely, the steelman is genuinely charitable, the repaired argument makes a claim actually worth debating.",
    },
  },
};

function getFallback(taskType: TaskType, tier: DifficultyTier): GeneratedTask {
  const entry = FALLBACKS[taskType]?.[tier];
  if (!entry) return { ...FALLBACKS.writing.beginner };
  return { ...entry };
}

// ─── 7. Response parser ───────────────────────────────────────────────────────

function parseTask(
  text:              string,
  taskType:          TaskType,
  tier:              DifficultyTier,
  expectedTimeLimit: number,
): GeneratedTask {
  try {
    const clean  = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (!parsed.title)      throw new Error("Missing title");
    if (!parsed.prompt)     throw new Error("Missing prompt");
    if (!parsed.constraint) throw new Error("Missing constraint");
    if (!parsed.timeLimit)  throw new Error("Missing timeLimit");

    parsed.timeLimit = expectedTimeLimit;
    parsed.tier      = tier;
    parsed.type      = taskType;

    if (taskType === "writing") parsed.evalType = "claude";
    else                        parsed.evalType = "self";

    return parsed as GeneratedTask;
  } catch {
    return getFallback(taskType, tier);
  }
}

// ─── 8. Server-side LLM call via /api/ai ─────────────────────────────────────
// Replaces direct llmCall() — goes through your own API route so keys stay
// server-side and there are no CORS issues.

async function serverLlmCall(
  system:    string,
  user:      string,
  maxTokens: number = 700,
): Promise<string> {
  const response = await fetch("/api/ai", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ system, user, maxTokens }),
  });

  if (!response.ok) {
    const { error } = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error ?? `API error ${response.status}`);
  }

  const { text } = await response.json();
  return text ?? "";
}

// ─── 9. Main export: generateTask ────────────────────────────────────────────

export async function generateTask(overrideType?: TaskType): Promise<GeneratedTask> {
  const profile     = loadProfile();
  const tier        = getDifficultyTier();
  const streak      = getStreak();
  const completions = getTotalCompletions();
  const recentTypes = getRecentTaskTypes();
  const taskType    = selectTaskType(profile, overrideType);

  const config        = TIER_CONFIG[tier];
  const timeLimitMins = profile?.timeLimit ?? 15;
  const timeLimitSecs = Math.round(timeLimitMins * 60 * config.timeMult);

  try {
    const text = await serverLlmCall(
      buildSystemPrompt(profile, taskType, tier, streak, completions, recentTypes),
      buildUserMessage(taskType, tier, timeLimitSecs),
      700,
    );
    return parseTask(text, taskType, tier, timeLimitSecs);
  } catch {
    return getFallback(taskType, tier);
  }
}

// ─── 10. Writing evaluator ────────────────────────────────────────────────────

export async function evaluateWriting(
  task:       GeneratedTask,
  submission: string,
): Promise<{
  clarity:     number;
  depth:       number;
  originality: number;
  overall:     number;
  feedback:    string;
}> {
  const tierInstruction = {
    beginner:     "This is a beginner-tier task. Be encouraging but honest. Specifically name one thing they did well and one concrete improvement.",
    intermediate: "This is an intermediate-tier task. Hold them to a real standard. Avoid flattery. Name what is missing or weak.",
    advanced:     "This is an advanced-tier task. Be direct about shortcomings. Do not soften criticism. Name exactly what would make this response stronger.",
  }[task.tier];

  try {
    const evalSystem = `You evaluate writing exercises for a cognitive training app. Be honest, not flattering. ${tierInstruction} Return ONLY valid JSON — no markdown, no preamble.`;
    const evalUser   = `Task prompt: "${task.prompt}"
Constraint: "${task.constraint}"
User's submission:
"${submission}"

Score each dimension 1-5 (1 = poor, 5 = excellent):
- clarity: how clear and readable is the writing?
- depth: how substantive and thoughtful is the content?
- originality: how original and non-generic is the thinking?
- overall: your holistic score

Write exactly 2 sentences of feedback. Be specific — reference what they actually wrote.

Return ONLY: {"clarity":N,"depth":N,"originality":N,"overall":N,"feedback":"two specific sentences."}`;

    const rawText = await serverLlmCall(evalSystem, evalUser, 400);
    const clean   = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);

  } catch {
    return {
      clarity: 3, depth: 3, originality: 3, overall: 3,
      feedback: "Evaluation unavailable. Your effort is logged — the act of writing without AI is what counts.",
    };
  }
}