import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// PRD non-negotiable: rate limiting on all write endpoints before launch
// Free tier: 10,000 commands/day on Upstash

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

function getInstances() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 req/min per user
      analytics: true,
    });
  }
  return { redis, ratelimit };
}

export async function checkRateLimit(
  request: NextRequest,
  identifier: string
): Promise<NextResponse | null> {
  // Skip rate limiting if Upstash not configured (e.g. local dev)
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;

  try {
    const { ratelimit } = getInstances();
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { data: null, error: { message: "Too many requests. Slow down.", code: "RATE_LIMITED" } },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }
  } catch {
    // If Upstash is down, fail open (don't block users)
    console.error("Rate limit check failed — failing open");
  }

  return null;
}
