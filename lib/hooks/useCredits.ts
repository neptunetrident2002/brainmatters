"use client";

import { useState } from "react";
import type { User } from "@/types";

// Local optimistic credit state — syncs with server via useUser realtime
export function useCredits(initialUser: User | null) {
  const [credits, setCredits] = useState(initialUser?.ai_credits ?? 0);
  const [progress, setProgress] = useState(initialUser?.ai_credits_progress ?? 0);

  async function spendCredit(challengeId: string): Promise<boolean> {
    if (credits < 1) return false;

    // Optimistic update
    setCredits(c => c - 1);

    const res = await fetch("/api/credits/spend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId }),
    });

    if (!res.ok) {
      // Rollback
      setCredits(c => c + 1);
      return false;
    }
    return true;
  }

  function addProgress() {
    const next = progress + 1;
    if (next >= 10) {
      setCredits(c => c + 1);
      setProgress(0);
    } else {
      setProgress(next);
    }
  }

  return { credits, progress, spendCredit, addProgress };
}
