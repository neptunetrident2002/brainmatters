// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  display_name: string;
  ai_credits: number;
  ai_credits_progress: number;  // 0–9, challenges toward next credit
  streak_days: number;
  total_challenges: number;
  organisation_id: string | null; // Reserved for Teams tier — do not remove
  feed_public: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Challenges ───────────────────────────────────────────────────────────────
export type ChallengeStatus =
  | "pending"
  | "in_progress"
  | "completed_free"    // Completed without AI — contributes to credit counter
  | "completed_credit"; // Completed using an AI Credit

export type ChallengeCategory =
  | "Coding"
  | "Writing"
  | "Math"
  | "Memory"
  | "Logic"
  | "Professional";

export type RecurringType = "daily" | "weekly" | "once";

export interface Challenge {
  id: string;
  user_id: string;
  title: string;
  category: ChallengeCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: ChallengeStatus;
  recurring: RecurringType;
  streak: number;
  started_at: string | null;
  completed_at: string | null;
  time_elapsed_seconds: number | null;
  created_at: string;
  updated_at: string;
}

// ─── Task of the Day ──────────────────────────────────────────────────────────
export interface DailyTask {
  id: string;
  date: string;           // YYYY-MM-DD
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  code_snippet: string | null;
  completions_count: number;
  created_at: string;
}

export interface DailyCompletion {
  id: string;
  user_id: string;
  daily_task_id: string;
  completed_at: string;
  time_elapsed_seconds: number;
  used_ai_credit: boolean;
}

// ─── Events (source of truth for all graphs) ──────────────────────────────────
// PRD non-negotiable: this table must exist from Week 1
export type EventType =
  | "challenge_started"
  | "challenge_completed_free"
  | "challenge_completed_credit"
  | "credit_earned"
  | "credit_spent"
  | "daily_completed"
  | "game_played"
  | "streak_extended"
  | "streak_broken";

export interface AppEvent {
  id: string;
  user_id: string;
  type: EventType;
  metadata: Record<string, unknown>; // Flexible payload per event type
  created_at: string;               // Never remove. This is the graph data.
}

// ─── Feed ─────────────────────────────────────────────────────────────────────
export type FeedItemType =
  | "completion"
  | "daily"
  | "streak"
  | "credit";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  user_display_name: string;
  challenge_title?: string;
  category?: ChallengeCategory;
  time_elapsed_seconds?: number;
  ai_free?: boolean;
  streak_days?: number;
  daily_task_title?: string;
  daily_completions_count?: number;
  created_at: string;
}

// ─── AI Credits ───────────────────────────────────────────────────────────────
export interface CreditTransaction {
  id: string;
  user_id: string;
  delta: number;      // +1 (earned) or -1 (spent)
  reason: "earned_10_challenges" | "spent_challenge" | "spent_daily";
  challenge_id: string | null;
  created_at: string;
}

// ─── Games ────────────────────────────────────────────────────────────────────
export type GameType = "dots_and_boxes" | "tic_tac_toe";
export type GameOutcome = "win" | "loss" | "draw";

export interface GameRecord {
  id: string;
  user_id: string;
  game_type: GameType;
  outcome: GameOutcome;
  difficulty: string;
  duration_seconds: number;
  created_at: string;
}

// ─── API Response Helpers ─────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: { message: string; code?: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
