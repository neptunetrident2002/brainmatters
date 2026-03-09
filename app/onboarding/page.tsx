"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { pullCreditsFromSupabase } from "@/lib/utils/credits";

const C = {
  orange: "#E8520A", orangeLight: "#FFF0E8", orangeDim: "#B84008",
  dark: "#1A1208", mid: "#5A4A2A", muted: "#8A7A5A",
  border: "#C8B89A", bg: "#F5F0E8", card: "#FFFEF9", cream: "#FAF6F0",
};

const NAV = [
  { id: "feed",       label: "Feed",       icon: "◎", href: "/feed" },
  { id: "daily",      label: "Daily",      icon: "⊕", href: "/daily", dot: true },
  { id: "challenges", label: "Challenges", icon: "✦", href: "/challenges" },
  { id: "journal",    label: "Journal",    icon: "✐", href: "/journal" },
  { id: "games",      label: "Games",      icon: "⬡", href: "/games" },
  { id: "progress",   label: "Progress",   icon: "↗", href: "/progress" },
  { id: "report",     label: "Report",     icon: "⊞", href: "/report" },
  { id: "settings",   label: "Settings",   icon: "⊙", href: "/settings" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const [credits,  setCredits]  = useState(0);
  const [progress, setProgress] = useState(0);
  const [streak,   setStreak]   = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("ss_onboarding_done");
    if (!done) { router.replace("/onboarding"); return; }

    // Load local state
    setCredits(parseInt(localStorage.getItem("ss_credits")  ?? "0"));
    setProgress(parseInt(localStorage.getItem("ss_progress") ?? "0"));
    setStreak(parseInt(localStorage.getItem("ss_streak")    ?? "0"));

    // Check auth — pull credits from Supabase if signed in
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        pullCreditsFromSupabase(supabase, user.id).then(() => {
          setCredits(parseInt(localStorage.getItem("ss_credits") ?? "0"));
        });
      }
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserEmail(null);
    setShowUserMenu(false);
  }

  // Initials from email
  const initials = userEmail ? userEmail[0].toUpperCase() : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Georgia, serif" }}>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>

      <header style={{ background: C.card, borderBottom: `2px solid ${C.border}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.orange, letterSpacing: "-0.02em" }}>BrainMatters</span>
          </Link>
          <span style={{ fontSize: 11, color: C.muted, borderLeft: `1px solid ${C.border}`, paddingLeft: 10, letterSpacing: "0.06em" }}>Train Your Brain. Earn Your AI.</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Credits */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: C.orangeLight, border: `1.5px solid ${C.orange}`, borderRadius: 20 }}>
              <span>⚡</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>{credits}</span>
              <span style={{ fontSize: 10, color: C.orangeDim }}>credits</span>
            </div>
            <div>
              <div style={{ fontSize: 9, color: C.muted }}>{progress}/10 to next</div>
              <div style={{ width: 64, height: 4, background: C.border, borderRadius: 2 }}>
                <div style={{ width: `${(progress / 10) * 100}%`, height: "100%", background: C.orange, borderRadius: 2 }} />
              </div>
            </div>
          </div>

          {/* Auth area */}
          {userEmail ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowUserMenu(m => !m)}
                title={userEmail}
                style={{ width: 32, height: 32, borderRadius: "50%", background: C.dark, border: `2px solid ${C.orange}`, color: C.cream, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {initials}
              </button>
              {showUserMenu && (
                <div style={{ position: "absolute", right: 0, top: 40, background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "8px 0", minWidth: 180, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 100 }}>
                  <div style={{ padding: "6px 16px 10px", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 11, color: C.muted }}>Signed in as</div>
                    <div style={{ fontSize: 12, color: C.dark, fontWeight: 600, wordBreak: "break-all" }}>{userEmail}</div>
                  </div>
                  <Link href="/settings" onClick={() => setShowUserMenu(false)} style={{ display: "block", padding: "8px 16px", fontSize: 12, color: C.mid, textDecoration: "none" }}>Settings</Link>
                  <button onClick={handleSignOut} style={{ width: "100%", padding: "8px 16px", background: "transparent", border: "none", textAlign: "left", fontSize: 12, color: "#C62828", cursor: "pointer", fontFamily: "Georgia, serif" }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" style={{ padding: "6px 14px", background: "transparent", border: `1.5px solid ${C.border}`, borderRadius: 8, color: C.mid, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          )}
        </div>
      </header>

      <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
        <nav style={{ width: 180, background: C.card, borderRight: `1.5px solid ${C.border}`, padding: "16px 12px", flexShrink: 0, position: "sticky", top: 56, height: "calc(100vh - 56px)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {NAV.map(({ id, label, icon, href, dot }: any) => {
              const active = pathname === href;
              return (
                <Link key={id} href={href} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", background: active ? C.orangeLight : "transparent", borderRadius: 8, color: active ? C.orange : C.mid, fontSize: 13, fontWeight: active ? 700 : 400, marginBottom: 2, cursor: "pointer" }}>
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    {label}
                    {dot && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: C.orange }} />}
                  </div>
                </Link>
              );
            })}
          </div>
          <div style={{ paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            {/* Auth nudge if not signed in */}
            {!userEmail && (
              <div style={{ padding: "10px 12px", background: C.orangeLight, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, marginBottom: 4 }}>Save your progress</div>
                <Link href="/signup" style={{ fontSize: 11, color: C.orange, textDecoration: "none", fontWeight: 600 }}>Create free account →</Link>
              </div>
            )}
            <div style={{ padding: "10px 12px", background: C.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Your Streak</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.orange }}>🔥 {streak}</div>
              <div style={{ fontSize: 10, color: C.muted }}>days AI-free</div>
            </div>
          </div>
        </nav>
        <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}