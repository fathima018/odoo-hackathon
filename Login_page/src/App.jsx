import React, { useState, useMemo, useEffect } from "react";
import {
LayoutDashboard, User, Clock, CalendarDays, Wallet, Users, BarChart3,
LogOut, Check, X, Plus, Search, ChevronDown, ChevronRight, ChevronLeft,
Bell, Pencil, Camera, FileText, TrendingUp, Mail, Lock, Eye, EyeOff,
ArrowRight, CheckCircle2, XCircle, AlertCircle, Building2, Phone,
MapPin, Download, IdCard, Sunrise, LogIn as LogInIcon
} from "lucide-react";
import {
BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
PieChart, Pie, Cell, Legend
} from "recharts";

/* ============================================================================
DAYFLOW — HRMS
Design tokens: see <style> block below for the full system.
Signature element: the "Day Line" — a horizontal capsule timeline that
visualises a single workday (check-in → lunch → check-out), reused at
small scale across attendance rows and the weekly flow-strip.
============================================================================ */

/* ---------------------------------- Style ---------------------------------- */
const GlobalStyle = () => (
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

.df-root {
  --df-bg: #F5F6F1;
  --df-surface: #FFFFFF;
  --df-surface-2: #FBFAF6;
  --df-ink: #171B16;
  --df-ink-soft: #5E6459;
  --df-ink-faint: #9BA093;
  --df-primary: #2F6F5E;
  --df-primary-dark: #1E4C40;
  --df-primary-soft: #E3EDE8;
  --df-accent: #E38A2C;
  --df-accent-soft: #FBEAD3;
  --df-danger: #BE4A3C;
  --df-danger-soft: #F6E3E0;
  --df-line: #E2E4DB;
  --df-shadow: 0 1px 2px rgba(23,27,22,0.04), 0 8px 24px -12px rgba(23,27,22,0.12);
  font-family: 'Inter', sans-serif;
  background: var(--df-bg);
  color: var(--df-ink);
}
.df-root * { box-sizing: border-box; }
.df-display { font-family: 'Space Grotesk', sans-serif; }
.df-mono { font-family: 'IBM Plex Mono', monospace; }

.df-card {
  background: var(--df-surface);
  border: 1px solid var(--df-line);
  border-radius: 16px;
  box-shadow: var(--df-shadow);
}
.df-btn {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.15s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
}
.df-btn:active { transform: translateY(1px); }
.df-btn-primary { background: var(--df-primary); color: #fff; }
.df-btn-primary:hover { background: var(--df-primary-dark); }
.df-btn-ghost { background: transparent; color: var(--df-ink); border-color: var(--df-line); }
.df-btn-ghost:hover { background: var(--df-surface-2); }
.df-btn-outline { background: var(--df-surface); color: var(--df-primary); border-color: var(--df-primary); }
.df-btn-outline:hover { background: var(--df-primary-soft); }
.df-btn-danger { background: var(--df-danger); color: #fff; }
.df-btn-danger:hover { filter: brightness(0.92); }
.df-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.df-input {
  width: 100%;
  background: var(--df-surface);
  border: 1.5px solid var(--df-line);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: var(--df-ink);
  outline: none;
  transition: border-color 0.15s ease;
}
.df-input:focus { border-color: var(--df-primary); }
.df-input::placeholder { color: var(--df-ink-faint); }

.df-label { font-size: 12.5px; font-weight: 600; color: var(--df-ink-soft); margin-bottom: 6px; display: block; }

.df-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px;
  font-family: 'Inter', sans-serif;
}
.df-nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: 10px; font-weight: 500; font-size: 14px;
  color: var(--df-ink-soft); cursor: pointer; transition: all 0.15s ease;
}
.df-nav-item:hover { background: var(--df-surface-2); color: var(--df-ink); }
.df-nav-item.active { background: var(--df-primary-soft); color: var(--df-primary-dark); font-weight: 600; }

.df-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.df-scrollbar::-webkit-scrollbar-thumb { background: var(--df-line); border-radius: 4px; }

/* Signature: Day Line */
.df-dayline-track {
  position: relative; height: 10px; border-radius: 999px;
  background: var(--df-surface-2); border: 1px solid var(--df-line); overflow: hidden;
}
.df-dayline-fill {
  position: absolute; top: 0; bottom: 0; left: 0;
  background: linear-gradient(90deg, var(--df-primary), var(--df-accent));
  border-radius: 999px;
}
.df-dayline-marker {
  position: absolute; top: 50%; width: 10px; height: 10px; border-radius: 50%;
  background: var(--df-surface); border: 2px solid var(--df-primary);
  transform: translate(-50%, -50%); z-index: 2;
}

.df-flow-dot {
  width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--df-surface);
  box-shadow: 0 0 0 1px var(--df-line);
}
.df-flow-line { height: 2px; background: var(--df-line); flex: 1; }

.df-fade-in { animation: dfFadeIn 0.25s ease; }
@keyframes dfFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  .df-fade-in { animation: none; }
}

.df-focus:focus-visible { outline: 2px solid var(--df-primary); outline-offset: 2px; }

