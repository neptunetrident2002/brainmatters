import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/daily — returns today's task
// Cache-Control set in next.config.js: s-maxage=300
export async function GET() {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_tasks")
    .select("id, date, title, description, category, difficulty, code_snippet, completions_count")
    .eq("date", today)
    .single();

  if (error || !data) {
    return NextResponse.json({ data: null, error: { message: "No task found for today" } }, { status: 404 });
  }

  return NextResponse.json({ data, error: null });
}
