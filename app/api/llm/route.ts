// app/api/llm/route.ts
// Server-side proxy for all LLM calls.
// Keeps API keys private (no NEXT_PUBLIC_ needed) and avoids CORS entirely.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // fastest cold start

type LLMProvider = "gemini" | "groq" | "anthropic";

const PROVIDERS: Record<LLMProvider, {
  model:   string;
  apiUrl:  string;
  getKey:  () => string;
  format:  "openai-compat" | "anthropic-native";
}> = {
  gemini: {
    model:   "gemini-1.5-flash",
    apiUrl:  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    getKey:  () => process.env.GEMINI_API_KEY ?? "",
    format:  "openai-compat",
  },
  groq: {
    model:   "llama-3.3-70b-versatile",
    apiUrl:  "https://api.groq.com/openai/v1/chat/completions",
    getKey:  () => process.env.GROQ_API_KEY ?? "",
    format:  "openai-compat",
  },
  anthropic: {
    model:   "claude-sonnet-4-20250514",
    apiUrl:  "https://api.anthropic.com/v1/messages",
    getKey:  () => process.env.ANTHROPIC_API_KEY ?? "",
    format:  "anthropic-native",
  },
};

function buildChain(primary: LLMProvider): LLMProvider[] {
  const all: LLMProvider[] = ["gemini", "groq", "anthropic"];
  const ordered = [primary, ...all.filter(p => p !== primary)];
  return ordered.filter(p => Boolean(PROVIDERS[p].getKey()));
}

function isRateLimit(status: number, body: string, provider: LLMProvider): boolean {
  if (status === 429) return true;
  if (provider === "gemini"    && body.includes("RESOURCE_EXHAUSTED")) return true;
  if (provider === "groq"      && body.includes("rate_limit_exceeded")) return true;
  if (provider === "anthropic" && status === 529) return true;
  return false;
}

async function callProvider(
  provider:  LLMProvider,
  system:    string,
  user:      string,
  maxTokens: number,
): Promise<{ text: string; provider: LLMProvider }> {
  const cfg = PROVIDERS[provider];
  const key = cfg.getKey();
  if (!key) throw new Error(`No key for ${provider}`);

  let response: Response;

  if (cfg.format === "openai-compat") {
    response = await fetch(cfg.apiUrl, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model:      cfg.model,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user",   content: user   },
        ],
      }),
    });
  } else {
    // Anthropic native
    response = await fetch(cfg.apiUrl, {
      method:  "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      cfg.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
  }

  const body = await response.text();

  if (isRateLimit(response.status, body, provider)) {
    const err = new Error(`rate_limit:${provider}`) as any;
    err.rateLimited = true;
    throw err;
  }

  if (!response.ok) {
    throw new Error(`${provider} ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = JSON.parse(body);

  const text = cfg.format === "openai-compat"
    ? (data.choices?.[0]?.message?.content ?? "")
    : (data.content?.map((b: any) => b.text || "").join("") ?? "");

  return { text, provider };
}

export async function POST(req: NextRequest) {
  let body: { system: string; user: string; maxTokens?: number; provider?: LLMProvider };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { system, user, maxTokens = 700 } = body;
  const primary = body.provider ?? (process.env.LLM_PROVIDER as LLMProvider) ?? "gemini";

  if (!system || !user) {
    return NextResponse.json({ error: "Missing system or user" }, { status: 400 });
  }

  const chain = buildChain(primary);

  if (chain.length === 0) {
    return NextResponse.json({ error: "No LLM providers configured" }, { status: 503 });
  }

  for (const provider of chain) {
    try {
      const result = await callProvider(provider, system, user, maxTokens);
      return NextResponse.json({ text: result.text, provider: result.provider });
    } catch (err: any) {
      if (err?.rateLimited) {
        console.warn(`[llm] rate limit on ${provider}, trying next`);
        continue;
      }
      console.warn(`[llm] error on ${provider}:`, err?.message);
      continue;
    }
  }

  return NextResponse.json({ error: "All LLM providers failed" }, { status: 503 });
}