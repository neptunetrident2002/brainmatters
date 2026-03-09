// ─── credits.ts ──────────────────────────────────────────────────────────────
//
// Single source of truth for all credit operations.
// Works in two modes:
//   - localStorage-only (unauthenticated users)
//   - localStorage + Supabase sync (authenticated users)
//
// Always write to localStorage first (instant UI feedback),
// then sync to Supabase if a session exists.

"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreditState {
  credits:  number;  // total balance
  progress: number;  // completions toward next credit (0–9)
}

// ─── localStorage ops ─────────────────────────────────────────────────────────

export function getCredits(): CreditState {
  if (typeof window === "undefined") return { credits: 0, progress: 0 };
  return {
    credits:  parseInt(localStorage.getItem("ss_credits")  ?? "0"),
    progress: parseInt(localStorage.getItem("ss_progress") ?? "0"),
  };
}

export function setCreditsLocal(state: CreditState): void {
  localStorage.setItem("ss_credits",  String(state.credits));
  localStorage.setItem("ss_progress", String(state.progress));
}

// ─── Earn a completion (call after every AI-free completion) ──────────────────
// Returns the new state AND whether a credit was just earned (for celebration UI)

export function earnCompletion(): { state: CreditState; creditEarned: boolean } {
  const current = getCredits();
  const np = current.progress + 1;

  let newState: CreditState;
  let creditEarned = false;

  if (np >= 10) {
    newState = { credits: current.credits + 1, progress: 0 };
    creditEarned = true;
  } else {
    newState = { credits: current.credits, progress: np };
  }

  setCreditsLocal(newState);
  return { state: newState, creditEarned };
}

// ─── Spend credits ────────────────────────────────────────────────────────────
// Returns false if insufficient balance.

export function spendCredits(amount: number): boolean {
  const current = getCredits();
  if (current.credits < amount) return false;
  setCreditsLocal({ ...current, credits: current.credits - amount });
  return true;
}

// ─── Supabase sync ────────────────────────────────────────────────────────────
// Columns match schema: ai_credits, ai_credits_progress

export async function syncCreditsToSupabase(
  supabase:  any,
  userId:    string,
  state:     CreditState,
): Promise<void> {
  try {
    await supabase
      .from("users")
      .upsert({
        id:                  userId,
        ai_credits:          state.credits,
        ai_credits_progress: state.progress,
        updated_at:          new Date().toISOString(),
      });
  } catch (err) {
    console.warn("[credits] Supabase sync failed:", err);
  }
}

// On login: pull credits from Supabase, take the higher value
export async function pullCreditsFromSupabase(
  supabase: any,
  userId:   string,
): Promise<void> {
  try {
    const { data } = await supabase
      .from("users")
      .select("ai_credits, ai_credits_progress")
      .eq("id", userId)
      .single();

    if (data) {
      const local = getCredits();
      // Take the max — protects against data loss if local is ahead
      const remoteCredits  = data.ai_credits          ?? 0;
      const remoteProgress = data.ai_credits_progress ?? 0;
      if (remoteCredits > local.credits) {
        setCreditsLocal({ credits: remoteCredits, progress: remoteProgress });
      }
    }
  } catch (err) {
    console.warn("[credits] Supabase pull failed:", err);
  }
}

// ─── Push all local data to Supabase on sign-in ───────────────────────────────
// Call once after a user signs in or creates an account.
// Syncs: credits, checkins, streak, profile display name.

export async function pushLocalDataToSupabase(
  supabase: any,
  userId:   string,
): Promise<void> {
  const local = getCredits();

  // 1 — credits (always push local if DB row doesn't exist yet)
  try {
    const { data: existing } = await supabase
      .from("users")
      .select("ai_credits")
      .eq("id", userId)
      .single();

    const dbCredits = existing?.ai_credits ?? 0;
    await supabase.from("users").upsert({
      id:                  userId,
      ai_credits:          Math.max(local.credits, dbCredits),
      ai_credits_progress: local.progress,
      updated_at:          new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[credits] push credits failed:", err);
  }

  // 2 — checkins
  try {
    const raw = localStorage.getItem("ss_checkins");
    if (raw) {
      const checkins: any[] = JSON.parse(raw);
      const rows = checkins.map(c => ({
        user_id:          userId,
        date:             c.date,
        ai_usage:         c.aiUsage,
        cognitive_effort: c.cognitiveEffort,
        awareness:        c.awareness,
        signal:           c.signal,
        saved_at:         c.savedAt,
      }));
      // upsert — unique (user_id, date) constraint handles duplicates
      await supabase.from("checkins").upsert(rows, { onConflict: "user_id,date" });
    }
  } catch (err) {
    console.warn("[credits] push checkins failed:", err);
  }

  // 3 — streak
  try {
    const streak = parseInt(localStorage.getItem("ss_streak") ?? "0");
    if (streak > 0) {
      await supabase
        .from("users")
        .update({ streak_days: streak, updated_at: new Date().toISOString() })
        .eq("id", userId);
    }
  } catch (err) {
    console.warn("[credits] push streak failed:", err);
  }
}

// ─── Refresh gate ─────────────────────────────────────────────────────────────

const DAILY_FREE_REFRESHES = 2;

export function getRefreshState(): { count: number; date: string } {
  const today = new Date().toDateString();
  const stored = localStorage.getItem("ss_refresh_date");
  if (stored !== today) {
    localStorage.setItem("ss_refresh_date",  today);
    localStorage.setItem("ss_refresh_count", "0");
    return { count: 0, date: today };
  }
  return {
    count: parseInt(localStorage.getItem("ss_refresh_count") ?? "0"),
    date:  today,
  };
}

export function incrementRefreshCount(): void {
  const { count } = getRefreshState();
  localStorage.setItem("ss_refresh_count", String(count + 1));
}

export function refreshIsFree(): boolean {
  return getRefreshState().count < DAILY_FREE_REFRESHES;
}

export function freeRefreshesRemaining(): number {
  return Math.max(0, DAILY_FREE_REFRESHES - getRefreshState().count);
}