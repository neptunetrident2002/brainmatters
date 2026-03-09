import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PRD non-negotiable: configure cron-job.org to hit this endpoint every 5 days
// to prevent Supabase free tier from pausing the project.
// URL to ping: https://your-app.vercel.app/api/health

export async function GET() {
  try {
    const supabase = createClient();
    // Light query to keep the connection alive
    await supabase.from("daily_tasks").select("id").limit(1);

    return NextResponse.json(
      { status: "ok", timestamp: new Date().toISOString() },
      {
        headers: {
          // Don't cache health checks
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: "DB unreachable" },
      { status: 503 }
    );
  }
}
