"use client";

// ─── AuthGateModal ────────────────────────────────────────────────────────────
// Shows when an unauthenticated user tries to spend credits.
// Non-blocking — dismissing it lets user keep using the app.

const C = {
  orange:      "#E8520A",
  orangeLight: "#FFF0E8",
  dark:        "#1A1208",
  mid:         "#5A4A2A",
  muted:       "#8A7A5A",
  border:      "#C8B89A",
  card:        "#FFFEF9",
  cream:       "#FAF6F0",
};

export function AuthGateModal({
  credits,
  onDismiss,
}: {
  credits:   number;
  onDismiss: () => void;
}) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,18,8,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
      <div style={{ background:C.card, border:`2px solid ${C.orange}`, borderRadius:16, padding:28, maxWidth:360, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:10 }}>⚡</div>
        <h3 style={{ fontFamily:"Georgia, serif", color:C.dark, margin:"0 0 8px", fontSize:18 }}>
          Sign in to use your credits
        </h3>
        <p style={{ color:C.mid, fontSize:13, lineHeight:1.7, margin:"0 0 6px" }}>
          You have <b style={{ color:C.orange }}>{credits} credit{credits !== 1 ? "s" : ""}</b> waiting.
        </p>
        <p style={{ color:C.muted, fontSize:12, lineHeight:1.6, margin:"0 0 22px", fontStyle:"italic" }}>
          Create a free account to spend them — they're yours, earned through your work.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <a
            href="/signup"
            style={{ display:"block", padding:"10px", background:C.orange, borderRadius:8, color:"white", fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:"Georgia, serif" }}
          >
            Create free account →
          </a>
          <a
            href="/login"
            style={{ display:"block", padding:"10px", background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:8, color:C.mid, fontSize:12, fontWeight:700, textDecoration:"none" }}
          >
            Sign in
          </a>
          <button
            onClick={onDismiss}
            style={{ padding:"8px", background:"transparent", border:"none", color:C.muted, fontSize:11, cursor:"pointer", textDecoration:"underline" }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SpendModal ───────────────────────────────────────────────────────────────
// Generic 2-tap credit spend confirmation.
// Caller provides the action label, cost, and callbacks.

export function SpendModal({
  icon,
  title,
  description,
  cost,
  credits,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  icon:         string;
  title:        string;
  description:  string;
  cost:         number;
  credits:      number;
  confirmLabel: string;
  onConfirm:    () => void;
  onCancel:     () => void;
}) {
  const canAfford = credits >= cost;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,18,8,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
      <div style={{ background:C.card, border:`2px solid ${C.orange}`, borderRadius:16, padding:28, maxWidth:360, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:10 }}>{icon}</div>
        <h3 style={{ fontFamily:"Georgia, serif", color:C.dark, margin:"0 0 8px", fontSize:18 }}>{title}</h3>
        <p style={{ color:C.mid, fontSize:13, lineHeight:1.65, margin:"0 0 8px" }}>{description}</p>

        {/* Cost display */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, margin:"12px 0 20px", padding:"10px", background:C.orangeLight, borderRadius:8 }}>
          <span style={{ fontSize:14, fontWeight:700, color:C.orange }}>
            {cost} credit{cost !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize:12, color:C.muted }}>·</span>
          <span style={{ fontSize:12, color:C.muted }}>
            {credits} remaining → {canAfford ? credits - cost : "insufficient"} after
          </span>
        </div>

        {!canAfford && (
          <p style={{ fontSize:12, color:"#C62828", margin:"0 0 14px", fontWeight:700 }}>
            Not enough credits. Complete more challenges to earn them.
          </p>
        )}

        <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
          <button
            onClick={onConfirm}
            disabled={!canAfford}
            style={{ padding:"9px 20px", background:canAfford ? C.orange : C.border, border:"none", borderRadius:8, color:"white", fontSize:12, fontWeight:700, cursor:canAfford ? "pointer" : "not-allowed" }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            style={{ padding:"9px 20px", background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:8, color:C.mid, fontSize:12, fontWeight:700, cursor:"pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}