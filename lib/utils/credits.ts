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
// Call after earn or spend if user is authenticated.
// Takes the Supabase client + userId as params to avoid import cycles.

export async function syncCreditsToSupabase(
  supabase:  any,
  userId:    string,
  state:     CreditState,
): Promise<void> {
  try {
    await supabase
      .from("users")
      .upsert({ id: userId, credits: state.credits, updated_at: new Date().toISOString() });
  } catch (err) {
    // Non-blocking — localStorage is source of truth
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
      .select("credits")
      .eq("id", userId)
      .single();

    if (data?.credits != null) {
      const local = getCredits();
      // Take the max — protects against data loss if local is ahead
      if (data.credits > local.credits) {
        setCreditsLocal({ ...local, credits: data.credits });
      }
    }
  } catch (err) {
    console.warn("[credits] Supabase pull failed:", err);
  }
}

// ─── Refresh gate ─────────────────────────────────────────────────────────────
// Tracks free challenge refreshes per day. 2 free, then 1 credit each.

const DAILY_FREE_REFRESHES = 2;

export function getRefreshState(): { count: number; date: string } {
  const today = new Date().toDateString();
  const stored = localStorage.getItem("ss_refresh_date");
  if (stored !== today) {
    // New day — reset
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