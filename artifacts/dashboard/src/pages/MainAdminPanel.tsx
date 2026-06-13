import { useState, useEffect, useCallback } from "react";

const _API_KEY = import.meta.env.VITE_API_SECRET ?? "";
function apiFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const h = new Headers(opts.headers);
  if (_API_KEY) h.set("x-api-key", _API_KEY);
  return fetch(url, { ...opts, headers: h });
}

const T = {
  bg: "#070c1a",
  card: "#0e1525",
  cardHover: "#141e30",
  border: "#1a2740",
  borderLight: "#1f3050",
  text: "#f1f5f9",
  muted: "#4d6280",
  mutedLight: "#7a95b4",
  accent: "#6366f1",
  accentLight: "#818cf8",
  accentGlow: "rgba(99,102,241,0.15)",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#f59e0b",
  orange: "#f97316",
  inputBg: "#080e1c",
  headerBg: "#080e1c",
};

type App = {
  id: number; appId: string; name: string; pin: string;
  status: string; loginLimit: number; activeSessions: number; createdAt: string;
};

function generateAppId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `APP-${seg(4)}-${seg(4)}-${seg(4)}`;
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed"; el.style.opacity = "0";
  document.body.appendChild(el); el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  return Promise.resolve();
}

/* ── SVG Icons ── */
const Ic = {
  Shield: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Eye: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Alert: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  Copy: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Layers: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  XCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  Link: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Pencil: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  LogOut2: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Power: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
      <line x1="12" y1="2" x2="12" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Key: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Inbox: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  Loader: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.9s linear infinite" }}>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  ),
  CPU: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
      <rect x="9" y="9" width="6" height="6"/>
      <line x1="9" y1="1" x2="9" y2="4"/>
      <line x1="15" y1="1" x2="15" y2="4"/>
      <line x1="9" y1="20" x2="9" y2="23"/>
      <line x1="15" y1="20" x2="15" y2="23"/>
      <line x1="20" y1="9" x2="23" y2="9"/>
      <line x1="20" y1="14" x2="23" y2="14"/>
      <line x1="1" y1="9" x2="4" y2="9"/>
      <line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  ),
};

function CopyBtn({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    copyToClipboard(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding: "3px 9px", borderRadius: 6,
        border: `1px solid ${copied ? T.green + "60" : T.borderLight}`,
        background: copied ? T.green + "18" : T.border + "80",
        color: copied ? T.green : T.mutedLight, cursor: "pointer",
        fontSize: 11, fontWeight: 600, gap: 5, transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? <Ic.Check /> : <Ic.Copy />}
      {copied ? "Copied" : label}
    </button>
  );
}

