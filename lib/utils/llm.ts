// ─── llm.ts ───────────────────────────────────────────────────────────────────
//
// Thin client wrapper — delegates all LLM calls to /api/llm (server-side).
// This avoids CORS errors and keeps API keys out of the browser bundle.
//
// The provider logic, fallback chain, and rate-limit handling all live
// in app/api/llm/route.ts. This file just provides the same public API
// so taskgen.ts and other callers need no changes.
//
// Rate-limit tracking is still done client-side via sessionStorage so the
// UI can show provider status without a round-trip.

"use client";

export type LLMProvider = "gemini" | "groq" | "anthropic";

// ─── Rate limit tracking (client-side only, for UI feedback) ─────────────────

const COOLDOWN_MS = 60 * 60 * 1000;

function markRateLimited(provider: LLMProvider): void {
  try { sessionStorage.setItem(`llm_rl_${provider}`, String(Date.now() + COOLDOWN_MS)); } catch {}
}

function isRateLimited(provider: LLMProvider): boolean {
  try {
    const raw = sessionStorage.getItem(`llm_rl_${provider}`);
    if (!raw) return false;
    const expiry = parseInt(raw);
    if (Date.now() < expiry) return true;
    sessionStorage.removeItem(`llm_rl_${provider}`);
    return false;
  } catch { return false; }
}

function clearRateLimit(provider: LLMProvider): void {
  try { sessionStorage.removeItem(`llm_rl_${provider}`); } catch {}
}

// ─── Error types ──────────────────────────────────────────────────────────────

export class LLMRateLimitError extends Error {
  constructor(public provider: LLMProvider) {
    super(`Rate limit hit on ${provider}`);
    this.name = "LLMRateLimitError";
  }
}

export class LLMExhaustedError extends Error {
  constructor(public attempted: LLMProvider[]) {
    super(`All LLM providers exhausted: ${attempted.join(", ")}`);
    this.name = "LLMExhaustedError";
  }
}

// ─── Main export: llmCall ─────────────────────────────────────────────────────
// Calls /api/llm which handles provider selection, fallback, and key auth.
// Throws LLMExhaustedError if the server reports all providers failed.

export async function llmCall(
  system:    string,
  user:      string,
  maxTokens: number = 700,
): Promise<string> {
  let response: Response;

  try {
    response = await fetch("/api/llm", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ system, user, maxTokens }),
    });
  } catch (err) {
    throw new LLMExhaustedError([]);
  }

  const data = await response.json();

  if (!response.ok) {
    // Server exhausted all providers
    if (response.status === 503) {
      throw new LLMExhaustedError(["gemini", "groq", "anthropic"]);
    }
    throw new Error(`LLM proxy error ${response.status}: ${data.error ?? "unknown"}`);
  }

  // Track which provider succeeded (for UI status panel)
  if (data.provider) {
    clearRateLimit(data.provider as LLMProvider);
  }

  return data.text ?? "";
}

// ─── Dev utility: provider status ────────────────────────────────────────────

export function getProviderStatus(): Array<{
  provider:        LLMProvider;
  rateLimited:     boolean;
  cooldownMinutes: number | null;
}> {
  return (["gemini", "groq", "anthropic"] as LLMProvider[]).map(provider => {
    const limited = isRateLimited(provider);
    let cooldownMinutes: number | null = null;
    if (limited) {
      try {
        const expiry = parseInt(sessionStorage.getItem(`llm_rl_${provider}`) ?? "0");
        cooldownMinutes = Math.ceil((expiry - Date.now()) / 60000);
      } catch {}
    }
    return { provider, rateLimited: limited, cooldownMinutes };
  });
}