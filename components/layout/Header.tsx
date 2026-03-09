"use client";

import type { User } from "@/types";

interface HeaderProps { user: User; }

export default function Header({ user }: HeaderProps) {
  return (
    <header style={{
      background: "var(--card)", borderBottom: "2px solid var(--border)",
      padding: "0 24px", height: 56, display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--orange)", letterSpacing: "-0.02em", fontFamily: "Georgia, serif" }}>
          BrainMatters
        </span>
        <span style={{ fontSize: 11, color: "var(--muted)", borderLeft: "1px solid var(--border)", paddingLeft: 10, letterSpacing: "0.06em" }}>
          Train Your Brain. Earn Your AI.
        </span>
      </div>

      {/* AI Credit counter — PRD: always visible in header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
            background: "var(--orange-light)", border: "1.5px solid var(--orange)", borderRadius: 20,
          }}>
            <span style={{ fontSize: 13 }}>⚡</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--orange)", fontFamily: "Georgia, serif" }}>
              {user.ai_credits}
            </span>
            <span style={{ fontSize: 10, color: "var(--orange-dim)", letterSpacing: "0.06em" }}>AI Credits</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.06em" }}>
              {user.ai_credits_progress}/10 to next
            </div>
            <div style={{ width: 64, height: 4, background: "var(--border)", borderRadius: 2 }}>
              <div style={{
                width: `${(user.ai_credits_progress / 10) * 100}%`,
                height: "100%", background: "var(--orange)", borderRadius: 2, transition: "width 0.4s",
              }} />
            </div>
          </div>
        </div>

        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: "var(--orange)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "Georgia, serif",
        }}>
          {user.display_name?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