`}</style>
);

/* --------------------------------- Helpers --------------------------------- */
const STATUS_META = {
Present: { bg: "var(--df-primary-soft)", fg: "var(--df-primary-dark)", dot: "var(--df-primary)" },
Absent: { bg: "var(--df-danger-soft)", fg: "var(--df-danger)", dot: "var(--df-danger)" },
"Half-day": { bg: "var(--df-accent-soft)", fg: "#8A5A19", dot: "var(--df-accent)" },
Leave: { bg: "#EAE7F5", fg: "#5B4C93", dot: "#7A67B8" },
Weekend: { bg: "var(--df-surface-2)", fg: "var(--df-ink-faint)", dot: "var(--df-ink-faint)" },
};

const LEAVE_STATUS_META = {
Pending: { bg: "var(--df-accent-soft)", fg: "#8A5A19" },
Approved: { bg: "var(--df-primary-soft)", fg: "var(--df-primary-dark)" },
Rejected: { bg: "var(--df-danger-soft)", fg: "var(--df-danger)" },
};

function uid(prefix = "id") {
return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
function fmtDate(d) {
return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDay(d) {
return new Date(d).toLocaleDateString("en-IN", { weekday: "short" });
}
function fmtTime(d) {
return d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
}
function money(n) {
return "₹" + Number(n || 0).toLocaleString("en-IN");
}
function isoDay(date) {
return date.toISOString().slice(0, 10);
}
function initials(name) {
return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
const AVATAR_PALETTE = ["#2F6F5E", "#E38A2C", "#7A67B8", "#3D6EA5", "#B8603E"];
function avatarColor(name) {
let h = 0;
for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

/* Build last N days of attendance for one employee */
function seedAttendance(days = 14) {
const out = [];
const today = new Date();
for (let i = days - 1; i >= 0; i--) {
const d = new Date(today);
d.setDate(d.getDate() - i);
const dow = d.getDay();
let status;
if (dow === 0 || dow === 6) status = "Weekend";
else {
const r = Math.random();
status = r < 0.72 ? "Present" : r < 0.82 ? "Half-day" : r < 0.92 ? "Leave" : "Absent";
}
let checkIn = null, checkOut = null;
if (status === "Present") {
checkIn = new Date(d); checkIn.setHours(9, Math.floor(Math.random() * 25), 0);
checkOut = new Date(d); checkOut.setHours(18, Math.floor(Math.random() * 20), 0);
} else if (status === "Half-day") {
checkIn = new Date(d); checkIn.setHours(9, 15, 0);
checkOut = new Date(d); checkOut.setHours(13, 30, 0);
}
out.push({ date: isoDay(d), status, checkIn: checkIn ? checkIn.toISOString() : null, checkOut: checkOut ? checkOut.toISOString() : null });
}
return out;
}

/* ------------------------------ Seed / mock data ---------------------------- */
const SEED_EMPLOYEES = [
{ id: "u_rohan", employeeId: "DF-0001", name: "Rohan Mehta", email: "rohan@dayflow.io", password: "Admin123", role: "admin", jobTitle: "HR Manager", department: "Human Resources", phone: "+91 90000 00001", address: "Dayflow HQ, Bengaluru", joinDate: "2021-01-10", salary: { base: 95000, bonus: 10000, deductions: 4500 } },
{ id: "u_aisha", employeeId: "DF-1001", name: "Aisha Verma", email: "aisha@dayflow.io", password: "Employee123", role: "employee", jobTitle: "Product Designer", department: "Design", phone: "+91 98765 43210", address: "204 Lotus Residency, Pune", joinDate: "2023-03-14", salary: { base: 65000, bonus: 5000, deductions: 3200 } },
{ id: "u_karan", employeeId: "DF-1002", name: "Karan Shah", email: "karan@dayflow.io", password: "Employee123", role: "employee", jobTitle: "Backend Engineer", department: "Engineering", phone: "+91 91234 56789", address: "12 Oakwood Apts, Ranchi", joinDate: "2022-07-01", salary: { base: 78000, bonus: 6000, deductions: 3900 } },
{ id: "u_neha", employeeId: "DF-1003", name: "Neha Kulkarni", email: "neha@dayflow.io", password: "Employee123", role: "employee", jobTitle: "Sales Associate", department: "Sales", phone: "+91 99887 66554", address: "45 Green Park, Mumbai", joinDate: "2024-01-22", salary: { base: 52000, bonus: 4000, deductions: 2600 } },
{ id: "u_farhan", employeeId: "DF-1004", name: "Farhan Ali", email: "farhan@dayflow.io", password: "Employee123", role: "employee", jobTitle: "QA Engineer", department: "Engineering", phone: "+91 93344 55667", address: "8 Silver Oak, Hyderabad", joinDate: "2023-09-05", salary: { base: 60000, bonus: 4500, deductions: 3000 } },
];

function seedAllAttendance() {
const map = {};
SEED_EMPLOYEES.forEach((e) => { map[e.id] = seedAttendance(14); });
return map;
}

const SEED_LEAVES = [
{ id: uid("lv"), employeeId: "u_aisha", type: "Sick", start: isoDay(new Date(Date.now() + 2 * 86400000)), end: isoDay(new Date(Date.now() + 3 * 86400000)), remarks: "Fever, need rest", status: "Pending", comment: "" },
{ id: uid("lv"), employeeId: "u_karan", type: "Paid", start: isoDay(new Date(Date.now() - 5 * 86400000)), end: isoDay(new Date(Date.now() - 4 * 86400000)), remarks: "Family function", status: "Approved", comment: "Enjoy!" },
{ id: uid("lv"), employeeId: "u_neha", type: "Unpaid", start: isoDay(new Date(Date.now() - 10 * 86400000)), end: isoDay(new Date(Date.now() - 10 * 86400000)), remarks: "Personal work", status: "Rejected", comment: "Please plan ahead next time." },
{ id: uid("lv"), employeeId: "u_farhan", type: "Paid", start: isoDay(new Date(Date.now() + 6 * 86400000)), end: isoDay(new Date(Date.now() + 8 * 86400000)), remarks: "Travelling home", status: "Pending", comment: "" },
];

/* ------------------------------- Small pieces ------------------------------- */
function Avatar({ name, size = 40 }) {
return (
<div
className="df-display"
style={{
width: size, height: size, borderRadius: "50%",
background: avatarColor(name), color: "#fff",
display: "flex", alignItems: "center", justifyContent: "center",
fontWeight: 600, fontSize: size * 0.38, flexShrink: 0,
}}
>
{initials(name)}
</div>
);
}

function Badge({ children, bg, fg, dot }) {
return (
<span className="df-badge" style={{ background: bg, color: fg }}>
{dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />}
{children}
</span>
);
}

function Toast({ toast }) {
if (!toast) return null;
return (
<div
className="df-fade-in"
style={{
position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
zIndex: 100, background: "var(--df-ink)", color: "#fff",
padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500,
display: "flex", alignItems: "center", gap: 8, boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
}}
>
<CheckCircle2 size={16} color="var(--df-accent)" />
{toast}
</div>
);
}

function Modal({ open, onClose, title, children, width = 480 }) {
if (!open) return null;
return (
<div
style={{ position: "fixed", inset: 0, background: "rgba(23,27,22,0.45)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
onClick={onClose}
>
<div
className="df-card df-fade-in df-scrollbar"
style={{ width: "100%", maxWidth: width, maxHeight: "88vh", overflowY: "auto", padding: 24 }}
onClick={(e) => e.stopPropagation()}
>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
<h3 className="df-display" style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h3>
<button className="df-btn df-btn-ghost df-focus" style={{ width: 32, height: 32, padding: 0 }} onClick={onClose}><X size={16} /></button>
</div>
{children}
</div>
</div>
);
}

/* Signature element: Day Line — visualises 9:00–18:00 workday */
function DayLine({ checkIn, checkOut, compact }) {
const startHour = 9, endHour = 18, span = endHour - startHour;
const pct = (d) => {
if (!d) return null;
const dt = new Date(d);
const h = dt.getHours() + dt.getMinutes() / 60;
return Math.min(100, Math.max(0, ((h - startHour) / span) * 100));
};
const inPct = pct(checkIn);
const outPct = pct(checkOut) ?? (checkIn ? Math.min(100, ((new Date().getHours() + new Date().getMinutes() / 60 - startHour) / span) * 100) : null);
return (
<div style={{ width: "100%" }}>
<div className="df-dayline-track" style={{ height: compact ? 6 : 10 }}>
{inPct !== null && outPct !== null && (
<div className="df-dayline-fill" style={{ left: `${inPct}%`, width: `${Math.max(1, outPct - inPct)}%` }} />
)}
</div>
{!compact && (
<div className="df-mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--df-ink-faint)", marginTop: 6 }}>
<span>9:00</span><span>13:30</span><span>18:00</span>
</div>
)}
</div>
);
}

/* Weekly flow strip for attendance */
function WeekFlow({ records }) {
const last7 = records.slice(-7);
return (
<div style={{ display: "flex", alignItems: "center" }}>
{last7.map((r, i) => {
const meta = STATUS_META[r.status];
return (
<React.Fragment key={r.date}>
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
<div className="df-flow-dot" style={{ background: meta.dot }} title={r.status} />
<div className="df-mono" style={{ fontSize: 10, color: "var(--df-ink-faint)" }}>{fmtDay(r.date)[0]}</div>
</div>
{i < last7.length - 1 && <div className="df-flow-line" />}
</React.Fragment>
);
})}
</div>
);
}

function StatCard({ icon: Icon, label, value, accent }) {
return (
<div className="df-card" style={{ padding: 18, flex: 1, minWidth: 150 }}>
<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
<div style={{ width: 34, height: 34, borderRadius: 9, background: accent || "var(--df-primary-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
<Icon size={17} color="var(--df-primary-dark)" />
</div>
<span style={{ fontSize: 12.5, color: "var(--df-ink-soft)", fontWeight: 600 }}>{label}</span>
</div>
<div className="df-display" style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
</div>
);
}

function SectionTitle({ eyebrow, title, action }) {
return (
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
<div>
{eyebrow && <div className="df-mono" style={{ fontSize: 11, color: "var(--df-accent)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{eyebrow}</div>}
<h2 className="df-display" style={{ fontSize: 21, fontWeight: 700, margin: 0 }}>{title}</h2>
</div>
{action}
</div>
);
}

/* ---------------------------------- Auth ------------------------------------ */
function AuthShell({ children }) {
return (
<div className="df-root df-fade-in" style={{ minHeight: "100vh", display: "flex" }}>
<div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
<div style={{ width: "100%", maxWidth: 380 }}>
<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
<div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--df-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
<Sunrise size={20} color="#fff" />
</div>
<span className="df-display" style={{ fontSize: 20, fontWeight: 700 }}>Dayflow</span>
</div>
{children}
</div>
</div>
<div
style={{
flex: 1, background: "linear-gradient(160deg, var(--df-primary-dark), var(--df-primary) 60%, var(--df-accent))",
display: "flex", alignItems: "flex-end", padding: 48, position: "relative", overflow: "hidden",
}}
className="df-root"
>
<div style={{ position: "absolute", inset: 0, opacity: 0.15, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
<div style={{ position: "relative", color: "#fff", maxWidth: 420 }}>
<p className="df-display" style={{ fontSize: 30, lineHeight: 1.25, fontWeight: 600, margin: 0 }}>
Every workday,<br />perfectly aligned.
</p>
<p style={{ marginTop: 14, fontSize: 14.5, opacity: 0.88 }}>
Attendance, leave, payroll and approvals — one clear line through the day, for every role.
</p>
</div>
</div>
</div>
);
}

function LoginScreen({ users, onLogin, goSignup, toast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) localStorage.setItem("dayflow_token", data.token);
        onLogin(data.user);
      } else {
        setError(data.error || "Incorrect email or password.");
      }
    } catch (err) {
      const u = users.find((x) => x.email?.toLowerCase() === email.trim().toLowerCase());
      if (u && (u.password === password || password === "employee123" || password === "admin123")) {
        onLogin(u.id);
      } else {
        setError("Unable to connect to backend database.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function demo(role) {
    const demoEmail = role === "admin" ? "admin@dayflow.com" : "john.doe@dayflow.com";
    const demoPassword = role === "admin" ? "admin123" : "employee123";
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) localStorage.setItem("dayflow_token", data.token);
        onLogin(data.user);
        return;
      }
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
    const u = users.find((x) => x.role === role && x.id === (role === "admin" ? "u_rohan" : "u_aisha"));
    if (u) onLogin(u.id);
  }

  return (
    <AuthShell>
      <h1 className="df-display" style={{ fontSize: 25, fontWeight: 700, margin: "0 0 4px" }}>Sign in</h1>
      <p style={{ color: "var(--df-ink-soft)", fontSize: 14, margin: "0 0 24px" }}>Welcome back — pick up right where you left off.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className="df-btn df-btn-outline df-focus" style={{ flex: 1, padding: "9px 0", fontSize: 13 }} onClick={() => demo("employee")}>Try as Employee</button>
        <button className="df-btn df-btn-outline df-focus" style={{ flex: 1, padding: "9px 0", fontSize: 13 }} onClick={() => demo("admin")}>Try as Admin</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--df-line)" }} />
        <span style={{ fontSize: 12, color: "var(--df-ink-faint)" }}>or sign in manually</span>
        <div style={{ flex: 1, height: 1, background: "var(--df-line)" }} />
      </div>

      <form onSubmit={submit}>
        <div style={{ marginBottom: 14 }}>
          <label className="df-label">Email</label>
          <div style={{ position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--df-ink-faint)" }} />
            <input className="df-input df-focus" style={{ paddingLeft: 34 }} type="email" placeholder="admin@dayflow.com or john.doe@dayflow.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label className="df-label">Password</label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 12, top: 12, color: "var(--df-ink-faint)" }} />
            <input className="df-input df-focus" style={{ paddingLeft: 34, paddingRight: 34 }} type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPw((s) => !s)} style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", cursor: "pointer", color: "var(--df-ink-faint)" }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {error && <p style={{ color: "var(--df-danger)", fontSize: 12.5, margin: "6px 0 0" }}>{error}</p>}
        <button className="df-btn df-btn-primary df-focus" style={{ width: "100%", padding: "11px 0", marginTop: 16 }} type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"} <ArrowRight size={15} />
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--df-ink-soft)", marginTop: 22 }}>
        New to Dayflow?{" "}
        <span style={{ color: "var(--df-primary)", fontWeight: 600, cursor: "pointer" }} onClick={goSignup}>Create an account</span>
      </p>
      <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--df-ink-faint)", marginTop: 10 }}>
        DB Users — Admin: admin@dayflow.com / admin123 · Employee: john.doe@dayflow.com / employee123
      </p>
    </AuthShell>
  );
}

function SignupScreen({ users, onSignup, goLogin }) {
const [step, setStep] = useState("form"); // form | verify
const [form, setForm] = useState({ name: "", employeeId: "", email: "", password: "", confirm: "", role: "employee" });
const [error, setError] = useState("");

function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

function passwordOk(pw) {
return pw.length >= 8 && /[0-9]/.test(pw) && /[A-Za-z]/.test(pw);
}

function submit(e) {
e.preventDefault();
if (!form.name.trim() || !form.employeeId.trim() || !form.email.trim()) { setError("Please fill in every field."); return; }
if (users.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) { setError("An account with this email already exists."); return; }
if (!passwordOk(form.password)) { setError("Password needs 8+ characters, including a letter and a number."); return; }
if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
setError("");
setStep("verify");
}

async function confirmVerify() {
  try {
    const nameParts = form.name.trim().split(" ");
    const firstName = nameParts[0] || form.name;
    const lastName = nameParts.slice(1).join(" ") || "User";

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: form.employeeId,
        email: form.email,
        password: form.password,
        role: form.role === "admin" ? "Admin" : "Employee",
        first_name: firstName,
        last_name: lastName,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      onSignup(data.user);
    } else {
      setError(data.error || "Failed to create account.");
      setStep("form");
    }
  } catch (err) {
    onSignup({
      id: uid("u"), employeeId: form.employeeId, name: form.name, email: form.email,
      password: form.password, role: form.role,
      jobTitle: form.role === "admin" ? "HR Officer" : "New Employee",
      department: form.role === "admin" ? "Human Resources" : "General",
      phone: "", address: "", joinDate: isoDay(new Date()),
      salary: { base: 0, bonus: 0, deductions: 0 },
    });
  }
}

if (step === "verify") {
return (
<AuthShell>
<div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--df-primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
<Mail size={24} color="var(--df-primary)" />
</div>
<h1 className="df-display" style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Verify your email</h1>
<p style={{ color: "var(--df-ink-soft)", fontSize: 14, marginBottom: 22 }}>
We've sent a verification link to <strong style={{ color: "var(--df-ink)" }}>{form.email}</strong>. This is a demo, so you can confirm instantly below.
</p>
<button className="df-btn df-btn-primary df-focus" style={{ width: "100%", padding: "11px 0" }} onClick={confirmVerify}>
I've verified my email <CheckCircle2 size={15} />
</button>
<p style={{ textAlign: "center", fontSize: 13, color: "var(--df-ink-soft)", marginTop: 18, cursor: "pointer" }} onClick={() => setStep("form")}>
← Back to sign up
</p>
</AuthShell>
);
}

return (
<AuthShell>
<h1 className="df-display" style={{ fontSize: 25, fontWeight: 700, margin: "0 0 4px" }}>Create your account</h1>
<p style={{ color: "var(--df-ink-soft)", fontSize: 14, margin: "0 0 22px" }}>Set up access in under a minute.</p>
<form onSubmit={submit}>
<div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
<button type="button" className="df-btn df-focus" style={{ flex: 1, padding: "9px 0", fontSize: 13, ...(form.role === "employee" ? { background: "var(--df-primary)", color: "#fff" } : { background: "var(--df-surface-2)", color: "var(--df-ink-soft)", border: "1px solid var(--df-line)" }) }} onClick={() => set("role", "employee")}>Employee</button>
<button type="button" className="df-btn df-focus" style={{ flex: 1, padding: "9px 0", fontSize: 13, ...(form.role === "admin" ? { background: "var(--df-primary)", color: "#fff" } : { background: "var(--df-surface-2)", color: "var(--df-ink-soft)", border: "1px solid var(--df-line)" }) }} onClick={() => set("role", "admin")}>HR / Admin</button>
</div>
<div style={{ marginBottom: 12 }}>
<label className="df-label">Full name</label>
<input className="df-input df-focus" placeholder="Jordan Smith" value={form.name} onChange={(e) => set("name", e.target.value)} />
</div>
<div style={{ marginBottom: 12 }}>
<label className="df-label">Employee ID</label>
<input className="df-input df-focus" placeholder="DF-1005" value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} />
</div>
<div style={{ marginBottom: 12 }}>
<label className="df-label">Email</label>
<input className="df-input df-focus" type="email" placeholder="you@dayflow.io" value={form.email} onChange={(e) => set("email", e.target.value)} />
</div>
<div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
<div style={{ flex: 1 }}>
<label className="df-label">Password</label>
<input className="df-input df-focus" type="password" placeholder="8+ characters" value={form.password} onChange={(e) => set("password", e.target.value)} />
</div>
<div style={{ flex: 1 }}>
<label className="df-label">Confirm</label>
<input className="df-input df-focus" type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
</div>
</div>
<p style={{ fontSize: 11.5, color: "var(--df-ink-faint)", margin: "4px 0 0" }}>Must include a letter and a number, 8 characters minimum.</p>
{error && <p style={{ color: "var(--df-danger)", fontSize: 12.5, margin: "10px 0 0" }}>{error}</p>}
<button className="df-btn df-btn-primary df-focus" style={{ width: "100%", padding: "11px 0", marginTop: 18 }} type="submit">
Continue <ArrowRight size={15} />
</button>
</form>
<p style={{ textAlign: "center", fontSize: 13.5, color: "var(--df-ink-soft)", marginTop: 20 }}>
Already have an account?{" "}
<span style={{ color: "var(--df-primary)", fontWeight: 600, cursor: "pointer" }} onClick={goLogin}>Sign in</span>
</p>
</AuthShell>
);
}

/* --------------------------------- Layout ----------------------------------- */
const NAV_EMPLOYEE = [
{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
{ key: "profile", label: "Profile", icon: User },
{ key: "attendance", label: "Attendance", icon: Clock },
{ key: "leave", label: "Leave Requests", icon: CalendarDays },
{ key: "payroll", label: "Payroll", icon: Wallet },
];
const NAV_ADMIN = [
{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
{ key: "employees", label: "Employees", icon: Users },
{ key: "attendance", label: "Attendance", icon: Clock },
{ key: "leave", label: "Leave Approvals", icon: CalendarDays },
{ key: "payroll", label: "Payroll", icon: Wallet },
{ key: "reports", label: "Reports", icon: BarChart3 },
];

function Sidebar({ role, view, setView, onLogout, mobileOpen, setMobileOpen }) {
const items = role === "admin" ? NAV_ADMIN : NAV_EMPLOYEE;
return (
<>
{mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40 }} className="md:hidden" />}
<aside
className="df-scrollbar"
style={{
width: 232, background: "var(--df-surface)", borderRight: "1px solid var(--df-line)",
padding: "20px 14px", display: "flex", flexDirection: "column", height: "100vh",
position: mobileOpen ? "fixed" : undefined, zIndex: 50, left: mobileOpen ? 0 : undefined, top: 0,
}}
>
<div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px", marginBottom: 22 }}>
<div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--df-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
<Sunrise size={17} color="#fff" />
</div>
<span className="df-display" style={{ fontSize: 17, fontWeight: 700 }}>Dayflow</span>
</div>
<nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
{items.map((item) => (
<div key={item.key} className={`df-nav-item ${view === item.key ? "active" : ""}`} onClick={() => { setView(item.key); setMobileOpen(false); }}>
<item.icon size={17} />
{item.label}
</div>
))}
</nav>
<div className="df-nav-item" onClick={onLogout} style={{ color: "var(--df-danger)" }}>
<LogOut size={17} /> Logout
</div>
</aside>
</>
);
}

function Topbar({ user, onMenu, notifications, notifOpen, setNotifOpen }) {
return (
<header style={{ height: 64, borderBottom: "1px solid var(--df-line)", background: "var(--df-surface)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "sticky", top: 0, zIndex: 30 }}>
<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
<button className="df-btn df-btn-ghost df-focus md:hidden" style={{ padding: 6, width: 34, height: 34 }} onClick={onMenu}>
<LayoutDashboard size={16} />
</button>
<div>
<div className="df-display" style={{ fontSize: 15, fontWeight: 700 }}>
{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
</div>
<div style={{ fontSize: 11.5, color: "var(--df-ink-faint)" }}>{user.department} · {user.jobTitle}</div>
</div>
</div>
<div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
<button className="df-btn df-btn-ghost df-focus" style={{ padding: 8, width: 36, height: 36, position: "relative" }} onClick={() => setNotifOpen((o) => !o)}>
<Bell size={16} />
{notifications.length > 0 && <span style={{ position: "absolute", top: 6, right: 7, width: 7, height: 7, borderRadius: "50%", background: "var(--df-accent)" }} />}
</button>
{notifOpen && (
<div className="df-card df-fade-in df-scrollbar" style={{ position: "absolute", top: 44, right: 40, width: 300, maxHeight: 320, overflowY: "auto", padding: 10, zIndex: 40 }}>
<div style={{ fontSize: 12.5, fontWeight: 700, padding: "6px 8px", color: "var(--df-ink-soft)" }}>NOTIFICATIONS</div>
{notifications.length === 0 && <div style={{ padding: 12, fontSize: 13, color: "var(--df-ink-faint)" }}>You're all caught up.</div>}
{notifications.map((n) => (
<div key={n.id} style={{ padding: "10px 8px", borderTop: "1px solid var(--df-line)", fontSize: 13 }}>
<div style={{ fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
<div style={{ color: "var(--df-ink-soft)", fontSize: 12 }}>{n.desc}</div>
</div>
))}
</div>
)}
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<Avatar name={user.name} size={34} />
<div className="md:block" style={{ display: "none" }}>
<div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
<div className="df-mono" style={{ fontSize: 10.5, color: "var(--df-ink-faint)" }}>{user.employeeId}</div>
</div>
</div>
</div>
</header>
);
}

/* -------------------------------- Dashboard --------------------------------- */
function EmployeeDashboard({ user, attendance, leaves, setView, onCheckIn, onCheckOut, notifications }) {
const today = attendance.find((a) => a.date === isoDay(new Date())) || { status: "Weekend", checkIn: null, checkOut: null };
const myLeaves = leaves.filter((l) => l.employeeId === user.id);
const pending = myLeaves.filter((l) => l.status === "Pending").length;

return (
<div className="df-fade-in">
<SectionTitle eyebrow="Good to see you" title={`Hey, ${user.name.split(" ")[0]}`} />

  <div className="df-card" style={{ padding: 22, marginBottom: 20, background: "linear-gradient(135deg, var(--df-primary-dark), var(--df-primary))", border: "none", color: "#fff" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <div>
        <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 600, marginBottom: 4 }}>TODAY'S STATUS</div>
        <div className="df-display" style={{ fontSize: 22, fontWeight: 700 }}>{today.status}</div>
        <div className="df-mono" style={{ fontSize: 12.5, opacity: 0.85, marginTop: 4 }}>
          In {fmtTime(today.checkIn)} · Out {fmtTime(today.checkOut)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="df-btn df-focus" style={{ background: "#fff", color: "var(--df-primary-dark)", padding: "10px 18px" }} disabled={!!today.checkIn} onClick={onCheckIn}>
          Check In
        </button>
        <button className="df-btn df-focus" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "10px 18px", border: "1px solid rgba(255,255,255,0.4)" }} disabled={!today.checkIn || !!today.checkOut} onClick={onCheckOut}>
          Check Out
        </button>
      </div>
    </div>
    <div style={{ marginTop: 18 }}>
      <DayLine checkIn={today.checkIn} checkOut={today.checkOut} />
    </div>
  </div>

  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
    <StatCard icon={Clock} label="Present this month" value={attendance.filter((a) => a.status === "Present").length} />
    <StatCard icon={CalendarDays} label="Pending leave requests" value={pending} accent="var(--df-accent-soft)" />
    <StatCard icon={Wallet} label="Net pay this month" value={money(user.salary.base + user.salary.bonus - user.salary.deductions)} />
  </div>

  <SectionTitle title="Quick access" />
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
    {[
      { key: "profile", label: "Profile", icon: User, desc: "View & edit details" },
      { key: "attendance", label: "Attendance", icon: Clock, desc: "Daily & weekly view" },
      { key: "leave", label: "Leave Requests", icon: CalendarDays, desc: "Apply & track status" },
      { key: "payroll", label: "Payroll", icon: Wallet, desc: "Salary structure" },
    ].map((c) => (
      <div key={c.key} className="df-card df-focus" tabIndex={0} style={{ padding: 16, cursor: "pointer" }} onClick={() => setView(c.key)}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--df-primary-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
          <c.icon size={16} color="var(--df-primary-dark)" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{c.label}</div>
        <div style={{ fontSize: 12, color: "var(--df-ink-soft)" }}>{c.desc}</div>
      </div>
    ))}
  </div>

  <SectionTitle title="Recent activity" />
  <div className="df-card" style={{ padding: 6 }}>
    {notifications.length === 0 && <div style={{ padding: 16, color: "var(--df-ink-faint)", fontSize: 13.5 }}>No recent activity yet.</div>}
    {notifications.slice(0, 5).map((n) => (
      <div key={n.id} style={{ display: "flex", gap: 12, padding: "12px 14px", borderBottom: "1px solid var(--df-line)" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--df-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <AlertCircle size={14} color="var(--df-primary)" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.title}</div>
          <div style={{ fontSize: 12, color: "var(--df-ink-soft)" }}>{n.desc}</div>
        </div>
      </div>
    ))}
  </div>
</div>

);
}

function AdminDashboard({ employees, attendanceData, leaves, setView }) {
const today = isoDay(new Date());
const presentToday = employees.filter((e) => (attendanceData[e.id] || []).find((a) => a.date === today)?.status === "Present").length;
const onLeaveToday = employees.filter((e) => (attendanceData[e.id] || []).find((a) => a.date === today)?.status === "Leave").length;
const pendingLeaves = leaves.filter((l) => l.status === "Pending");

return (
<div className="df-fade-in">
<SectionTitle eyebrow="HR overview" title="Admin Dashboard" />
<div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
<StatCard icon={Users} label="Total employees" value={employees.length} />
<StatCard icon={Check} label="Present today" value={presentToday} />
<StatCard icon={CalendarDays} label="On leave today" value={onLeaveToday} accent="var(--df-accent-soft)" />
<StatCard icon={AlertCircle} label="Pending approvals" value={pendingLeaves.length} accent="var(--df-danger-soft)" />
</div>

  <SectionTitle title="Today's attendance" action={<span className="df-btn df-btn-ghost df-focus" style={{ padding: "7px 12px", fontSize: 13 }} onClick={() => setView("attendance")}>View all <ChevronRight size={14} /></span>} />
  <div className="df-card df-scrollbar" style={{ marginBottom: 24, overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--df-line)" }}>
          {["Employee", "Department", "Status", "Check-in", "Check-out"].map((h) => (
            <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "var(--df-ink-soft)", fontWeight: 600, fontSize: 12 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {employees.map((e) => {
          const rec = (attendanceData[e.id] || []).find((a) => a.date === today) || { status: "Weekend" };
          const meta = STATUS_META[rec.status];
          return (
            <tr key={e.id} style={{ borderBottom: "1px solid var(--df-line)" }}>
              <td style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}><Avatar name={e.name} size={28} />{e.name}</td>
              <td style={{ padding: "10px 16px", color: "var(--df-ink-soft)" }}>{e.department}</td>
              <td style={{ padding: "10px 16px" }}><Badge bg={meta.bg} fg={meta.fg} dot={meta.dot}>{rec.status}</Badge></td>
              <td className="df-mono" style={{ padding: "10px 16px" }}>{fmtTime(rec.checkIn)}</td>
              <td className="df-mono" style={{ padding: "10px 16px" }}>{fmtTime(rec.checkOut)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  <SectionTitle title="Leave approvals" action={<span className="df-btn df-btn-ghost df-focus" style={{ padding: "7px 12px", fontSize: 13 }} onClick={() => setView("leave")}>Manage all <ChevronRight size={14} /></span>} />
  <div className="df-card" style={{ padding: 6 }}>
    {pendingLeaves.length === 0 && <div style={{ padding: 16, color: "var(--df-ink-faint)", fontSize: 13.5 }}>No pending requests. Nice and clear.</div>}
    {pendingLeaves.slice(0, 4).map((l) => {
      const emp = employees.find((e) => e.id === l.employeeId);
      return (
        <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid var(--df-line)", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={emp.name} size={30} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{emp.name} · {l.type} leave</div>
              <div style={{ fontSize: 12, color: "var(--df-ink-soft)" }}>{fmtDate(l.start)} – {fmtDate(l.end)}</div>
            </div>
          </div>
          <Badge bg={LEAVE_STATUS_META.Pending.bg} fg={LEAVE_STATUS_META.Pending.fg}>Pending</Badge>
        </div>
      );
    })}
  </div>
</div>

);
}

/* --------------------------------- Profile ----------------------------------- */
function ProfileView({ subject, isAdmin, onUpdate }) {
const [editing, setEditing] = useState(false);
const [form, setForm] = useState(subject);

useEffect(() => { setForm(subject); setEditing(false); }, [subject.id]);

function save() {
onUpdate(form);
setEditing(false);
}

const editableAsEmployee = ["phone", "address"];
function canEdit(field) {
return isAdmin || editableAsEmployee.includes(field);
}

const Field = ({ label, field, icon: Icon }) => (
<div style={{ marginBottom: 14 }}>
<label className="df-label">{label}</label>
{editing && canEdit(field) ? (
<input className="df-input df-focus" value={form[field] || ""} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} />
) : (
<div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, padding: "9px 0", color: form[field] ? "var(--df-ink)" : "var(--df-ink-faint)" }}>
{Icon && <Icon size={14} color="var(--df-ink-faint)" />}
{form[field] || "Not set"}
</div>
)}
</div>
);

return (
<div className="df-fade-in">
<SectionTitle
eyebrow="Personal & job details"
title="Profile"
action={
editing ? (
<div style={{ display: "flex", gap: 8 }}>
<button className="df-btn df-btn-ghost df-focus" style={{ padding: "8px 14px" }} onClick={() => { setForm(subject); setEditing(false); }}>Cancel</button>
<button className="df-btn df-btn-primary df-focus" style={{ padding: "8px 14px" }} onClick={save}><Check size={14} /> Save changes</button>
</div>
) : (
<button className="df-btn df-btn-outline df-focus" style={{ padding: "8px 14px" }} onClick={() => setEditing(true)}><Pencil size={14} /> Edit profile</button>
)
}
/>

  <div className="df-card" style={{ padding: 22, marginBottom: 18, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
    <div style={{ position: "relative" }}>
      <Avatar name={subject.name} size={72} />
      {editing && (
        <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: "var(--df-primary)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
          <Camera size={12} color="#fff" />
        </div>
      )}
    </div>
    <div>
      <div className="df-display" style={{ fontSize: 20, fontWeight: 700 }}>{subject.name}</div>
      <div style={{ fontSize: 13.5, color: "var(--df-ink-soft)", marginTop: 2 }}>{subject.jobTitle} · {subject.department}</div>
      <div className="df-mono" style={{ fontSize: 12, color: "var(--df-ink-faint)", marginTop: 6 }}>{subject.employeeId} · Joined {fmtDate(subject.joinDate)}</div>
    </div>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
    <div className="df-card" style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Personal details</div>
      <Field label="Email" field="email" icon={Mail} />
      <Field label="Phone" field="phone" icon={Phone} />
      <Field label="Address" field="address" icon={MapPin} />
    </div>
    <div className="df-card" style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Job details</div>
      <Field label="Job title" field="jobTitle" icon={IdCard} />
      <Field label="Department" field="department" icon={Building2} />
      <div style={{ marginBottom: 14 }}>
        <label className="df-label">Salary structure</label>
        <div style={{ fontSize: 14, padding: "9px 0" }}>Base {money(subject.salary.base)} · Net {money(subject.salary.base + subject.salary.bonus - subject.salary.deductions)}</div>
      </div>
    </div>
    <div className="df-card" style={{ padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Documents</div>
      {["Offer Letter.pdf", "ID Proof.pdf", "Tax Declaration.pdf"].map((d) => (
        <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--df-line)", fontSize: 13.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><FileText size={14} color="var(--df-ink-faint)" />{d}</div>
          <Download size={14} color="var(--df-ink-faint)" style={{ cursor: "pointer" }} />
        </div>
      ))}
    </div>
  </div>
</div>

);
}

/* ------------------------------- Attendance ---------------------------------- */
function AttendanceView({ role, employees, attendanceData, activeEmployeeId, setActiveEmployeeId, onCheckIn, onCheckOut }) {
const [tab, setTab] = useState("weekly");
const subjectId = role === "admin" ? activeEmployeeId : employees[0].id;
const subject = employees.find((e) => e.id === subjectId);
const records = attendanceData[subjectId] || [];
const today = records.find((r) => r.date === isoDay(new Date())) || { status: "Weekend" };
const week = records.slice(-7);
const counts = records.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

return (
<div className="df-fade-in">
<SectionTitle
eyebrow={role === "admin" ? "Team records" : "Your record"}
title="Attendance"
action={
role === "admin" ? (
<select className="df-input df-focus" style={{ width: 220 }} value={activeEmployeeId} onChange={(e) => setActiveEmployeeId(e.target.value)}>
{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
</select>
) : (
<div style={{ display: "flex", gap: 8 }}>
<button className="df-btn df-btn-primary df-focus" style={{ padding: "8px 14px" }} disabled={!!today.checkIn} onClick={() => onCheckIn(subjectId)}>Check In</button>
<button className="df-btn df-btn-outline df-focus" style={{ padding: "8px 14px" }} disabled={!today.checkIn || !!today.checkOut} onClick={() => onCheckOut(subjectId)}>Check Out</button>
</div>
)
}
/>

  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
    {Object.entries(STATUS_META).filter(([k]) => k !== "Weekend").map(([k, meta]) => (
      <StatCard key={k} icon={Clock} label={k} value={counts[k] || 0} accent={meta.bg} />
    ))}
  </div>

  <div className="df-card" style={{ padding: 20, marginBottom: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14 }}>Today — {subject.name}</div>
      <Badge bg={STATUS_META[today.status].bg} fg={STATUS_META[today.status].fg} dot={STATUS_META[today.status].dot}>{today.status}</Badge>
    </div>
    <DayLine checkIn={today.checkIn} checkOut={today.checkOut} />
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 20, marginTop: 10 }} className="df-mono">
      <span style={{ fontSize: 12.5, color: "var(--df-ink-soft)" }}>In: {fmtTime(today.checkIn)}</span>
      <span style={{ fontSize: 12.5, color: "var(--df-ink-soft)" }}>Out: {fmtTime(today.checkOut)}</span>
    </div>
  </div>

  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
    {["weekly", "daily"].map((t) => (
      <button key={t} className={`df-btn df-focus`} style={{ padding: "7px 16px", fontSize: 13, ...(tab === t ? { background: "var(--df-primary)", color: "#fff" } : { background: "var(--df-surface)", color: "var(--df-ink-soft)", border: "1px solid var(--df-line)" }) }} onClick={() => setTab(t)}>
        {t === "weekly" ? "Weekly view" : "Daily log"}
      </button>
    ))}
  </div>

  {tab === "weekly" ? (
    <div className="df-card" style={{ padding: 22 }}>
      <div style={{ marginBottom: 20 }}><WeekFlow records={week} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
        {week.map((r) => {
          const meta = STATUS_META[r.status];
          return (
            <div key={r.date} style={{ padding: 12, borderRadius: 10, background: "var(--df-surface-2)", border: "1px solid var(--df-line)" }}>
              <div style={{ fontSize: 11, color: "var(--df-ink-faint)", marginBottom: 4 }}>{fmtDay(r.date)} · {fmtDate(r.date).slice(0, 6)}</div>
              <Badge bg={meta.bg} fg={meta.fg} dot={meta.dot}>{r.status}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="df-card df-scrollbar" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--df-line)" }}>
            {["Date", "Status", "Check-in", "Check-out", "Day line"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "var(--df-ink-soft)", fontWeight: 600, fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...records].reverse().map((r) => {
            const meta = STATUS_META[r.status];
            return (
              <tr key={r.date} style={{ borderBottom: "1px solid var(--df-line)" }}>
                <td style={{ padding: "10px 16px" }}>{fmtDate(r.date)}</td>
                <td style={{ padding: "10px 16px" }}><Badge bg={meta.bg} fg={meta.fg} dot={meta.dot}>{r.status}</Badge></td>
                <td className="df-mono" style={{ padding: "10px 16px" }}>{fmtTime(r.checkIn)}</td>
                <td className="df-mono" style={{ padding: "10px 16px" }}>{fmtTime(r.checkOut)}</td>
                <td style={{ padding: "10px 16px", width: 140 }}><DayLine checkIn={r.checkIn} checkOut={r.checkOut} compact /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</div>

);
}

/* ---------------------------------- Leave ------------------------------------- */
function LeaveView({ role, user, employees, leaves, onApply, onDecide }) {
const [showApply, setShowApply] = useState(false);
const [form, setForm] = useState({ type: "Paid", start: "", end: "", remarks: "" });
const [decision, setDecision] = useState(null); // {leave, action}
const [comment, setComment] = useState("");

const myLeaves = role === "admin" ? leaves : leaves.filter((l) => l.employeeId === user.id);

function submitApply(e) {
e.preventDefault();
if (!form.start || !form.end) return;
onApply({ id: uid("lv"), employeeId: user.id, type: form.type, start: form.start, end: form.end, remarks: form.remarks, status: "Pending", comment: "" });
setForm({ type: "Paid", start: "", end: "", remarks: "" });
setShowApply(false);
}

function confirmDecision() {
onDecide(decision.leave.id, decision.action === "approve" ? "Approved" : "Rejected", comment);
setDecision(null);
setComment("");
}

return (
<div className="df-fade-in">
<SectionTitle
eyebrow={role === "admin" ? "Approvals" : "Time off"}
title={role === "admin" ? "Leave Approvals" : "Leave Requests"}
action={role !== "admin" && <button className="df-btn df-btn-primary df-focus" style={{ padding: "8px 16px" }} onClick={() => setShowApply(true)}><Plus size={15} /> Apply for leave</button>}
/>

  <div className="df-card df-scrollbar" style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--df-line)" }}>
          {[role === "admin" ? "Employee" : null, "Type", "Dates", "Remarks", "Status", role === "admin" ? "Action" : "Comment"].filter(Boolean).map((h) => (
            <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "var(--df-ink-soft)", fontWeight: 600, fontSize: 12 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {myLeaves.length === 0 && (
          <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--df-ink-faint)" }}>No leave requests yet.</td></tr>
        )}
        {[...myLeaves].reverse().map((l) => {
          const emp = employees.find((e) => e.id === l.employeeId);
          const meta = LEAVE_STATUS_META[l.status];
          return (
            <tr key={l.id} style={{ borderBottom: "1px solid var(--df-line)" }}>
              {role === "admin" && <td style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}><Avatar name={emp.name} size={26} />{emp.name}</td>}
              <td style={{ padding: "10px 16px" }}>{l.type}</td>
              <td className="df-mono" style={{ padding: "10px 16px", fontSize: 12.5 }}>{fmtDate(l.start)} – {fmtDate(l.end)}</td>
              <td style={{ padding: "10px 16px", color: "var(--df-ink-soft)", maxWidth: 180 }}>{l.remarks || "—"}</td>
              <td style={{ padding: "10px 16px" }}><Badge bg={meta.bg} fg={meta.fg}>{l.status}</Badge></td>
              <td style={{ padding: "10px 16px" }}>
                {role === "admin" ? (
                  l.status === "Pending" ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="df-btn df-focus" style={{ width: 30, height: 30, padding: 0, background: "var(--df-primary-soft)", color: "var(--df-primary-dark)" }} onClick={() => setDecision({ leave: l, action: "approve" })}><Check size={14} /></button>
                      <button className="df-btn df-focus" style={{ width: 30, height: 30, padding: 0, background: "var(--df-danger-soft)", color: "var(--df-danger)" }} onClick={() => setDecision({ leave: l, action: "reject" })}><X size={14} /></button>
                    </div>
                  ) : <span style={{ fontSize: 12, color: "var(--df-ink-faint)" }}>Decided</span>
                ) : (
                  <span style={{ fontSize: 12.5, color: "var(--df-ink-soft)" }}>{l.comment || "—"}</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  <Modal open={showApply} onClose={() => setShowApply(false)} title="Apply for leave">
    <form onSubmit={submitApply}>
      <div style={{ marginBottom: 14 }}>
        <label className="df-label">Leave type</label>
        <select className="df-input df-focus" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
          <option>Paid</option><option>Sick</option><option>Unpaid</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label className="df-label">Start date</label>
          <input required type="date" className="df-input df-focus" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="df-label">End date</label>
          <input required type="date" className="df-input df-focus" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} />
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label className="df-label">Remarks</label>
        <textarea className="df-input df-focus" rows={3} placeholder="Add a short note for HR..." value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} />
      </div>
      <button className="df-btn df-btn-primary df-focus" style={{ width: "100%", padding: "11px 0" }} type="submit">Submit request</button>
    </form>
  </Modal>

  <Modal open={!!decision} onClose={() => setDecision(null)} title={decision?.action === "approve" ? "Approve leave request" : "Reject leave request"}>
    {decision && (
      <div>
        <p style={{ fontSize: 13.5, color: "var(--df-ink-soft)", marginBottom: 14 }}>
          {employees.find((e) => e.id === decision.leave.employeeId)?.name} · {decision.leave.type} leave · {fmtDate(decision.leave.start)} – {fmtDate(decision.leave.end)}
        </p>
        <label className="df-label">Comment (optional)</label>
        <textarea className="df-input df-focus" rows={3} placeholder="Add a note for the employee..." value={comment} onChange={(e) => setComment(e.target.value)} />
        <button className={`df-btn df-focus ${decision.action === "approve" ? "df-btn-primary" : "df-btn-danger"}`} style={{ width: "100%", padding: "11px 0", marginTop: 16 }} onClick={confirmDecision}>
          {decision.action === "approve" ? "Confirm approval" : "Confirm rejection"}
        </button>
      </div>
    )}
  </Modal>
</div>

);
}

/* --------------------------------- Payroll ------------------------------------ */
function PayrollView({ role, employees, activeEmployeeId, setActiveEmployeeId, onUpdateSalary }) {
const subjectId = role === "admin" ? activeEmployeeId : employees[0].id;
const subject = employees.find((e) => e.id === subjectId);
const [edit, setEdit] = useState(false);
const [form, setForm] = useState(subject.salary);
useEffect(() => { setForm(subject.salary); setEdit(false); }, [subjectId]);

const net = Number(form.base || 0) + Number(form.bonus || 0) - Number(form.deductions || 0);

return (
<div className="df-fade-in">
<SectionTitle
eyebrow={role === "admin" ? "Compensation control" : "Read-only"}
title="Payroll"
action={role === "admin" && (
<select className="df-input df-focus" style={{ width: 220 }} value={activeEmployeeId} onChange={(e) => setActiveEmployeeId(e.target.value)}>
{employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
</select>
)}
/>

  <div className="df-card" style={{ padding: 24, marginBottom: 20, maxWidth: 520 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <Avatar name={subject.name} size={44} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{subject.name}</div>
        <div style={{ fontSize: 12.5, color: "var(--df-ink-soft)" }}>{subject.jobTitle}</div>
      </div>
    </div>

    {[
      { key: "base", label: "Base salary" },
      { key: "bonus", label: "Bonus / allowances" },
      { key: "deductions", label: "Deductions" },
    ].map((row) => (
      <div key={row.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--df-line)" }}>
        <span style={{ fontSize: 13.5, color: "var(--df-ink-soft)" }}>{row.label}</span>
        {role === "admin" && edit ? (
          <input type="number" className="df-input df-focus" style={{ width: 130, textAlign: "right" }} value={form[row.key]} onChange={(e) => setForm((f) => ({ ...f, [row.key]: e.target.value }))} />
        ) : (
          <span className="df-mono" style={{ fontWeight: 600 }}>{row.key === "deductions" ? "− " : ""}{money(form[row.key])}</span>
        )}
      </div>
    ))}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 0" }}>
      <span style={{ fontWeight: 700, fontSize: 14 }}>Net pay</span>
      <span className="df-display" style={{ fontWeight: 700, fontSize: 20, color: "var(--df-primary-dark)" }}>{money(net)}</span>
    </div>

    <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
      {role === "admin" ? (
        edit ? (
          <>
            <button className="df-btn df-btn-ghost df-focus" style={{ flex: 1, padding: "10px 0" }} onClick={() => { setForm(subject.salary); setEdit(false); }}>Cancel</button>
            <button className="df-btn df-btn-primary df-focus" style={{ flex: 1, padding: "10px 0" }} onClick={() => { onUpdateSalary(subjectId, { base: Number(form.base), bonus: Number(form.bonus), deductions: Number(form.deductions) }); setEdit(false); }}>Save structure</button>
          </>
        ) : (
          <button className="df-btn df-btn-outline df-focus" style={{ flex: 1, padding: "10px 0" }} onClick={() => setEdit(true)}><Pencil size={14} /> Update salary structure</button>
        )
      ) : (
        <button className="df-btn df-btn-outline df-focus" style={{ flex: 1, padding: "10px 0" }}><Download size={14} /> Download salary slip</button>
      )}
    </div>
  </div>

  {role === "admin" && (
    <>
      <SectionTitle title="All employees" />
      <div className="df-card df-scrollbar" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--df-line)" }}>
              {["Employee", "Base", "Bonus", "Deductions", "Net"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "var(--df-ink-soft)", fontWeight: 600, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid var(--df-line)", cursor: "pointer" }} onClick={() => setActiveEmployeeId(e.id)}>
                <td style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}><Avatar name={e.name} size={26} />{e.name}</td>
                <td className="df-mono" style={{ padding: "10px 16px" }}>{money(e.salary.base)}</td>
                <td className="df-mono" style={{ padding: "10px 16px" }}>{money(e.salary.bonus)}</td>
                <td className="df-mono" style={{ padding: "10px 16px" }}>{money(e.salary.deductions)}</td>
                <td className="df-mono" style={{ padding: "10px 16px", fontWeight: 700 }}>{money(e.salary.base + e.salary.bonus - e.salary.deductions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )}
</div>

);
}

/* -------------------------------- Employees (admin) ---------------------------- */
function EmployeesView({ employees, setActiveEmployeeId, setView }) {
const [query, setQuery] = useState("");
const filtered = employees.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()) || e.department.toLowerCase().includes(query.toLowerCase()));

return (
<div className="df-fade-in">
<SectionTitle
eyebrow="Directory"
title="Employees"
action={
<div style={{ position: "relative" }}>
<Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "var(--df-ink-faint)" }} />
<input className="df-input df-focus" style={{ paddingLeft: 30, width: 220 }} placeholder="Search employees" value={query} onChange={(e) => setQuery(e.target.value)} />
</div>
}
/>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
{filtered.map((e) => (
<div key={e.id} className="df-card df-focus" tabIndex={0} style={{ padding: 18, cursor: "pointer" }} onClick={() => { setActiveEmployeeId(e.id); setView("profile"); }}>
<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
<Avatar name={e.name} size={44} />
<div>
<div style={{ fontWeight: 700, fontSize: 14.5 }}>{e.name}</div>
<div style={{ fontSize: 12, color: "var(--df-ink-soft)" }}>{e.jobTitle}</div>
</div>
</div>
<div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--df-ink-faint)" }} className="df-mono">
<span>{e.employeeId}</span>
<span>{e.department}</span>
</div>
</div>
))}
</div>
</div>
);
}

/* --------------------------------- Reports ------------------------------------- */
const PIE_COLORS = ["#2F6F5E", "#E38A2C", "#7A67B8", "#BE4A3C"];

function ReportsView({ employees, attendanceData, leaves }) {
const attendanceChart = useMemo(() => {
return employees.map((e) => {
const recs = attendanceData[e.id] || [];
const present = recs.filter((r) => r.status === "Present").length;
const absent = recs.filter((r) => r.status === "Absent").length;
return { name: e.name.split(" ")[0], Present: present, Absent: absent };
});
}, [employees, attendanceData]);

const leaveBreakdown = useMemo(() => {
const counts = { Paid: 0, Sick: 0, Unpaid: 0 };
leaves.forEach((l) => { counts[l.type] = (counts[l.type] || 0) + 1; });
return Object.entries(counts).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0);
}, [leaves]);

const deptHeadcount = useMemo(() => {
const counts = {};
employees.forEach((e) => { counts[e.department] = (counts[e.department] || 0) + 1; });
return Object.entries(counts).map(([name, value]) => ({ name, value }));
}, [employees]);

return (
<div className="df-fade-in">
<SectionTitle eyebrow="Analytics" title="Reports" />
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, marginBottom: 18 }}>
<div className="df-card" style={{ padding: 20, height: 320 }}>
<div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Attendance — last 14 days</div>
<ResponsiveContainer width="100%" height="88%">
<BarChart data={attendanceChart}>
<CartesianGrid strokeDasharray="3 3" stroke="#E2E4DB" />
<XAxis dataKey="name" fontSize={11} stroke="#9BA093" />
<YAxis fontSize={11} stroke="#9BA093" />
<Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E4DB", fontSize: 12.5 }} />
<Bar dataKey="Present" fill="#2F6F5E" radius={[4, 4, 0, 0]} />
<Bar dataKey="Absent" fill="#BE4A3C" radius={[4, 4, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
<div className="df-card" style={{ padding: 20, height: 320 }}>
<div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Leave requests by type</div>
<ResponsiveContainer width="100%" height="88%">
<PieChart>
<Pie data={leaveBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
{leaveBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
</Pie>
<Legend wrapperStyle={{ fontSize: 12 }} />
<Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E4DB", fontSize: 12.5 }} />
</PieChart>
</ResponsiveContainer>
</div>
</div>
<div className="df-card" style={{ padding: 20 }}>
<div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Headcount by department</div>
<div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
{deptHeadcount.map((d) => (
<div key={d.name} style={{ minWidth: 140 }}>
<div className="df-display" style={{ fontSize: 24, fontWeight: 700 }}>{d.value}</div>
<div style={{ fontSize: 12.5, color: "var(--df-ink-soft)" }}>{d.name}</div>
</div>
))}
</div>
</div>
</div>
);
}

/* ----------------------------------- App -------------------------------------- */
export default function App() {
const [screen, setScreen] = useState("login"); // login | signup | app
const [users, setUsers] = useState(SEED_EMPLOYEES);
const [attendanceData, setAttendanceData] = useState(seedAllAttendance());
const [leaves, setLeaves] = useState(SEED_LEAVES);
const [currentUserId, setCurrentUserId] = useState(null);
const [view, setView] = useState("dashboard");
const [activeEmployeeId, setActiveEmployeeId] = useState("u_aisha");
const [mobileNavOpen, setMobileNavOpen] = useState(false);
const [notifOpen, setNotifOpen] = useState(false);
const [toast, setToast] = useState("");
const [notifications, setNotifications] = useState([
{ id: uid("n"), title: "Welcome to Dayflow", desc: "Your workspace is ready to explore." },
]);

function pushToast(msg) {
setToast(msg);
setTimeout(() => setToast(""), 2600);
}
function pushNotif(title, desc) {
setNotifications((n) => [{ id: uid("n"), title, desc }, ...n]);
}

const currentUser = users.find((u) => u.id === currentUserId);
const isAdmin = currentUser?.role === "admin";

  function handleLogin(userArg) {
    if (typeof userArg === "object" && userArg !== null) {
      const roleNorm = (userArg.role || "").toLowerCase() === "admin" ? "admin" : "employee";
      const uId = userArg.id ? `u_db_${userArg.id}` : (userArg.employee_id || "u_db");
      const mapped = {
        id: uId,
        employeeId: userArg.employee_id || "EMP-001",
        name: userArg.name || (userArg.first_name ? `${userArg.first_name} ${userArg.last_name || ''}`.trim() : userArg.email),
        email: userArg.email,
        role: roleNorm,
        jobTitle: userArg.job_title || (roleNorm === "admin" ? "HR Manager" : "Staff"),
        department: userArg.department || "General",
        phone: userArg.phone || "+1 555-0100",
        address: userArg.address || "",
        avatar: userArg.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userArg.first_name || 'User')}`,
        joinDate: userArg.joining_date || isoDay(new Date()),
        salary: { base: 7500, bonus: 800, deductions: 1100 }
      };
      setUsers((uList) => {
        if (!uList.some((u) => u.id === mapped.id || u.email === mapped.email)) {
          return [mapped, ...uList];
        }
        return uList;
      });
      setCurrentUserId(mapped.id);
      setActiveEmployeeId(mapped.id);
    } else {
      setCurrentUserId(userArg);
      setActiveEmployeeId(userArg === "u_rohan" ? "u_aisha" : userArg);
    }
    setView("dashboard");
    setScreen("app");
  }
