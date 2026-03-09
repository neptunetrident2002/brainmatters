// ─── llm.ts ───────────────────────────────────────────────────────────────────
//
// Provider-agnostic LLM abstraction for BrainMatters.
//
// PRIMARY PROVIDER set via NEXT_PUBLIC_LLM_PROVIDER in .env.local.
// If it hits a rate limit or quota error, automatically falls through
// the FALLBACK_CHAIN in order until one succeeds.
//
// Providers:
//   gemini     — Google Gemini 1.5 Flash. 1,500 req/day free. DEFAULT.
//   groq       — Llama 3.3 70B via Groq. ~6,000 req/day free. Very fast.
//   anthropic  — Claude Sonnet. Paid. Best quality. Use post-PMF.
//
// .env.local keys needed (only the ones you use):
//   NEXT_PUBLIC_LLM_PROVIDER=gemini
//   NEXT_PUBLIC_GEMINI_API_KEY=AIza...
//   NEXT_PUBLIC_GROQ_API_KEY=gsk_...
//   NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
//
// Automatic fallback chain (default):
//   gemini → groq → anthropic
//
// If ALL providers fail, throws a LLMExhaustedError.
// Callers (taskgen.ts) catch this and serve from the local fallback library.

export type LLMProvider = "gemini" | "groq" | "anthropic";

// ─── Rate limit tracking ──────────────────────────────────────────────────────
// Tracks which providers have hit their limit this session, and when the
// cooldown expires. Uses sessionStorage so it resets on tab close.

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown after rate limit hit

function markRateLimited(provider: LLMProvider): void {
  try {
    const expiry = Date.now() + COOLDOWN_MS;
    sessionStorage.setItem(`llm_rl_${provider}`, String(expiry));
  } catch {}
}

function isRateLimited(provider: LLMProvider): boolean {
  try {
    const raw = sessionStorage.getItem(`llm_rl_${provider}`);
    if (!raw) return false;
    const expiry = parseInt(raw);
    if (Date.now() < expiry) return true;
    // Cooldown expired — clear it
    sessionStorage.removeItem(`llm_rl_${provider}`);
    return false;
  } catch {
    return false;
  }
}

function clearRateLimit(provider: LLMProvider): void {
  try { sessionStorage.removeItem(`llm_rl_${provider}`); } catch {}
}

// ─── Provider definitions ─────────────────────────────────────────────────────

interface ProviderConfig {
  name:         string;
  model:        string;
  apiUrl:       string;
  getKey:       () => string;
  format:       "openai-compat" | "anthropic-native";
  freeTierNote: string;
}

const PROVIDERS: Record<LLMProvider, ProviderConfig> = {
  gemini: {
    name:    "Google Gemini Flash",
    model:   "gemini-1.5-flash",
    apiUrl:  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    getKey:  () => process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "",
    format:  "openai-compat",
    freeTierNote: "1,500 req/day free — covers ~500 DAU comfortably",
  },
  groq: {
    name:    "Groq (Llama 3.3 70B)",
    model:   "llama-3.3-70b-versatile",
    apiUrl:  "https://api.groq.com/openai/v1/chat/completions",
    getKey:  () => process.env.NEXT_PUBLIC_GROQ_API_KEY ?? "",
    format:  "openai-compat",
    freeTierNote: "~6,000 req/day free on 70B — good secondary fallback",
  },
  anthropic: {
    name:    "Anthropic Claude Sonnet",
    model:   "claude-sonnet-4-20250514",
    apiUrl:  "https://api.anthropic.com/v1/messages",
    getKey:  () => process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ?? "",
    format:  "anthropic-native",
    freeTierNote: "Paid — best quality. Use as last resort or post-PMF.",
  },
};

// ─── Fallback chain ───────────────────────────────────────────────────────────
// Order matters. Primary first, then fallbacks in priority order.
// Only providers with a key configured are included at runtime.

