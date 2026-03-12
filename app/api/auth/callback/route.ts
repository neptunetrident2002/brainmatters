import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

type CookieItem = { name: string; value: string; options?: Record<string, unknown> };

// Handles Google OAuth redirect
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    // Build the redirect response first so we can attach cookies to it
    const response = NextResponse.redirect(`${origin}/feed`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet: CookieItem[]) {
            // Write session cookies directly onto the redirect response
            cookiesToSet.forEach(({ name, value, options }: CookieItem) =>
              response.cookies.set(name, value, options as any)
            );
          },
        },
      }
    );

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
        organisation_id: null,
        feed_public: true,
      }, { onConflict: "id", ignoreDuplicates: true });

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}