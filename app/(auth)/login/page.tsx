"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState("");
  const supabase = createClient();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    setDebug("Attempting login…");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setDebug("Auth error: " + signInError.message);
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Login failed — no user returned.");
        setLoading(false);
        return;
      }

      setDebug("Login success — checking profile…");

      await supabase.from("users").upsert({
        id: data.user.id,
        display_name: data.user.email?.split("@")[0] ?? "User",
        ai_credits: 0,
        ai_credits_progress: 0,
        streak_days: 0,
        total_challenges: 0,
        organisation_id: null,
        feed_public: true,
      }, { onConflict: "id", ignoreDuplicates: true });

      setDebug("Redirecting…");
      window.location.href = "/feed";

    } catch (err: any) {
      setError("Something went wrong: " + err.message);
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px",
    border: "1.5px solid #C8B89A", borderRadius: 8,
    fontSize: 14, color: "#1A1208", background: "#FAF6F0",
    fontFamily: "Georgia, serif", outline: "none", marginBottom: 10,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#E8520A", fontFamily: "Georgia, serif", margin: "0 0 6px" }}>BrainMatters</h1>
          </Link>
          <p style={{ color: "#8A7A5A", fontSize: 13, margin: 0 }}>Train Your Brain. Earn Your AI.</p>
        </div>

        <div style={{ background: "#FFFEF9", border: "1.5px solid #C8B89A", borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1208", fontFamily: "Georgia, serif", margin: "0 0 20px" }}>Sign in</h2>

          {error && (
            <div style={{ padding: "9px 12px", background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 7, fontSize: 13, color: "#DC2626", marginBottom: 14 }}>
              {error}
            </div>
          )}

          {debug && (
            <div style={{ padding: "9px 12px", background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 7, fontSize: 11, color: "#E65100", marginBottom: 14, fontFamily: "monospace" }}>
              {debug}
            </div>
          )}

          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ ...inputStyle, marginBottom: 18 }} />

          <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "11px", background: "#E8520A", border: "none", borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "Georgia, serif", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#8A7A5A", marginTop: 18, marginBottom: 0 }}>
            No account?{" "}
            <Link href="/signup" style={{ color: "#E8520A", textDecoration: "none", fontWeight: 700 }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}