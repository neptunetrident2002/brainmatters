import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/feed?cursor=<timestamp>&limit=20
// Cache-Control set in next.config.js: s-maxage=60, stale-while-revalidate=300
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

  const supabase = createClient();

  let query = supabase
    .from("feed_items_view")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 });
  }

  const nextCursor = data && data.length === limit ? data[data.length - 1].created_at : null;

  return NextResponse.json({ data, nextCursor, error: null });
}
