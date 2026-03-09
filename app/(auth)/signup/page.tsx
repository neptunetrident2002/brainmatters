"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup() {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create user profile row
      await supabase.from("users").upsert({
        id: data.user.id,
        display_name: name.trim(),
        ai_credits: 0,
        ai_credits_progress: 0,
        streak_days: 0,
        total_challenges: 0,
        organisation_id: null,
        feed_public: true,
      }, { onConflict: "id", ignoreDuplicates: true });

      window.location.href = "/feed";
    }

    setLoading(false);
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
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1208", fontFamily: "Georgia, serif", margin: "0 0 20px" }}>
            Create your account
          </h2>

          {error && (
            <div style={{ padding: "9px 12px", background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 7, fontSize: 13, color: "#DC2626", marginBottom: 14 }}>
              {error}
            </div>
          )}

          <input
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSignup()}
            style={{ ...inputStyle, marginBottom: 18 }}
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            style={{
              width: "100%", padding: "11px", background: "#E8520A", border: "none",
              borderRadius: 9, color: "#fff", fontSize: 14, fontWeight: 700,
              fontFamily: "Georgia, serif", cursor: "pointer", opacity: loading ? 0.7 : 1,
              letterSpacing: "0.04em",
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#8A7A5A", marginTop: 18, marginBottom: 0 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#E8520A", textDecoration: "none", fontWeight: 700 }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#8A7A5A", marginTop: 16 }}>
          Free forever for early users. No credit card required.
        </p>
      </div>
    </div>
  );
}