/* ─────────── Login Screen ─────────── */
function MasterLogin({ onAuth }: { onAuth: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const r = await apiFetch("/api/admin/verify-master-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!r.ok) {
        const j = await r.json() as { error?: string };
        setErr(j.error ?? "Wrong master PIN. Try again.");
        setPin(""); return;
      }
      onAuth(pin);
    } catch { setErr("Network error. Try again."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 65% 15%, rgba(99,102,241,0.14) 0%, transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(139,92,246,0.10) 0%, transparent 50%), ${T.bg}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif", padding: "20px",
    }}>
      {/* Subtle grid overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div style={{
        width: "100%", maxWidth: 400, position: "relative",
        background: T.card,
        borderRadius: 24,
        padding: "44px 40px 36px",
        border: `1px solid ${T.borderLight}`,
        boxShadow: "0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(99,102,241,0.08) inset",
      }}>
        {/* Accent top bar */}
        <div style={{ position: "absolute", top: 0, left: 40, right: 40, height: 2, background: "linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent)", borderRadius: "0 0 2px 2px" }} />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20, margin: "0 auto 18px",
            background: "linear-gradient(145deg, #4f52d4, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            boxShadow: "0 12px 32px rgba(99,102,241,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset",
          }}><Ic.Shield /></div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5, lineHeight: 1.1 }}>MR ROBOT</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
            fontSize: 10, color: T.accentLight,
            background: "rgba(99,102,241,0.12)",
            padding: "4px 14px", borderRadius: 99,
            border: `1px solid rgba(99,102,241,0.25)`,
            fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.accentLight, display: "inline-block" }} />
            Master Admin
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 10, color: T.mutedLight, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <Ic.Lock /> Master PIN
          </label>
          <div style={{ position: "relative", marginTop: 8, marginBottom: 6 }}>
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter master PIN"
              autoFocus
              style={{
                width: "100%", padding: "14px 46px 14px 16px",
                borderRadius: 12, border: `1.5px solid ${pin ? T.accent + "70" : T.borderLight}`,
                background: T.inputBg, color: T.text, fontSize: 15, outline: "none",
                boxSizing: "border-box", transition: "border-color 0.2s",
                fontFamily: pin && !showPin ? "monospace" : "inherit",
                letterSpacing: pin && !showPin ? 4 : "normal",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPin(v => !v)}
              style={{
                position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: showPin ? T.accentLight : T.muted,
                cursor: "pointer", padding: 4, display: "flex", alignItems: "center",
                transition: "color 0.15s",
              }}
            >{showPin ? <Ic.EyeOff /> : <Ic.Eye />}</button>
          </div>

          {err && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              color: T.red, fontSize: 12, marginTop: 10, marginBottom: 4,
              background: T.red + "12", padding: "9px 13px", borderRadius: 9,
              border: `1px solid ${T.red}30`,
            }}>
              <Ic.Alert /> {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            style={{
              width: "100%", marginTop: 20, padding: "14px 0", borderRadius: 12,
              background: pin && !loading
                ? "linear-gradient(135deg, #5254d4, #7c3aed)"
                : T.borderLight,
              color: pin && !loading ? "#fff" : T.muted,
              fontWeight: 800, fontSize: 14, border: "none",
              cursor: pin && !loading ? "pointer" : "default",
              letterSpacing: 0.3, transition: "all 0.2s",
              boxShadow: pin && !loading ? "0 8px 24px rgba(99,102,241,0.38)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff3", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Verifying…
              </>
            ) : (
              <>Unlock Panel <Ic.ArrowRight /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 22, fontSize: 11, color: T.muted }}>
          MR ROBOT Control Panel · Secure Access
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

/* ─────────── Modal Shell ─────────── */
function Modal({ children, onClose, maxWidth = 420 }: { children: React.ReactNode; onClose: () => void; maxWidth?: number }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.80)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16, backdropFilter: "blur(3px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "100%", maxWidth, background: T.card, borderRadius: 20, padding: "26px 28px 24px", border: `1px solid ${T.borderLight}`, boxShadow: "0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,0.04) inset" }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, icon, onClose }: { title: string; icon?: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon && <div style={{ color: T.accentLight }}>{icon}</div>}
        <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>{title}</div>
      </div>
      <button onClick={onClose} style={{
        background: T.border, border: "none", color: T.mutedLight, cursor: "pointer",
        width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center",
        justifyContent: "center", transition: "background 0.15s",
      }}>
        <Ic.X />
      </button>
    </div>
  );
}

const inpBase: React.CSSProperties = {
  width: "100%", marginTop: 6, padding: "11px 14px", borderRadius: 10,
  border: `1.5px solid ${T.borderLight}`, background: T.inputBg,
  color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 10, color: T.mutedLight, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
      {children}
    </label>
  );
}

function ErrBanner({ msg }: { msg: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.red, fontSize: 12, marginBottom: 10, background: T.red + "12", padding: "9px 13px", borderRadius: 9, border: `1px solid ${T.red}30` }}>
      <Ic.Alert /> {msg}
    </div>
  );
}

