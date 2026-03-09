"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { id: "feed",       label: "Feed",       icon: "◎", href: "/feed" },
  { id: "challenges", label: "Challenges", icon: "✦", href: "/challenges" },
  { id: "daily",      label: "Daily",      icon: "⊕", href: "/daily", dot: true },
  { id: "games",      label: "Games",      icon: "⬡", href: "/games" },
  { id: "progress",   label: "Progress",   icon: "↗", href: "/progress" },
  { id: "settings",   label: "Settings",   icon: "⊙", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav style={{
      width: 180, background: "var(--card)", borderRight: "1.5px solid var(--border)",
      padding: "16px 12px", flexShrink: 0, position: "sticky",
      top: 56, height: "calc(100vh - 56px)", overflowY: "auto",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ flex: 1 }}>
        {NAV.map(({ id, label, icon, href, dot }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={id} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
                background: active ? "var(--orange-light)" : "transparent",
                borderRadius: 8, color: active ? "var(--orange)" : "var(--mid)",
                fontSize: 13, fontWeight: active ? 700 : 400,
                marginBottom: 2, fontFamily: "Georgia, serif",
                transition: "all 0.15s", cursor: "pointer",
              }}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
                {label}
                {dot && (
                  <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--orange)" }} />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Streak widget at bottom of sidebar */}
      <div style={{ paddingTop: 20, borderTop: "1px solid var(--border)" }}>
        <div style={{ padding: "10px 12px", background: "var(--bg)", borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Your Streak
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--orange)", fontFamily: "Georgia, serif" }}>
            🔥 —
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)" }}>days AI-free</div>
        </div>
      </div>
    </nav>
  );
}