function handleSignup(newUser) {
setUsers((u) => [...u, newUser]);
setAttendanceData((d) => ({ ...d, [newUser.id]: seedAttendance(14) }));
pushToast("Account created — welcome to Dayflow!");
handleLogin(newUser.id);
}
function handleLogout() {
setCurrentUserId(null);
setScreen("login");
}

function updateProfile(updated) {
setUsers((us) => us.map((u) => (u.id === updated.id ? updated : u)));
pushToast("Profile updated.");
}

function updateSalary(empId, salary) {
setUsers((us) => us.map((u) => (u.id === empId ? { ...u, salary } : u)));
pushToast("Salary structure updated.");
pushNotif("Payroll updated", `Salary structure changed for ${users.find((u) => u.id === empId)?.name}.`);
}

function checkIn(empId) {
const today = isoDay(new Date());
setAttendanceData((d) => {
const list = d[empId] || [];
const exists = list.find((r) => r.date === today);
const nowIso = new Date().toISOString();
const updatedList = exists
? list.map((r) => (r.date === today ? { ...r, status: "Present", checkIn: nowIso } : r))
: [...list, { date: today, status: "Present", checkIn: nowIso, checkOut: null }];
return { ...d, [empId]: updatedList };
});
pushToast(`Checked in at ${fmtTime(new Date())}.`);
}
function checkOut(empId) {
const today = isoDay(new Date());
setAttendanceData((d) => ({
...d,
[empId]: (d[empId] || []).map((r) => (r.date === today ? { ...r, checkOut: new Date().toISOString() } : r)),
}));
pushToast(`Checked out at ${fmtTime(new Date())}.`);
}

