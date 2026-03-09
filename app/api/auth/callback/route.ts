import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles Google OAuth redirect
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Create user profile if first login
      await supabase.from("users").upsert({
        id: data.user.id,
        display_name: data.user.user_metadata?.full_name ?? data.user.email?.split("@")[0] ?? "User",
        ai_credits: 0,
        ai_credits_progress: 0,
        streak_days: 0,
        total_challenges: 0,
        organisation_id: null,  // Reserved for Teams tier
        feed_public: true,
      }, { onConflict: "id", ignoreDuplicates: true });

      return NextResponse.redirect(`${origin}/feed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
