"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const C = {
  orange:      "#E8520A",
  orangeLight: "#FFF0E8",
  orangeDim:   "#B84008",
  dark:        "#1A1208",
  mid:         "#5A4A2A",
  muted:       "#8A7A5A",
  border:      "#C8B89A",
  bg:          "#F5F0E8",
  card:        "#FFFEF9",
  cream:       "#FAF6F0",
};

// ─── Quotes ───────────────────────────────────────────────────────────────────

const QUOTES = [
  { text: "Iron rusts from disuse; even so does inaction sap the vigor of the mind.", author: "Leonardo da Vinci", year: "c. 1500" },
  { text: "The intellect is sharpened by use, and dulled by disuse.", author: "Edward Bulwer-Lytton", year: "1803–1873" },
  { text: "Neurons that fire together wire together.", author: "Donald Hebb", year: "The Organization of Behavior, 1949" },
  { text: "Through repeated practice, even a dull mind becomes wise.", author: "Tulsidas", year: "Ramcharitmanas, c. 1574" },
  { text: "The mind grows stronger through use.", author: "Mencius", year: "372–289 BC" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick a daily challenge", desc: "Write without AI. Debug yourself. Solve the logic puzzle. Each challenge is designed to rebuild a specific cognitive muscle." },
  { step: "02", title: "Complete it AI-free",    desc: "A timer runs. No shortcuts. The discomfort is the point — that's where the growth is." },
  { step: "03", title: "Earn AI Credits",        desc: "Every 10 AI-free completions earns you 1 AI Credit. Credits are the only way to use AI on a challenge. You earn the right." },
  { step: "04", title: "Watch your confidence return", desc: "Track your AI-free streaks, category progress, and proof-of-work over time. The data shows you what you've rebuilt." },
];

const FEATURES = [
  { icon: "✦", title: "Daily challenges",     desc: "Writing, logic, recall. Each designed to exercise a specific cognitive muscle — with a timer, no shortcuts. The discomfort is intentional." },
  { icon: "⚡", title: "AI credits you earn",  desc: "Complete 10 AI-free challenges → earn 1 credit. Credits unlock features like Socratic hints and your behaviour report. You earn the right." },
  { icon: "✐", title: "A journal that reflects", desc: "28 rotating prompts. After enough entries, the app synthesises patterns in your writing and reflects them back — honest, not flattering." },
  { icon: "⊞", title: "Behaviour report",     desc: "Completions, check-ins, AI usage signals — synthesised into a frank behavioural profile. What the data shows, not what you want to hear." },
  { icon: "↗", title: "Visible progress",      desc: "Activity grid, dependency trend, difficulty tier, 12 milestones. Proof you're rebuilding what over-reliance quietly took." },
  { icon: "◎", title: "Daily signal",          desc: "A 60-second check-in: how much AI did you use today, how much effort did you put in, how aware were you of the difference?" },
];

// ─── Sky gradient background ──────────────────────────────────────────────────

function HeroBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {/* Base — bright warm cream to soft champagne gold */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, #FEFAF4 0%, #FAF0D8 28%, #F5E4B0 58%, #EED898 78%, #F5EDD0 100%)",
      }}/>
      {/* Soft sun bloom — upper centre */}
      <div style={{
        position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
        width: "70vw", height: "70vw", maxWidth: 640, maxHeight: 640,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,230,140,0.55) 0%, rgba(255,210,80,0.25) 40%, transparent 68%)",
        filter: "blur(18px)",
      }}/>
      {/* Warm right edge glow */}
      <div style={{
        position: "absolute", top: "10%", right: "-5%",
        width: "35vw", height: "55vw", maxWidth: 320, maxHeight: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(240,195,100,0.3) 0%, transparent 65%)",
        filter: "blur(24px)",
      }}/>
      {/* Seamless fade into page background at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
        background: "linear-gradient(0deg, rgba(245,240,232,1) 0%, rgba(245,240,232,0.6) 50%, transparent 100%)",
      }}/>
    </div>
  );
}

// ─── Quotes Carousel ──────────────────────────────────────────────────────────

function QuotesCarousel() {
  const [idx,  setIdx]  = useState(0);
  const [fade, setFade] = useState(true);
  const timer = useRef<any>(null);

  function goTo(next: number) {
    setFade(false);
    setTimeout(() => { setIdx(next); setFade(true); }, 300);
  }

  useEffect(() => {
    timer.current = setInterval(() => goTo((idx + 1) % QUOTES.length), 3200);
    return () => clearInterval(timer.current);
  }, [idx]);

  const q = QUOTES[idx];

  return (
    <div style={{ width: "100%", maxWidth: 580, margin: "0 auto" }}>
      <div style={{
        minHeight: 148, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        opacity: fade ? 1 : 0, transition: "opacity 0.3s ease",
        padding: "0 4px",
      }}>
        <p style={{
          fontSize: "clamp(15px,3vw,20px)",
          fontFamily: "Georgia,serif", fontStyle: "italic",
          color: C.dark, lineHeight: 1.85,
          margin: "0 0 18px", textAlign: "center",
        }}>
          "{q.text}"
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <span style={{ display: "block", width: 24, height: 1, background: C.border }}/>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.mid }}>{q.author}</span>
          <span style={{ fontSize: 11, color: C.muted }}>{q.year}</span>
          <span style={{ display: "block", width: 24, height: 1, background: C.border }}/>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 22 }}>
        {QUOTES.map((_, i) => (
          <button key={i}
            onClick={() => { clearInterval(timer.current); goTo(i); }}
            aria-label={`Quote ${i + 1}`}
            style={{
              width: i === idx ? 20 : 7, height: 7,
              borderRadius: 4, border: "none", padding: 0, cursor: "pointer",
              background: i === idx ? C.orange : C.border,
              transition: "all 0.35s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [email,       setEmail]       = useState("");
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [emailError,  setEmailError]  = useState("");
  const [isReturning, setIsReturning] = useState(false);
  const [showMore,    setShowMore]    = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localStorage.getItem("ss_onboarding_done") === "true") setIsReturning(true);
  }, []);

  async function handleFollow() {
    const t = email.trim();
    if (!t || !t.includes("@")) { setEmailError("Enter a valid email."); return; }
    setSubmitting(true); setEmailError("");
    try { await createClient().from("waitlist").insert({ email: t, created_at: new Date().toISOString() }); } catch {}
    setSubmitted(true); setSubmitting(false);
  }

  function handleMore() {
    setShowMore(true);
    setTimeout(() => moreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Georgia,serif", background: C.cream, overflowX: "hidden" }}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px 100px",
      }}>
        <HeroBackground/>

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 700 }}>

          {/* Eyebrow */}
          <div style={{
            display: "inline-block",
            padding: "5px 16px",
            background: "rgba(232,82,10,0.1)",
            border: "1px solid rgba(232,82,10,0.35)",
            borderRadius: 20,
            fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
            color: C.orange, fontWeight: 700,
            marginBottom: 22,
          }}>
            Now in early access — join the waitlist
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(44px,9.5vw,86px)",
            fontWeight: 700, color: C.dark,
            margin: "0 0 10px",
            lineHeight: 1.03, letterSpacing: "-0.035em",
          }}>
            BrainMatters
          </h1>

          {/* Slogan */}
          <p style={{
            fontSize: "clamp(18px,3vw,24px)",
            fontWeight: 700, color: C.dark,
            margin: "0 0 10px",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
          }}>
            Your brain is getting weaker.{" "}
            <span style={{ color: C.orange }}>Let's fix that.</span>
          </p>

          {/* Subhead */}
          <p style={{
            fontSize: "clamp(13px,1.8vw,15px)",
            color: C.mid,
            margin: "0 auto 60px",
            maxWidth: 420, lineHeight: 1.85,
            letterSpacing: "0.01em",
          }}>
            Rebuild cognitive independence in an age of AI dependence.
          </p>

          {/* Quote carousel card */}
          <div style={{
            background: "rgba(255,254,249,0.80)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            border: "1.5px solid rgba(200,184,154,0.5)",
            borderRadius: 18, padding: "36px 32px 28px",
            marginBottom: 56,
            boxShadow: "0 6px 36px rgba(26,18,8,0.06)",
          }}>
            <QuotesCarousel/>
          </div>

          {/* ── CTAs ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

            {/* Primary — enter app */}
            <a href={isReturning ? "/feed" : "/onboarding"} style={{
              display: "inline-block",
              padding: "14px 40px",
              background: C.dark, borderRadius: 11,
              color: C.cream, fontSize: 15, fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.01em",
              boxShadow: "0 4px 22px rgba(26,18,8,0.2)",
            }}>
              {isReturning ? "Continue training →" : "Try the beta →"}
            </a>

            {/* Email — follow the build */}
            {submitted ? (
              <div style={{
                padding: "11px 24px",
                background: "rgba(46,125,50,0.08)",
                border: "1.5px solid #2E7D32",
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 13, color: "#2E7D32", fontWeight: 700 }}>
                  ✓ You're in. We'll be in touch.
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, width: "100%", maxWidth: 370 }}>
                <div style={{
                  display: "flex", width: "100%",
                  borderRadius: 10, overflow: "hidden",
                  border: `1.5px solid ${emailError ? C.orange : C.border}`,
                  background: "rgba(255,254,249,0.88)",
                  boxShadow: "0 2px 10px rgba(26,18,8,0.04)",
                }}>
                  <input
                    type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleFollow()}
                    placeholder="your@email.com"
                    style={{
                      flex: 1, padding: "12px 15px",
                      border: "none", background: "transparent",
                      fontSize: 13, color: C.dark,
                      fontFamily: "Georgia,serif", outline: "none",
                    }}
                  />
                  <button onClick={handleFollow} disabled={submitting} style={{
                    padding: "12px 18px",
                    background: C.orange, border: "none",
                    color: "white", fontSize: 12, fontWeight: 700,
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontFamily: "Georgia,serif", whiteSpace: "nowrap",
                  }}>
                    {submitting ? "…" : "Follow the build"}
                  </button>
                </div>
                {emailError && <span style={{ fontSize: 11, color: C.orange }}>{emailError}</span>}
                <span style={{ fontSize: 11, color: C.muted }}>Updates as the app improves. No spam.</span>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ── Research ─────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", background: C.cream }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.orange, fontWeight: 700, marginBottom: 14 }}>
              The Research
            </div>
            <h2 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, color: C.dark, margin: 0, lineHeight: 1.3 }}>
              The evidence is neurological now.
            </h2>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 20, marginBottom: 24 }}>
            {[
              { stat: "55%",  desc: "reduced brain connectivity in LLM users vs. those working alone" },
              { stat: "83%",  desc: "of LLM users couldn't quote from essays they'd just written" },
              { stat: "4 mo", desc: "of sustained LLM use to observe measurable neural under-engagement" },
            ].map(({ stat, desc }) => (
              <div key={stat} style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 38, fontWeight: 700, color: C.orange, fontFamily: "Georgia,serif", lineHeight: 1, marginBottom: 12 }}>
                  {stat}
                </div>
                <p style={{ fontSize: 12, color: C.mid, margin: 0, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Paper card */}
          <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: "28px 28px", marginBottom: 48 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, fontWeight: 700, marginBottom: 12 }}>
              MIT Media Lab · arXiv:2506.08872 · June 2025
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.dark, fontFamily: "Georgia,serif", margin: "0 0 8px", lineHeight: 1.4 }}>
              "Your Brain on ChatGPT"
            </h3>
            <p style={{ fontSize: 12, color: C.muted, margin: "0 0 16px", fontStyle: "italic", lineHeight: 1.6 }}>
              Accumulation of Cognitive Debt when Using an AI Assistant for Essay Writing Task<br/>
              Kosmyna, Hauptmann, Yuan et al.
            </p>
            <p style={{ fontSize: 13, color: C.mid, margin: 0, lineHeight: 1.82 }}>
              The researchers coined the term{" "}
              <strong style={{ color: C.dark }}>cognitive debt</strong>
              {" "}— LLMs spare mental effort in the short term and generate long-term costs: diminished critical thinking, reduced creativity, and shallow information processing. The first neurophysiological evidence that AI assistance fundamentally alters how our brains process and retain information.
            </p>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>
                Preliminary; not yet peer-reviewed. Cited because the pattern is real.
              </span>
              <a href="https://arxiv.org/abs/2506.08872" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: C.orange, fontWeight: 700, textDecoration: "none" }}>
                Read paper →
              </a>
            </div>
          </div>

          {/* How it works — below the paper card */}
          <div style={{ textAlign: "center" }}>
            <button onClick={handleMore} style={{
              background: C.card,
              border: `2px solid ${C.border}`,
              borderRadius: 12, padding: "14px 40px",
              color: C.mid, fontSize: 15, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.01em",
              boxShadow: "0 2px 12px rgba(26,18,8,0.07)",
              fontFamily: "Georgia,serif",
              display: "inline-flex", alignItems: "center", gap: 10,
            }}>
              How it works
              <span style={{ fontSize: 18, lineHeight: 1, color: C.orange }}>↓</span>
            </button>
          </div>

        </div>
      </section>

      {/* ── How it works (expandable) ────────────────────────────────── */}
      {showMore && (
        <section ref={moreRef} style={{ padding: "100px 24px", background: "#EDE8DF" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>

            {/* Section header */}
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.orange, fontWeight: 700, marginBottom: 14 }}>
                How it works
              </div>
              <h2 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, color: C.dark, margin: "0 0 12px", lineHeight: 1.3 }}>
                A training ground.<br/>Not another productivity app.
              </h2>
            </div>

            {/* 4-step loop */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, marginBottom: 72 }}>
              {HOW_IT_WORKS.map(({ step, title, desc }) => (
                <div key={step} style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "28px 24px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: "0.14em", marginBottom: 12 }}>{step}</div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: C.dark, fontFamily: "Georgia,serif", margin: "0 0 10px" }}>{title}</h4>
                  <p style={{ fontSize: 13, color: C.mid, margin: 0, lineHeight: 1.75 }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* Features grid */}
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <h3 style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 700, color: C.dark, margin: 0 }}>
                Everything inside the app
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(215px,1fr))", gap: 20, marginBottom: 72 }}>
              {FEATURES.map(({ icon, title, desc }) => (
                <div key={title} style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "26px 22px" }}>
                  <div style={{ fontSize: 18, marginBottom: 14 }}>{icon}</div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: C.dark, fontFamily: "Georgia,serif", margin: "0 0 10px" }}>{title}</h4>
                  <p style={{ fontSize: 12, color: C.mid, margin: 0, lineHeight: 1.75 }}>{desc}</p>
                </div>
              ))}
            </div>

            {/* Mission / not anti-AI */}
            <div style={{ background: C.card, border: `2px solid ${C.border}`, borderRadius: 16, padding: "34px 32px", marginBottom: 48 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.orange, fontWeight: 700, marginBottom: 16 }}>
                Our position
              </div>
              <p style={{ fontSize: 15, color: C.mid, margin: 0, lineHeight: 1.9 }}>
                We're not anti-AI. We use it too. But we believe AI should be a tool you reach for deliberately — not a crutch your brain has forgotten how to live without. BrainMatters gives you the structure to earn that distinction.
              </p>
            </div>

            {/* Dark quote */}
            <div style={{ background: C.dark, borderRadius: 16, padding: "36px 32px", textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: "clamp(15px,2.4vw,19px)", color: C.cream, fontFamily: "Georgia,serif", fontStyle: "italic", lineHeight: 1.88, margin: "0 0 14px" }}>
                "AI isn't the problem. Thoughtless dependency is."
              </p>
              <span style={{ fontSize: 11, color: C.muted }}>The idea behind BrainMatters</span>
            </div>

            {/* Final CTA */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <a href={isReturning ? "/feed" : "/onboarding"} style={{
                padding: "14px 38px", background: C.orange,
                borderRadius: 10, color: "white",
                fontSize: 14, fontWeight: 700, textDecoration: "none",
              }}>
                {isReturning ? "Back to training →" : "Start training →"}
              </a>
              <span style={{ fontSize: 11, color: C.muted }}>Free. No account required to start.</span>
            </div>

          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ padding: "26px 24px", background: C.dark }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.orange, fontFamily: "Georgia,serif" }}>BrainMatters</span>
          <span style={{ fontSize: 11, color: C.muted }}>Train your brain. Earn your AI.</span>
        </div>
      </footer>

    </div>
  );
}