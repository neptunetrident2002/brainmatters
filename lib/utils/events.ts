import { createAdminClient } from "@/lib/supabase/server";
import type { EventType } from "@/types";

// PRD non-negotiable: every user action writes to the events table.
// This is the source of truth for all graphs. Never bypass this.
export async function logEvent(
  userId: string,
  type: EventType,
  metadata: Record<string, unknown> = {}
) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("events").insert({
      user_id: userId,
      type,
      metadata,
    });
    if (error) console.error("Event logging failed:", error.message);
  } catch (err) {
    // Event logging should never crash a request — log and continue
    console.error("Event logging exception:", err);
  }
}

// Convenience wrappers
export const Events = {
  challengeStarted: (userId: string, challengeId: string) =>
    logEvent(userId, "challenge_started", { challenge_id: challengeId }),

  challengeCompletedFree: (userId: string, challengeId: string, seconds: number, category: string) =>
    logEvent(userId, "challenge_completed_free", { challenge_id: challengeId, seconds, category }),

  challengeCompletedCredit: (userId: string, challengeId: string) =>
    logEvent(userId, "challenge_completed_credit", { challenge_id: challengeId }),

  creditEarned: (userId: string) =>
    logEvent(userId, "credit_earned", {}),

  creditSpent: (userId: string, challengeId: string) =>
    logEvent(userId, "credit_spent", { challenge_id: challengeId }),

  dailyCompleted: (userId: string, dailyTaskId: string, seconds: number, usedCredit: boolean) =>
    logEvent(userId, "daily_completed", { daily_task_id: dailyTaskId, seconds, used_credit: usedCredit }),

  gamePlayed: (userId: string, gameType: string, outcome: string, difficulty: string) =>
    logEvent(userId, "game_played", { game_type: gameType, outcome, difficulty }),

  streakExtended: (userId: string, days: number) =>
    logEvent(userId, "streak_extended", { days }),

  streakBroken: (userId: string, days: number) =>
    logEvent(userId, "streak_broken", { days }),
};
