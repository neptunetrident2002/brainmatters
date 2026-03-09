import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/ratelimit";
import { Events } from "@/lib/utils/events";

// POST /api/challenges/[id]/complete
// Body: { useAiCredit: boolean, elapsedSeconds: number }
// PRD rules enforced here:
//   - Minimum 120 seconds before completion (anti-gaming)
//   - AI Credit spend requires credit balance > 0
//   - Every 10 AI-free completions earns 1 credit
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });

  const rateLimitError = await checkRateLimit(request, `complete:${user.id}`);
  if (rateLimitError) return rateLimitError;

  const { useAiCredit, elapsedSeconds } = await request.json();

  // PRD hard rule: minimum 2 minutes before completion
  if (elapsedSeconds < 120) {
    return NextResponse.json(
      { data: null, error: { message: "Minimum 2 minutes required before completion.", code: "TOO_FAST" } },
      { status: 400 }
    );
  }

  // Fetch challenge to verify ownership
  const { data: challenge, error: fetchErr } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !challenge) {
    return NextResponse.json({ data: null, error: { message: "Challenge not found" } }, { status: 404 });
  }

  // Fetch user profile for credit balance
  const { data: profile } = await supabase
    .from("users")
    .select("ai_credits, ai_credits_progress")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ data: null, error: { message: "User not found" } }, { status: 404 });

  let newCredits = profile.ai_credits;
  let newProgress = profile.ai_credits_progress;
  const newStatus = useAiCredit ? "completed_credit" : "completed_free";

  if (useAiCredit) {
    if (profile.ai_credits < 1) {
      return NextResponse.json(
        { data: null, error: { message: "No AI Credits remaining.", code: "NO_CREDITS" } },
        { status: 400 }
      );
    }
    newCredits -= 1;
    await Events.creditSpent(user.id, params.id);
  } else {
    // AI-free path: increment progress toward next credit
    newProgress += 1;
    if (newProgress >= 10) {
      newCredits += 1;
      newProgress = 0;
      await Events.creditEarned(user.id);
    }
    await Events.challengeCompletedFree(user.id, params.id, elapsedSeconds, challenge.category);
  }

  // Update challenge
  await supabase.from("challenges").update({
    status: newStatus,
    completed_at: new Date().toISOString(),
    time_elapsed_seconds: elapsedSeconds,
    streak: newStatus === "completed_free" ? challenge.streak + 1 : challenge.streak,
  }).eq("id", params.id);

  // Update user profile
  await supabase.from("users").update({
    ai_credits: newCredits,
    ai_credits_progress: newProgress,
    total_challenges: profile.total_challenges + 1,
  }).eq("id", user.id);

  return NextResponse.json({
    data: { credits: newCredits, progress: newProgress, status: newStatus },
    error: null,
  });
}