function buildChain(): LLMProvider[] {
  const primary = (process.env.NEXT_PUBLIC_LLM_PROVIDER as LLMProvider) ?? "gemini";

  // Default order: configured primary first, then the other two
  const all: LLMProvider[] = ["gemini", "groq", "anthropic"];
  const ordered: LLMProvider[] = [
    primary,
    ...all.filter(p => p !== primary),
  ];

  // Only include providers that have a key set
  return ordered.filter(p => Boolean(PROVIDERS[p].getKey()));
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

// ─── Rate limit detection ─────────────────────────────────────────────────────
// Each provider signals rate limits differently. Normalise them here.

function isRateLimitResponse(provider: LLMProvider, status: number, body: string): boolean {
  if (status === 429) return true; // universal

  // Gemini sometimes returns 200 with an error body
  if (provider === "gemini" && body.includes("RESOURCE_EXHAUSTED")) return true;

  // Groq uses 429 but also sends this in the body
  if (provider === "groq" && body.includes("rate_limit_exceeded")) return true;

  // Anthropic uses 429 and also 529 (overloaded)
  if (provider === "anthropic" && status === 529) return true;

  return false;
}

// ─── Single provider call ─────────────────────────────────────────────────────

async function callProvider(
  provider:  LLMProvider,
  system:    string,
  user:      string,
  maxTokens: number,
): Promise<string> {
  const config = PROVIDERS[provider];
  const key    = config.getKey();

  if (!key) throw new Error(`No API key for ${provider}`);

  // ── OpenAI-compatible (Gemini + Groq) ──────────────────────────────────────
  if (config.format === "openai-compat") {
    const response = await fetch(config.apiUrl, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model:      config.model,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user",   content: user   },
        ],
      }),
    });

    const body = await response.text();

    if (isRateLimitResponse(provider, response.status, body)) {
      markRateLimited(provider);
      throw new LLMRateLimitError(provider);
    }

    if (!response.ok) {
      throw new Error(`${config.name} error ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = JSON.parse(body);
    return data.choices?.[0]?.message?.content ?? "";
  }

  // ── Anthropic native ───────────────────────────────────────────────────────
  const response = await fetch(config.apiUrl, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "x-api-key":     key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model:      config.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  const body = await response.text();

  if (isRateLimitResponse(provider, response.status, body)) {
    markRateLimited(provider);
    throw new LLMRateLimitError(provider);
  }

  if (!response.ok) {
    throw new Error(`${config.name} error ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = JSON.parse(body);
  return data.content?.map((b: any) => b.text || "").join("") ?? "";
}

// ─── Main export: llmCall ─────────────────────────────────────────────────────
//
// Tries providers in order. On rate limit → marks provider as limited for
// 1 hour and immediately tries the next one. On any other error → also
// tries the next provider (network blip, model overloaded, etc).
//
// Throws LLMExhaustedError only if ALL providers fail.
// taskgen.ts catches this and falls back to the local task library.

export async function llmCall(
  system:    string,
  user:      string,
  maxTokens: number = 700,
): Promise<string> {
  const chain    = buildChain();
  const attempted: LLMProvider[] = [];

  if (chain.length === 0) {
    throw new LLMExhaustedError([]);
  }

  for (const provider of chain) {
    // Skip if currently rate-limited
    if (isRateLimited(provider)) {
      console.info(`[llm] ${provider} is rate-limited — skipping`);
      continue;
    }

    attempted.push(provider);

    try {
      const result = await callProvider(provider, system, user, maxTokens);
      // Success — clear any stale rate limit flag (e.g. if cooldown expired naturally)
      clearRateLimit(provider);
      console.info(`[llm] Success via ${provider}`);
      return result;

    } catch (err) {
      if (err instanceof LLMRateLimitError) {
        console.warn(`[llm] Rate limit on ${provider} — trying next provider`);
        // Already marked in markRateLimited(), continue to next
        continue;
      }
      // Non-rate-limit error — log and try next
      console.warn(`[llm] Error on ${provider}:`, err);
      continue;
    }
  }

  // All providers failed or were rate-limited
  throw new LLMExhaustedError(attempted);
}

// ─── Dev utility: provider status ────────────────────────────────────────────
// Useful for a settings debug panel or console inspection.

export function getProviderStatus(): Array<{
  provider:       LLMProvider;
  name:           string;
  hasKey:         boolean;
  rateLimited:    boolean;
  cooldownMinutes: number | null;
}> {
  return (["gemini", "groq", "anthropic"] as LLMProvider[]).map(provider => {
    const config  = PROVIDERS[provider];
    const limited = isRateLimited(provider);
    let cooldownMinutes: number | null = null;

    if (limited) {
      try {
        const expiry = parseInt(sessionStorage.getItem(`llm_rl_${provider}`) ?? "0");
        cooldownMinutes = Math.ceil((expiry - Date.now()) / 60000);
      } catch {}
    }

    return {
      provider,
      name:    config.name,
      hasKey:  Boolean(config.getKey()),
      rateLimited: limited,
      cooldownMinutes,
    };
  });
}