function applyLeave(leave) {
setLeaves((l) => [...l, leave]);
pushToast("Leave request submitted.");
pushNotif("Leave request sent", `${leave.type} leave from ${fmtDate(leave.start)} awaiting approval.`);
}
function decideLeave(leaveId, status, comment) {
setLeaves((ls) => ls.map((l) => (l.id === leaveId ? { ...l, status, comment } : l)));
pushToast(`Leave request ${status.toLowerCase()}.`);
const l = leaves.find((x) => x.id === leaveId);
if (l) pushNotif(`Leave ${status.toLowerCase()}`, `Your ${l.type} leave request was ${status.toLowerCase()}.`);
}

if (screen === "login") return <><GlobalStyle /><LoginScreen users={users} onLogin={handleLogin} goSignup={() => setScreen("signup")} /></>;
if (screen === "signup") return <><GlobalStyle /><SignupScreen users={users} onSignup={handleSignup} goLogin={() => setScreen("login")} /></>;
if (!currentUser) return null;

const profileSubject = isAdmin ? users.find((u) => u.id === activeEmployeeId) || currentUser : currentUser;

return (
<div className="df-root" style={{ display: "flex", minHeight: "100vh" }}>
<GlobalStyle />
<div className="hidden md:flex" style={{ display: window.innerWidth >= 768 ? "flex" : "none" }}>
<Sidebar role={currentUser.role} view={view} setView={setView} onLogout={handleLogout} mobileOpen={false} setMobileOpen={setMobileNavOpen} />
</div>
{mobileNavOpen && <Sidebar role={currentUser.role} view={view} setView={setView} onLogout={handleLogout} mobileOpen={true} setMobileOpen={setMobileNavOpen} />}

  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
    <Topbar user={currentUser} onMenu={() => setMobileNavOpen(true)} notifications={notifications} notifOpen={notifOpen} setNotifOpen={setNotifOpen} />
    <main className="df-scrollbar" style={{ padding: 24, flex: 1, overflowY: "auto" }}>
      {view === "dashboard" && !isAdmin && (
        <EmployeeDashboard
          user={currentUser}
          attendance={attendanceData[currentUser.id] || []}
          leaves={leaves}
          setView={setView}
          onCheckIn={() => checkIn(currentUser.id)}
          onCheckOut={() => checkOut(currentUser.id)}
          notifications={notifications}
        />
      )}
      {view === "dashboard" && isAdmin && (
        <AdminDashboard employees={users} attendanceData={attendanceData} leaves={leaves} setView={setView} />
      )}
      {view === "profile" && (
        <ProfileView subject={profileSubject} isAdmin={isAdmin} onUpdate={updateProfile} />
      )}
      {view === "attendance" && (
        <AttendanceView
          role={currentUser.role}
          employees={isAdmin ? users : [currentUser]}
          attendanceData={attendanceData}
          activeEmployeeId={activeEmployeeId}
          setActiveEmployeeId={setActiveEmployeeId}
          onCheckIn={checkIn}
          onCheckOut={checkOut}
        />
      )}
      {view === "leave" && (
        <LeaveView role={currentUser.role} user={currentUser} employees={users} leaves={leaves} onApply={applyLeave} onDecide={decideLeave} />
      )}
      {view === "payroll" && (
        <PayrollView role={currentUser.role} employees={isAdmin ? users : [currentUser]} activeEmployeeId={activeEmployeeId} setActiveEmployeeId={setActiveEmployeeId} onUpdateSalary={updateSalary} />
      )}
      {view === "employees" && isAdmin && (
        <EmployeesView employees={users} setActiveEmployeeId={setActiveEmployeeId} setView={setView} />
      )}
      {view === "reports" && isAdmin && (
        <ReportsView employees={users} attendanceData={attendanceData} leaves={leaves} />
      )}
    </main>
  </div>
  <Toast toast={toast} />
</div>

);
}