/* ─────────── Create App Modal ─────────── */
function CreateAppModal({ masterPin, onClose, onCreated }: { masterPin: string; onClose: () => void; onCreated: (a: App) => void }) {
  const [name, setName] = useState("MR ROBOT");
  const [appId, setAppId] = useState(generateAppId);
  const [pin, setPin] = useState("1234");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !pin.trim()) { setErr("All fields required"); return; }
    if (pin.length < 4) { setErr("PIN must be at least 4 characters"); return; }
    setErr(""); setLoading(true);
    try {
      const r = await apiFetch("/api/master/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-master-pin": masterPin },
        body: JSON.stringify({ appId, name: name.trim(), pin }),
      });
      if (!r.ok) { const j = await r.json() as { error?: string }; setErr(j.error ?? "Failed"); return; }
      const created = await r.json() as App;
      onCreated(created);
    } catch { setErr("Network error"); }
    finally { setLoading(false); }
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Create Sub-Admin App" onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <FieldLabel>App Name</FieldLabel>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Team Alpha" style={inpBase} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <FieldLabel>App ID</FieldLabel>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input type="text" value={appId} onChange={e => setAppId(e.target.value)}
              style={{ ...inpBase, marginTop: 0, flex: 1, fontFamily: "monospace", fontSize: 12 }} />
            <button type="button" onClick={() => setAppId(generateAppId())}
              style={{
                padding: "0 14px", borderRadius: 10, background: T.border, border: `1px solid ${T.borderLight}`,
                color: T.mutedLight, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", transition: "color 0.15s",
              }}>
              <Ic.Refresh /> New
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <FieldLabel>Login PIN</FieldLabel>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="min 4 characters" style={inpBase} />
        </div>
        {err && <ErrBanner msg={err} />}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose}
            style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: T.border, border: `1px solid ${T.borderLight}`, color: T.text, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button type="submit" disabled={loading}
            style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "linear-gradient(135deg,#5254d4,#7c3aed)", border: "none", color: "#fff", fontWeight: 700, cursor: loading ? "default" : "pointer", fontSize: 13, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
            {loading ? "Creating…" : "Create App"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─────────── Change Master PIN Modal ─────────── */
function ChangePinModal({ masterPin, onClose, onChanged }: { masterPin: string; onClose: () => void; onChanged: (p: string) => void }) {
  const [currentPin, setCurrentPin] = useState(masterPin);
  const [newPin, setNewPin] = useState("");
  const [newPin2, setNewPin2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPin.length < 4) { setErr("New PIN must be at least 4 characters"); return; }
    if (newPin !== newPin2) { setErr("PINs do not match"); return; }
    setErr(""); setLoading(true);
    try {
      const r = await apiFetch("/api/admin/master-pin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin }),
      });
      if (!r.ok) { const j = await r.json() as { error?: string }; setErr(j.error ?? "Failed"); return; }
      onChanged(newPin);
    } catch { setErr("Network error"); }
    finally { setLoading(false); }
  }

  return (
    <Modal onClose={onClose} maxWidth={380}>
      <ModalHeader title="Change Master PIN" icon={<Ic.Key />} onClose={onClose} />
      <form onSubmit={handleSubmit}>
        {[
          { label: "Current PIN", val: currentPin, set: setCurrentPin },
          { label: "New PIN", val: newPin, set: setNewPin },
          { label: "Confirm New PIN", val: newPin2, set: setNewPin2 },
        ].map(({ label, val, set }) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <FieldLabel>{label}</FieldLabel>
            <input type="password" value={val} onChange={e => set(e.target.value)} style={inpBase} />
          </div>
        ))}
        {err && <ErrBanner msg={err} />}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose}
            style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: T.border, border: `1px solid ${T.borderLight}`, color: T.text, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button type="submit" disabled={loading}
            style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "linear-gradient(135deg,#5254d4,#7c3aed)", border: "none", color: "#fff", fontWeight: 700, cursor: loading ? "default" : "pointer", fontSize: 13 }}>
            {loading ? "Saving…" : "Change PIN"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─────────── Edit App Modal ─────────── */
function EditAppModal({ app, masterPin, onClose, onUpdated }: { app: App; masterPin: string; onClose: () => void; onUpdated: (a: App) => void }) {
  const [name, setName] = useState(app.name);
  const [pin, setPin] = useState(app.pin);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr("Name required"); return; }
    if (pin.length < 4) { setErr("PIN must be at least 4 characters"); return; }
    setErr(""); setLoading(true);
    try {
      const r = await apiFetch(`/api/master/apps/${encodeURIComponent(app.appId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-master-pin": masterPin },
        body: JSON.stringify({ name: name.trim(), pin }),
      });
      if (!r.ok) { const j = await r.json() as { error?: string }; setErr(j.error ?? "Failed"); return; }
      const updated = await r.json() as App;
      onUpdated({ ...updated, activeSessions: app.activeSessions });
    } catch { setErr("Network error"); }
    finally { setLoading(false); }
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Edit App" icon={<Ic.Pencil />} onClose={onClose} />
      <div style={{ fontSize: 11, color: T.muted, marginBottom: 18, fontFamily: "monospace", background: T.inputBg, padding: "6px 12px", borderRadius: 8, display: "inline-block", border: `1px solid ${T.borderLight}` }}>
        {app.appId}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <FieldLabel>App Name</FieldLabel>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={inpBase} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <FieldLabel>Login PIN</FieldLabel>
          <input type="text" value={pin} onChange={e => setPin(e.target.value)} style={{ ...inpBase, fontFamily: "monospace" }} />
        </div>
        {err && <ErrBanner msg={err} />}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose}
            style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: T.border, border: `1px solid ${T.borderLight}`, color: T.text, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button type="submit" disabled={loading}
            style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: "linear-gradient(135deg,#5254d4,#7c3aed)", border: "none", color: "#fff", fontWeight: 700, cursor: loading ? "default" : "pointer", fontSize: 13 }}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─────────── App Card ─────────── */
function AppCard({
  app, onEdit, onDelete, onToggle, onLogoutAll, onCopyUrl,
  copyMsg, deletingId, togglingId, logoutAllId,
}: {
  app: App;
  onEdit: (a: App) => void;
  onDelete: (a: App) => void;
  onToggle: (a: App) => void;
  onLogoutAll: (a: App) => void;
  onCopyUrl: (a: App) => void;
  copyMsg: Record<string, string>;
  deletingId: string | null;
  togglingId: string | null;
  logoutAllId: string | null;
}) {
  const isActive = app.status === "active";
  const dateStr = new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{
      background: T.card,
      borderRadius: 14,
      border: `1px solid ${T.borderLight}`,
      overflow: "hidden",
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = isActive ? T.green + "40" : T.red + "30";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = T.borderLight;
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Status accent line */}
      <div style={{ height: 2, background: isActive ? `linear-gradient(90deg,${T.green},#4ade80)` : `linear-gradient(90deg,${T.red},#f87171)`, opacity: 0.7 }} />

      <div style={{ padding: "15px 18px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 13 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, wordBreak: "break-word" }}>{app.name}</div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99,
                color: isActive ? T.green : T.red,
                background: (isActive ? T.green : T.red) + "18",
                border: `1px solid ${(isActive ? T.green : T.red)}35`,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? T.green : T.red, display: "inline-block" }} />
                {isActive ? "Active" : "Disabled"}
              </span>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>Created {dateStr}</div>
          </div>
          {/* Session badge */}
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{app.activeSessions} / {app.loginLimit}</div>
            <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>sessions</div>
          </div>
        </div>

        {/* Info panel */}
        <div style={{
          background: T.inputBg, borderRadius: 10, padding: "10px 14px",
          marginBottom: 13, display: "flex", flexDirection: "column", gap: 8,
          border: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", minWidth: 30 }}>ID</span>
            <span style={{ fontSize: 11, color: T.accentLight, fontFamily: "monospace", fontWeight: 600, flex: 1, wordBreak: "break-all" }}>{app.appId}</span>
            <CopyBtn value={app.appId} label="ID" />
          </div>
          <div style={{ height: 1, background: T.border }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", minWidth: 30 }}>PIN</span>
            <span style={{ fontSize: 13, color: T.text, fontFamily: "monospace", letterSpacing: 4, flex: 1 }}>{app.pin}</span>
            <CopyBtn value={app.pin} label="PIN" />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {/* Copy URL */}
          <button onClick={() => onCopyUrl(app)}
            style={{
              padding: "7px 12px", borderRadius: 8,
              background: copyMsg[app.appId] ? T.green + "18" : T.border,
              border: `1px solid ${copyMsg[app.appId] ? T.green + "50" : T.borderLight}`,
              color: copyMsg[app.appId] ? T.green : T.mutedLight,
              fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s",
            }}>
            {copyMsg[app.appId] ? <Ic.Check /> : <Ic.Link />}
            {copyMsg[app.appId] ? "Copied" : "URL"}
          </button>

          {/* Edit */}
          <button onClick={() => onEdit(app)}
            style={{
              padding: "7px 12px", borderRadius: 8,
              background: T.accentGlow, border: `1px solid ${T.accent}30`,
              color: T.accentLight, fontWeight: 600, fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
            }}>
            <Ic.Pencil /> Edit
          </button>

          {/* Logout All */}
          <button onClick={() => onLogoutAll(app)} disabled={logoutAllId === app.appId}
            style={{
              padding: "7px 12px", borderRadius: 8,
              background: T.orange + "14", border: `1px solid ${T.orange}30`,
              color: T.orange, fontWeight: 600, fontSize: 12,
              cursor: logoutAllId === app.appId ? "wait" : "pointer",
              whiteSpace: "nowrap", opacity: logoutAllId === app.appId ? 0.5 : 1,
              display: "flex", alignItems: "center", gap: 5,
            }}>
            <Ic.LogOut2 />
            {logoutAllId === app.appId ? "…" : "Logout All"}
          </button>

          <div style={{ flex: 1 }} />

          {/* Toggle */}
          <button onClick={() => onToggle(app)} disabled={togglingId === app.appId}
            style={{
              padding: "7px 14px", borderRadius: 9,
              background: isActive ? T.yellow + "14" : T.green + "14",
              border: `1.5px solid ${isActive ? T.yellow + "60" : T.green + "60"}`,
              color: isActive ? T.yellow : T.green,
              fontWeight: 700, fontSize: 12, cursor: togglingId === app.appId ? "wait" : "pointer",
              whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.15s",
            }}>
            <Ic.Power />
            {togglingId === app.appId ? "…" : isActive ? "Disable" : "Enable"}
          </button>

          {/* Delete */}
          <button onClick={() => onDelete(app)} disabled={deletingId === app.appId}
            style={{
              padding: "7px 14px", borderRadius: 9,
              background: T.red + "14", border: `1.5px solid ${T.red}55`,
              color: T.red, fontWeight: 700, fontSize: 12,
              cursor: deletingId === app.appId ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.15s",
            }}>
            <Ic.Trash />
            {deletingId === app.appId ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Dashboard ─────────── */
function Dashboard({ masterPin, onLogout, onPinChanged }: { masterPin: string; onLogout: () => void; onPinChanged: (p: string) => void }) {
  const [appList, setAppList] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [editApp, setEditApp] = useState<App | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<Record<string, string>>({});
  const [logoutAllId, setLogoutAllId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const sortedApps = [...appList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const fetchApps = useCallback(async () => {
    try {
      const r = await apiFetch("/api/master/apps", { headers: { "x-master-pin": masterPin } });
      if (r.status === 401) { onLogout(); return; }
      if (!r.ok) return;
      setAppList(await r.json() as App[]);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [masterPin, onLogout]);

  useEffect(() => { void fetchApps(); }, [fetchApps]);

  async function toggleStatus(app: App) {
    setTogglingId(app.appId);
    const newStatus = app.status === "active" ? "disabled" : "active";
    try {
      await apiFetch(`/api/master/apps/${encodeURIComponent(app.appId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-master-pin": masterPin },
        body: JSON.stringify({ status: newStatus }),
      });
      setAppList(prev => prev.map(a => a.appId === app.appId ? { ...a, status: newStatus } : a));
    } catch { /* ignore */ } finally { setTogglingId(null); }
  }

  async function deleteApp(app: App) {
    if (!confirm(`Delete "${app.name}"?\nThis cannot be undone.`)) return;
    setDeletingId(app.appId);
    try {
      await apiFetch(`/api/master/apps/${encodeURIComponent(app.appId)}`, {
        method: "DELETE",
        headers: { "x-master-pin": masterPin },
      });
      setAppList(prev => prev.filter(a => a.appId !== app.appId));
    } catch { /* ignore */ } finally { setDeletingId(null); }
  }

  async function logoutAll(app: App) {
    if (!confirm(`"${app.name}" ke sabhi logged-in users ko logout karein?`)) return;
    setLogoutAllId(app.appId);
    try {
      await apiFetch(`/api/admin/sessions?appId=${encodeURIComponent(app.appId)}`, { method: "DELETE" });
      setAppList(prev => prev.map(a => a.appId === app.appId ? { ...a, activeSessions: 0 } : a));
    } catch { /* ignore */ } finally { setLogoutAllId(null); }
  }

  function copyUrl(app: App) {
    const url = `${window.location.origin}/preview/dashboard/WebDashboard?appId=${app.appId}`;
    copyToClipboard(url).then(() => {
      setCopyMsg(p => ({ ...p, [app.appId]: "Copied!" }));
      setTimeout(() => setCopyMsg(p => ({ ...p, [app.appId]: "" })), 2000);
    });
  }

  const filteredApps = search.trim() === ""
    ? sortedApps
    : sortedApps.filter(a =>
        a.appId.toLowerCase().includes(search.trim().toLowerCase()) ||
        a.name.toLowerCase().includes(search.trim().toLowerCase())
      );

  const activeCount = appList.filter(a => a.status === "active").length;
  const disabledCount = appList.length - activeCount;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter', system-ui, sans-serif", color: T.text }}>

      {/* ── Header ── */}
      <div style={{
        background: T.headerBg,
        borderBottom: `1px solid ${T.border}`,
        padding: "0 20px",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 1px 24px rgba(0,0,0,0.4)",
      }}>
        {/* Accent gradient top line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)" }} />
        <div style={{
          maxWidth: 960, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 62, gap: 12,
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(145deg,#4f52d4,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", flexShrink: 0,
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
            }}>
              <Ic.CPU />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: T.text, letterSpacing: -0.3, lineHeight: 1.1 }}>MR ROBOT</div>
              <div style={{ fontSize: 9, color: T.accentLight, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>Master Admin</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <button onClick={() => setShowChangePin(true)}
              style={{
                padding: "7px 14px", borderRadius: 9, background: T.border,
                border: `1px solid ${T.borderLight}`, color: T.mutedLight, fontWeight: 600,
                fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
              }}>
              <Ic.Key /> Change PIN
            </button>
            <button onClick={onLogout}
              style={{
                padding: "7px 13px", borderRadius: 9, background: "transparent",
                border: `1px solid ${T.border}`, color: T.muted, fontWeight: 600,
                fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s",
              }}>
              <Ic.LogOut /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
          {[
            { label: "Total Apps", val: appList.length, color: T.accent, Icon: Ic.Layers },
            { label: "Active", val: activeCount, color: T.green, Icon: Ic.CheckCircle },
            { label: "Disabled", val: disabledCount, color: T.red, Icon: Ic.XCircle },
          ].map(({ label, val, color, Icon }) => (
            <div key={label} style={{
              background: T.card, borderRadius: 13, padding: "15px 18px",
              border: `1px solid ${T.borderLight}`,
              position: "relative", overflow: "hidden",
            }}>
              {/* Glow spot */}
              <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: color + "12", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color, opacity: 0.9 }}><Icon /></span>
                <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Apps header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Sub-Admin Apps</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Sorted by newest first</div>
          </div>
          <button onClick={() => setShowCreate(true)}
            style={{
              padding: "9px 18px", borderRadius: 10,
              background: "linear-gradient(135deg,#5254d4,#7c3aed)",
              border: "none", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.38)", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 7, transition: "box-shadow 0.15s",
            }}>
            <Ic.Plus /> New App
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 14, position: "relative" }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: T.muted, pointerEvents: "none", display: "flex" }}>
            <Ic.Search />
          </span>
          <input
            type="text"
            placeholder="Search by App ID or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 36px 10px 40px",
              borderRadius: 10, background: T.card, border: `1px solid ${T.borderLight}`,
              color: T.text, fontSize: 13, outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = T.accent + "60"}
            onBlur={e => e.target.style.borderColor = T.borderLight}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: T.border, border: "none", color: T.muted, cursor: "pointer",
              width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            }}><Ic.X /></button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: T.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ color: T.accent }}><Ic.Loader /></div>
            <div style={{ fontSize: 13 }}>Loading apps…</div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: T.muted, background: T.card, borderRadius: 14, border: `1px solid ${T.borderLight}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ color: T.border }}><Ic.Inbox /></div>
            <div style={{ fontSize: 13 }}>
              {search ? `"${search}" se koi app nahi mila.` : 'No apps yet. Click "New App" to create one.'}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {filteredApps.map(app => (
              <AppCard
                key={app.appId}
                app={app}
                onEdit={setEditApp}
                onDelete={deleteApp}
                onToggle={toggleStatus}
                onLogoutAll={logoutAll}
                onCopyUrl={copyUrl}
                copyMsg={copyMsg}
                deletingId={deletingId}
                togglingId={togglingId}
                logoutAllId={logoutAllId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateAppModal masterPin={masterPin} onClose={() => setShowCreate(false)}
          onCreated={a => { setAppList(prev => [a, ...prev]); setShowCreate(false); }} />
      )}
      {showChangePin && (
        <ChangePinModal masterPin={masterPin} onClose={() => setShowChangePin(false)}
          onChanged={p => { onPinChanged(p); setShowChangePin(false); }} />
      )}
      {editApp && (
        <EditAppModal app={editApp} masterPin={masterPin} onClose={() => setEditApp(null)}
          onUpdated={a => { setAppList(prev => prev.map(x => x.appId === a.appId ? a : x)); setEditApp(null); }} />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

/* ─────────── Root Export ─────────── */
export default function MainAdminPanel() {
  const [masterPin, setMasterPin] = useState<string | null>(() => {
    return sessionStorage.getItem("mrrobot_master_auth") ?? null;
  });

  function handleAuth(pin: string) {
    sessionStorage.setItem("mrrobot_master_auth", pin);
    setMasterPin(pin);
  }

  function handleLogout() {
    sessionStorage.removeItem("mrrobot_master_auth");
    setMasterPin(null);
  }

  function handlePinChanged(newPin: string) {
    sessionStorage.setItem("mrrobot_master_auth", newPin);
    setMasterPin(newPin);
    alert("Master PIN changed successfully!");
  }

  if (!masterPin) return <MasterLogin onAuth={handleAuth} />;
  return <Dashboard masterPin={masterPin} onLogout={handleLogout} onPinChanged={handlePinChanged} />;
}
