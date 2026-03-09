import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/ratelimit";
import { Events } from "@/lib/utils/events";

// GET /api/challenges — list user's challenges
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });
  return NextResponse.json({ data, error: null });
}

// POST /api/challenges — create a challenge
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });

  const rateLimitError = await checkRateLimit(request, `challenges:create:${user.id}`);
  if (rateLimitError) return rateLimitError;

  const body = await request.json();
  const { title, category, difficulty, recurring } = body;

  if (!title?.trim()) {
    return NextResponse.json({ data: null, error: { message: "Title is required" } }, { status: 400 });
  }

  const { data, error } = await supabase.from("challenges").insert({
    user_id: user.id, title: title.trim(), category, difficulty, recurring,
    status: "pending", streak: 0,
  }).select().single();

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });
  return NextResponse.json({ data, error: null }, { status: 201 });
}
