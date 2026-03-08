import { useState, useEffect, useMemo, useCallback, createContext, useContext, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line,
} from "recharts";

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `

  *, *::before, *::after { box-sizing: border-box; }
  * { transition: background-color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
  .no-transition * { transition: none !important; }

  @keyframes shimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  @keyframes slideUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulse2   { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 8px rgba(20,184,166,0.3)} 50%{box-shadow:0 0 20px rgba(20,184,166,0.6)} }
  @keyframes countUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes barGrow  { from{width:0} to{width:var(--w)} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes panelIn  { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes panelOut { from{transform:translateX(0);opacity:1} to{transform:translateX(100%);opacity:0} }
  @keyframes chatIn   { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes tickerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes msgIn    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes typingDot{ 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-4px);opacity:1} }

  .dark ::-webkit-scrollbar { width:4px; height:4px; }
  .dark ::-webkit-scrollbar-track { background:transparent; }
  .dark ::-webkit-scrollbar-thumb { background:#1e3a5f; border-radius:4px; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }
  button { user-select: none; }
  select option { background:#0f1f3d; color:#e2e8f0; }

  .glass-card {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .stat-number {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-variant-numeric: lining-nums tabular-nums;
    font-feature-settings: "lnum" 1, "tnum" 1;
    font-optical-sizing: none;
    vertical-align: baseline;
    line-height: 1;
  }

  .nav-font { font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

  .shap-bar { animation: barGrow 0.8s ease forwards; }
  .metric-anim { animation: countUp 0.4s ease forwards; }

  /* Leaflet map container overrides */
  .leaflet-container { font-family: 'Inter', sans-serif !important; }
  .leaflet-control-attribution { display: none !important; }
  .leaflet-control-zoom a {
    background: rgba(255,255,255,0.9) !important;
    border-color: rgba(0,0,0,0.1) !important;
    color: #334155 !important;
    font-size: 16px !important;
  }
  .dark .leaflet-control-zoom a {
    background: rgba(15,23,42,0.9) !important;
    border-color: rgba(255,255,255,0.1) !important;
    color: #94a3b8 !important;
  }
  /* Custom tooltip — remove default Leaflet tooltip chrome */
  .leaflet-tooltip-custom {
    padding: 0 !important;
    background: none !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  .leaflet-tooltip-custom::before { display: none !important; }
  .leaflet-tooltip { pointer-events: none; }

  /* Analytics panel slide animation */
  .geo-panel-enter { animation: panelIn 0.28s cubic-bezier(0.16,1,0.3,1) forwards; }

  /* ══════════════════════════════════════════════════════
     DARK MODE GUARANTEE
     Tailwind CDN in artifact env doesn't compile dark: variants.
     These CSS rules replicate every critical dark: class explicitly.
  ══════════════════════════════════════════════════════ */

  /* ── Card / glass backgrounds ── */
  .dark .glass-card {
    background-color: rgba(255,255,255,0.035) !important;
    border-color: rgba(255,255,255,0.08) !important;
  }

  /* ── Primary text (headings, values, names) ── */
  .dark .text-slate-900 { color: #ffffff !important; }
  .dark h1, .dark h2, .dark h3 { color: #ffffff; }
  .dark .stat-number { color: #ffffff; }
  .dark .nav-font { color: #ffffff; }

  /* ── Secondary text ── */
  .dark .text-slate-700 { color: #cbd5e1 !important; }
  .dark .text-slate-600 { color: #94a3b8 !important; }

  /* ── Muted text ── */
  .dark .text-slate-500 { color: #64748b !important; }
  .dark .text-slate-400 { color: #475569 !important; }

  /* ── Table row borders ── */
  .dark .border-slate-100 { border-color: rgba(255,255,255,0.06) !important; }
  .dark .border-slate-200 { border-color: rgba(255,255,255,0.08) !important; }

  /* ── Table / card hover ── */
  .dark .hover\\:bg-slate-50:hover { background-color: rgba(255,255,255,0.025) !important; }
  .dark .bg-slate-50 { background-color: rgba(255,255,255,0.04) !important; }
  .dark .bg-slate-100 { background-color: rgba(255,255,255,0.06) !important; }

  /* ── Input fields ── */
  .dark .bg-slate-800\\/60 { background-color: rgba(30,41,59,0.6) !important; }
`;

const GOOGLE_API_KEY = "PASTE_YOUR_GOOGLE_API_KEY_HERE";
/* ═══════════════════════════════════════════════════════════
   THEME CONTEXT
═══════════════════════════════════════════════════════════ */
const ThemeCtx = createContext(null);
const THEME_KEY = "lendquant-v2-theme";

function getSystem() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function getSaved() {
  try { const s = localStorage.getItem(THEME_KEY); return ["light","dark","system"].includes(s) ? s : "system"; } catch { return "system"; }
}
function applyTheme(t) {
  const r = document.documentElement;
  r.classList.add("no-transition");
  if (t === "dark") { r.classList.add("dark"); r.style.colorScheme = "dark"; }
  else { r.classList.remove("dark"); r.style.colorScheme = "light"; }
  requestAnimationFrame(() => requestAnimationFrame(() => r.classList.remove("no-transition")));
}

function ThemeProvider({ children }) {
  const [pref, setPrefState] = useState(getSaved);
  const [sys, setSys] = useState(getSystem);
  const resolved = pref === "system" ? sys : pref;
  const isDark = resolved === "dark";

  /* Non-blocking font load — fires after first paint, no render delay */
  useEffect(() => {
    if (document.getElementById("lendquant-fonts")) return;
    const link = document.createElement("link");
    link.id = "lendquant-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  /* Preload Leaflet in background so Geo page opens instantly */
  useEffect(() => {
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    if (window.L || document.getElementById("leaflet-js")) return;
    const s = document.createElement("script");
    s.id = "leaflet-js";
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  useEffect(() => { applyTheme(resolved); }, [resolved]);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = e => setSys(e.matches ? "dark" : "light");
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const setPref = useCallback(p => { setPrefState(p); try { localStorage.setItem(THEME_KEY, p); } catch {} }, []);
  const toggle = useCallback(() => setPref(isDark ? "light" : "dark"), [isDark, setPref]);

  return <ThemeCtx.Provider value={{ pref, theme: resolved, isDark, toggle, setPref }}>{children}</ThemeCtx.Provider>;
}
function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}

/* ═══════════════════════════════════════════════════════════
   CHART THEME HOOK
═══════════════════════════════════════════════════════════ */
function useChartTheme() {
  const { isDark } = useTheme();
  return {
    grid: isDark ? "#1a2d48" : "#e2e8f0",
    tick: isDark ? "#64748b" : "#94a3b8",
    ttBg: isDark ? "#ffffff" : "#ffffff",
    ttBorder: isDark ? "#e2e8f0" : "#e2e8f0",
    ttColor: isDark ? "#0f172a" : "#0f172a",
  };
}

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════ */
const STATES = [
  { state:"Maharashtra",    code:"MH", default:18, fraud:12, recovery:74, risk:"medium", loans:52410 },
  { state:"Uttar Pradesh",  code:"UP", default:34, fraud:22, recovery:51, risk:"high",   loans:84200 },
  { state:"Tamil Nadu",     code:"TN", default:11, fraud:8,  recovery:82, risk:"low",    loans:38100 },
  { state:"Karnataka",      code:"KA", default:14, fraud:9,  recovery:79, risk:"low",    loans:29800 },
  { state:"West Bengal",    code:"WB", default:27, fraud:18, recovery:61, risk:"high",   loans:41200 },
  { state:"Rajasthan",      code:"RJ", default:22, fraud:15, recovery:66, risk:"medium", loans:33600 },
  { state:"Gujarat",        code:"GJ", default:9,  fraud:6,  recovery:88, risk:"low",    loans:44100 },
  { state:"Bihar",          code:"BR", default:38, fraud:26, recovery:44, risk:"high",   loans:61800 },
  { state:"Madhya Pradesh", code:"MP", default:29, fraud:19, recovery:58, risk:"high",   loans:37900 },
  { state:"Andhra Pradesh", code:"AP", default:16, fraud:11, recovery:77, risk:"medium", loans:28400 },
  { state:"Kerala",         code:"KL", default:8,  fraud:5,  recovery:91, risk:"low",    loans:22100 },
  { state:"Punjab",         code:"PB", default:21, fraud:14, recovery:68, risk:"medium", loans:24600 },
  { state:"Haryana",        code:"HR", default:17, fraud:11, recovery:76, risk:"medium", loans:21400 },
  { state:"Odisha",         code:"OD", default:31, fraud:21, recovery:55, risk:"high",   loans:26700 },
  { state:"Jharkhand",      code:"JH", default:33, fraud:23, recovery:52, risk:"high",   loans:18900 },
];

const BORROWERS = [
  { id:"BRW-001", name:"Rajesh Narayan",      loan:"₹4,50,000", loanNum:450000, emi:"₹12,400", riskScore:82, fraudScore:67, sentiment:"Angry",      daysOverdue:45, state:"UP", riskLabel:"high",   strategy:"Legal Escalation" },
  { id:"BRW-002", name:"Kavitha Subramanian", loan:"₹1,80,000", loanNum:180000, emi:"₹5,200",  riskScore:34, fraudScore:12, sentiment:"Cooperative", daysOverdue:8,  state:"TN", riskLabel:"low",    strategy:"Soft Reminder"    },
  { id:"BRW-003", name:"Mohammed Iqbal",      loan:"₹7,20,000", loanNum:720000, emi:"₹19,800", riskScore:61, fraudScore:38, sentiment:"Hardship",    daysOverdue:22, state:"MH", riskLabel:"medium", strategy:"Restructuring"    },
  { id:"BRW-004", name:"Sunita Devi",         loan:"₹90,000",   loanNum:90000,  emi:"₹3,100",  riskScore:47, fraudScore:21, sentiment:"Ignoring",    daysOverdue:16, state:"BR", riskLabel:"medium", strategy:"Field Visit"      },
  { id:"BRW-005", name:"Arjun Patel",         loan:"₹3,60,000", loanNum:360000, emi:"₹9,800",  riskScore:28, fraudScore:9,  sentiment:"Cooperative", daysOverdue:3,  state:"GJ", riskLabel:"low",    strategy:"Soft Reminder"    },
  { id:"BRW-006", name:"Priya Mehta",         loan:"₹2,40,000", loanNum:240000, emi:"₹6,800",  riskScore:73, fraudScore:55, sentiment:"Angry",       daysOverdue:38, state:"MH", riskLabel:"high",   strategy:"Legal Escalation" },
  { id:"BRW-007", name:"Arun Krishnaswamy",   loan:"₹5,50,000", loanNum:550000, emi:"₹14,200", riskScore:52, fraudScore:31, sentiment:"Hardship",    daysOverdue:19, state:"KA", riskLabel:"medium", strategy:"Field Visit"      },
  { id:"BRW-008", name:"Deepa Rani",          loan:"₹1,20,000", loanNum:120000, emi:"₹3,900",  riskScore:22, fraudScore:7,  sentiment:"Cooperative", daysOverdue:2,  state:"KL", riskLabel:"low",    strategy:"Soft Reminder"    },
  { id:"BRW-009", name:"Vikram Choudhary",    loan:"₹6,80,000", loanNum:680000, emi:"₹18,200", riskScore:78, fraudScore:61, sentiment:"Ignoring",    daysOverdue:52, state:"UP", riskLabel:"high",   strategy:"Legal Escalation" },
  { id:"BRW-010", name:"Meena Deshpande",     loan:"₹3,10,000", loanNum:310000, emi:"₹8,600",  riskScore:41, fraudScore:18, sentiment:"Hardship",    daysOverdue:11, state:"MH", riskLabel:"medium", strategy:"Restructuring"    },
];

const FRAUD_ALERTS = [
  { id:"FR-4821", borrower:"Ramesh Kumar",    type:"Location Anomaly",  score:87, state:"UP", time:"14 min ago", severity:"critical" },
  { id:"FR-4820", borrower:"Priya Mehta",     type:"Multiple Loans",    score:73, state:"MH", time:"1 hr ago",   severity:"high"     },
  { id:"FR-4819", borrower:"Suresh Reddy",    type:"Mobile Mismatch",   score:65, state:"AP", time:"2 hr ago",   severity:"high"     },
  { id:"FR-4818", borrower:"Deepak Singh",    type:"High-Risk Cluster", score:58, state:"MP", time:"3 hr ago",   severity:"medium"   },
  { id:"FR-4817", borrower:"Anita Sharma",    type:"Location Anomaly",  score:51, state:"RJ", time:"5 hr ago",   severity:"medium"   },
  { id:"FR-4816", borrower:"Karan Malhotra",  type:"Multiple Loans",    score:49, state:"PB", time:"6 hr ago",   severity:"medium"   },
  { id:"FR-4815", borrower:"Sonia Agarwal",   type:"Mobile Mismatch",   score:44, state:"HR", time:"7 hr ago",   severity:"low"      },
];

const RECOVERY_TREND = [
  { month:"Aug", rate:61, target:70, loans:2100 }, { month:"Sep", rate:63, target:70, loans:2280 },
  { month:"Oct", rate:67, target:72, loans:2450 }, { month:"Nov", rate:65, target:72, loans:2380 },
  { month:"Dec", rate:71, target:74, loans:2590 }, { month:"Jan", rate:74, target:74, loans:2710 },
  { month:"Feb", rate:77, target:76, loans:2840 },
];

const RISK_DIST = [
  { name:"Low Risk",    value:38, color:"#10b981" },
  { name:"Medium Risk", value:38, color:"#f59e0b" },
  { name:"High Risk",   value:24, color:"#ef4444" },
];

const STRATEGY_DIST = [
  { name:"Soft Reminder",    value:38, color:"#10b981" },
  { name:"Restructuring",    value:27, color:"#f59e0b" },
  { name:"Field Visit",      value:21, color:"#3b82f6" },
  { name:"Legal Escalation", value:14, color:"#ef4444" },
];

const SHAP_FEATURES = [
  { name:"EMI Delay Avg",        value:0.32, impact:"negative" },
  { name:"Credit Score",         value:0.27, impact:"positive" },
  { name:"Region Default Rate",  value:0.24, impact:"negative" },
  { name:"Salary Stability",     value:0.19, impact:"positive" },
  { name:"Loan-to-Income Ratio", value:0.17, impact:"negative" },
  { name:"Contact Response",     value:0.14, impact:"positive" },
  { name:"Active Loan Count",    value:0.11, impact:"negative" },
  { name:"Employment Tenure",    value:0.09, impact:"positive" },
];

const NOTIFS = [
  { msg:"Critical fraud alert in UP — FR-4821", time:"14m", dot:"bg-red-500", unread:true },
  { msg:"Recovery rate crossed 77% national target", time:"1h", dot:"bg-emerald-500", unread:true },
  { msg:"182 EMI reminders dispatched in Tamil Nadu", time:"2h", dot:"bg-blue-500", unread:false },
  { msg:"Bihar cluster risk elevated to HIGH", time:"3h", dot:"bg-amber-500", unread:false },
  { msg:"Scheduled Feb 2026 report generated", time:"4h", dot:"bg-teal-500", unread:false },
  { msg:"Priya Mehta fraud score updated: 73", time:"5h", dot:"bg-orange-500", unread:false },
];

const LANGUAGES = {
  UP:{ lang:"Hindi",     msg:"नमस्ते! आपकी EMI देय है।" },
  TN:{ lang:"Tamil",     msg:"வணக்கம்! உங்கள் EMI நிலுவையில் உள்ளது." },
  MH:{ lang:"Marathi",   msg:"नमस्कार! तुमची EMI थकीत आहे." },
  WB:{ lang:"Bengali",   msg:"নমস্কার! আপনার EMI বকেয়া আছে।" },
  GJ:{ lang:"Gujarati",  msg:"નમસ્તે! તમારી EMI બાકી છે." },
  KA:{ lang:"Kannada",   msg:"ನಮಸ್ಕಾರ! ನಿಮ್ಮ EMI ಬಾಕಿ ಇದೆ." },
  KL:{ lang:"Malayalam", msg:"ഹലോ! നിങ്ങളുടെ EMI കുടിശ്ശിക ആണ്." },
  PB:{ lang:"Punjabi",   msg:"ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਡੀ EMI ਬਕਾਇਆ ਹੈ।" },
  AP:{ lang:"Telugu",    msg:"నమస్కారం! మీ EMI బకాయిలో ఉంది." },
  DEFAULT:{ lang:"English", msg:"Dear borrower, your EMI is overdue." },
};

const NAV = [
  { id:"overview",  label:"Overview",          icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", roles:["admin","manager","agent"] },
  { id:"risk",      label:"Risk Intelligence",  icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", roles:["admin","manager"] },
  { id:"geo",       label:"Geo Risk Map",       icon:"M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", roles:["admin","manager"] },
  { id:"fraud",     label:"Fraud Monitoring",   icon:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", roles:["admin"] },
  { id:"emi",       label:"EMI Reminders",      icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", roles:["admin","manager","agent"] },
  { id:"strategy",  label:"Decision Centre",        icon:"M13 10V3L4 14h7v7l9-11h-7z", roles:["admin","manager"] },
  { id:"reports",   label:"Reports",            icon:"M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", roles:["admin","manager"] },
  { id:"predict",    label:"Default Alerts",      icon:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", roles:["admin","manager"] },
  { id:"funnel",     label:"Recovery Funnel",      icon:"M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12", roles:["admin","manager"] },
  { id:"multilang",  label:"Lang Preview",        icon:"M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129", roles:["admin","manager","agent"] },
  { id:"settings",  label:"Settings",           icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", roles:["admin","manager","agent"] },
];

const ADMIN_AVATAR = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADhAOEDASIAAhEBAxEB/8QAHQABAAEFAQEBAAAAAAAAAAAAAAMCBAYHCAUBCf/EAE0QAAEDAgIDCA0ICAUFAAAAAAABAgMEBQYRBxIhExQiMUFRYXEIFyMyQlJWYoGRlKHTFSQzcoKxwdEWNENEVWOSoiU2U3PwVIOywtL/xAAbAQEAAQUBAAAAAAAAAAAAAAAABgIDBAUHAf/EADYRAAIBAwEEBgoBBQEBAAAAAAABAgMEEQUSITFBBhRRYXGREyJSU4GhscHR4RYHIzLw8UJD/9oADAMBAAIRAxEAPwDssAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwXSRpBteD4UgSPfl0lbrR0rXZaqeM9eRPepZr16dCDnUeEXaNGpXmoU1lszotqmrpqdO71MMP+5Iifecs4j0g4vvcr99Xaamhd+70jlhY3o2cJfSqmJubukuu/hvd3zncbiO1ek9NPFOm34vH5JDS6NVJL+5PD7ln8HZHy1Z/4tQe0M/M+/Llm/i1B7Qz8zjRzIyl0cZZ/k83/APJef6L/APGI+8+X7OzPlqz/AMWoPaGfmPlqz/xag9oZ+Zxi6OMoc2M9/k0/drz/AEP4xH3vy/Z29BLHPCyaCRj2O4TXNXNHJ1kx4WBKN9vwXZaJ+WvT0EEbvrIxM/ee6SqnJygmyKTioyaTzgAArKQAAAAAAAAAAAAAAAAAAAAAAAAederrQWe3S19yqY6aniThPe7L0Jzr0C8XKjs9rqbncJUhpqdiySOy5PxXkOW9IWMq/F103zNrw0cX6rS62yJOdedy8qmq1TU4WUO2T4L7vu+ps9M0yd9PsiuL+y7/AKGbYx013OolfBhmmZR03FvqdqPld0o3ib9rW9Bqu41tXc6+avrah9TUTu1pHu41UtXODXEHub2vdPNWWe7l5E4tbKharFKOO/n5kh9PgMIygRuJCNxWgUu4ynd97ysm3Nk2q5HbnLtY/JeJegSSbmWcz90LkIvOT3GTrDRfpFtONqXVYu87pE3WqKNzs9njsXwm/dy8hnpwrbLjV2i6w3O3VD6argdukcjeNF/FOTI660XYvpsZYViuTEZFUx9xq4W/s5ETk6F406yc6VqfWV6Op/kvmQbWdI6m/S0/8H8v0ZgADdGiAAAAAAAAAAAAAAAAAAAAAAAANDdkniKR9fR4YgeiQxNSqqsvCcuaMb6Nq+lOY00Zdpqlkk0oX3X8GSNvoSGNDyMG2r5YvbIZP1aLuk3VzelfxObavcOVzUqT4JtfBbjoum0oULOGOzPxe8vMO4SrLpFvqeXe1M7vXauav6UTmPWrNH0m5fNLlw/Flj1U9afkZ3HGTNaRZ31aUsp4XYeyrzzuNOXDDWILf9JQzPZ40HdE921Dx5HyR8B8ep9ZqodANaHR7p9Jw/rGTDUJY9aJVG7a4o59jlkk4DItd/itzU9u24TxJcP3HerP9Sfge7j9xudse5/R8D6oc0T1CWPVihK7b4I1nDo2/wCqu/D/AJUP4qp5WJsC1lrpX1tDU79hZwpG7nk9qc/Sbdc0gc0sR1GvGSbeSmNzUT3nOrjY3Y54iks+kOG3yS/Nrsze8jeTdEzWNfXmn2jHdI1l+R71rwR6lHVZyRt5Gryt/wCc55uDXyR41sT2d+25Uzm9aTMJXYXPr06sDJuqcbi2lF8GjuIBOIHRTmAAAAAAAAAAAAAAAAAAAAAAAABypp2p9w0qXbPvJdxkb1bixPvRT1NF9DveyPrfDqpV/obsT35l12UFHvfGFBcPAqaLV9Mblz9z0PYsNJvO1UVL/pQMa7ry2nKOkeadadPtk/z90T+2q7djTx2JeW49GNpK1pTGTtaR2K3FIa0q1SprSTVLuyUNkOqUuaXGqUuaNkJ4LZzSGRpcuaRSNLUluKkzC9KVu35hWaZn01G5Jm9XE/3Ln6DXGjal35pEw5Cn8Sp3O6mPRy+5FN3V0EdRSTUsneStWN3UqZGtex+tkkml+3wyfuG7ySdbGLH970JF0ek6k1S718zKdXYtaj7E/odbAA6uc5AAAAAAAAAAAAAAAAAAAAAABa10b5KGaNi6kjonNa7mVUKZS2U2eriaR0+19sv9fYqKi1ppqeu3GSTV4GrJlmiLy94h6UZijoN8XCiZJ4M7JPSm0yuM4pqWoTv6vpaiw+4nVClGjRjSjwRPGTxkEZO0xVwDJW8RI3jI28RI3jLyKA7jI3cRI5xG7iDBE4ikJXEUhak8orRBIYroqnt+HNL2I6mu12MdGkccjW5ozdXJIqr0bDKJDF66mjjxBVT+HUNjc70JkX9Ovp2VZ1Yce/x/BVUiqlKVOXCSwdExyMlja+NyPY5M2ubtRUJTxMGsfHhW2skXhb3a7qRdqIe2dptqjq0ozaxlJ48SCTjszcewAAvFIAAAAAAAAAAAAAAAAAAAABpLE2HrnbMSPnSimfR7u+RszWqrGsXPjVOLjy2ksbjZuNf8rVv1E+9DV0bjkHSTTqen3ezTbaks+G97iXaZcSuKOZct3yRdxuJmuLaNxK1xpYvcbBly1xJrFu1xVrFzJbaJtYpc4j1ilzj3aPA5xFI4qc4gkcWpMrSI5HFhFYrnd72xlFRTPhc1Gun1VSNnPt4vQXcjjYmjj/L3/ff+BtNB0+Go3noajwsN7u7G4xb+4lb0duPHJkUEbYomRM2NY1Gt6kJgDsiWFghoAB6AAAAAAAAAAAAAAAAAAAAACzudK2st89K5fpY3MX0oaccySCV8M/AfE5Wub4qobvMC0gWLYt5pY0735w3/ANvzIX0w0udxQjc01lw4+H64+GTc6PdKlUdOXCX1MSjcTNcWTZCVshzSMiTtF21xVrFs15VrlamU4J9Ypc4i1ylzz3bGCRziGRxS6QidIW3IqSEjjbOFaF1BYaWlkXuiM1pOtdqp7zDMB2R1fVsudWxEp4ndzb470/BPvNlnQ+hmlzpxleVFjaWI+HFv48v2RzWbtTkqMeXHxAAJ4aIAAAAAAAAAAAAAAAAAAAAAAAAFLkKgAa6xfhOSn16y1xa8PfPp2t2s6U506DD2uN6miMTT1FHiq5wyR8DfMjtXoVc09yocw6V6HSs2ri33KT3rl4r8Em0m+nVzTqb8cyZshVuhZQ1Mcn7X7LiYhbbXE3ZPuhS6QiI5p44+/k+z4R4m3wCwTucZHhXC9Rc9SprdeGk9TpermTpMI3zJUSshgj+lcjW87lVckQ6FaS7ovodK/qSqXHCGN3bnt8MGo1W+nQio0+L5kNPDHBCyGFjWMYmTWt4kQuADqkYqKwiLN5AAKjwAAAAAAAAAAAAAAAAAAAAAAGqNKumewYM3a3UKJeLy3gup45Mo4HfzH8i+Ym3qLtGhUrz2KayyzWr06Eduo8I2nLJHFE6SSRrGN2uc5ckRDV+L9OmBLAskNNWyXmpbs3O3oj2Z9Mi5M9SqcyY70gYrxnPne7lJvbX1m0UGcdOz7PL1rrKYsSW26PRW+vLPcvyR2516T3UY473+DdWJeyNxXV67LHbbfaYfGlzqZfWuq3+1TalqtE+OdG1gxLvhsl6lt8bppHNa1J3omS55bEXPM5AOwOxVuCVuiKlplk130FXUU7l63rKn9siGF0l0W0qWPo3Ddn48Hz4mRoWp3HWm5T34/wB3GEVdPPSVT6aqjfDM3vo3NyVD42WSPvJX/wBRvi/2G2XuFGV1MjpGJ3OVux7OpfwNaYjwBc6DWmofn9OibEamUjU6W8vo9RxDUujNzaNypLbh3cfivujpNrqlKrun6r+RiTpZJP2j/wCopjZJJKxjI3ve7gta1uauXmyMjw1gu73uJlVwKOjfwmzScJzk50by/wBps/DWFrRYm69LDulQqcKeThP9HMnUW9N6OXV41KS2I9r+y/4u8qutSpUU0nl933MUwrhV9kt9ViK8IjamCCSaGFcsosmqusvT9xo/DHZFY3t6sZeKa23mHVTWc6LcJnfaZwf7DobThcUtmiXE1VuiN1qCSnavny9yb73nC52rovotpQtZU1DKzz45xveTnev6lXdeMlLDx9zrzB/ZBYIu+5w3XfNgqX8e+W68Of8AuN4ut6NNsW+spLhRx1dFUQ1NPK3WjlhkR7HpzoqcZ+dJ7uDsYYkwfV76w5dpqLha0kOtnDL9eNdi9ffGzuNCg99GWH2Mw7fWprdVWfA/QMGkNFen2yX/AHG2YpZDZrm5Ea2bW+bTL9Zfo16HbPON3ker29ShLZqLDN/QuKdeO1B5AALJeAAAAAAAAAAAAAAAABz92UGkeS1w/oVZKnUqamPXuMzV2xRKmyJOZXptXzesyLW2nc1VThz+RjXVzC2pupP/AKeTpy02STzVGGsF1WpTtVY6u5xu2vXlZCvInn+F4POvPwBPrS0pWlPYprxfaQa6uql1PbqP9A+AGQWAb97De+pBdb5huSTZURsroW9LV1ZPc6P1HPxkOjrEUmEMa2nEDNdWUs/dmt8KJeDIn9Cr9rIwtQodYt5U1x5eJl2Vf0FeM+R3vNuiQvWPU19Xg62xM+k5I0u4xx9W3uqsWJZX22OLY6gps2QvZyOz45Wrzrs6EOtaaeKppY6iCRskMjUfG9vE5qpmioc09ldcGVGOrZb2fudv3RzumR67PUxPWcv1FP0Wc4+52rodKDv9iUFLK4vjHHNePD/d+EaPsWYysN0pqLC9TNM6ok1Y7c5N0hmcvJqrxdaavF3x2FZ33GW00zrrFTw1zo03xHDIro2vy2o1VTahyn2O9ey36WbYx/eVkctLreLmxXp72InpOvijTE/Rt5+Bf6bOKu4QUEnjO1zeW1v8MGhOzFv29MI2nDkcibrcatZpE/lRJ/8Abmeo5aNg9kDiv9K9J9fUwSa9BQfMaTxXJGq67vS9X+jI18dK02h6C2jF8Xvfx/WDjGoVvTXEpLhw8gfADOMMG5dB2mqswrLDYcTSz1lhdk2OZ2b5KLq5Xx+bxpyeKaYBj3FvTuIbE1uMihWnRltQe8/RqiqaespYqqllZNBK1HxyRuRWPaqZoqKnGhcnK3YsaSpLZdYcC3mozoKx3+GSOX6GVV+i+q/wen6x1SQq7tZW1Vwl8PAl9rcxuKamgADGMkAAAAAAAAAAAA8vEt1p7HYa+81f6tQ00lRJlxqjGqqonTsOB75c6y+Xutu9xk16msnfNI7pVc8k6E4k6EOvOydqn0mhy7Nj/byQQu+qszM/cip6TjclnR2klSnV5t48sMiuv1W6kafJLPmD4ASI0AIwClvB6AD4UlSR1X2KWOWXjDL8JV0vz60tzpdd22Wm5P6F2dSsNSabLj8qaVL/ADMk12RVO9W+buTUjcnrRTA8KX24YYxBRX21yalZRy7o3menErV6FTNF6z0Kyu+VKupuEnf1U8kzvrvcqr71OedLLKVFqrBerJ7+5nY/6YXdKrWqU5y9eMcLvWeXhhZ8y+wtcUtGKrTdlk1I6Otime7zEeir7szpvsicdJgzAr4aGoSO8XTOno9VdrE/aS/ZRfWqHKMm57k/X7zV4XUU47xXc8X3pbpdJMnthZBFHyRxtTiTrXNV6VUx+i1lK4qSlJeosefZ9M9xm/1NuqdBUVCX9xp7uaW7f9cGPgA6OcVBSAeFSWQAUlDeSsqjkkjlZPBK9j2ORzZGuyVqptRUXnO9dE+KExfo9tOIHoiTTw6tS1OJJmqrJPRrIq9SocEHVvYY1ckuj+7UUneUt0V0fmtfFGuXrRV9JpdbpqVBT5p/U22kVHGs48mvob4ABFySgAAAAAAAAAAAGp+yobIuh2ufH4FXTucvMm6on4ocfH6BYls9DiCw1dmuce60lZE6KVueS5LyovIqcaL0HKmLtAmO7XcXx2emZfKHW7lNFMyN+XnteqZL1ZoSfQr6jTpOlUeHnO/nwIzrVnVqVFUgsrGNxqgjNgdprSh5JVPtMHxB2mtKHknU+1U/xDeddt/eR80aXqlx7uXkzX4M+7TOk/yTqfaaf4g7TWk/yPqfaaf4hT1y395HzR6rSv7EvJmAAz7tM6UPI6p9pp/iDtM6UPI6p9pp/iHnXLf3kfNFzqlf2H5MwEmo6mSnl8x3fNM37TGk/wAjqn2qn+IO0xpP8jqn2qn+IWa1a0r03TqSi0+KyjJtFe2laNeipRlF5TSZhVdVb47nHwGf+XSpaGf9pjSh5HVPtNP8QdpjSh5HVPtNP8Qptp2dtSVKlKKS70Xb6pfX9eVxcqUpy4vD/wBSXJGAFJsHtMaUPI6p9pp/iFPaW0oeR1T7VT/ELnW6Htx80YvVa3sPyZgAM/7TOlPyOqfaqf4h87S+lPyPqfaqf4h47uh7a80VdWrew/I1+DPu0vpT8jqn2qn+IO0tpU8jqn2mn+IedaoP/wBrzRV1at7D8jADqbsKmSJg7EEi/RuubWtXpSJmf3oapw/oG0l3S4MhqrSy0w63dKirqY3I1OhI1VVX/mZ1do5wnbsEYUpcP21XvZFm6SV6ZPmkdtc9fy5ERENRq15SlS9HB5b7DZ6Za1VV9JJYSMoABHCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//Z";

const ROLES = {
  admin:   { label:"Admin",          sub:"All India View",     color:"#14b8a6", initials:"AD" },
  manager: { label:"Branch Manager", sub:"",                   color:"#3b82f6", initials:"BM" },
  agent:   { label:"Recovery Agent", sub:"Assigned Borrowers", color:"#f59e0b", initials:"RA" },
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const delay = ms => new Promise(r => setTimeout(r, ms));
const api = {
  fetchStates:    async () => { await delay(0);   return STATES; },
  fetchBorrowers: async () => { await delay(0);   return BORROWERS; },
  fetchFraud:     async () => { await delay(0);   return FRAUD_ALERTS; },
};

function useFetch(fn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fn().then(d => { if (alive) { setData(d); setLoading(false); } });
    return () => { alive = false; };
  }, []);
  return { data, loading };
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);
  return { toasts, push };
}

const riskColor = s => s >= 70 ? "#ef4444" : s >= 45 ? "#f59e0b" : "#10b981";
const riskLabel = s => s >= 70 ? "HIGH" : s >= 45 ? "MED" : "LOW";
const stateColor = d => d > 30 ? "#ef4444" : d > 20 ? "#f97316" : d > 10 ? "#f59e0b" : "#10b981";

const stratStyle = s => {
  const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border";
  return base + " " + ({
    "Legal Escalation": "bg-red-50     dark:bg-red-500/20     text-red-700     dark:text-red-300     border-red-200     dark:border-red-500/40",
    "Restructuring":    "bg-amber-50   dark:bg-amber-500/20   text-amber-700   dark:text-amber-300   border-amber-200   dark:border-amber-500/40",
    "Field Visit":      "bg-blue-50    dark:bg-blue-500/20    text-blue-700    dark:text-blue-300    border-blue-200    dark:border-blue-500/40",
    "Soft Reminder":    "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40",
  }[s] || "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600");
};

const sentInfo = s => ({
  "Cooperative": { icon:"◎", cls:"text-emerald-600 dark:text-emerald-400", badge:"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40" },
  "Angry":       { icon:"◈", cls:"text-red-600     dark:text-red-400",     badge:"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-red-50     dark:bg-red-500/20     text-red-700     dark:text-red-300     border border-red-200     dark:border-red-500/40"     },
  "Hardship":    { icon:"◷", cls:"text-amber-600   dark:text-amber-400",   badge:"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-amber-50   dark:bg-amber-500/20   text-amber-700   dark:text-amber-300   border border-amber-200   dark:border-amber-500/40"   },
  "Ignoring":    { icon:"◉", cls:"text-slate-500   dark:text-slate-400",   badge:"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-100  dark:bg-slate-700/60   text-slate-600   dark:text-slate-300   border border-slate-200  dark:border-slate-600/60"    },
}[s] || { icon:"◉", cls:"text-slate-500 dark:text-slate-400", badge:"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600" });

/* ═══════════════════════════════════════════════════════════
   LENDQUANT LOGO
═══════════════════════════════════════════════════════════ */
function LendQuantLogo({ size = 36 }) {
  const { isDark } = useTheme();
  return (
    <div style={{ width: size, height: size }} className="relative flex-shrink-0">
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#0d9488" : "#2563eb"} />
            <stop offset="100%" stopColor={isDark ? "#0891b2" : "#1d4ed8"} />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Rounded square bg */}
        <rect width="36" height="36" rx="10" fill="url(#logoGrad)" filter={isDark ? "url(#logoGlow)" : "none"} />
        {/* Shield shape */}
        <path d="M18 6 L26 9.5 L26 17.5 C26 22 22 25.5 18 27.5 C14 25.5 10 22 10 17.5 L10 9.5 Z"
          fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        {/* Rupee symbol ₹ */}
        <text x="18" y="21" textAnchor="middle" fill="white" fontSize="11" fontWeight="800"
          fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="-0.5">₹</text>
        {/* Mini analytics bars at bottom */}
        <rect x="11" y="28" width="3" height="3" rx="0.8" fill="rgba(255,255,255,0.6)" />
        <rect x="15" y="26" width="3" height="5" rx="0.8" fill="rgba(255,255,255,0.8)" />
        <rect x="19" y="24" width="3" height="7" rx="0.8" fill="white" />
        <rect x="23" y="27" width="3" height="4" rx="0.8" fill="rgba(255,255,255,0.65)" />
        {/* Dark overlay gradient at top of bars to blend with shield */}
        <rect x="10" y="23" width="16" height="4" fill="url(#logoGrad)" opacity="0.7" />
      </svg>
      {isDark && (
        <div className="absolute inset-0 rounded-xl"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(20,184,166,0.3), transparent 70%)", filter: "blur(6px)", zIndex: -1 }} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════════════════ */
function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label="Toggle theme"
      className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-200 overflow-hidden
        bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10
        text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        className={`absolute transition-all duration-300 ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-50 rotate-90"}`}>
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        className={`absolute transition-all duration-300 ${!isDark ? "opacity-100 scale-100" : "opacity-0 scale-50 -rotate-90"}`}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION PANEL
   The dropdown is lifted OUT of the header entirely and
   rendered as a sibling to the whole app layout via the
   NotificationOverlay component mounted in AppShell.
   This avoids react-dom/portal AND all stacking context issues.
   Bell button calls a shared setter passed down from AppShell.
═══════════════════════════════════════════════════════════ */
function NotificationPanel({ onOpen }) {
  const [read, setRead] = useState(false);
  const unreadCount = read ? 0 : NOTIFS.filter(n => n.unread).length;

  return (
    <button
      onClick={() => onOpen(s => !s)}
      className="relative w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-200
        bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10
        text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white
        hover:border-slate-300 dark:hover:border-white/20">
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7.5 1.5C7.5 1.5 3.5 3 3.5 7.5v2.5L2 11.5h11L11.5 10V7.5C11.5 3 7.5 1.5 7.5 1.5Z" strokeLinejoin="round"/>
        <path d="M5.8 11.5a1.7 1.7 0 0 0 3.4 0" strokeLinecap="round"/>
      </svg>
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border-2 border-slate-50 dark:border-slate-900">
          <span className="text-white font-bold leading-none" style={{ fontSize: 9 }}>{unreadCount}</span>
        </div>
      )}
    </button>
  );
}

/* Rendered as a direct child of AppShell's root div — completely
   outside the header/main stacking contexts. Uses position:fixed
   so it escapes layout flow entirely. No backdrop-filter so no
   new stacking context is created on the dropdown itself.        */
function NotificationOverlay({ open, onClose }) {
  const { isDark } = useTheme();
  const [read, setRead] = useState(false);
  const ref = useRef(null);
  const unreadCount = read ? 0 : NOTIFS.filter(n => n.unread).length;

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const divider = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)";

  return (
    <div
      ref={ref}
      style={{
        position:     "fixed",
        top:          "60px",
        right:        "16px",
        width:        "320px",
        zIndex:       2147483647,
        animation:    "slideUp 0.2s ease",
        background:   isDark ? "#0d1f3c" : "#ffffff",
        border:       `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
        borderRadius: "16px",
        boxShadow:    isDark
          ? "0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)"
          : "0 24px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)",
        overflow:     "hidden",
      }}>
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center"
        style={{ borderBottom: `1px solid ${divider}` }}>
        <div className="flex items-center gap-2">
          <p style={{ fontSize: 12, fontWeight: 700, color: isDark ? "#ffffff" : "#0f172a" }}
            className="nav-font">Notifications</p>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold"
              style={{ fontSize: 9 }}>{unreadCount} new</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setRead(true)}
            style={{ fontSize: 12, color: "#14b8a6", background: "none", border: "none", cursor: "pointer" }}>
            Mark all read
          </button>
          <button onClick={onClose}
            style={{ fontSize: 13, color: isDark ? "#64748b" : "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
            ✕
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: "288px", overflowY: "auto" }}>
        {NOTIFS.map((n, i) => (
          <div key={i}
            className="flex gap-3 px-4 py-3 cursor-pointer"
            style={{
              borderBottom: `1px solid ${divider}`,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#f8fafc"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div className="flex-shrink-0 pt-1.5">
              <div
                className={`w-2 h-2 rounded-full ${n.dot}`}
                style={{
                  opacity: n.unread && !read ? 1 : 0.45,
                  animation: n.unread && !read ? "pulse2 2s infinite" : "none",
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p style={{
                fontSize: 12,
                lineHeight: "1.5",
                fontWeight: n.unread && !read ? 600 : 400,
                color: n.unread && !read
                  ? (isDark ? "#ffffff" : "#0f172a")
                  : (isDark ? "#cbd5e1" : "#475569"),
              }}>
                {n.msg}
              </p>
              <p style={{ fontSize: 11, marginTop: 2, color: isDark ? "#64748b" : "#94a3b8" }}>
                {n.time} ago
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5">
        <button style={{ fontSize: 12, color: "#14b8a6", background: "none", border: "none", cursor: "pointer" }}>
          View all activity →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════════════════════════════ */
function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800/60 ${className}`}>
      <div className="absolute inset-0" style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)", animation:"shimmer 1.6s infinite" }} />
    </div>
  );
}

function GlassCard({ children, className = "", onClick, glow, style }) {
  const [hov, setHov] = useState(false);
  const { isDark } = useTheme();
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`rounded-2xl border backdrop-blur-sm glass-card transition-all duration-300
        ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        ...style,
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.75)",
        borderColor: hov && glow ? `${glow}35` : isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)",
        boxShadow: hov && glow
          ? isDark ? `0 0 30px ${glow}22, 0 4px 20px rgba(0,0,0,0.3)` : `0 0 20px ${glow}18, 0 4px 16px rgba(0,0,0,0.08)`
          : isDark ? "0 2px 20px rgba(0,0,0,0.25)" : "0 2px 16px rgba(0,0,0,0.05)",
        transform: hov && onClick ? "translateY(-2px)" : "none",
      }}>
      {children}
    </div>
  );
}

function AnimCounter({ value, duration = 400 }) {
  const raw = String(value);
  const numeric = parseFloat(raw.replace(/[^0-9.]/g, ""));
  const prefix = raw.match(/^[^0-9]*/)?.[0] || "";
  const suffix = raw.match(/[^0-9.]*$/)?.[0] || "";
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(Math.floor(e * numeric));
      if (p < 1) requestAnimationFrame(step); else setDisp(numeric);
    };
    requestAnimationFrame(step);
  }, [numeric, duration]);
  return <>{prefix}{isNaN(disp) ? numeric : disp.toLocaleString("en-IN")}{suffix}</>;
}

function MetricCard({ label, value, sub, accent, trend, icon }) {
  const { isDark } = useTheme();
  return (
    <GlassCard className="p-5 relative overflow-hidden" glow={accent}>
      <div className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 80% 0%,${accent}18,transparent 65%)` }} />
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: isDark ? "#64748b" : "#64748b" }}>{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}22` }}>
            <svg width="15" height="15" fill="none" stroke={accent} strokeWidth="1.8" viewBox="0 0 24 24"><path d={icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        )}
      </div>
      <div className="stat-number mb-2"
        style={{
          fontSize: "1.75rem",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: isDark ? "#ffffff" : "#0f172a",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontVariantNumeric: "lining-nums tabular-nums",
          fontFeatureSettings: '"lnum" 1, "tnum" 1',
          WebkitFontFeatureSettings: '"lnum" 1, "tnum" 1',
          MozFontFeatureSettings: '"lnum" 1, "tnum" 1',
        }}>
        <AnimCounter value={value} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "nowrap" }}>
        <span style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8", lineHeight: 1.4 }}>{sub}</span>
        {trend != null && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            color: trend > 0 ? "#10b981" : "#ef4444",
          }}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full" style={{ background: `linear-gradient(90deg,${accent},transparent)` }} />
    </GlassCard>
  );
}

function ToastContainer({ toasts }) {
  const map = { info:"border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300", success:"border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300", error:"border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300", warn:"border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300" };
  const icons = { info:"●", success:"✓", error:"✕", warn:"⚠" };
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl pointer-events-auto bg-white dark:bg-[rgba(4,12,30,0.97)] backdrop-blur-md ${map[t.type]}`}
          style={{ animation: "slideUp .3s ease" }}>
          <span>{icons[t.type]}</span>{t.msg}
        </div>
      ))}
    </div>
  );
}

function RiskGauge({ score, label }) {
  const { isDark } = useTheme();
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    let raf;
    const tick = () => { setAnim(p => { const n = p + (score - p) * 0.08; return Math.abs(n - score) < 0.5 ? score : n; }); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);
  const angle = (anim / 100) * 180 - 90;
  const rad = a => a * Math.PI / 180;
  const nx = 70 + 52 * Math.cos(rad(angle - 90));
  const ny = 70 + 52 * Math.sin(rad(angle - 90));
  const textFill = isDark ? "white" : "#0f172a";
  const labelFill = isDark ? "#94a3b8" : "#64748b";
  const track = isDark ? "#1a2d48" : "#e2e8f0";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width="140" height="82" viewBox="0 0 140 82">
        <defs>
          <linearGradient id={`gg${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981"/><stop offset="50%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#ef4444"/>
          </linearGradient>
        </defs>
        <path d="M 18 70 A 52 52 0 0 1 122 70" fill="none" stroke={track} strokeWidth="8" strokeLinecap="round"/>
        <path d="M 18 70 A 52 52 0 0 1 122 70" fill="none" stroke={`url(#gg${label})`} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(anim / 100) * 163} 163`}/>
        <line x1="70" y1="70" x2={nx} y2={ny} stroke={textFill} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="70" cy="70" r="4" fill={textFill}/>
        <text x="70" y="56" textAnchor="middle" fill={textFill} fontSize="15" fontWeight="800" fontFamily="'Plus Jakarta Sans',sans-serif">{Math.round(anim)}</text>
      </svg>
      <span style={{ fontSize: 10 }} className="tracking-widest uppercase font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BORROWER MODAL
═══════════════════════════════════════════════════════════ */
function BorrowerModal({ b, onClose }) {
  const lang = LANGUAGES[b.state] || LANGUAGES.DEFAULT;
  const hist = [
    {m:"Sep",p:true},{m:"Oct",p:true},{m:"Nov",p:true},
    {m:"Dec",p:false},{m:"Jan",p:b.daysOverdue<20},{m:"Feb",p:false},
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl border border-teal-500/30 overflow-hidden shadow-2xl
          bg-white dark:bg-gradient-to-br dark:from-[rgba(5,15,36,0.99)] dark:to-[rgba(3,10,26,0.99)]"
        style={{ animation: "slideUp .25s ease" }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-white/8">
          <div>
            <h2 className="text-slate-900 dark:text-white text-lg font-black nav-font">{b.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{b.id} · {b.state} · {b.loan}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">✕</button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center"><RiskGauge score={b.riskScore} label="Risk Score"/></div>
            <div className="text-center"><RiskGauge score={b.fraudScore} label="Fraud Score"/></div>
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sentiment</p>
              <span className={`text-3xl ${sentInfo(b.sentiment).cls}`}>{sentInfo(b.sentiment).icon}</span>
              <p className={`text-sm font-bold ${sentInfo(b.sentiment).cls}`}>{b.sentiment}</p>
            </div>
          </div>
          <div className={`rounded-xl p-4 ${stratStyle(b.strategy)}`}>
            <p className="text-xs opacity-70 uppercase tracking-widest mb-1">Decision Centre</p>
            <p className="text-base font-black nav-font">{b.strategy}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Payment History</p>
            <div className="flex gap-2">
              {hist.map(h => (
                <div key={h.m} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-7 rounded-lg flex items-center justify-center text-xs font-bold border
                    ${h.p ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                           : "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30"}`}>{h.p?"✓":"✗"}</div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{h.m}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Regional ({lang.lang})</p>
            <p className="text-sm text-teal-600 dark:text-teal-300">{lang.msg}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INDIA HEATMAP
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   INDIA CHOROPLETH MAP — Leaflet + GeoJSON
   Loads Leaflet from CDN, renders real India state boundaries,
   risk-based fill colors, hover highlight, tooltip, click panel.
═══════════════════════════════════════════════════════════ */

/* ── Minimal India States GeoJSON (simplified polygons) ── */
const INDIA_GEOJSON = {"type":"FeatureCollection","features":[
{"type":"Feature","properties":{"name":"Jammu & Kashmir"},"geometry":{"type":"Polygon","coordinates":[[[74.31,37.10],[75.20,37.05],[76.00,37.08],[76.84,36.97],[77.44,36.50],[78.23,36.40],[78.78,36.62],[79.22,36.10],[80.40,35.45],[80.40,34.60],[79.60,34.00],[78.90,33.30],[78.22,32.54],[77.44,32.55],[76.55,32.10],[75.42,32.28],[74.63,32.10],[73.90,33.00],[74.01,34.30],[73.90,35.10],[74.31,37.10]]]}},
{"type":"Feature","properties":{"name":"Himachal Pradesh"},"geometry":{"type":"Polygon","coordinates":[[[76.55,32.10],[77.44,32.55],[78.22,32.54],[78.50,31.80],[79.00,31.10],[78.50,30.50],[77.80,30.40],[76.90,30.60],[76.20,30.80],[75.60,31.20],[75.80,31.90],[76.55,32.10]]]}},
{"type":"Feature","properties":{"name":"Punjab"},"geometry":{"type":"Polygon","coordinates":[[[73.88,31.42],[74.63,32.10],[75.42,32.28],[76.55,32.10],[75.80,31.90],[75.60,31.20],[76.20,30.80],[75.60,30.10],[74.80,30.00],[73.90,30.20],[73.88,31.42]]]}},
{"type":"Feature","properties":{"name":"Haryana"},"geometry":{"type":"Polygon","coordinates":[[[74.63,30.00],[75.60,30.10],[76.20,30.80],[76.90,30.60],[77.80,30.40],[78.00,29.80],[77.80,29.00],[77.30,28.40],[76.50,28.10],[75.80,28.30],[75.10,28.90],[74.63,29.50],[74.63,30.00]]]}},
{"type":"Feature","properties":{"name":"Uttarakhand"},"geometry":{"type":"Polygon","coordinates":[[[77.80,30.40],[78.50,30.50],[79.00,31.10],[79.60,30.60],[80.40,30.00],[81.00,30.20],[81.00,29.20],[80.20,28.70],[79.50,28.70],[78.80,29.10],[77.80,29.00],[78.00,29.80],[77.80,30.40]]]}},
{"type":"Feature","properties":{"name":"Uttar Pradesh"},"geometry":{"type":"Polygon","coordinates":[[[77.30,28.40],[77.80,29.00],[78.80,29.10],[79.50,28.70],[80.20,28.70],[81.00,29.20],[81.90,29.10],[83.30,27.50],[84.70,27.00],[84.60,26.20],[83.80,25.60],[83.00,25.30],[82.00,24.80],[80.20,24.50],[78.50,24.80],[77.40,25.30],[77.00,26.40],[77.30,28.40]]]}},
{"type":"Feature","properties":{"name":"Rajasthan"},"geometry":{"type":"Polygon","coordinates":[[[69.55,29.00],[70.50,28.50],[71.90,28.10],[73.00,27.70],[74.63,25.00],[75.80,24.20],[76.80,23.40],[77.40,23.80],[77.80,23.00],[76.00,22.50],[74.50,22.80],[73.00,22.70],[71.90,23.00],[70.10,22.60],[69.00,23.20],[68.00,23.80],[68.50,24.80],[69.55,25.50],[69.55,29.00]]]}},
{"type":"Feature","properties":{"name":"Bihar"},"geometry":{"type":"Polygon","coordinates":[[[83.30,27.50],[84.70,27.00],[85.50,26.80],[86.50,26.50],[87.70,26.30],[88.20,26.50],[88.50,25.80],[87.80,25.00],[86.80,24.50],[85.80,24.50],[84.40,24.30],[83.30,24.50],[83.30,27.50]]]}},
{"type":"Feature","properties":{"name":"Jharkhand"},"geometry":{"type":"Polygon","coordinates":[[[83.30,24.50],[84.40,24.30],[85.80,24.50],[86.80,24.50],[87.80,25.00],[88.00,24.30],[87.50,23.50],[86.50,22.80],[85.80,22.40],[84.80,22.00],[83.80,22.50],[82.80,23.00],[83.30,24.50]]]}},
{"type":"Feature","properties":{"name":"West Bengal"},"geometry":{"type":"Polygon","coordinates":[[[88.20,26.50],[88.60,27.20],[89.00,26.80],[89.90,26.40],[89.50,25.20],[88.80,24.40],[88.50,23.50],[88.00,22.70],[87.00,21.90],[86.00,21.50],[85.80,22.40],[86.50,22.80],[87.50,23.50],[88.00,24.30],[87.80,25.00],[88.50,25.80],[88.20,26.50]]]}},
{"type":"Feature","properties":{"name":"Sikkim"},"geometry":{"type":"Polygon","coordinates":[[[88.00,27.80],[88.50,28.10],[89.00,27.50],[88.80,27.00],[88.00,27.10],[88.00,27.80]]]}},
{"type":"Feature","properties":{"name":"Gujarat"},"geometry":{"type":"Polygon","coordinates":[[[68.18,23.60],[68.90,23.20],[70.00,22.80],[71.90,23.00],[73.00,22.70],[74.50,22.80],[74.00,21.80],[73.00,21.00],[72.00,20.70],[71.00,20.60],[70.00,20.80],[68.80,22.00],[68.18,23.60]]]}},
{"type":"Feature","properties":{"name":"Madhya Pradesh"},"geometry":{"type":"Polygon","coordinates":[[[74.00,25.00],[74.63,25.00],[76.00,24.50],[77.40,25.30],[78.50,24.80],[80.20,24.50],[82.00,24.80],[83.00,25.30],[83.80,25.60],[84.60,26.20],[84.70,25.50],[83.50,24.20],[82.80,23.00],[81.50,22.70],[80.40,22.00],[78.80,21.70],[77.50,21.80],[76.20,22.00],[75.00,22.50],[73.70,23.00],[74.00,23.80],[74.00,25.00]]]}},
{"type":"Feature","properties":{"name":"Chhattisgarh"},"geometry":{"type":"Polygon","coordinates":[[[80.40,22.00],[81.50,22.70],[82.80,23.00],[83.80,22.50],[84.80,22.00],[85.80,22.40],[86.00,21.50],[84.80,20.80],[83.80,20.20],[82.50,19.00],[81.00,18.50],[80.30,18.80],[80.00,19.50],[80.40,21.00],[80.40,22.00]]]}},
{"type":"Feature","properties":{"name":"Odisha"},"geometry":{"type":"Polygon","coordinates":[[[85.80,22.40],[86.50,22.80],[87.50,23.50],[87.80,22.00],[87.00,21.00],[86.00,20.20],[85.00,19.50],[84.50,18.80],[84.00,18.30],[83.00,18.00],[82.00,17.80],[81.00,17.80],[80.30,18.80],[81.00,18.50],[82.50,19.00],[83.80,20.20],[84.80,20.80],[86.00,21.50],[85.80,22.40]]]}},
{"type":"Feature","properties":{"name":"Maharashtra"},"geometry":{"type":"Polygon","coordinates":[[[72.80,20.50],[73.50,20.20],[74.00,20.00],[75.00,20.50],[76.00,20.80],[77.50,21.80],[78.80,21.70],[80.40,21.00],[80.00,19.50],[80.30,18.80],[79.00,17.80],[77.80,17.00],[76.80,16.00],[76.00,15.50],[75.00,15.70],[74.20,15.50],[73.80,16.00],[73.00,17.00],[72.80,17.80],[72.80,19.00],[72.80,20.50]]]}},
{"type":"Feature","properties":{"name":"Goa"},"geometry":{"type":"Polygon","coordinates":[[[73.70,15.80],[74.30,15.70],[74.30,15.00],[73.80,14.90],[73.50,15.20],[73.70,15.80]]]}},
{"type":"Feature","properties":{"name":"Telangana"},"geometry":{"type":"Polygon","coordinates":[[[77.20,19.90],[78.50,19.80],[79.50,19.50],[80.40,19.00],[80.00,18.00],[79.00,17.80],[78.20,17.50],[77.40,17.20],[76.80,17.50],[77.00,18.50],[77.20,19.90]]]}},
{"type":"Feature","properties":{"name":"Andhra Pradesh"},"geometry":{"type":"Polygon","coordinates":[[[80.00,18.00],[80.40,19.00],[81.00,17.80],[82.00,17.80],[83.00,18.00],[84.00,18.30],[84.50,18.80],[85.00,17.50],[84.80,16.00],[83.80,15.00],[82.80,14.00],[81.80,13.30],[80.80,13.80],[80.20,13.60],[80.00,14.50],[79.80,15.50],[79.50,16.50],[80.00,17.30],[80.00,18.00]]]}},
{"type":"Feature","properties":{"name":"Karnataka"},"geometry":{"type":"Polygon","coordinates":[[[74.20,15.50],[75.00,15.70],[76.00,15.50],[76.80,16.00],[77.80,17.00],[79.00,17.80],[79.50,16.50],[79.80,15.50],[80.00,14.50],[80.20,13.60],[79.80,12.50],[78.80,11.70],[77.80,11.60],[77.00,12.00],[76.30,11.90],[75.50,12.00],[74.90,13.00],[74.20,14.00],[74.20,15.50]]]}},
{"type":"Feature","properties":{"name":"Tamil Nadu"},"geometry":{"type":"Polygon","coordinates":[[[79.80,12.50],[80.20,13.60],[80.80,13.80],[81.80,13.30],[80.30,11.50],[79.80,10.00],[79.00,9.00],[78.20,8.10],[77.00,8.00],[76.50,8.50],[77.00,9.50],[77.50,10.00],[77.80,11.00],[78.00,11.70],[77.80,11.60],[78.80,11.70],[79.80,12.50]]]}},
{"type":"Feature","properties":{"name":"Kerala"},"geometry":{"type":"Polygon","coordinates":[[[74.90,12.80],[75.50,12.00],[76.30,11.90],[77.00,12.00],[77.50,10.00],[77.00,9.50],[76.50,8.50],[77.00,8.00],[76.50,8.20],[76.00,8.80],[75.50,10.00],[75.00,11.00],[74.90,12.00],[74.90,12.80]]]}},
{"type":"Feature","properties":{"name":"Assam"},"geometry":{"type":"Polygon","coordinates":[[[89.70,27.00],[90.50,26.80],[91.00,26.40],[91.80,26.50],[92.50,26.80],[93.50,26.70],[94.50,27.00],[95.00,27.50],[94.50,27.80],[93.50,27.50],[92.50,27.50],[91.50,27.80],[90.50,27.50],[89.70,27.00]]]}},
{"type":"Feature","properties":{"name":"Arunachal Pradesh"},"geometry":{"type":"Polygon","coordinates":[[[91.60,29.50],[92.50,29.00],[93.50,29.00],[95.00,29.20],[96.00,29.00],[97.40,28.20],[97.00,27.50],[95.80,27.50],[95.00,27.50],[94.50,27.00],[93.50,26.70],[92.50,26.80],[91.80,26.50],[91.60,27.00],[91.60,29.50]]]}},
{"type":"Feature","properties":{"name":"Nagaland"},"geometry":{"type":"Polygon","coordinates":[[[93.50,27.50],[94.50,27.80],[95.00,27.50],[95.80,27.50],[95.50,26.50],[94.80,25.80],[94.00,26.20],[93.50,26.70],[93.50,27.50]]]}},
{"type":"Feature","properties":{"name":"Manipur"},"geometry":{"type":"Polygon","coordinates":[[[93.00,25.70],[94.00,26.20],[94.80,25.80],[95.00,25.00],[94.50,24.50],[93.50,24.00],[93.00,24.50],[93.00,25.70]]]}},
{"type":"Feature","properties":{"name":"Mizoram"},"geometry":{"type":"Polygon","coordinates":[[[92.30,24.50],[93.00,24.50],[93.50,24.00],[93.00,23.00],[92.80,22.20],[92.20,22.50],[91.80,23.20],[92.30,24.50]]]}},
{"type":"Feature","properties":{"name":"Tripura"},"geometry":{"type":"Polygon","coordinates":[[[91.20,24.60],[92.00,24.50],[92.30,24.50],[91.80,23.20],[91.50,22.80],[91.20,23.50],[91.20,24.60]]]}},
{"type":"Feature","properties":{"name":"Meghalaya"},"geometry":{"type":"Polygon","coordinates":[[[89.70,26.20],[90.50,26.80],[91.00,26.40],[91.80,26.50],[92.50,26.80],[92.50,25.70],[91.80,25.20],[91.00,25.20],[90.50,25.50],[89.80,25.30],[89.70,26.20]]]}},
{"type":"Feature","properties":{"name":"Uttarakhand"},"geometry":{"type":"Polygon","coordinates":[[[77.80,30.40],[78.50,30.50],[79.00,31.10],[79.60,30.60],[80.40,30.00],[81.00,30.20],[81.00,29.20],[80.20,28.70],[79.50,28.70],[78.80,29.10],[77.80,29.00],[78.00,29.80],[77.80,30.40]]]}},
{"type":"Feature","properties":{"name":"Delhi"},"geometry":{"type":"Polygon","coordinates":[[[76.84,28.88],[77.35,28.88],[77.35,28.40],[76.84,28.40],[76.84,28.88]]]}}
]};

/* ── Risk color scale ── */
function getRiskColor(value, layer = "default") {
  if (layer === "recovery") {
    if (value >= 80) return "#10b981";
    if (value >= 65) return "#3b82f6";
    if (value >= 50) return "#f59e0b";
    return "#ef4444";
  }
  /* default & fraud: 3-tier as per spec */
  if (value >= 30) return "#ef4444";  /* High Risk */
  if (value >= 15) return "#f59e0b";  /* Medium Risk */
  return "#10b981";                   /* Low Risk */
}

function getRiskCategory(value, layer = "default") {
  if (layer === "recovery") {
    if (value >= 80) return { label: "Excellent", color: "#10b981" };
    if (value >= 65) return { label: "Good", color: "#3b82f6" };
    if (value >= 50) return { label: "Fair", color: "#f59e0b" };
    return { label: "Poor", color: "#ef4444" };
  }
  if (value >= 30) return { label: "High Risk", color: "#ef4444" };
  if (value >= 20) return { label: "Medium Risk", color: "#f97316" };
  if (value >= 10) return { label: "Moderate", color: "#f59e0b" };
  return { label: "Low Risk", color: "#10b981" };
}

/* ── Side Analytics Panel ── */
function GeoAnalyticsPanel({ state, stateData, layer, isDark, onClose }) {
  const d = stateData?.find(s => s.state === state) || null;
  if (!d && !state) return null;

  const val = d ? (layer === "fraud" ? d.fraud : layer === "recovery" ? d.recovery : d.default) : 0;
  const cat = getRiskCategory(val, layer);
  const color = getRiskColor(val, layer);

  const panelBg = isDark ? "#0f172a" : "#ffffff";
  const borderCol = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#64748b" : "#94a3b8";
  const rowBg = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const rowBorder = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";

  const stats = d ? [
    { label: "Default Rate",   value: `${d.default}%`,  color: getRiskColor(d.default), icon: "M12 9v2m0 4h.01" },
    { label: "Fraud Score",    value: `${d.fraud}%`,    color: getRiskColor(d.fraud),   icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    { label: "Recovery Rate",  value: `${d.recovery}%`, color: d.recovery >= 70 ? "#10b981" : "#f59e0b", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
    { label: "Active Loans",   value: (d.loans || 0).toLocaleString("en-IN"), color: "#3b82f6", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ] : [];

  return (
    <div className="geo-panel-enter" style={{
      position: "fixed",
      top: 0,
      right: 0,
      width: 360,
      height: "100vh",
      background: panelBg,
      borderLeft: `1px solid ${borderCol}`,
      boxShadow: isDark ? "-8px 0 40px rgba(0,0,0,0.6)" : "-8px 0 40px rgba(0,0,0,0.12)",
      zIndex: 10000,
      display: "flex",
      flexDirection: "column",
      backdropFilter: "blur(20px)",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: `1px solid ${borderCol}`,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, animation: "pulse2 2s infinite", flexShrink: 0 }}/>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: textSecondary }}>
              State Analytics
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: `1px solid ${borderCol}`,
            background: "transparent", cursor: "pointer", color: textSecondary,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            ✕
          </button>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: textPrimary, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0, lineHeight: 1.2 }}>
          {state}
        </h2>
        {d && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 20,
              background: `${color}20`, border: `1px solid ${color}40`,
              fontSize: 11, fontWeight: 700, color: color,
            }}>
              {cat.label}
            </span>
            <span style={{ fontSize: 11, color: textSecondary }}>
              {layer === "fraud" ? "Fraud Risk" : layer === "recovery" ? "Recovery" : "Default Risk"}: <strong style={{ color: textPrimary }}>{val}%</strong>
            </span>
          </div>
        )}
      </div>

      {/* Risk bar */}
      {d && (
        <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Risk Level</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{val}%</span>
          </div>
          <div style={{ height: 8, background: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9", borderRadius: 8, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.min(val, 100)}%`,
              background: `linear-gradient(90deg, ${color}, ${color}99)`,
              borderRadius: 8,
              transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            }}/>
          </div>
        </div>
      )}

      {/* Stats grid */}
      {d && (
        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              padding: "14px",
              background: rowBg,
              border: `1px solid ${rowBorder}`,
              borderRadius: 12,
              borderLeft: `3px solid ${s.color}`,
            }}>
              <div style={{ fontSize: 10, color: textSecondary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Risk insight text */}
      {d && (
        <div style={{ padding: "0 20px", flexShrink: 0 }}>
          <div style={{
            padding: "14px",
            background: `${color}10`,
            border: `1px solid ${color}30`,
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              AI Insight
            </p>
            <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6, margin: 0 }}>
              {d.default >= 30
                ? `${state} is in the critical risk zone with ${d.default}% default rate. Immediate intervention via legal escalation and field visits recommended.`
                : d.default >= 20
                ? `${state} shows elevated risk at ${d.default}% defaults. Consider proactive restructuring and borrower outreach programs.`
                : d.default >= 10
                ? `${state} shows moderate risk. Standard EMI reminder campaigns and monitoring protocols should be maintained.`
                : `${state} is performing well with only ${d.default}% default rate. Continue current recovery strategy.`}
            </p>
          </div>
        </div>
      )}

      {!d && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: textSecondary, fontSize: 13 }}>
          No data available for this state
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: `1px solid ${borderCol}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse2 2s infinite" }}/>
          <span style={{ fontSize: 11, color: textSecondary }}>Live Data · Feb 2026</span>
        </div>
      </div>
    </div>
  );
}

/* ── Darken hex color by a given amount ── */
function darkenColor(hex, amount = 30) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/* ── Accurate India SVG paths traced directly from real map image via OpenCV ── */
const INDIA_SVG_STATES = [
  { name:"Madhya Pradesh",    d:"M404.7,393.0 L403.8,414.9 L372.8,414.9 L372.8,429.1 L386.9,436.7 L354.0,466.1 L343.7,491.8 L313.6,479.4 L259.2,486.1 L252.6,474.7 L223.5,494.6 L165.3,463.3 L191.5,415.8 L187.8,389.2 L197.2,380.7 L213.1,389.2 L207.5,414.9 L224.4,401.6 L246.9,405.4 L245.1,380.7 L260.1,367.4 L246.0,369.3 L236.6,357.9 L282.6,326.6 L301.4,334.2 L277.9,388.3 L293.9,406.3 L304.2,399.7 L293.0,374.1 L299.5,365.5 L304.2,376.9 L322.1,379.7 L333.3,370.3 L339.0,383.5 L372.8,379.7 Z" },
  { name:"Gujarat",           d:"M20.7,388.3 L52.6,394.9 L64.8,387.3 L81.7,391.1 L83.6,380.7 L138.0,393.0 L150.2,421.5 L173.7,442.4 L163.4,448.1 L162.4,465.2 L150.2,475.6 L156.8,487.0 L145.5,488.0 L151.2,504.1 L140.8,502.2 L137.1,514.6 L128.6,515.5 L132.4,499.4 L121.1,483.2 L129.6,475.6 L120.2,469.0 L124.9,456.6 L114.6,451.9 L102.3,467.1 L108.9,479.4 L99.5,488.9 L73.2,498.4 L62.0,494.6 L22.5,450.9 L23.5,445.3 L41.3,448.1 L64.8,432.0 L57.3,426.3 L36.6,433.9 L11.3,412.0 Z" },
  { name:"West Bengal",       d:"M554.9,354.1 L564.3,364.6 L573.7,367.4 L570.0,371.2 L558.7,370.3 L561.5,374.1 L553.1,383.5 L553.1,391.1 L570.0,405.4 L567.1,418.7 L578.4,445.3 L583.1,475.6 L576.5,478.5 L575.6,467.1 L569.0,464.2 L568.1,477.5 L559.6,477.5 L560.6,467.1 L555.9,460.4 L550.2,461.4 L554.9,470.9 L542.7,480.4 L522.1,464.2 L511.7,438.6 L497.7,436.7 L495.8,430.1 L506.1,429.1 L521.1,417.7 L530.5,417.7 L544.6,404.4 L549.3,379.7 L546.5,369.3 L554.0,363.6 Z" },
  { name:"Odisha",            d:"M533.3,477.5 L535.2,482.3 L519.2,496.5 L524.9,511.7 L502.3,535.4 L493.9,539.2 L478.9,535.4 L477.0,547.8 L452.6,565.8 L442.3,567.7 L428.2,561.1 L409.4,581.0 L397.2,578.2 L389.7,593.4 L370.9,598.1 L393.4,562.0 L384.0,533.5 L396.2,543.0 L407.5,542.1 L409.4,537.3 L398.1,526.9 L398.1,509.8 L406.6,501.3 L424.4,497.5 L431.9,469.9 L441.3,460.4 L452.6,464.2 L467.6,459.5 L471.4,470.9 L495.8,471.8 L503.3,459.5 Z" },
  { name:"Bihar",             d:"M424.4,382.6 L425.4,376.9 L441.3,363.6 L449.8,363.6 L459.2,357.0 L444.1,348.4 L447.9,340.8 L443.2,335.1 L450.7,332.3 L451.6,326.6 L441.3,318.0 L441.3,306.6 L453.5,311.4 L462.9,322.8 L485.4,327.5 L490.1,335.1 L523.0,335.1 L531.5,338.9 L560.6,332.3 L558.7,338.0 L546.5,343.7 L548.4,362.7 L529.6,373.1 L520.2,392.1 L505.2,394.9 L489.2,384.5 L477.9,394.9 L455.4,397.8 L448.8,392.1 L429.1,394.0 Z" },
  { name:"Haryana",           d:"M190.6,224.1 L205.6,236.4 L213.1,231.6 L231.9,232.6 L234.7,225.0 L245.1,224.1 L254.5,205.1 L257.3,211.7 L267.6,219.3 L256.3,227.8 L256.3,257.3 L248.8,258.2 L244.1,263.0 L244.1,268.7 L249.8,274.4 L261.0,274.4 L263.8,278.2 L262.9,287.7 L251.6,293.4 L247.9,288.6 L247.9,281.0 L242.3,283.9 L232.9,281.0 L228.2,288.6 L225.4,287.7 L226.3,275.3 L215.0,266.8 L210.3,245.9 L192.5,241.1 L187.8,229.7 Z" },
  { name:"Ladakh",            d:"M151.2,27.5 L168.1,12.3 L184.0,13.3 L185.9,7.6 L207.5,3.8 L222.5,6.6 L274.2,57.9 L293.9,53.2 L314.6,38.0 L327.7,49.4 L337.1,49.4 L344.6,57.0 L337.1,77.8 L323.0,88.3 L318.3,99.7 L306.1,105.4 L305.2,120.6 L313.6,128.2 L314.6,147.2 L306.1,150.0 L303.3,142.4 L282.6,139.6 L278.9,132.9 L262.0,133.9 L248.8,108.2 L217.8,89.2 L210.3,65.5 L183.1,57.9 L178.4,46.5 L164.3,35.1 L152.1,35.1 Z" },
  { name:"Arunachal Pradesh", d:"M798.1,265.8 L785.9,282.0 L788.7,285.8 L785.9,289.6 L767.1,292.4 L761.5,283.9 L762.4,271.5 L754.9,269.6 L726.8,284.8 L718.3,284.8 L706.1,297.2 L702.3,307.6 L697.7,308.5 L674.2,307.6 L662.9,312.3 L661.0,300.0 L648.8,292.4 L651.6,288.6 L668.5,288.6 L678.9,274.4 L723.0,239.2 L743.7,244.0 L756.8,231.6 L764.3,233.5 L763.4,244.9 L769.0,242.1 L774.6,244.9 L770.9,261.1 L791.5,260.1 Z" },
  { name:"Karnataka",         d:"M251.6,581.0 L255.4,607.6 L245.1,637.0 L248.8,653.2 L237.6,657.0 L232.9,667.4 L237.6,679.7 L229.1,680.7 L227.2,694.0 L235.7,724.4 L243.2,706.3 L246.0,725.3 L264.8,722.5 L278.9,743.4 L270.4,752.8 L252.6,750.9 L248.8,778.5 L219.7,786.1 L170.0,746.2 L162.4,694.0 L154.9,684.5 L157.7,661.7 L166.2,646.5 L162.4,634.2 L181.2,623.7 L200.0,622.8 L200.9,610.4 L222.5,611.4 Z" },
  { name:"Telangana",         d:"M370.0,601.9 L364.3,615.2 L340.8,619.0 L338.0,625.6 L329.6,622.8 L322.1,632.3 L307.0,632.3 L297.7,645.6 L289.2,649.4 L273.2,649.4 L264.8,654.1 L251.6,652.2 L255.4,647.5 L249.8,639.9 L254.5,628.5 L252.6,619.0 L260.1,609.5 L256.3,602.8 L258.2,579.1 L266.7,571.5 L266.7,557.3 L282.6,549.7 L286.4,540.2 L300.5,547.8 L321.1,547.8 L325.8,571.5 L344.6,582.0 L357.7,600.9 Z" },
  { name:"Maharashtra",       d:"M139.0,652.2 L123.9,518.4 L139.0,521.2 L141.8,510.8 L156.8,504.1 L153.1,489.9 L163.4,485.1 L154.9,477.5 L170.9,469.0 L178.4,482.3 L225.4,498.4 L251.6,478.5 L257.3,490.8 L311.7,483.2 L341.8,494.6 L338.0,538.3 L349.3,549.7 L336.2,555.4 L335.2,570.6 L323.0,544.0 L285.4,535.4 L263.8,554.4 L262.9,568.7 L216.9,608.5 L198.1,604.7 L194.4,619.9 L158.7,630.4 L154.9,657.9 Z" },
  { name:"Jharkhand",         d:"M544.6,375.0 L541.8,400.6 L531.5,406.3 L528.6,414.9 L519.2,411.1 L517.4,417.7 L492.0,427.2 L492.0,436.7 L505.2,440.5 L518.3,463.3 L501.4,453.8 L495.8,456.6 L494.8,467.1 L475.1,468.0 L473.2,456.6 L445.1,458.5 L451.6,444.3 L425.4,409.2 L430.0,397.8 L447.9,396.8 L451.6,401.6 L470.4,403.5 L492.0,390.2 L503.3,398.7 L521.1,396.8 L528.6,391.1 L526.8,385.4 L535.2,373.1 Z" },
  { name:"Assam",             d:"M758.7,275.3 L755.9,282.9 L761.5,293.4 L754.0,292.4 L717.4,322.8 L713.6,337.0 L704.2,338.9 L694.8,352.2 L699.5,359.8 L691.1,384.5 L676.1,394.9 L669.5,391.1 L668.5,382.6 L684.5,360.8 L664.8,338.9 L654.5,338.0 L637.6,347.5 L620.7,342.7 L607.5,346.5 L600.0,337.0 L602.8,325.6 L612.2,319.9 L635.7,322.8 L675.1,311.4 L686.4,316.1 L691.1,311.4 L704.2,311.4 L720.2,288.6 Z" },
  { name:"Uttar Pradesh",     d:"M272.3,216.5 L272.3,235.4 L288.3,234.5 L301.4,254.4 L350.2,271.5 L379.3,297.2 L435.7,311.4 L446.9,326.6 L435.7,336.1 L440.4,350.3 L451.6,356.0 L421.6,375.0 L424.4,404.4 L417.8,412.0 L406.6,406.3 L408.5,389.2 L374.6,375.9 L355.9,380.7 L335.2,365.5 L322.1,374.1 L303.3,371.2 L296.7,357.9 L308.0,337.0 L300.5,326.6 L266.7,319.0 L259.2,298.1 L267.6,288.6 L259.2,229.7 Z" },
  { name:"Himachal Pradesh",  d:"M246.0,125.3 L250.7,126.3 L260.1,137.7 L277.0,137.7 L281.7,144.3 L289.2,144.3 L293.9,151.9 L292.0,158.5 L300.5,171.8 L298.6,179.4 L303.3,187.0 L302.3,189.9 L296.7,189.9 L295.8,187.0 L291.1,186.1 L276.1,187.0 L271.4,193.7 L273.2,209.8 L268.5,213.6 L259.2,207.0 L251.6,194.6 L244.1,188.9 L242.3,183.2 L231.9,177.5 L232.9,169.0 L222.5,158.5 L229.1,148.1 L230.0,137.7 Z" },
  { name:"Rajasthan",         d:"M167.1,220.3 L184.0,225.9 L190.6,245.9 L206.6,248.7 L223.5,293.4 L235.7,284.8 L262.9,309.5 L261.0,324.7 L279.8,325.6 L233.8,354.1 L246.9,373.1 L241.3,402.5 L223.5,395.9 L211.3,409.2 L215.0,383.5 L197.2,374.1 L185.0,383.5 L187.8,415.8 L177.5,433.9 L154.9,420.6 L138.0,387.3 L85.4,375.9 L63.8,338.0 L65.7,319.0 L48.8,310.4 L72.3,277.2 L85.4,289.6 L114.6,282.0 Z" },
  { name:"Uttarakhand",       d:"M279.8,190.8 L291.1,189.9 L298.6,194.6 L305.2,193.7 L308.9,187.0 L311.7,188.0 L317.4,198.4 L328.6,198.4 L337.1,205.1 L340.8,212.7 L348.4,213.6 L354.0,218.4 L354.0,223.1 L342.7,232.6 L338.0,242.1 L334.3,262.0 L323.9,262.0 L306.1,251.6 L288.3,227.8 L279.8,235.4 L274.2,230.7 L275.1,225.9 L280.8,222.2 L280.8,218.4 L275.1,213.6 L278.9,206.0 L275.1,196.5 Z" },
  { name:"Tamil Nadu",        d:"M329.6,735.8 L330.5,755.7 L320.2,773.7 L308.0,780.4 L316.4,795.6 L316.4,826.9 L297.7,832.6 L288.3,862.0 L266.7,870.6 L258.2,892.4 L239.4,897.2 L234.7,890.5 L238.5,886.7 L236.6,869.6 L245.1,855.4 L239.4,848.7 L240.4,827.8 L228.2,827.8 L230.0,813.6 L215.0,787.0 L245.1,786.1 L257.3,777.5 L252.6,766.1 L258.2,752.8 L274.2,759.5 L307.0,740.5 Z" },
  { name:"Nagaland",          d:"M554.9,314.2 L557.7,316.1 L563.4,315.2 L564.3,312.3 L569.0,312.3 L571.8,317.1 L579.3,322.8 L582.2,323.7 L594.4,322.8 L598.1,326.6 L598.1,332.3 L594.4,335.1 L588.7,343.7 L586.9,343.7 L583.1,340.8 L583.1,337.0 L578.4,330.4 L576.5,329.4 L572.8,331.3 L565.3,330.4 L564.3,327.5 L562.4,326.6 L559.6,327.5 L555.9,326.6 L555.9,320.9 L554.0,319.9 Z" },
  { name:"Punjab",            d:"M220.7,151.9 L217.8,158.5 L228.2,170.9 L226.3,172.8 L228.2,181.3 L240.4,187.0 L241.3,192.7 L248.8,199.4 L248.8,207.0 L245.1,209.8 L242.3,219.3 L233.8,219.3 L228.2,228.8 L213.1,227.8 L206.6,230.7 L197.2,221.2 L174.6,221.2 L172.8,219.3 L173.7,210.8 L180.3,200.3 L192.5,189.9 L194.4,172.8 L191.5,168.0 L193.4,165.2 L211.3,159.5 L215.0,151.9 Z" },
  { name:"Andhra Pradesh",    d:"M459.2,566.8 L418.8,606.6 L395.3,619.9 L389.7,638.9 L365.3,644.6 L354.0,661.7 L334.3,662.7 L326.8,682.6 L330.5,732.0 L282.6,749.1 L267.6,718.7 L248.8,721.5 L248.8,704.4 L233.8,699.7 L242.3,657.9 L292.0,653.2 L304.2,647.5 L305.2,638.9 L368.1,618.0 L382.2,597.2 L396.2,596.2 L396.2,585.8 L413.1,583.9 L430.0,565.8 L441.3,572.5 Z" },
  { name:"Chhattisgarh",      d:"M426.3,413.9 L447.9,447.2 L429.1,467.1 L421.6,492.7 L403.8,497.5 L394.4,507.0 L394.4,526.9 L403.8,538.3 L381.2,529.7 L387.8,565.8 L370.9,582.9 L367.1,595.3 L359.6,597.2 L338.0,573.4 L339.0,560.1 L353.1,554.4 L352.1,546.8 L342.7,541.1 L343.7,498.4 L354.0,473.7 L391.5,436.7 L375.6,420.6 L399.1,421.5 L407.5,414.9 L415.0,418.7 Z" },
  { name:"Meghalaya",         d:"M666.7,393.0 L672.3,397.8 L672.3,401.6 L669.5,405.4 L669.5,409.2 L667.6,411.1 L665.7,411.1 L662.9,413.0 L661.0,419.6 L656.3,424.4 L658.2,432.0 L656.3,433.9 L653.5,433.9 L649.8,430.1 L647.9,430.1 L646.0,428.2 L646.0,423.4 L643.2,420.6 L642.3,411.1 L644.1,406.3 L647.9,402.5 L649.8,402.5 L652.6,399.7 L657.3,398.7 L660.1,395.9 Z" },
  { name:"Manipur",           d:"M679.8,359.8 L678.9,364.6 L675.1,365.5 L671.4,369.3 L665.7,365.5 L651.6,366.5 L649.8,368.4 L636.6,365.5 L631.0,369.3 L614.1,369.3 L604.7,363.6 L604.7,360.8 L607.5,357.9 L607.5,350.3 L618.8,347.5 L621.6,349.4 L632.9,349.4 L637.6,353.2 L641.3,353.2 L656.3,341.8 L662.9,342.7 L663.8,345.6 L662.0,349.4 L669.5,353.2 L674.2,353.2 Z" },
  { name:"Sikkim",            d:"M684.5,391.1 L688.3,392.1 L688.3,398.7 L696.7,401.6 L702.3,409.2 L701.4,425.3 L696.7,430.1 L694.8,434.8 L694.8,444.3 L698.6,450.0 L698.6,452.8 L693.9,458.5 L690.1,456.6 L685.4,456.6 L683.6,454.7 L683.6,443.4 L677.0,433.9 L677.0,419.6 L676.1,416.8 L672.3,413.9 L673.2,406.3 L676.1,400.6 Z" },
  { name:"Tripura",           d:"M728.6,353.2 L730.5,356.0 L729.6,362.7 L733.3,365.5 L733.3,369.3 L725.8,382.6 L724.9,390.2 L722.1,394.0 L723.0,396.8 L720.2,399.7 L699.5,399.7 L696.7,396.8 L693.0,395.9 L691.1,394.0 L691.1,391.1 L694.8,385.4 L695.8,375.0 L698.6,371.2 L699.5,365.5 L705.2,363.6 L716.4,353.2 L721.1,354.1 Z" },
  { name:"Jammu & Kashmir",   d:"M189.7,64.6 L198.1,65.5 L200.9,68.4 L204.7,67.4 L216.0,94.9 L238.5,103.5 L248.8,117.7 L246.9,122.5 L237.6,125.3 L226.3,133.9 L226.3,143.4 L221.6,148.1 L216.9,149.1 L212.2,145.3 L200.9,143.4 L193.4,133.9 L183.1,130.1 L172.8,120.6 L170.9,80.7 L176.5,79.7 Z" },
  { name:"Kerala",            d:"M175.6,753.8 L193.4,775.6 L210.3,782.3 L210.3,794.6 L221.6,803.2 L220.7,807.9 L226.3,814.6 L222.5,826.9 L227.2,832.6 L237.6,832.6 L234.7,851.6 L239.4,853.5 L240.4,858.2 L232.9,867.7 L232.9,889.6 L215.0,865.8 L199.1,802.2 L191.5,785.1 L172.8,759.5 Z" },
  { name:"Mizoram",           d:"M745.5,310.4 L743.7,313.3 L743.7,317.1 L739.9,320.9 L744.6,338.0 L735.2,350.3 L714.6,349.4 L704.2,358.9 L699.5,352.2 L708.0,342.7 L712.7,344.6 L716.4,341.8 L718.3,328.5 L723.9,322.8 L726.8,321.8 L729.6,317.1 L739.0,308.5 Z" },
];

function IndiaHeatmap({ stateData, layer }) {
  const { isDark } = useTheme();
  const [selectedState, setSelectedState] = useState(null);
  const [hoveredState, setHoveredState]   = useState(null);
  const [tooltip, setTooltip]             = useState(null);
  const [panelOpen, setPanelOpen]         = useState(false);

  const stateMap = useMemo(() =>
    Object.fromEntries((stateData || []).map(s => [s.state, s])),
  [stateData]);

  const fallback = { default: 15, fraud: 10, recovery: 70, loans: 5000 };

  const getStateData = useCallback((stateName) => {
    if (stateMap[stateName]) return stateMap[stateName];
    const lower = stateName.toLowerCase();
    const found = Object.keys(stateMap).find(k => {
      const kl = k.toLowerCase();
      return kl === lower || kl.includes(lower) || lower.includes(kl);
    });
    return found ? stateMap[found] : { ...fallback, state: stateName };
  }, [stateMap]);

  const getVal = useCallback((stateName) => {
    const d = getStateData(stateName);
    return layer === "fraud" ? d.fraud : layer === "recovery" ? d.recovery : d.default;
  }, [getStateData, layer]);

  const LEGENDS = {
    default:  [{ l:"High Risk (≥30%)", c:"#ef4444" },{ l:"Medium (15–29%)", c:"#f59e0b" },{ l:"Low Risk (<15%)", c:"#10b981" }],
    fraud:    [{ l:"High Risk (≥30%)", c:"#ef4444" },{ l:"Medium (15–29%)", c:"#f59e0b" },{ l:"Low Risk (<15%)", c:"#10b981" }],
    recovery: [{ l:"Excellent (≥80%)", c:"#10b981" },{ l:"Good (65–79%)", c:"#3b82f6" },{ l:"Fair (50–64%)", c:"#f59e0b" },{ l:"Poor (<50%)", c:"#ef4444" }],
  };

  const mapBg    = isDark ? "#0a1628" : "#dbeafe";
  const borderC  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  const handleEnter = (e, state) => {
    setHoveredState(state.name);
    const rect = e.currentTarget.closest("svg").getBoundingClientRect();
    const d    = getStateData(state.name);
    const val  = getVal(state.name);
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      cw: rect.width,
      ch: rect.height,
      name: state.name,
      val,
      defVal:   d.default  ?? 15,
      fraudVal: d.fraud    ?? 10,
      recVal:   d.recovery ?? 70,
      color:    getRiskColor(val, layer),
    });
  };

  const handleMove = (e) => {
    const rect = e.currentTarget.closest("svg").getBoundingClientRect();
    setTooltip(t => t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top, cw: rect.width, ch: rect.height } : t);
  };

  const handleLeave = () => { setHoveredState(null); setTooltip(null); };

  const handleClick = (name) => {
    setSelectedState(name);
    setPanelOpen(true);
  };

  const ttBg    = "#ffffff";
  const ttBdr   = isDark ? "rgba(255,255,255,0.10)" : "#e2e8f0";
  const ttTitle = isDark ? "#f1f5f9" : "#0f172a";
  const ttSub   = isDark ? "#64748b" : "#94a3b8";
  const ttDiv   = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";

  return (
    <>
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 520,
          borderRadius: 16,
          border: `1px solid ${borderC}`,
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
          background: mapBg,
        }}
      >
        {/* SVG Map */}
        <svg
          viewBox="0 0 810 910"
          style={{ width: "100%", height: "100%", display: "block" }}
          onMouseLeave={handleLeave}
        >
          {/* ocean / background */}
          <rect x="0" y="0" width="810" height="910" fill={mapBg} />

          {INDIA_SVG_STATES.map(state => {
            const val   = getVal(state.name);
            const color = getRiskColor(val, layer);
            const isHov = hoveredState === state.name;
            return (
              <path
                key={state.name}
                d={state.d}
                fill={isHov ? darkenColor(color, 25) : color}
                fillOpacity={isHov ? 0.97 : 0.88}
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ cursor: "pointer", transition: "fill 0.1s ease, fill-opacity 0.1s ease" }}
                onMouseEnter={e => handleEnter(e, state)}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                onClick={() => handleClick(state.name)}
              />
            );
          })}
        </svg>

        {/* Rich tooltip — smart flip: avoids right/bottom edges */}
        {tooltip && (() => {
          const TT_W = 196;
          const TT_H = 150;
          const PAD  = 14;
          const cw   = tooltip.cw || 800;
          const ch   = tooltip.ch || 520;
          const flipX = tooltip.x + PAD + TT_W > cw - 8;
          const flipY = tooltip.y + TT_H > ch - 8;
          const left  = flipX ? Math.max(6, tooltip.x - PAD - TT_W) : tooltip.x + PAD;
          const top   = flipY ? Math.max(6, tooltip.y - TT_H) : tooltip.y - 10;
          return (
            <div style={{
              position: "absolute",
              left,
              top,
              background: ttBg,
              border: `1px solid ${ttBdr}`,
              borderTop: `3px solid ${tooltip.color}`,
              borderRadius: 12,
              padding: "12px 14px",
              minWidth: TT_W,
              pointerEvents: "none",
              boxShadow: `0 12px 32px rgba(0,0,0,${isDark ? "0.55" : "0.14"})`,
              zIndex: 50,
              fontFamily: "'Inter',sans-serif",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:tooltip.color, flexShrink:0, boxShadow:`0 0 6px ${tooltip.color}88` }} />
                <span style={{ fontSize:13, fontWeight:800, color:ttTitle, fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-0.3px" }}>{tooltip.name}</span>
              </div>
              {[
                { label:"Default Rate",  val:`${tooltip.defVal}%`,   col: getRiskColor(tooltip.defVal, "default") },
                { label:"Fraud Score",   val:`${tooltip.fraudVal}%`, col: getRiskColor(tooltip.fraudVal, "fraud") },
                { label:"Recovery Rate", val:`${tooltip.recVal}%`,   col: getRiskColor(tooltip.recVal, "recovery") },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom: i < arr.length-1 ? `1px solid ${ttDiv}` : "none" }}>
                  <span style={{ fontSize:11, color:ttSub, fontWeight:500 }}>{row.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:row.col }}>{row.val}</span>
                </div>
              ))}
              <div style={{ marginTop:8, height:3, background: isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(tooltip.val, 100)}%`, background:`linear-gradient(90deg,${tooltip.color},${darkenColor(tooltip.color, -20)})`, borderRadius:4, transition:"width 0.3s" }} />
              </div>
            </div>
          );
        })()}

        {/* Legend — bottom left */}
        <div style={{
          position:"absolute", bottom:16, left:16, zIndex:999,
          display:"flex", flexDirection:"column", gap:6,
          background: isDark ? "rgba(5,13,30,0.90)" : "rgba(255,255,255,0.94)",
          backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
          border:`1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          borderRadius:12, padding:"10px 13px",
          boxShadow:"0 4px 20px rgba(0,0,0,0.18)", minWidth:148,
        }}>
          <div style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color: isDark ? "#475569" : "#94a3b8", marginBottom:2 }}>
            {layer === "recovery" ? "Recovery Rate" : layer === "fraud" ? "Fraud Risk" : "Default Rate"}
          </div>
          {(LEGENDS[layer] || LEGENDS.default).map(l => (
            <div key={l.l} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:11, height:11, borderRadius:3, background:l.c, flexShrink:0, boxShadow:`0 0 6px ${l.c}66` }} />
              <span style={{ fontSize:10.5, color: isDark ? "#94a3b8" : "#475569", fontWeight:500 }}>{l.l}</span>
            </div>
          ))}
        </div>

        {/* Hovered state pill — top center */}
        {hoveredState && (
          <div style={{
            position:"absolute", top:14, left:"50%", transform:"translateX(-50%)",
            zIndex:999, pointerEvents:"none",
            background: isDark ? "rgba(5,13,30,0.92)" : "rgba(255,255,255,0.96)",
            border:`1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}`,
            borderRadius:20, padding:"6px 16px",
            fontSize:12, fontWeight:800,
            color: isDark ? "#f1f5f9" : "#0f172a",
            fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-0.2px",
            boxShadow:"0 4px 20px rgba(0,0,0,0.22)",
            animation:"fadeIn 0.1s ease", whiteSpace:"nowrap",
          }}>
            {hoveredState}
          </div>
        )}

        {/* Click hint */}
        {!panelOpen && (
          <div style={{
            position:"absolute", bottom:16, right:16, zIndex:999,
            background: isDark ? "rgba(20,184,166,0.13)" : "rgba(20,184,166,0.09)",
            border:"1px solid rgba(20,184,166,0.28)",
            borderRadius:8, padding:"5px 10px",
            fontSize:10, color:"#14b8a6", fontWeight:700, letterSpacing:"0.02em",
          }}>
            Click any state for details →
          </div>
        )}
      </div>

      {/* Side Analytics Panel */}
      {panelOpen && selectedState && (
        <GeoAnalyticsPanel
          state={selectedState}
          stateData={stateData}
          layer={layer}
          isDark={isDark}
          onClose={() => { setPanelOpen(false); setSelectedState(null); }}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   BORROWER TABLE
═══════════════════════════════════════════════════════════ */
function BorrowerTable({ borrowers, loading, onToast }) {
  const [search, setSearch] = useState("");
  const [stateF, setStateF] = useState("all");
  const [riskF, setRiskF] = useState("all");
  const [sortKey, setSortKey] = useState("riskScore");
  const [sortDir, setSortDir] = useState("desc");
  const [sel, setSel] = useState(null);
  const { isDark } = useTheme();

  const filtered = useMemo(() => {
    if (!borrowers) return [];
    const q = search.toLowerCase();
    return [...borrowers]
      .filter(b => (!q || b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)) && (stateF === "all" || b.state === stateF) && (riskF === "all" || b.riskLabel === riskF))
      .sort((a, b) => sortDir === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);
  }, [borrowers, search, stateF, riskF, sortKey, sortDir]);

  const toggleSort = key => { if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("desc"); } };
  const iCls = "border rounded-xl px-3 py-1.5 text-xs focus:outline-none transition-colors";
  const iStyle = { background: isDark ? "rgba(30,41,59,0.6)" : "#f1f5f9", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0", color: isDark ? "#cbd5e1" : "#334155" };

  return (
    <GlassCard className="p-5">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div>
          <h3 className="font-bold text-sm nav-font" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>Borrower Risk Registry</h3>
          <p className="text-xs mt-0.5" style={{ color: isDark ? "#64748b" : "#94a3b8" }}>{filtered.length} records · Click for AI profile</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / ID…" className={iCls + " min-w-36"} style={iStyle} />
          <select value={stateF} onChange={e => setStateF(e.target.value)} className={iCls} style={iStyle}>
            <option value="all">All States</option>
            {[...new Set((borrowers || []).map(b => b.state))].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={riskF} onChange={e => setRiskF(e.target.value)} className={iCls} style={iStyle}>
            {["all","low","medium","high"].map(r => <option key={r} value={r}>{r === "all" ? "All Risk" : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 rounded-xl" style={{ background: isDark ? "rgba(30,41,59,0.4)" : "#f1f5f9" }}>
            <Shimmer className="h-4 w-36"/><Shimmer className="h-4 w-20 ml-auto"/><Shimmer className="h-4 w-16"/><Shimmer className="h-4 w-16"/><Shimmer className="h-4 w-24"/>
          </div>
        ))}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}` }}>
                {[{h:"Borrower",k:null},{h:"Loan",k:null},{h:"Risk",k:"riskScore"},{h:"Fraud",k:"fraudScore"},{h:"Sentiment",k:null},{h:"Strategy",k:null},{h:"Overdue",k:"daysOverdue"}].map(c => (
                  <th key={c.h} onClick={() => c.k && toggleSort(c.k)}
                    className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider ${c.k ? "cursor-pointer select-none" : ""}`}
                    style={{ color: isDark ? "#64748b" : "#94a3b8" }}>
                    {c.h}{c.k && sortKey === c.k && <span className="ml-1" style={{ color: "#14b8a6" }}>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const si = sentInfo(b.sentiment);
                return (
                  <tr key={b.id} onClick={() => { setSel(b); onToast(`Opened: ${b.name}`, "info"); }}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"}` }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>{b.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: isDark ? "#475569" : "#94a3b8" }}>{b.id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: isDark ? "#cbd5e1" : "#475569" }}>{b.loan}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${b.riskScore}%`, background:riskColor(b.riskScore) }}/>
                        </div>
                        <span className="text-xs font-bold" style={{ color:riskColor(b.riskScore) }}>{b.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold" style={{ color:riskColor(b.fraudScore) }}>{b.fraudScore}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={si.badge}>{si.icon} {b.sentiment}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={stratStyle(b.strategy)}>{b.strategy}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${b.daysOverdue > 30 ? "text-red-600 dark:text-red-400" : b.daysOverdue > 10 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>{b.daysOverdue}d</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {sel && <BorrowerModal b={sel} onClose={() => setSel(null)} />}
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGES
═══════════════════════════════════════════════════════════ */
function OverviewPage({ onToast }) {
  const { data: borrowers, loading: bLoad } = useFetch(api.fetchBorrowers);
  const ct = useChartTheme();
  const tt = { background:ct.ttBg, border:`1px solid ${ct.ttBorder}`, borderRadius:8, color:ct.ttColor, fontSize:11, boxShadow:"0 8px 24px rgba(0,0,0,0.35)", fontWeight:600 };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Loans" value="284712" sub="Across 28 states" accent="#3b82f6" trend={4.2}
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
        <MetricCard label="High Risk" value="41208" sub="14.5% of portfolio" accent="#ef4444" trend={-2.1}
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        <MetricCard label="Fraud Alerts" value="1847" sub="Live monitoring" accent="#f59e0b" trend={1.8}
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        <MetricCard label="Recovery Rate" value="74.3%" sub="Above target" accent="#10b981" trend={3.4}
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-5">
          <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-0.5">Recovery Trend vs Target</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">Last 7 months · National average</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={RECOVERY_TREND}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={ct.grid}/>
              <XAxis dataKey="month" tick={{ fill:ct.tick, fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:ct.tick, fontSize:11 }} axisLine={false} tickLine={false} domain={[55,85]}/>
              <Tooltip contentStyle={tt}/>
              <Area type="monotone" dataKey="rate" stroke="#14b8a6" strokeWidth={2.5} fill="url(#ag1)" name="Actual"/>
              <Area type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" fill="none" name="Target"/>
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-0.5">Risk Distribution</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mb-3">Current portfolio breakdown</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={RISK_DIST} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                {RISK_DIST.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={tt}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {RISK_DIST.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:s.color }}/>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{s.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{s.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-0.5">State-wise Default Rate</h3>
        <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">All states ranked by default percentage</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={STATES.slice(0,12)} margin={{ left:-20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false}/>
            <XAxis dataKey="code" tick={{ fill:ct.tick, fontSize:9 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:ct.tick, fontSize:10 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tt}/>
            <Bar dataKey="default" radius={[4,4,0,0]} name="Default %">
              {STATES.slice(0,12).map((e,i) => <Cell key={i} fill={stateColor(e.default)}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <BorrowerTable borrowers={borrowers} loading={bLoad} onToast={onToast}/>
    </div>
  );
}

/* ─── RISK PAGE ─── */
function RiskPage() {
  const { data: borrowers, loading } = useFetch(api.fetchBorrowers);
  const ct = useChartTheme();
  const tt = { background:ct.ttBg, border:`1px solid ${ct.ttBorder}`, borderRadius:8, color:ct.ttColor, fontSize:11, boxShadow:"0 8px 24px rgba(0,0,0,0.35)", fontWeight:600 };
  const topRisk = useMemo(() => (borrowers || []).sort((a,b) => b.riskScore - a.riskScore).slice(0, 6), [borrowers]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Avg Risk Score"   value="52.4" sub="Portfolio average"     accent="#ef4444"/>
        <MetricCard label="High Risk Count"  value="41208" sub="Risk score > 70"       accent="#f97316" trend={-2.1}/>
        <MetricCard label="Fraud-Risk Overlap" value="18.2%" sub="Cross-flagged cases"  accent="#f59e0b"/>
        <MetricCard label="Recovery (High Risk)" value="44.1%" sub="Below national avg" accent="#3b82f6"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk trend */}
        <GlassCard className="p-5">
          <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-0.5">Risk Score Trend</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">Average across all borrowers</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[
              {month:"Aug",avg:56},{month:"Sep",avg:54},{month:"Oct",avg:57},{month:"Nov",avg:55},
              {month:"Dec",avg:53},{month:"Jan",avg:52},{month:"Feb",avg:50},
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={ct.grid}/>
              <XAxis dataKey="month" tick={{ fill:ct.tick, fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:ct.tick, fontSize:11 }} axisLine={false} tickLine={false} domain={[44,62]}/>
              <Tooltip contentStyle={tt}/>
              <Line type="monotone" dataKey="avg" stroke="#ef4444" strokeWidth={2.5} dot={{ fill:"#ef4444", r:3 }} name="Avg Risk Score"/>
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* SHAP explanation */}
        <GlassCard className="p-5">
          <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-0.5">SHAP Feature Importance</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">Key drivers of risk prediction</p>
          <div className="space-y-3">
            {SHAP_FEATURES.map((f, i) => (
              <div key={f.name} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 w-40 flex-shrink-0 truncate">{f.name}</span>
                <div className="flex-1 h-5 rounded-md bg-slate-100 dark:bg-slate-800/50 overflow-hidden relative">
                  <div className="h-full rounded-md transition-all duration-700"
                    style={{ width:`${f.value * 280}%`, background: f.impact === "negative" ? "#ef444488" : "#10b98188",
                    borderRight: `2px solid ${f.impact === "negative" ? "#ef4444" : "#10b981"}`,
                    animationDelay: `${i * 80}ms` }}/>
                </div>
                <span className="text-xs font-bold w-8 text-right flex-shrink-0"
                  style={{ color: f.impact === "negative" ? "#ef4444" : "#10b981" }}>
                  {f.impact === "negative" ? "-" : "+"}{f.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-white/8">
            <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-red-400"/><span className="text-xs text-slate-500 dark:text-slate-400">Risk-increasing</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-1.5 rounded bg-emerald-400"/><span className="text-xs text-slate-500 dark:text-slate-400">Risk-decreasing</span></div>
          </div>
        </GlassCard>
      </div>

      {/* Top risky borrowers */}
      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-0.5">Highest Risk Borrowers</h3>
        <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">Sorted by composite risk score</p>
        {loading ? (
          <div className="space-y-2">{Array(6).fill(0).map((_,i) => <Shimmer key={i} className="h-14"/>)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topRisk.map((b, i) => (
              <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 hover:border-red-400/30 transition-all">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${riskColor(b.riskScore)},${riskColor(b.riskScore)}88)` }}>
                  {i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 dark:text-white text-sm font-semibold truncate">{b.name}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs">{b.state} · {b.loan} · {b.daysOverdue}d overdue</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black stat-number" style={{ color:riskColor(b.riskScore) }}>{b.riskScore}</p>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${stratStyle(b.strategy)}`}>{b.riskLabel.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Risk by state chart */}
      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-0.5">State Risk vs Recovery Matrix</h3>
        <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">Default rate vs recovery performance</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={STATES.slice(0,10)} margin={{ left:-20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false}/>
            <XAxis dataKey="code" tick={{ fill:ct.tick, fontSize:9 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:ct.tick, fontSize:10 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tt}/>
            <Bar dataKey="default" name="Default %" fill="#ef4444" opacity={0.7} radius={[3,3,0,0]}/>
            <Bar dataKey="fraud" name="Fraud %" fill="#f59e0b" opacity={0.7} radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

/* ─── GEO PAGE ─── */
function GeoPage() {
  const { data: stateData, loading } = useFetch(api.fetchStates);
  const [layer, setLayer] = useState("default");
  const ct = useChartTheme();
  const tt = { background:ct.ttBg, border:`1px solid ${ct.ttBorder}`, borderRadius:8, color:ct.ttColor, fontSize:11, boxShadow:"0 8px 24px rgba(0,0,0,0.35)", fontWeight:600 };

  return (
    <div className="space-y-5">
      <div className="flex gap-3 items-center flex-wrap">
        {[{id:"default",label:"Default Risk"},{id:"fraud",label:"Fraud Risk"},{id:"recovery",label:"Recovery Rate"}].map(l => (
          <button key={l.id} onClick={() => setLayer(l.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all
              ${layer === l.id
                ? "bg-teal-500/20 border-teal-500/50 text-teal-600 dark:text-teal-400"
                : "border-slate-300 dark:border-white/10 text-slate-500 hover:border-slate-400 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white"}`}>
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-3 overflow-hidden">
          {loading
            ? <div className="h-96 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent" style={{animation:"spin 0.8s linear infinite"}}/>
              </div>
            : <IndiaHeatmap stateData={stateData} layer={layer}/>}
        </GlassCard>

        <GlassCard className="p-5 overflow-y-auto" style={{ maxHeight:480 }}>
          <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-3">State Rankings</h3>
          {loading
            ? <div className="space-y-2">{Array(10).fill(0).map((_,i) => <Shimmer key={i} className="h-8"/>)}</div>
            : (stateData || []).sort((a,b) => b.default - a.default).map((s, i) => (
              <div key={s.state} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
                <span className="text-xs text-slate-400 dark:text-slate-600 w-5">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-900 dark:text-white font-semibold truncate">{s.state}</span>
                    <span className="text-xs font-bold ml-1 flex-shrink-0" style={{ color:stateColor(s.default) }}>{s.default}%</span>
                  </div>
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width:`${s.default}%`, background:stateColor(s.default) }}/>
                  </div>
                </div>
              </div>
            ))}
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-4">Recovery vs Default — State Comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={STATES} margin={{ left:-20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false}/>
            <XAxis dataKey="code" tick={{ fill:ct.tick, fontSize:8 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:ct.tick, fontSize:10 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tt}/>
            <Bar dataKey="recovery" name="Recovery %" fill="#10b981" opacity={0.8} radius={[3,3,0,0]}/>
            <Bar dataKey="default" name="Default %" fill="#ef4444" opacity={0.7} radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

/* ─── FRAUD PAGE ─── */
function FraudPage({ onToast }) {
  const { data: alerts, loading } = useFetch(api.fetchFraud);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Alerts"     value="1847" sub="Requires review"      accent="#ef4444" trend={1.8}/>
        <MetricCard label="Avg Fraud Score"   value="62.4" sub="Threshold: 70"        accent="#f59e0b"/>
        <MetricCard label="Location Anomaly"  value="412"  sub="GPS mismatch"         accent="#f97316"/>
        <MetricCard label="Multi-Loan Flags"  value="889"  sub="Short-duration"       accent="#dc2626"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font">Live Fraud Alert Feed</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs">Real-time ML anomaly detection</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" style={{animation:"pulse2 2s infinite"}}/>
              <span className="text-xs text-red-500 dark:text-red-400 font-semibold">LIVE</span>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">{Array(5).fill(0).map((_,i) => <Shimmer key={i} className="h-16"/>)}</div>
          ) : (
            <div className="space-y-2">
              {(alerts || []).map(a => (
                <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 hover:border-red-400/40 dark:hover:border-red-500/30 transition-all">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.severity === "critical" ? "bg-red-500" : a.severity === "high" ? "bg-orange-500" : "bg-amber-500"}`}
                    style={a.severity === "critical" ? {animation:"pulse2 1s infinite"} : {}}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white text-sm font-semibold">{a.borrower}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs">{a.type} · {a.state} · {a.time}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold" style={{ color:riskColor(a.score) }}>Score: {a.score}</p>
                    <p className={`text-xs font-semibold capitalize ${a.severity === "critical" ? "text-red-600 dark:text-red-400" : a.severity === "high" ? "text-orange-600 dark:text-orange-400" : "text-amber-600 dark:text-amber-400"}`}>{a.severity}</p>
                  </div>
                  <button onClick={() => onToast(`Alert ${a.id} queued for review`, "warn")}
                    className="text-xs px-3 py-1.5 rounded-lg border border-red-400/40 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15 transition-colors flex-shrink-0">
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-3">Fraud Signal Weights</h3>
          <div className="space-y-4">
            {[
              { signal:"Location Anomaly",  weight:30, color:"#ef4444" },
              { signal:"Mobile Mismatch",   weight:25, color:"#f59e0b" },
              { signal:"Multiple Loans",    weight:25, color:"#f97316" },
              { signal:"High-Risk Cluster", weight:20, color:"#6366f1" },
            ].map(f => (
              <div key={f.signal}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400">{f.signal}</span>
                  <span className="text-xs font-bold" style={{ color:f.color }}>{f.weight}pts</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width:`${f.weight * 3.33}%`, background:f.color }}/>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ─── EMI PAGE ─── */
function EmiPage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Reminders Sent"    value="84200" sub="This month" accent="#3b82f6" trend={6.2}/>
        <MetricCard label="Response Rate"     value="68.4%" sub="WhatsApp + SMS" accent="#10b981" trend={2.1}/>
        <MetricCard label="SMS Delivered"     value="29100" sub="Regional languages" accent="#f59e0b"/>
        <MetricCard label="IVR Escalations"   value="4820" sub="No digital response" accent="#f97316"/>
      </div>

      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-4">Regional Language Matrix</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(LANGUAGES).filter(([k]) => k !== "DEFAULT").map(([code, l]) => (
            <div key={code} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 hover:border-teal-500/30 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400">{l.lang}</p>
                <span className="text-xs text-slate-400 dark:text-slate-600 font-mono bg-slate-100 dark:bg-slate-700/40 px-1.5 rounded">{code}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{l.msg}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { n:"01", t:"Salary Date Learning", d:"Detect salary credit via NEFT/IMPS regex. Rolling 3-month average → stable credit date D." },
          { n:"02", t:"Payment Pattern Analysis", d:"Track days between salary credit and EMI. Compute µ (mean lag) + σ (variance). Flag σ > 5 as irregular." },
          { n:"03", t:"Optimal Dispatch", d:"Send at D + µ − 3 days. Escalate cadence if no payment by D + µ + 2 days. Channel: WhatsApp → SMS → IVR → Field." },
        ].map(x => (
          <GlassCard key={x.n} className="p-4">
            <span className="text-4xl font-black text-slate-200 dark:text-slate-700/50 stat-number">{x.n}</span>
            <p className="text-slate-900 dark:text-white font-bold mt-1 mb-1.5 text-sm nav-font">{x.t}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{x.d}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* ─── STRATEGY PAGE ─── */
function StrategyPage() {
  const { isDark } = useTheme();
  const [fieldVisits,   setFieldVisits]   = useState(21);
  const [legalEsc,      setLegalEsc]      = useState(14);
  const [softReminder,  setSoftReminder]  = useState(38);
  const [restructuring, setRestructuring] = useState(27);
  const [focusState,    setFocusState]    = useState("UP");
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiAnalysis,    setAiAnalysis]    = useState("");

  const baseRecovery = 74.3;
  const fvBoost      = ((fieldVisits   - 21) * 0.18).toFixed(1);
  const leBoost      = ((legalEsc      - 14) * 0.12).toFixed(1);
  const srBoost      = ((softReminder  - 38) * 0.06).toFixed(1);
  const rsBoost      = ((restructuring - 27) * 0.14).toFixed(1);
  const totalBoost   = (parseFloat(fvBoost)+parseFloat(leBoost)+parseFloat(srBoost)+parseFloat(rsBoost));
  const projRecovery = Math.min(99, Math.max(0, baseRecovery + totalBoost)).toFixed(1);
  const costDelta    = ((fieldVisits - 21) * 0.8 + (legalEsc - 14) * 1.4).toFixed(1);
  const npaReduction = (totalBoost * 0.31).toFixed(1);
  const stateData    = STATES.find(s => s.code === focusState) || STATES[0];

  const runAI = async () => {
    setAiLoading(true); setAiAnalysis("");
    try {
      const prompt = `Given these collection strategy allocations for ${stateData.state} (default rate: ${stateData.default}%, fraud: ${stateData.fraud}%, recovery: ${stateData.recovery}%):
- Soft Reminder: ${softReminder}%, Restructuring: ${restructuring}%, Field Visits: ${fieldVisits}%, Legal Escalation: ${legalEsc}%
Projected recovery: ${projRecovery}% (${totalBoost >= 0 ? "+" : ""}${totalBoost.toFixed(1)}% vs baseline 74.3%). Cost change: ${costDelta >= 0 ? "+" : ""}${costDelta}% opex.
In 80 words, give a sharp professional analysis: Is this optimal? What one change would most improve ROI? Consider RBI norms and borrower demographics.`;
      const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: userText }]
        }
      ]
    })
  }
);

const data = await res.json();

const reply =
  data?.candidates?.[0]?.content?.parts?.[0]?.text ||
  "Sorry, I couldn't process that.";
  };

  const tc = isDark ? "#f1f5f9" : "#0f172a";
  const sc = isDark ? "#64748b" : "#94a3b8";
  const bd = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const bg2 = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";

  const SliderRow = ({ label, value, setValue, color, min=0, max=60, description }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:7 }}>
        <div>
          <span style={{ fontSize:13, fontWeight:600, color:tc, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{label}</span>
          <span style={{ fontSize:11, color:sc, marginLeft:8 }}>{description}</span>
        </div>
        <span style={{ fontSize:17, fontWeight:800, color, fontFamily:"'Plus Jakarta Sans',sans-serif", fontVariantNumeric:"lining-nums tabular-nums" }}>{value}%</span>
      </div>
      <div style={{ position:"relative", height:6 }}>
        <div style={{ position:"absolute", inset:0, borderRadius:4, background:isDark?"rgba(255,255,255,0.08)":"#e2e8f0" }}/>
        <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${(value-min)/(max-min)*100}%`, borderRadius:4, background:`linear-gradient(90deg,${color}88,${color})`, transition:"width 0.15s" }}/>
        <input type="range" min={min} max={max} value={value} onChange={e=>setValue(Number(e.target.value))}
          style={{ position:"absolute", inset:0, width:"100%", opacity:0, cursor:"pointer", height:"100%", margin:0 }}/>
      </div>
    </div>
  );

  const ResultCard = ({ label, value, unit, delta, color }) => (
    <div style={{ background:bg2, border:`1px solid ${bd}`, borderLeft:`3px solid ${color}`, borderRadius:12, padding:"14px 16px" }}>
      <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:sc, marginBottom:6 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
        <span style={{ fontSize:22, fontWeight:900, color, fontFamily:"'Plus Jakarta Sans',sans-serif", fontVariantNumeric:"lining-nums tabular-nums" }}>{value}</span>
        <span style={{ fontSize:12, color:sc }}>{unit}</span>
      </div>
      {delta !== undefined && (
        <div style={{ fontSize:11, fontWeight:600, color:parseFloat(delta)>=0?"#10b981":"#ef4444", marginTop:4 }}>
          {parseFloat(delta)>=0?"▲":"▼"} {Math.abs(delta)}% vs baseline
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── AI Decision Engine ── */}
      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-1">Decision Centre</h3>
        <p className="text-slate-400 dark:text-slate-500 text-xs mb-5">Rule-based + ML hybrid · 3 inputs → 1 strategy</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { s:"Soft Reminder",    c:"#10b981", i:"◎", t:"Risk < 45 AND Sentiment ≠ Angry AND Fraud < 30", a:"Auto WhatsApp + regional SMS. 3 days before EMI due." },
            { s:"Restructuring",    c:"#3b82f6", i:"◈", t:"Risk 45–70 OR Sentiment = Hardship, history > 6m", a:"Generate restructuring proposal. Assign relationship manager." },
            { s:"Field Visit",      c:"#f59e0b", i:"◉", t:"Risk 50–70 AND Sentiment = Ignoring, overdue > 15d", a:"Dispatch field recovery agent. Generate visit report form." },
            { s:"Legal Escalation", c:"#ef4444", i:"◆", t:"Risk > 70 OR Fraud > 65 OR overdue > 90 days", a:"Trigger SARFAESI notice. Escalate to legal cell." },
          ].map(x => (
            <div key={x.s} className="rounded-xl p-4 border hover:scale-[1.02] transition-transform bg-slate-50 dark:bg-slate-800/20" style={{ borderColor:`${x.c}40` }}>
              <div className="text-3xl mb-3" style={{ color:x.c }}>{x.i}</div>
              <p className="text-slate-900 dark:text-white font-black text-sm mb-2 nav-font">{x.s}</p>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed"><span className="text-slate-700 dark:text-slate-300 font-semibold">Trigger: </span>{x.t}</p>
              <p className="text-xs leading-relaxed" style={{ color:x.c }}>{x.a}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Simulator + Distribution row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Sliders */}
        <GlassCard className="p-5">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div>
              <h3 style={{ fontSize:13, fontWeight:700, color:tc, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Strategy Simulator</h3>
              <p style={{ fontSize:11, color:sc, marginTop:2 }}>Drag sliders · see projected portfolio impact</p>
            </div>
            <select value={focusState} onChange={e=>setFocusState(e.target.value)}
              style={{ fontSize:11, padding:"5px 10px", borderRadius:8, border:`1px solid ${bd}`, background:isDark?"rgba(30,41,59,0.8)":bg2, color:tc, cursor:"pointer" }}>
              {STATES.map(s => <option key={s.code} value={s.code}>{s.state}</option>)}
            </select>
          </div>
          <SliderRow label="Soft Reminder"    value={softReminder}  setValue={setSoftReminder}  color="#10b981" description="WhatsApp/SMS" />
          <SliderRow label="Restructuring"    value={restructuring} setValue={setRestructuring} color="#f59e0b" description="EMI renegotiation" />
          <SliderRow label="Field Visits"     value={fieldVisits}   setValue={setFieldVisits}   color="#3b82f6" description="Agent visits" />
          <SliderRow label="Legal Escalation" value={legalEsc}      setValue={setLegalEsc}      color="#ef4444" description="SARFAESI action" max={40} />
          <div style={{ marginTop:8, padding:"8px 12px", borderRadius:8, background:isDark?"rgba(255,255,255,0.04)":"#f1f5f9", border:`1px solid ${bd}`, display:"flex", justifyContent:"space-between", fontSize:11 }}>
            <span style={{ color:sc }}>Total allocation</span>
            <span style={{ fontWeight:700, color:softReminder+restructuring+fieldVisits+legalEsc>100?"#ef4444":"#10b981" }}>
              {softReminder+restructuring+fieldVisits+legalEsc}% {softReminder+restructuring+fieldVisits+legalEsc>100?"⚠ Over 100%":"✓"}
            </span>
          </div>
        </GlassCard>

        {/* Right: results + AI + distribution */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Result cards */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <ResultCard label="Projected Recovery" value={projRecovery} unit="%" delta={totalBoost.toFixed(1)} color="#10b981"/>
            <ResultCard label="NPA Reduction"       value={npaReduction} unit="% pts" color="#3b82f6"/>
            <ResultCard label="Cost Delta"          value={costDelta>=0?`+${costDelta}`:costDelta} unit="% opex" color={costDelta>=0?"#f59e0b":"#10b981"}/>
            <ResultCard label="Focus State Default" value={stateData.default} unit="%" color="#ef4444"/>
          </div>

          {/* AI Analysis */}
          <GlassCard className="p-4" style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:tc, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>🤖 AI Analysis</span>
              <button onClick={runAI} disabled={aiLoading}
                style={{ fontSize:11, padding:"5px 12px", borderRadius:8, fontWeight:600, border:"none", cursor:aiLoading?"not-allowed":"pointer",
                  background:aiLoading?(isDark?"rgba(255,255,255,0.06)":"#e2e8f0"):"linear-gradient(135deg,#14b8a6,#0ea5e9)",
                  color:aiLoading?(isDark?"#475569":"#94a3b8"):"white", display:"flex", alignItems:"center", gap:5 }}>
                {aiLoading?(<><div style={{ width:10,height:10,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite" }}/> Analysing</>):"Analyse ✦"}
              </button>
            </div>
            {aiAnalysis
              ? <p style={{ fontSize:12, lineHeight:1.7, color:isDark?"#cbd5e1":"#475569", margin:0 }}>{aiAnalysis}</p>
              : <p style={{ fontSize:12, color:sc, fontStyle:"italic", lineHeight:1.6 }}>Adjust sliders and click <strong style={{ color:"#14b8a6" }}>Analyse ✦</strong> to get a Claude-powered assessment for {stateData.state}.</p>
            }
          </GlassCard>

          {/* Strategy Distribution */}
          <GlassCard className="p-4">
            <p style={{ fontSize:12, fontWeight:700, color:tc, marginBottom:10, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Current Distribution</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {STRATEGY_DIST.map(s => (
                  <div key={s.name}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:7, height:7, borderRadius:"50%", background:s.color }}/>
                        <span style={{ fontSize:11, color:isDark?"#cbd5e1":"#475569" }}>{s.name}</span>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:tc }}>{s.value}%</span>
                    </div>
                    <div style={{ height:5, background:isDark?"rgba(255,255,255,0.07)":"#e2e8f0", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${s.value}%`, background:s.color, borderRadius:4 }}/>
                    </div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={STRATEGY_DIST} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value">
                    {STRATEGY_DIST.map((e,i) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── Sentiment Analysis ── */}
      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-3">Sentiment Analysis — NLP Keywords</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { s:"Cooperative", kw:["okay","will pay","arrange","soon"], c:"#10b981", sc:"0–30" },
            { s:"Angry",       kw:["harassment","complaint","legal"],  c:"#ef4444", sc:"70–100" },
            { s:"Hardship",    kw:["job loss","hospital","can't pay"], c:"#f59e0b", sc:"31–60" },
            { s:"Ignoring",    kw:["no reply","bounce","cut call"],    c:"#6366f1", sc:"61–69" },
          ].map(x => (
            <div key={x.s} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5">
              <p className="text-xs font-bold mb-0.5" style={{ color:x.c }}>{x.s}</p>
              <p className="text-xs text-slate-400 mb-2">Score: {x.sc}</p>
              <div className="flex flex-wrap gap-1">
                {x.kw.map(k => <span key={k} className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400">{k}</span>)}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

    </div>
  );
}

/* ─── REPORTS PAGE ─── */
function ReportsPage() {
  const ct = useChartTheme();
  const { isDark } = useTheme();
  const tt = { background:ct.ttBg, border:`1px solid ${ct.ttBorder}`, borderRadius:8, color:ct.ttColor, fontSize:11, boxShadow:"0 8px 24px rgba(0,0,0,0.35)", fontWeight:600 };

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [reportType, setReportType] = useState("monthly");
  const [includeOptions, setIncludeOptions] = useState({
    executive:true, riskMatrix:true, fraudAlerts:true,
    stateBreakdown:true, borrowerList:false, recommendations:true,
  });
  const [progress, setProgress] = useState(0);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const toggleOption = k => setIncludeOptions(o => ({...o,[k]:!o[k]}));

  const buildReportHtml = () => {
    const now     = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
    const totalLoans    = STATES.reduce((s,x) => s+x.loans, 0);
    const avgDefault    = (STATES.reduce((s,x) => s+x.default,0)/STATES.length).toFixed(1);
    const highRiskStates= STATES.filter(x => x.risk==="high");
    const topFraud      = [...STATES].sort((a,b)=>b.fraud-a.fraud).slice(0,3);
    const bestRecovery  = [...STATES].sort((a,b)=>b.recovery-a.recovery).slice(0,3);
    const latestTrend   = RECOVERY_TREND[RECOVERY_TREND.length-1];
    const highRiskBrw   = BORROWERS.filter(b=>b.riskLabel==="high");
    const criticalAlerts= FRAUD_ALERTS.filter(a=>a.severity==="critical"||a.severity==="high");
    const riskColor = r => r==="high"?"#ef4444":r==="medium"?"#f59e0b":"#10b981";
    const sevColor  = s => s==="critical"?"#ef4444":s==="high"?"#f97316":s==="medium"?"#f59e0b":"#10b981";

    let sections = "";
    if (includeOptions.executive) {
      sections += `<div class="section"><h2>1. Executive Summary</h2>
        <p>${aiSummary || `National loan portfolio tracks <strong>${totalLoans.toLocaleString("en-IN")}</strong> active loans across <strong>${STATES.length} states</strong>. Recovery rate stands at <strong>${latestTrend.rate}%</strong> (Feb 2026), surpassing target of ${latestTrend.target}%. Avg default: <strong>${avgDefault}%</strong>. Improved from 61% (Aug) to ${latestTrend.rate}% (Feb).`}</p>
        <div class="kpi-row">
          <div class="kpi"><div class="kv" style="color:#3b82f6">${totalLoans.toLocaleString("en-IN")}</div><div class="kl">Active Loans</div></div>
          <div class="kpi"><div class="kv" style="color:#10b981">${latestTrend.rate}%</div><div class="kl">Recovery Rate</div></div>
          <div class="kpi"><div class="kv" style="color:#ef4444">${avgDefault}%</div><div class="kl">Avg Default</div></div>
          <div class="kpi"><div class="kv" style="color:#f97316">${FRAUD_ALERTS.length}</div><div class="kl">Fraud Alerts</div></div>
        </div></div>`;
    }
    if (includeOptions.riskMatrix) {
      sections += `<div class="section"><h2>2. Risk Score Matrix</h2>
        <table><thead><tr><th>State</th><th>Default%</th><th>Fraud%</th><th>Recovery%</th><th>Risk</th><th>Loans</th></tr></thead><tbody>
        ${STATES.map(s=>`<tr><td><b>${s.state}</b></td><td>${s.default}%</td><td>${s.fraud}%</td><td>${s.recovery}%</td>
          <td><span class="badge" style="background:${riskColor(s.risk)}22;color:${riskColor(s.risk)}">${s.risk.toUpperCase()}</span></td>
          <td>${s.loans.toLocaleString("en-IN")}</td></tr>`).join("")}
        </tbody></table>
        <p class="note">High Risk: ${highRiskStates.map(s=>s.state).join(", ")} &nbsp;|&nbsp; Best: ${bestRecovery.map(s=>s.state+" ("+s.recovery+"%)").join(", ")}</p></div>`;
    }
    if (includeOptions.fraudAlerts) {
      sections += `<div class="section"><h2>3. Fraud Alert Log</h2>
        <p>Active: <b>${FRAUD_ALERTS.length}</b> &nbsp;|&nbsp; Critical/High: <b>${criticalAlerts.length}</b> &nbsp;|&nbsp; Top risk: ${topFraud.map(s=>s.state+" "+s.fraud+"%").join(", ")}</p>
        <table><thead><tr><th>ID</th><th>Borrower</th><th>Type</th><th>Score</th><th>State</th><th>Severity</th></tr></thead><tbody>
        ${FRAUD_ALERTS.map(a=>`<tr><td><code>${a.id}</code></td><td>${a.borrower}</td><td>${a.type}</td><td><b>${a.score}</b></td><td>${a.state}</td>
          <td><span class="badge" style="background:${sevColor(a.severity)}22;color:${sevColor(a.severity)}">${a.severity.toUpperCase()}</span></td></tr>`).join("")}
        </tbody></table></div>`;
    }
    if (includeOptions.stateBreakdown) {
      sections += `<div class="section"><h2>4. Recovery Trend & Strategy</h2>
        <table><thead><tr><th>Month</th><th>Recovery%</th><th>Target%</th><th>vs Target</th><th>Loans</th></tr></thead><tbody>
        ${RECOVERY_TREND.map(m=>`<tr><td><b>${m.month}</b></td>
          <td style="color:${m.rate>=m.target?"#10b981":"#ef4444"}">${m.rate}%</td><td>${m.target}%</td>
          <td style="color:${m.rate>=m.target?"#10b981":"#ef4444"}">${m.rate>=m.target?"▲ +"+(m.rate-m.target)+"pp":"▼ "+(m.rate-m.target)+"pp"}</td>
          <td>${m.loans.toLocaleString("en-IN")}</td></tr>`).join("")}
        </tbody></table>
        <table style="margin-top:10px"><thead><tr><th>Strategy</th><th>%</th><th>Bar</th></tr></thead><tbody>
        ${STRATEGY_DIST.map(s=>`<tr><td>${s.name}</td><td><b>${s.value}%</b></td>
          <td><div style="height:8px;width:${s.value*3}px;background:${s.color};border-radius:3px"></div></td></tr>`).join("")}
        </tbody></table></div>`;
    }
    if (includeOptions.borrowerList) {
      sections += `<div class="section"><h2>5. Borrower Risk Registry</h2>
        <p>Total: <b>${BORROWERS.length}</b> &nbsp;|&nbsp; High Risk: <b>${highRiskBrw.length}</b></p>
        <table><thead><tr><th>ID</th><th>Name</th><th>State</th><th>Loan</th><th>EMI</th><th>Risk</th><th>Overdue</th><th>Strategy</th></tr></thead><tbody>
        ${BORROWERS.map(b=>`<tr><td><code>${b.id}</code></td><td>${b.name}</td><td>${b.state}</td><td>${b.loan}</td><td>${b.emi}</td>
          <td><span class="badge" style="background:${riskColor(b.riskLabel)}22;color:${riskColor(b.riskLabel)}">${b.riskLabel.toUpperCase()}</span></td>
          <td>${b.daysOverdue}d</td><td>${b.strategy}</td></tr>`).join("")}
        </tbody></table></div>`;
    }
    if (includeOptions.recommendations) {
      sections += `<div class="section"><h2>6. AI Recommendations</h2>
        <div class="rec"><span class="rn">01</span><div><b>Priority:</b> Bihar &amp; Jharkhand default rates above 33%. Immediate field visit escalation and restructuring campaigns needed.</div></div>
        <div class="rec"><span class="rn">02</span><div><b>Opportunity:</b> Kerala &amp; Gujarat recovery &gt;88%. Replicate their soft reminder cadence nationally.</div></div>
        <div class="rec"><span class="rn">03</span><div><b>Fraud:</b> ${criticalAlerts.length} critical/high alerts require 24hr resolution. UP location anomaly cases need cluster investigation.</div></div>
        <div class="rec"><span class="rn">04</span><div><b>Trend:</b> Recovery up +16pp since Aug 2025. Maintain mix: ${STRATEGY_DIST.map(s=>s.name+" "+s.value+"%").join(", ")}.</div></div>
        </div>`;
    }

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:11px;color:#1e293b;line-height:1.5;padding:20px}
.hdr{background:linear-gradient(135deg,#0f172a,#1e3a5f);color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center}
.hdr h1{font-size:16px;font-weight:800}.hdr-sub{font-size:9.5px;opacity:.7;margin-top:2px}
.hdr-meta{text-align:right;font-size:9px;opacity:.75;line-height:1.8}
.section{margin-bottom:18px}
h2{font-size:12px;font-weight:700;color:#0f172a;border-left:3px solid #14b8a6;padding-left:8px;margin-bottom:8px}
p{margin-bottom:6px;color:#475569;font-size:10.5px}
table{width:100%;border-collapse:collapse;margin:6px 0;font-size:10px}
th{background:#f1f5f9;color:#475569;font-weight:700;text-align:left;padding:5px 8px;border-bottom:2px solid #e2e8f0;font-size:9px;text-transform:uppercase}
td{padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#334155}
.badge{display:inline-block;padding:1px 6px;border-radius:20px;font-size:9px;font-weight:700}
code{font-family:monospace;background:#f1f5f9;padding:1px 4px;border-radius:3px;font-size:9px}
.kpi-row{display:flex;gap:8px;margin:10px 0}
.kpi{flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:9px;text-align:center}
.kv{font-size:17px;font-weight:900;line-height:1;margin-bottom:2px}
.kl{font-size:8.5px;color:#64748b;text-transform:uppercase;letter-spacing:.07em;font-weight:600}
.note{color:#64748b;font-size:9.5px;margin-top:4px}
.rec{display:flex;gap:10px;margin-bottom:7px;padding:8px 11px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px}
.rn{font-size:16px;font-weight:900;color:#14b8a6;flex-shrink:0;line-height:1.2}
.ftr{margin-top:16px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;color:#94a3b8;font-size:9px}
</style></head><body>
<div class="hdr">
  <div><h1>LendQuant AI</h1><div class="hdr-sub">${reportType.charAt(0).toUpperCase()+reportType.slice(1)} Intelligence Report &middot; FY 2025&ndash;26</div></div>
  <div class="hdr-meta">Generated: ${dateStr} at ${timeStr}<br/>${STATES.length} States &middot; ${totalLoans.toLocaleString("en-IN")} Active Loans</div>
</div>
${sections}
<div class="ftr"><span>CONFIDENTIAL &mdash; LendQuant AI</span><span>Auto-generated &middot; ${dateStr}</span></div>
</body></html>`;
  };

  const generateReport = async () => {
    setGenerating(true); setProgress(0); setShowPreview(false);
    const steps = [{ p:15 },{ p:30 },{ p:50 },{ p:65 },{ p:80 },{ p:95 },{ p:100 }];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 380));
      setProgress(step.p);
    }
    setPreviewHtml(buildReportHtml());
    setGenerating(false); setGenerated(true);
  };

  const generateAISummary = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{role:"user", content:`Write a professional executive summary paragraph for a LendQuant AI ${reportType} risk report. Include: national recovery rate 74.3% (above target), 284,712 active loans, 41,208 high-risk cases (14.5%), fraud alerts 1,847, top risk states Bihar (38%), UP (34%), best performers Kerala (8%), Gujarat (9%). Key achievement: recovery trend improved from 61% (Aug) to 77% (Feb). Recommend 2 strategic priorities. Professional banking tone. 100 words max.`}],
        }),
      });
      const data = await res.json();
      setAiSummary(data.content?.map(b=>b.text||"").join("") || "Summary unavailable.");
    } catch { setAiSummary("⚠ Could not generate summary."); }
    finally { setAiLoading(false); }
  };

  const downloadSimulated = () => {
    setPdfLoading(true);
    try {
      const html = buildReportHtml();
      // Use srcdoc on the existing preview iframe — no new tabs, no popups
      setPreviewHtml(html);
      setShowPreview(true);
      // Scroll to preview
      setTimeout(() => {
        document.getElementById("report-preview-frame")?.scrollIntoView({ behavior:"smooth", block:"start" });
      }, 200);
    } finally {
      setPdfLoading(false);
    }
  };

  const printReport = () => {
    const iframe = document.getElementById("report-preview-frame");
    if (!iframe) return;
    const iw = iframe.contentWindow;
    iw.focus();
    iw.print();
  };

  const tc = isDark ? "#f1f5f9" : "#0f172a";
  const sc = isDark ? "#64748b" : "#94a3b8";
  const bd = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const bg2 = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";

  const REPORT_TYPES = [
    { id:"monthly",   label:"Monthly",        desc:"Full overview · 12 pages",    icon:"📅" },
    { id:"state",     label:"State-wise",      desc:"Risk breakdown · 8 pages",    icon:"🗺" },
    { id:"fraud",     label:"Fraud Intel",     desc:"Alerts & patterns · 6 pages", icon:"🔍" },
    { id:"executive", label:"Executive",       desc:"C-suite snapshot · 2 pages",  icon:"👔" },
  ];
  const SECTIONS = [
    { key:"executive",      label:"Executive Summary",    icon:"📋" },
    { key:"riskMatrix",     label:"Risk Score Matrix",     icon:"📊" },
    { key:"fraudAlerts",    label:"Fraud Alert Log",       icon:"⚠" },
    { key:"stateBreakdown", label:"State-wise Breakdown",  icon:"🗺" },
    { key:"borrowerList",   label:"Borrower Risk Registry",icon:"👥" },
    { key:"recommendations",label:"AI Recommendations",    icon:"🤖" },
  ];

  return (
    <div className="space-y-5">

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { l:"Total Processed",  v:"2,84,712",  s:"FY 2025–26",       accent:"#3b82f6" },
          { l:"Amount Recovered", v:"₹1,847 Cr", s:"YTD recovery",     accent:"#10b981" },
          { l:"NPA Rate Reduced", v:"−3.2%",      s:"vs last FY",       accent:"#ef4444" },
          { l:"Avg Recovery Time",v:"18.4 days",  s:"Per case",         accent:"#f59e0b" },
          { l:"Legal Cases Filed",v:"4,120",       s:"SARFAESI notices", accent:"#8b5cf6" },
          { l:"Field Visits",     v:"28,400",      s:"This quarter",     accent:"#14b8a6" },
        ].map(m => (
          <GlassCard key={m.l} className="p-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ background:`radial-gradient(ellipse at 85% 0%,${m.accent}14,transparent 60%)` }}/>
            <div className="absolute bottom-0 left-0 h-0.5 w-full"
              style={{ background:`linear-gradient(90deg,${m.accent},transparent)` }}/>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color:"#64748b" }}>{m.l}</p>
            <p className="stat-number font-black leading-none mb-1.5" style={{ fontSize:"1.35rem", fontVariantNumeric:"lining-nums tabular-nums", fontFeatureSettings:'"lnum" 1,"tnum" 1' }}>{m.v}</p>
            <p className="text-xs mt-0.5" style={{ color:"#94a3b8" }}>{m.s}</p>
          </GlassCard>
        ))}
      </div>

      {/* ── Recovery Trend Chart ── */}
      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-4">Recovery vs Loan Volume Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={RECOVERY_TREND}>
            <defs>
              <linearGradient id="rg3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={ct.grid}/>
            <XAxis dataKey="month" tick={{ fill:ct.tick, fontSize:11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:ct.tick, fontSize:11 }} axisLine={false} tickLine={false} domain={[55,85]}/>
            <Tooltip contentStyle={tt}/>
            <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5} fill="url(#rg3)" name="Recovery %"/>
            <Area type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Target"/>
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* ── Export Section ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Left: Config */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <GlassCard className="p-5">
            <p style={{ fontSize:12, fontWeight:700, color:tc, marginBottom:12, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Report Type</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {REPORT_TYPES.map(r => (
                <div key={r.id} onClick={() => { setReportType(r.id); setGenerated(false); }}
                  style={{ padding:12, borderRadius:10, cursor:"pointer",
                    background: reportType===r.id ? "rgba(20,184,166,0.08)" : bg2,
                    border:`1px solid ${reportType===r.id ? "rgba(20,184,166,0.35)" : bd}`,
                    transition:"all 0.15s" }}>
                  <span style={{ fontSize:20 }}>{r.icon}</span>
                  <p style={{ fontSize:12, fontWeight:700, color:reportType===r.id?"#14b8a6":tc, margin:"6px 0 2px", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{r.label}</p>
                  <p style={{ fontSize:10, color:sc, margin:0 }}>{r.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <p style={{ fontSize:12, fontWeight:700, color:tc, marginBottom:12, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Include Sections</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {SECTIONS.map(s => (
                <label key={s.key} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"8px 10px", borderRadius:8,
                  background: includeOptions[s.key] ? "rgba(20,184,166,0.06)" : "transparent",
                  border:`1px solid ${includeOptions[s.key] ? "rgba(20,184,166,0.2)" : "transparent"}`, transition:"all 0.12s" }}>
                  <div style={{ width:18, height:18, borderRadius:5, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                    background: includeOptions[s.key] ? "#14b8a6" : "transparent",
                    border:`2px solid ${includeOptions[s.key] ? "#14b8a6" : bd}`, transition:"all 0.12s" }}
                    onClick={() => toggleOption(s.key)}>
                    {includeOptions[s.key] && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontSize:12, color:includeOptions[s.key]?tc:sc }}>{s.icon} {s.label}</span>
                </label>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right: AI Summary + Generate + Recent */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <GlassCard className="p-5">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <p style={{ fontSize:12, fontWeight:700, color:tc, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>✨ AI Executive Summary</p>
              <button onClick={generateAISummary} disabled={aiLoading}
                style={{ fontSize:11, padding:"5px 12px", borderRadius:8, cursor:aiLoading?"not-allowed":"pointer", fontWeight:600,
                  background: aiLoading?(isDark?"rgba(255,255,255,0.06)":"#e2e8f0"):"linear-gradient(135deg,#14b8a6,#0ea5e9)",
                  border:"none", color:aiLoading?(isDark?"#475569":"#94a3b8"):"white",
                  display:"flex", alignItems:"center", gap:5 }}>
                {aiLoading?(<><div style={{ width:10,height:10,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite" }}/>Writing</>):"Draft with AI ✦"}
              </button>
            </div>
            {aiSummary ? (
              <p style={{ fontSize:12, lineHeight:1.7, color:tc }}>{aiSummary}</p>
            ) : (
              <div style={{ background:bg2, border:`1px dashed ${bd}`, borderRadius:8, padding:16, textAlign:"center", color:sc, fontSize:12 }}>
                Click <strong style={{ color:"#14b8a6" }}>Draft with AI ✦</strong> to auto-generate an executive summary
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <p style={{ fontSize:12, fontWeight:700, color:tc, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Generate & Export</p>
                <p style={{ fontSize:11, color:sc, marginTop:2 }}>{Object.values(includeOptions).filter(Boolean).length} sections selected</p>
              </div>
              {generated && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"rgba(16,185,129,0.15)", color:"#10b981", fontWeight:700 }}>✓ Ready</span>}
            </div>
            {generating && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:11, color:sc }}>Generating report...</span>
                  <span style={{ fontSize:11, fontWeight:700, color:"#14b8a6" }}>{progress}%</span>
                </div>
                <div style={{ height:8, background:isDark?"rgba(255,255,255,0.08)":"#e2e8f0", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#14b8a6,#0ea5e9)", borderRadius:4, transition:"width 0.4s ease", boxShadow:"0 0 8px rgba(20,184,166,0.5)" }}/>
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <button onClick={generateReport} disabled={generating}
                style={{ flex:1, minWidth:120, padding:"10px 12px", borderRadius:10, border:"none",
                  background: generating?"rgba(255,255,255,0.06)":"linear-gradient(135deg,#3b82f6,#1d4ed8)",
                  color:generating?sc:"white", cursor:generating?"not-allowed":"pointer",
                  fontSize:12, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif",
                  boxShadow:generating?"none":"0 4px 14px rgba(59,130,246,0.4)" }}>
                {generating ? "⏳ Generating..." : "📄 Generate"}
              </button>
              {generated && (<>
                <button onClick={() => setShowPreview(p => !p)}
                  style={{ flex:1, minWidth:120, padding:"10px 12px", borderRadius:10, border:`1px solid ${showPreview?"#14b8a6":bd}`,
                    background: showPreview?"rgba(20,184,166,0.12)":bg2,
                    color: showPreview?"#14b8a6":tc, cursor:"pointer",
                    fontSize:12, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  {showPreview ? "🔼 Hide Preview" : "👁 Open PDF Preview"}
                </button>
                <button onClick={downloadSimulated}
                  style={{ flex:1, minWidth:120, padding:"10px 12px", borderRadius:10, border:"none",
                    background:"linear-gradient(135deg,#10b981,#059669)",
                    color:"white", cursor:"pointer", fontSize:12, fontWeight:700,
                    fontFamily:"'Plus Jakarta Sans',sans-serif",
                    boxShadow:"0 4px 14px rgba(16,185,129,0.4)" }}>
                  {pdfLoading ? <><div style={{ width:12,height:12,border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block',marginRight:6 }}/>Generating PDF...</> : '⬇ Preview & Print PDF'}
                </button>
              </>)}
            </div>
          </GlassCard>

          {/* ── Inline PDF Preview ── */}
          {showPreview && previewHtml && (
            <GlassCard className="p-0 overflow-hidden">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderBottom:`1px solid ${bd}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444" }}/>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#f59e0b" }}/>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#10b981" }}/>
                  <span style={{ fontSize:11, color:sc, marginLeft:6 }}>LendQuant_{reportType}_Report.pdf</span>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <button onClick={printReport}
                    style={{ fontSize:11, padding:"4px 10px", borderRadius:6, border:"none",
                      background:"linear-gradient(135deg,#14b8a6,#0ea5e9)", color:"white",
                      cursor:"pointer", fontWeight:700 }}>🖨 Print / Save as PDF</button>
                  <button onClick={() => setShowPreview(false)}
                    style={{ fontSize:11, color:sc, background:"none", border:"none", cursor:"pointer", padding:"2px 6px" }}>✕</button>
                </div>
              </div>
              <iframe
                srcDoc={previewHtml}
                style={{ width:"100%", height:520, border:"none", display:"block" }}
                id="report-preview-frame" title="Report Preview"
              />
            </GlassCard>
          )}

          <GlassCard className="p-4">
            <p style={{ fontSize:12, fontWeight:700, color:tc, marginBottom:10, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>📁 Recent Reports</p>
            {[
              { name:"Monthly_Report_Feb2026",     date:"28 Feb 2026", size:"2.4 MB" },
              { name:"Fraud_Intelligence_Feb2026",  date:"25 Feb 2026", size:"1.1 MB" },
              { name:"Executive_Summary_Jan2026",   date:"31 Jan 2026", size:"0.6 MB" },
            ].map(r => (
              <div key={r.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${bd}` }}>
                <div>
                  <p style={{ fontSize:11, fontWeight:600, color:tc, margin:0 }}>📄 {r.name}.pdf</p>
                  <p style={{ fontSize:10, color:sc, marginTop:2 }}>{r.date} · {r.size}</p>
                </div>
                <button onClick={downloadSimulated}
                  style={{ fontSize:10, padding:"3px 8px", borderRadius:6, background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)", color:"#3b82f6", cursor:"pointer", fontWeight:600 }}>
                  ↓ Download
                </button>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ─── SETTINGS PAGE ─── */
function SettingsPage({ role, setRole, onToast }) {
  const { pref, setPref, isDark } = useTheme();
  const [notifPrefs, setNotifPrefs] = useState({ fraud:true, recovery:true, reminders:false, reports:false });

  const toggleNotif = key => setNotifPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-5">
      {/* Theme */}
      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-1">Appearance</h3>
        <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">Choose how LendQuant AI looks to you.</p>
        <div className="flex gap-3 flex-wrap">
          {[
            { id:"light",  label:"☀ Light",  desc:"Always light" },
            { id:"dark",   label:"☾ Dark",   desc:"Always dark" },
            { id:"system", label:"⊙ System", desc:"Follow OS" },
          ].map(t => (
            <button key={t.id} onClick={() => setPref(t.id)}
              className={`px-4 py-3 rounded-xl border text-left transition-all min-w-28
                ${pref === t.id
                  ? "bg-teal-500/20 border-teal-500/50 text-teal-600 dark:text-teal-400"
                  : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20"}`}>
              <p className="text-sm font-bold">{t.label}</p>
              <p className="text-xs opacity-60 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-3">
          Active theme: <span className="font-bold text-teal-600 dark:text-teal-400">{isDark ? "Dark" : "Light"}</span>
        </p>
      </GlassCard>

      {/* Notifications */}
      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-1">Notification Preferences</h3>
        <p className="text-slate-400 dark:text-slate-500 text-xs mb-4">Control what alerts you receive.</p>
        <div className="space-y-3">
          {[
            { key:"fraud",    label:"Fraud Alerts",     desc:"Critical and high-severity fraud events" },
            { key:"recovery", label:"Recovery Updates",  desc:"When states cross or drop below targets" },
            { key:"reminders",label:"EMI Reminders",     desc:"Reminder dispatch confirmations" },
            { key:"reports",  label:"Scheduled Reports", desc:"Monthly and quarterly report generation" },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5">
              <div>
                <p className="text-sm text-slate-900 dark:text-white font-semibold">{n.label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{n.desc}</p>
              </div>
              <button onClick={() => toggleNotif(n.key)}
                className={`w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${notifPrefs[n.key] ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${notifPrefs[n.key] ? "left-6" : "left-1"}`}/>
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Role */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font">Role Simulation</h3>
          <span className="text-xs text-slate-400">RBAC-controlled nav</span>
        </div>
        <div className="flex flex-col gap-2">
          {Object.entries(ROLES).map(([key, r]) => (
            <button key={key} onClick={() => { setRole(key); onToast(`Switched to ${r.label}`, "success"); }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-all
                ${role === key
                  ? "border-teal-500/50 bg-teal-500/10"
                  : "border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/3 hover:border-slate-300 dark:hover:border-white/15"}`}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                style={{ background:`linear-gradient(135deg,${r.color},${r.color}80)` }}>
                {r.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${role === key ? "text-teal-600 dark:text-teal-400" : "text-slate-900 dark:text-white"}`}>{r.label}</p>
                {r.sub && <p className="text-xs text-slate-400">{r.sub}</p>}
              </div>
              <div className="flex gap-3 text-xs text-slate-400 flex-shrink-0">
                <span>{key === "agent" ? "🚫 Geo" : "✓ Geo"}</span>
                <span>{key === "admin" ? "✓ Fraud" : "🚫 Fraud"}</span>
              </div>
              {role === key && <div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"/>}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Account */}
      <GlassCard className="p-5">
        <h3 className="text-slate-900 dark:text-white font-bold text-sm nav-font mb-4">Account</h3>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg"
            style={{ background:`linear-gradient(135deg,${ROLES[role].color},${ROLES[role].color}80)` }}>
            {ROLES[role].initials}
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-bold">{ROLES[role].label}</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">{ROLES[role].sub}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{animation:"pulse2 2s infinite"}}/>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">Session active · Secured</span>
            </div>
          </div>
        </div>
        <button className="px-5 py-2.5 rounded-xl border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          ⎋ Sign Out
        </button>
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */
function Sidebar({ active, setActive, role, open }) {
  const { isDark } = useTheme();
  const visibleNav = NAV.filter(n => n.roles.includes(role));
  const bg = isDark ? "#0B1220" : "rgba(255,255,255,0.98)";
  const bdr = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <aside className="flex-shrink-0 flex flex-col z-20 border-r transition-all duration-300"
      style={{ width: open ? 220 : 64, background: bg, borderColor: bdr, backdropFilter: "blur(24px)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b flex-shrink-0" style={{ borderColor: bdr }}>
        <LendQuantLogo size={34} />
        {open && (
          <div className="overflow-hidden min-w-0">
            <p className="font-black text-sm tracking-tight nav-font leading-none" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>LendQuant</p>
            <p className="font-bold tracking-[0.25em] uppercase"
              style={{ fontSize: 10, color: isDark ? "#2dd4bf" : "#64748b" }}>AI PLATFORM</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {visibleNav.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 border
              ${active === item.id
                ? isDark
                  ? "bg-teal-500/10 text-teal-400 border border-teal-400/20"
                  : "bg-blue-50 text-blue-600 border-blue-100"
                : isDark
                  ? "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
                  : "text-slate-500 hover:text-slate-900 hover:bg-black/5 border-transparent"}`}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="flex-shrink-0">
              <path d={item.icon} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {open && <span className="text-xs font-semibold truncate">{item.label}</span>}
            {active === item.id && open && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"/>}
          </button>
        ))}
      </nav>

      {/* Role badge */}
      {open && (
        <div className="px-3 py-3 border-t flex-shrink-0" style={{ borderColor: bdr }}>
          <div className="rounded-xl border p-3"
            style={{ background: isDark ? "rgba(30,41,59,0.4)" : "rgba(0,0,0,0.04)", borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex-shrink-0 shadow overflow-hidden flex items-center justify-center select-none"
                style={{ background: isDark ? "linear-gradient(135deg,#2dd4bf,#0891b2)" : "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
                {role === "admin" ? (
                  <img src={ADMIN_AVATAR} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-black select-none" style={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{ROLES[role].initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>{ROLES[role].label}</p>
                <p className="text-xs truncate" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>{ROLES[role].sub}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{animation:"pulse2 2s infinite"}}/>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">Live · Secured</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOPBAR
═══════════════════════════════════════════════════════════ */
function TopNavbar({ sideOpen, setSideOpen, role, active, onNotifOpen, onNav }) {
  const { isDark } = useTheme();
  const [time, setTime] = useState(new Date());
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    if (dropOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropOpen]);

  const bg = isDark ? "rgba(3,10,26,0.95)" : "rgba(248,250,252,0.95)";
  const bdr = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const avatarGrad = isDark
    ? "linear-gradient(135deg,#2dd4bf,#0891b2)"
    : "linear-gradient(135deg,#3b82f6,#1d4ed8)";

  return (
    <header className="flex-shrink-0 h-14 flex items-center gap-4 px-5 border-b transition-shadow duration-200 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(20,184,166,0.15)]"
      style={{ background: bg, borderColor: bdr, backdropFilter: "blur(20px)" }}>
      <button onClick={() => setSideOpen(s => !s)}
        className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0">
        <svg width="16" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="0" y1="2" x2="16" y2="2"/><line x1="0" y1="6" x2="12" y2="6"/><line x1="0" y1="10" x2="16" y2="10"/>
        </svg>
      </button>

      <div className="flex-1 max-w-sm relative">
        <input type="text" placeholder="Search borrowers, states, alerts…"
          className="w-full text-xs placeholder-slate-400 dark:placeholder-slate-600
            bg-black/5 dark:bg-white/4 border border-black/8 dark:border-white/8 rounded-xl px-4 py-1.5
            focus:outline-none focus:border-teal-500/40 transition-colors text-slate-900 dark:text-white"/>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 text-xs">⌘K</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-slate-400 dark:text-slate-400 font-mono hidden lg:block">
          {time.toLocaleTimeString("en-IN", { hour12:true, hour:"2-digit", minute:"2-digit", second:"2-digit" })}
        </span>
        <ThemeToggle />
        <NotificationPanel onOpen={onNotifOpen} />
        <div className="flex items-center gap-2.5 relative" ref={dropRef}>
          {/* Avatar — photo for admin, gradient initials for other roles */}
          <div
            onClick={() => setDropOpen(s => !s)}
            className="w-10 h-10 rounded-full flex-shrink-0 shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer overflow-hidden flex items-center justify-center select-none"
            style={{ background: avatarGrad }}>
            {role === "admin" ? (
              <img src={ADMIN_AVATAR} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-black text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.5px" }}>
                {ROLES[role].initials}
              </span>
            )}
          </div>
          <div className="hidden md:block cursor-pointer" onClick={() => setDropOpen(s => !s)}>
            <p className="text-xs font-semibold leading-tight" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>{ROLES[role].label}</p>
            <p className="text-xs leading-tight" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>{ROLES[role].sub}</p>
          </div>

          {/* Animated dropdown */}
          <div
            className="absolute right-0 top-[calc(100%+10px)] w-44 rounded-xl border shadow-2xl overflow-hidden
              bg-white dark:bg-slate-900
              border-slate-200 dark:border-white/10
              backdrop-blur-xl"
            style={{
              zIndex: 9999,
              transformOrigin: "top right",
              transition: "opacity 150ms ease, transform 150ms ease",
              opacity: dropOpen ? 1 : 0,
              transform: dropOpen ? "scale(1)" : "scale(0.95)",
              pointerEvents: dropOpen ? "auto" : "none",
            }}>
            {[
              { label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
              { label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" },
              { label: "Logout", icon: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1", danger: true },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => {
                  setDropOpen(false);
                  if (item.label === "Settings" && onNav) onNav("settings");
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-left transition-all duration-200
                  hover:bg-slate-100 dark:hover:bg-white/5
                  ${item.danger ? "text-red-500 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d={item.icon} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}



/* ═══════════════════════════════════════════════════════════
   FEATURE 4 ── LIVE ANIMATED TICKER
═══════════════════════════════════════════════════════════ */
const TICKER_ITEMS = [
  { type:"fraud",    icon:"⚠", text:"CRITICAL · FR-4821 · Ramesh Kumar · UP · Location Anomaly · Score 87",  color:"#ef4444" },
  { type:"recovery", icon:"↑", text:"RECOVERY · National rate crossed 77% · Above Feb target",               color:"#10b981" },
  { type:"emi",      icon:"📲", text:"EMI DISPATCH · 182 reminders sent · Tamil Nadu · Success rate 94%",    color:"#3b82f6" },
  { type:"risk",     icon:"🔴", text:"RISK ALERT · Bihar cluster elevated to HIGH · 61,800 loans impacted",  color:"#f97316" },
  { type:"fraud",    icon:"⚠", text:"FRAUD · FR-4820 · Priya Mehta · MH · Multiple Loans · Score 73",       color:"#ef4444" },
  { type:"report",   icon:"📊", text:"REPORT · Feb 2026 monthly report auto-generated · Download available", color:"#8b5cf6" },
  { type:"recovery", icon:"↑", text:"STRATEGY · Field visits increased 18% in UP · Recovery up 4.2%",       color:"#10b981" },
  { type:"risk",     icon:"🟡", text:"MODERATE · Rajasthan default rate stabilised at 22% · Watch list",     color:"#f59e0b" },
  { type:"fraud",    icon:"⚠", text:"FRAUD · FR-4819 · Suresh Reddy · AP · Mobile Mismatch · Score 65",     color:"#ef4444" },
  { type:"emi",      icon:"📲", text:"EMI SUCCESS · Gujarat 96% collection rate · Best performing state",    color:"#14b8a6" },
];

function LiveTicker() {
  const { isDark } = useTheme();
  const [paused, setPaused] = useState(false);
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  const bg     = isDark ? "rgba(4,12,30,0.95)" : "rgba(15,23,42,0.92)";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.1)";

  return (
    <div style={{
      width: "100%", height: 36, overflow: "hidden",
      background: bg, borderBottom: `1px solid ${border}`,
      display: "flex", alignItems: "center", flexShrink: 0,
      position: "relative", zIndex: 10,
    }}>
      {/* LIVE badge */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
        padding: "0 14px", borderRight: "1px solid rgba(255,255,255,0.1)",
        height: "100%", background: "rgba(239,68,68,0.15)",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse2 1.2s infinite" }}/>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#ef4444", letterSpacing: "0.12em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>LIVE</span>
      </div>

      {/* Scrolling track */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div style={{
          display: "flex", alignItems: "center", gap: 0, whiteSpace: "nowrap",
          animation: `tickerScroll ${TICKER_ITEMS.length * 6}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          willChange: "transform",
        }}>
          {doubled.map((item, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "0 28px", fontSize: 11, fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              fontFamily: "'Inter', sans-serif",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{ color: item.color, fontSize: 10 }}>{item.icon}</span>
              <span style={{ color: item.color, fontWeight: 700, fontSize: 10, letterSpacing: "0.06em" }}>{item.type.toUpperCase()}</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10.5 }}>
                {item.text.replace(/^[A-Z ·]+· /, "")}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Timestamp */}
      <div style={{
        flexShrink: 0, padding: "0 12px", borderLeft: "1px solid rgba(255,255,255,0.1)",
        height: "100%", display: "flex", alignItems: "center",
      }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums" }}>
          {new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true })}
        </span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   FEATURE 6 ── STRATEGY SIMULATOR (What-If Sliders)
═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   FEATURE 8 ── MULTI-LANGUAGE EMI PREVIEW
═══════════════════════════════════════════════════════════ */
const LANG_FULL = {
  UP: { lang:"Hindi",     flag:"🇮🇳", script:"Devanagari",  color:"#f97316" },
  TN: { lang:"Tamil",     flag:"🌺",  script:"Tamil",       color:"#ef4444" },
  MH: { lang:"Marathi",   flag:"🧡",  script:"Devanagari",  color:"#f59e0b" },
  WB: { lang:"Bengali",   flag:"🐟",  script:"Bengali",     color:"#3b82f6" },
  GJ: { lang:"Gujarati",  flag:"🦁",  script:"Gujarati",    color:"#10b981" },
  KA: { lang:"Kannada",   flag:"🐘",  script:"Kannada",     color:"#8b5cf6" },
  KL: { lang:"Malayalam", flag:"🥥",  script:"Malayalam",   color:"#14b8a6" },
  PB: { lang:"Punjabi",   flag:"🌾",  script:"Gurmukhi",    color:"#f97316" },
  AP: { lang:"Telugu",    flag:"🌶",  script:"Telugu",      color:"#ef4444" },
};

const EMI_MESSAGES_FULL = {
  UP: {
    sms:  "नमस्ते {name}! आपकी EMI ₹{emi} {date} तक देय है। समय पर भुगतान करें और पेनल्टी से बचें। हेल्पलाइन: 1800-XXX-XXXX",
    whatsapp: "🙏 नमस्ते {name} जी,\n\nआपकी EMI राशि *₹{emi}* की देय तिथि *{date}* है।\n\n✅ समय पर भुगतान के लाभ:\n• क्रेडिट स्कोर सुधार\n• पेनल्टी से बचाव\n\nभुगतान लिंक: pay.lendquant.ai/{id}",
    ivr:  "नमस्ते, यह LendQuant AI का स्वचालित संदेश है। आपकी मासिक किश्त {date} को देय है।",
  },
  TN: {
    sms:  "வணக்கம் {name}! உங்கள் EMI ₹{emi} {date} அன்று செலுத்த வேண்டும். தாமதமின்றி செலுத்துங்கள்।",
    whatsapp: "🙏 வணக்கம் {name},\n\nஉங்கள் EMI தொகை *₹{emi}* செலுத்த கடைசி நாள் *{date}*.\n\n✅ நேரத்தில் செலுத்துவதன் நன்மைகள்:\n• கடன் மதிப்பெண் உயரும்\n• அபராதம் தவிர்க்கலாம்\n\nசெலுத்தும் இணைப்பு: pay.lendquant.ai/{id}",
    ivr:  "வணக்கம், இது LendQuant AI தானியங்கி செய்தி. உங்கள் மாதாந்திர தவணை {date} அன்று செலுத்தப்பட வேண்டும்.",
  },
  MH: {
    sms:  "नमस्कार {name}! तुमची EMI ₹{emi} {date} पर्यंत देय आहे। वेळेवर भरा आणि दंड टाळा।",
    whatsapp: "🙏 नमस्कार {name},\n\nतुमची EMI रक्कम *₹{emi}* भरण्याची शेवटची तारीख *{date}* आहे.\n\n✅ वेळेवर भरण्याचे फायदे:\n• क्रेडिट स्कोर सुधारेल\n• दंड टळेल\n\nपेमेंट लिंक: pay.lendquant.ai/{id}",
    ivr:  "नमस्कार, हे LendQuant AI चे स्वयंचलित संदेश आहे. तुमची मासिक हप्ता {date} रोजी देय आहे.",
  },
  GJ: {
    sms:  "નમસ્તે {name}! તમારી EMI ₹{emi} {date} સુધીમાં ભરવાની છે. સમયસર ભરો અને દંડ ટાળો।",
    whatsapp: "🙏 નમસ્તે {name},\n\nતમારી EMI રકમ *₹{emi}* ભરવાની છેલ્લી તારીખ *{date}* છે.\n\n✅ સમયસર ભરવાના ફાયદા:\n• ક્રેડિટ સ્કોર સુધરશે\n• દંડ ટળશે\n\nચુકવણી લિંક: pay.lendquant.ai/{id}",
    ivr:  "નમસ્તે, આ LendQuant AI નો સ્વચાલિત સંદેશ છે. તમારો માસિક હપ્તો {date}ના રોજ ચૂકવવાનો છે.",
  },
  KL: {
    sms:  "ഹലോ {name}! നിങ്ങളുടെ EMI ₹{emi} {date} ന് അടയ്ക്കേണ്ടതാണ്. സമയത്ത് അടക്കൂ.",
    whatsapp: "🙏 ഹലോ {name},\n\nനിങ്ങളുടെ EMI തുക *₹{emi}* അടയ്ക്കാനുള്ള അവസാന തീയതി *{date}*.\n\n✅ സമയത്ത് അടയ്ക്കുന്നതിന്റെ ഗുണങ്ങൾ:\n• ക്രെഡിറ്റ് സ്കോർ മെച്ചപ്പെടും\n• പിഴ ഒഴിവാക്കാം\n\nപേയ്‌മെന്റ് ലിങ്ക്: pay.lendquant.ai/{id}",
    ivr:  "ഹലോ, ഇത് LendQuant AI ന്റെ സ്വയംക്രിയ സന്ദേശമാണ്. നിങ്ങളുടെ മാസ ഗഡു {date} ന് അടയ്ക്കേണ്ടതാണ്.",
  },
  DEFAULT: {
    sms:  "Dear {name}, your EMI of ₹{emi} is due on {date}. Pay on time to avoid penalties. Helpline: 1800-XXX-XXXX",
    whatsapp: "🙏 Dear {name},\n\nYour EMI amount *₹{emi}* is due on *{date}*.\n\n✅ Benefits of timely payment:\n• Improved credit score\n• Avoid penalty charges\n\nPayment link: pay.lendquant.ai/{id}",
    ivr:  "Hello, this is an automated message from LendQuant AI. Your monthly instalment is due on {date}.",
  },
};

// fill in missing states with DEFAULT
["WB","KA","PB","AP"].forEach(c => { EMI_MESSAGES_FULL[c] = EMI_MESSAGES_FULL.DEFAULT; });

function MultiLangEMIPage() {
  const { isDark } = useTheme();
  const [selectedBorrower, setSelectedBorrower] = useState(BORROWERS[0]);
  const [channel, setChannel] = useState("whatsapp");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const stateCode = selectedBorrower.state;
  const langInfo  = LANG_FULL[stateCode] || { lang:"English", flag:"🇬🇧", script:"Latin", color:"#3b82f6" };
  const msgs      = EMI_MESSAGES_FULL[stateCode] || EMI_MESSAGES_FULL.DEFAULT;

  const fill = (tpl) => tpl
    .replace(/{name}/g, selectedBorrower.name.split(" ")[0])
    .replace(/{emi}/g,  selectedBorrower.emi.replace("₹",""))
    .replace(/{date}/g, "15 Mar 2026")
    .replace(/{id}/g,   selectedBorrower.id.replace("BRW-",""));

  const previewMsg = fill(msgs[channel] || msgs.whatsapp);

  const copyMsg = () => {
    navigator.clipboard?.writeText(previewMsg).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const generateAI = async () => {
    setAiLoading(true); setAiMsg("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{ role:"user", content:
            `Write a personalised EMI recovery ${channel} message in ${langInfo.lang} for this borrower:
Name: ${selectedBorrower.name}
State: ${selectedBorrower.state}
EMI: ${selectedBorrower.emi}
Days Overdue: ${selectedBorrower.daysOverdue}
Sentiment: ${selectedBorrower.sentiment}
Risk: ${selectedBorrower.riskLabel}

Rules:
- Write ENTIRELY in ${langInfo.lang} script
- Tone: ${selectedBorrower.sentiment === "Angry" ? "calm and empathetic" : selectedBorrower.sentiment === "Hardship" ? "compassionate and offering help" : "friendly and firm"}
- Mention their specific overdue of ${selectedBorrower.daysOverdue} days
- Include a call to action
- Max 60 words
- No translation needed, just the message`
          }],
        }),
      });
      const data = await res.json();
      setAiMsg(data.content?.map(b => b.text || "").join("") || "Could not generate message.");
    } catch { setAiMsg("⚠ Connection error."); }
    finally { setAiLoading(false); }
  };

  const bg2 = isDark ? "rgba(255,255,255,0.03)" : "#f8fafc";
  const bd  = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const tc  = isDark ? "#f1f5f9" : "#0f172a";
  const sc  = isDark ? "#64748b" : "#94a3b8";

  return (
    <div className="space-y-5">
      <div>
        <h2 style={{ fontSize:15, fontWeight:800, color: isDark?"#fff":"#0f172a", margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Multi-Language EMI Preview</h2>
        <p style={{ fontSize:12, color:sc, marginTop:3 }}>Generate personalised recovery messages in borrower's regional language via AI</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:16 }}>
        {/* Borrower list */}
        <GlassCard className="p-4">
          <p style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:sc, marginBottom:12 }}>Select Borrower</p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {BORROWERS.map(b => {
              const lc = LANG_FULL[b.state] || { lang:"English", flag:"🇬🇧", color:"#3b82f6" };
              const sel = b.id === selectedBorrower.id;
              return (
                <div key={b.id} onClick={() => { setSelectedBorrower(b); setAiMsg(""); }}
                  style={{
                    padding:"10px 12px", borderRadius:10, cursor:"pointer",
                    background: sel ? `${lc.color}18` : bg2,
                    border: `1px solid ${sel ? lc.color+"44" : bd}`,
                    transition:"all 0.15s",
                  }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, fontWeight:sel?700:500, color: sel ? lc.color : tc }}>{b.name.split(" ")[0]} {b.name.split(" ").slice(-1)[0]}</span>
                    <span style={{ fontSize:10 }}>{lc.flag}</span>
                  </div>
                  <div style={{ fontSize:10, color:sc, marginTop:2 }}>{lc.lang} · {b.state} · {b.daysOverdue}d overdue</div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Preview panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Borrower info strip */}
          <GlassCard className="p-4">
            <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg,${langInfo.color},${langInfo.color}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{langInfo.flag}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:800, color:tc, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{selectedBorrower.name}</p>
                <p style={{ fontSize:11, color:sc, marginTop:2 }}>{selectedBorrower.id} · {langInfo.lang} ({langInfo.script}) · {selectedBorrower.sentiment} · {selectedBorrower.daysOverdue} days overdue</p>
              </div>
              {["whatsapp","sms","ivr"].map(ch => (
                <button key={ch} onClick={() => setChannel(ch)}
                  style={{
                    fontSize:11, padding:"6px 14px", borderRadius:20,
                    background: channel===ch ? langInfo.color : bg2,
                    border:`1px solid ${channel===ch ? langInfo.color : bd}`,
                    color: channel===ch ? "white" : sc, cursor:"pointer", fontWeight:600,
                    transition:"all 0.15s", textTransform:"uppercase", letterSpacing:"0.06em",
                  }}>
                  {ch === "whatsapp" ? "WhatsApp" : ch === "sms" ? "SMS" : "IVR Script"}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Template preview */}
          <GlassCard className="p-4">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:12, fontWeight:700, color:tc, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>📋 Template Message</span>
              <button onClick={copyMsg}
                style={{ fontSize:11, padding:"4px 10px", borderRadius:8, background: copied?"#10b98122":"transparent", border:`1px solid ${copied?"#10b981":bd}`, color: copied?"#10b981":sc, cursor:"pointer" }}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <div style={{ background: isDark?"rgba(0,0,0,0.3)":"#f1f5f9", borderRadius:10, padding:"14px 16px", fontSize:13, lineHeight:1.8, color:tc, whiteSpace:"pre-wrap", fontFamily: langInfo.lang !== "English" ? "system-ui, sans-serif" : "'Inter',sans-serif", minHeight:80 }}>
              {previewMsg}
            </div>
          </GlassCard>

          {/* AI personalisation */}
          <GlassCard className="p-4">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <span style={{ fontSize:12, fontWeight:700, color:tc, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>✨ AI-Personalised Message</span>
                <span style={{ fontSize:11, color:sc, marginLeft:8 }}>tailored to sentiment & overdue days</span>
              </div>
              <button onClick={generateAI} disabled={aiLoading}
                style={{
                  fontSize:11, padding:"6px 14px", borderRadius:8,
                  background: aiLoading?(isDark?"rgba(255,255,255,0.06)":"#e2e8f0"):"linear-gradient(135deg,#14b8a6,#0ea5e9)",
                  border:"none", color: aiLoading?(isDark?"#475569":"#94a3b8"):"white",
                  cursor:aiLoading?"not-allowed":"pointer", fontWeight:600,
                  display:"flex", alignItems:"center", gap:6,
                }}>
                {aiLoading?(<><div style={{ width:10,height:10,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.7s linear infinite" }}/>Generating</>):"Generate AI ✦"}
              </button>
            </div>
            {aiMsg ? (
              <div style={{ background: isDark?"rgba(20,184,166,0.06)":"rgba(20,184,166,0.04)", border:"1px solid rgba(20,184,166,0.2)", borderRadius:10, padding:"14px 16px", fontSize:13, lineHeight:1.8, color:tc, whiteSpace:"pre-wrap", fontFamily:"system-ui, sans-serif", minHeight:80 }}>
                {aiMsg}
              </div>
            ) : (
              <div style={{ background:bg2, border:`1px dashed ${bd}`, borderRadius:10, padding:"20px 16px", textAlign:"center", color:sc, fontSize:12 }}>
                Click <strong style={{ color:"#14b8a6" }}>Generate AI ✦</strong> to create a hyper-personalised message in {langInfo.lang} based on {selectedBorrower.name.split(" ")[0]}'s sentiment and overdue history
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   FEATURE: PREDICTIVE DEFAULT ALERT PANEL
═══════════════════════════════════════════════════════════ */
const PREDICTED_DEFAULTS = [
  { id:"BRW-011", name:"Suresh Yadav",      state:"UP", loan:"₹3,80,000", emi:"₹10,400", daysOverdue:28, riskScore:88, confidence:94, trend:"↑", signals:["3 missed EMIs","Location mismatch","Income drop 40%"],     strategy:"Legal Escalation" },
  { id:"BRW-012", name:"Lakshmi Devi",      state:"BR", loan:"₹1,20,000", emi:"₹3,800",  daysOverdue:21, riskScore:81, confidence:89, trend:"↑", signals:["Ignoring calls","Cluster risk HIGH","EMI bounce x2"],      strategy:"Field Visit" },
  { id:"BRW-013", name:"Rahul Tiwari",      state:"MP", loan:"₹5,60,000", emi:"₹15,200", daysOverdue:18, riskScore:77, confidence:85, trend:"↑", signals:["Job loss reported","Overdue 18d","Loan-income ratio 4.1x"],  strategy:"Restructuring" },
  { id:"BRW-014", name:"Anjali Kumari",     state:"WB", loan:"₹2,10,000", emi:"₹6,100",  daysOverdue:14, riskScore:72, confidence:81, trend:"→", signals:["2 missed EMIs","Fraud flag active","CIBIL drop 80pts"],     strategy:"Field Visit" },
  { id:"BRW-015", name:"Mohan Lal Sharma",  state:"OD", loan:"₹4,40,000", emi:"₹12,000", daysOverdue:33, riskScore:91, confidence:96, trend:"↑", signals:["No contact 2 weeks","Property dispute","High cluster risk"],"strategy":"Legal Escalation" },
  { id:"BRW-016", name:"Fatima Begum",      state:"JH", loan:"₹90,000",   emi:"₹2,900",  daysOverdue:9,  riskScore:65, confidence:74, trend:"→", signals:["Delayed last 3 months","Hardship flag","EMI-income 62%"],   strategy:"Restructuring" },
  { id:"BRW-017", name:"Dinesh Verma",      state:"UP", loan:"₹6,20,000", emi:"₹16,800", daysOverdue:41, riskScore:85, confidence:92, trend:"↑", signals:["Legal notice issued","Absconding flag","Co-borrower default"],"strategy":"Legal Escalation" },
  { id:"BRW-018", name:"Sushma Gupta",      state:"RJ", loan:"₹1,70,000", emi:"₹4,900",  daysOverdue:12, riskScore:68, confidence:77, trend:"↓", signals:["Partial payment","Contacted yesterday","EMI restructured"],  strategy:"Soft Reminder" },
];

function PredictiveDefaultPage() {
  const { isDark } = useTheme();
  const [sortBy, setSortBy] = useState("confidence");
  const [filterConf, setFilterConf] = useState(0);
  const [selected, setSelected] = useState(null);

  const sorted = [...PREDICTED_DEFAULTS]
    .filter(b => b.confidence >= filterConf)
    .sort((a,b) => b[sortBy] - a[sortBy]);

  const bg   = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const bd   = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const tc   = isDark ? "#f1f5f9" : "#0f172a";
  const sc   = isDark ? "#64748b" : "#94a3b8";

  const confColor = c => c >= 90 ? "#ef4444" : c >= 80 ? "#f97316" : c >= 70 ? "#f59e0b" : "#10b981";
  const trendColor = t => t === "↑" ? "#ef4444" : t === "↓" ? "#10b981" : "#f59e0b";

  const totalExposure = sorted.reduce((s,b) => s + parseFloat(b.loan.replace(/[₹,]/g,"")), 0);

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"At-Risk Borrowers", val:sorted.length, unit:"next 30d", color:"#ef4444" },
          { label:"Exposure",          val:"₹" + (totalExposure/100000).toFixed(1)+"L", unit:"total loans", color:"#f97316" },
          { label:"Avg Confidence",    val:Math.round(sorted.reduce((s,b)=>s+b.confidence,0)/sorted.length)+"%", unit:"prediction score", color:"#f59e0b" },
          { label:"Critical (≥90%)",   val:sorted.filter(b=>b.confidence>=90).length, unit:"immediate action", color:"#8b5cf6" },
        ].map(s => (
          <GlassCard key={s.label} className="p-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background:`radial-gradient(ellipse at 80% 0%,${s.color}12,transparent 60%)` }}/>
            <div className="absolute bottom-0 left-0 h-0.5 w-full" style={{ background:`linear-gradient(90deg,${s.color},transparent)` }}/>
            <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:sc, marginBottom:6 }}>{s.label}</p>
            <p className="stat-number" style={{ fontSize:"1.4rem", fontWeight:900, color:s.color, lineHeight:1, fontVariantNumeric:"lining-nums tabular-nums" }}>{s.val}</p>
            <p style={{ fontSize:11, color:sc, marginTop:4 }}>{s.unit}</p>
          </GlassCard>
        ))}
      </div>

      {/* Controls */}
      <GlassCard className="p-5">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:14, fontWeight:800, color:tc, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>⚠ Predicted Defaults — Next 30 Days</h3>
            <p style={{ fontSize:11, color:sc, marginTop:3 }}>AI model confidence scores · Updated hourly · Based on 14 risk signals</p>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:11, color:sc }}>Min confidence:</span>
            {[0,70,80,90].map(v => (
              <button key={v} onClick={() => setFilterConf(v)}
                style={{ fontSize:11, padding:"4px 10px", borderRadius:8, cursor:"pointer", fontWeight:600,
                  background: filterConf===v ? "#ef444420" : bg,
                  border:`1px solid ${filterConf===v ? "#ef4444" : bd}`,
                  color: filterConf===v ? "#ef4444" : sc }}>
                {v === 0 ? "All" : v+"%+"}
              </button>
            ))}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ fontSize:11, padding:"4px 10px", borderRadius:8, border:`1px solid ${bd}`, background: isDark?"rgba(30,41,59,0.8)":"#f1f5f9", color:tc, cursor:"pointer" }}>
              <option value="confidence">Sort: Confidence</option>
              <option value="riskScore">Sort: Risk Score</option>
              <option value="daysOverdue">Sort: Days Overdue</option>
            </select>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {sorted.map((b, i) => (
            <div key={b.id}
              onClick={() => setSelected(selected?.id === b.id ? null : b)}
              style={{
                background: selected?.id === b.id ? (isDark?"rgba(239,68,68,0.08)":"rgba(239,68,68,0.04)") : bg,
                border:`1px solid ${selected?.id === b.id ? "#ef444440" : bd}`,
                borderRadius:12, padding:"12px 16px", cursor:"pointer",
                transition:"all 0.18s",
              }}
              onMouseEnter={e => { if(selected?.id !== b.id) e.currentTarget.style.background = isDark?"rgba(255,255,255,0.06)":"#f1f5f9"; }}
              onMouseLeave={e => { if(selected?.id !== b.id) e.currentTarget.style.background = bg; }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                {/* Rank */}
                <div style={{ width:28, height:28, borderRadius:"50%", background:confColor(b.confidence)+"22", border:`1.5px solid ${confColor(b.confidence)}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:800, color:confColor(b.confidence) }}>{i+1}</span>
                </div>
                {/* Name + state */}
                <div style={{ flex:1, minWidth:120 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:tc, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{b.name}</p>
                  <p style={{ fontSize:11, color:sc, marginTop:1 }}>{b.id} · {b.state} · {b.daysOverdue}d overdue</p>
                </div>
                {/* Confidence bar — single line */}
                <div style={{ minWidth:180, display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:10, color:sc, whiteSpace:"nowrap" }}>Default Probability</span>
                  <div style={{ flex:1, height:5, background:isDark?"rgba(255,255,255,0.08)":"#e2e8f0", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${b.confidence}%`, background:`linear-gradient(90deg,${confColor(b.confidence)}88,${confColor(b.confidence)})`, borderRadius:4, transition:"width 0.5s ease" }}/>
                  </div>
                  <span style={{ fontSize:12, fontWeight:800, color:confColor(b.confidence), whiteSpace:"nowrap" }}>{b.confidence}%</span>
                </div>
                {/* Trend */}
                <span style={{ fontSize:20, color:trendColor(b.trend), flexShrink:0 }}>{b.trend}</span>
                {/* Loan */}
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:tc, margin:0 }}>{b.loan}</p>
                  <p style={{ fontSize:10, color:sc }}>EMI {b.emi}</p>
                </div>
                {/* Strategy badge */}
                <span style={{
                  fontSize:10, padding:"3px 8px", borderRadius:6, fontWeight:700, flexShrink:0,
                  background: b.strategy === "Legal Escalation" ? "#ef444420" : b.strategy === "Field Visit" ? "#3b82f620" : b.strategy === "Restructuring" ? "#f59e0b20" : "#10b98120",
                  color: b.strategy === "Legal Escalation" ? "#ef4444" : b.strategy === "Field Visit" ? "#3b82f6" : b.strategy === "Restructuring" ? "#f59e0b" : "#10b981",
                }}>
                  {b.strategy}
                </span>
              </div>
              {/* Expanded signals */}
              {selected?.id === b.id && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${bd}`, display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:sc, fontWeight:600 }}>Risk Signals:</span>
                  {b.signals.map(sig => (
                    <span key={sig} style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"rgba(239,68,68,0.1)", color:"#ef4444", border:"1px solid rgba(239,68,68,0.2)" }}>
                      ⚠ {sig}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURE: RECOVERY FUNNEL (Sankey-style)
═══════════════════════════════════════════════════════════ */
function RecoveryFunnelPage() {
  const { isDark } = useTheme();
  const [activeStage, setActiveStage] = useState(null);
  const [animTick, setAnimTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setAnimTick(n => n+1), 50);
    return () => clearInterval(t);
  }, []);

  const FUNNEL = [
    { id:"total",     label:"Total Loan Portfolio", value:284712, pct:100,  color:"#3b82f6", icon:"🏦",
      desc:"All active loans under management across 28 states",
      sub:"FY 2025–26 · ₹8,420 Cr total disbursed" },
    { id:"overdue",   label:"Overdue / NPA",         value:41208,  pct:14.5, color:"#ef4444", icon:"⚠",
      desc:"Borrowers who have missed at least one EMI payment",
      sub:"14.5% portfolio NPA · Avg overdue 24 days" },
    { id:"contacted", label:"Successfully Contacted", value:34200,  pct:83.0, color:"#f97316", icon:"📞",
      desc:"Overdue borrowers reached via call, SMS, WhatsApp or field visit",
      sub:"83% contact rate · 6,208 unreachable" },
    { id:"engaged",   label:"Engaged in Resolution",  value:24800,  pct:72.5, color:"#f59e0b", icon:"🤝",
      desc:"Borrowers who acknowledged debt and are in active resolution process",
      sub:"72.5% engagement · EMI restructuring or promise-to-pay" },
    { id:"partial",   label:"Partial Payment Made",   value:18600,  pct:75.0, color:"#14b8a6", icon:"💳",
      desc:"Borrowers who made at least one partial payment after outreach",
      sub:"75% partial recovery rate · Avg ₹4,200 collected" },
    { id:"recovered", label:"Fully Recovered",        value:12140,  pct:65.3, color:"#10b981", icon:"✅",
      desc:"Loans fully cleared or settled — NPA resolved",
      sub:"65.3% full recovery · ₹1,847 Cr recovered YTD" },
  ];

  const maxVal = FUNNEL[0].value;
  const tc = isDark ? "#f1f5f9" : "#0f172a";
  const sc = isDark ? "#64748b" : "#94a3b8";
  const bd = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";

  const FLOW_STATS = [
    { label:"Drop-off: Not Contactable",   val:"6,208",  pct:"15.1%", color:"#ef4444" },
    { label:"Drop-off: Refused Engagement",val:"9,400",  pct:"27.5%", color:"#f97316" },
    { label:"Drop-off: No Payment Made",   val:"6,200",  pct:"25.0%", color:"#f59e0b" },
    { label:"Written Off",                 val:"6,460",  pct:"34.7%", color:"#94a3b8" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 style={{ fontSize:15, fontWeight:800, color:tc, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Recovery Funnel</h2>
        <p style={{ fontSize:12, color:sc, marginTop:3 }}>End-to-end collection pipeline · From portfolio to full recovery · Click any stage for details</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
        {/* Funnel visualization */}
        <GlassCard className="p-6">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {FUNNEL.map((stage, i) => {
              const barWidth = (stage.value / maxVal) * 100;
              const isActive = activeStage?.id === stage.id;
              return (
                <div key={stage.id} onClick={() => setActiveStage(isActive ? null : stage)} style={{ cursor:"pointer" }}>
                  {/* Stage label row */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:16 }}>{stage.icon}</span>
                      <span style={{ fontSize:12, fontWeight:700, color: isActive ? stage.color : tc, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{stage.label}</span>
                      {i > 0 && (
                        <span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:stage.color+"18", color:stage.color, fontWeight:700 }}>
                          {stage.pct}% of prev
                        </span>
                      )}
                    </div>
                    <span className="stat-number" style={{ fontSize:13, fontWeight:800, color:stage.color, fontVariantNumeric:"lining-nums tabular-nums" }}>
                      {stage.value.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {/* Bar */}
                  <div style={{ height:32, background:isDark?"rgba(255,255,255,0.05)":"#f1f5f9", borderRadius:8, overflow:"hidden", position:"relative" }}>
                    <div style={{
                      height:"100%",
                      width:`${barWidth}%`,
                      background:`linear-gradient(90deg,${stage.color}99,${stage.color})`,
                      borderRadius:8,
                      transition:"width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                      display:"flex", alignItems:"center", paddingLeft:12,
                      boxShadow: isActive ? `0 0 16px ${stage.color}66` : "none",
                    }}>
                      <div style={{ height:"60%", width:"100%", background:`repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(255,255,255,0.08) 8px,rgba(255,255,255,0.08) 9px)`, borderRadius:4 }}/>
                    </div>
                    {/* Percentage label */}
                    <div style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontSize:11, fontWeight:700, color:isDark?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.35)" }}>
                      {((stage.value/maxVal)*100).toFixed(1)}%
                    </div>
                  </div>
                  {/* Connector arrow */}
                  {i < FUNNEL.length-1 && (
                    <div style={{ display:"flex", justifyContent:"center", marginTop:4, marginBottom:-4 }}>
                      <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                        <path d="M8 0v10M3 6l5 8 5-8" stroke={isDark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.15)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Side panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Active stage detail */}
          <GlassCard className="p-4" style={{ minHeight:160 }}>
            {activeStage ? (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:24 }}>{activeStage.icon}</span>
                  <div>
                    <p style={{ fontSize:13, fontWeight:800, color:activeStage.color, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{activeStage.label}</p>
                    <p className="stat-number" style={{ fontSize:20, fontWeight:900, color:tc, margin:0, fontVariantNumeric:"lining-nums tabular-nums" }}>{activeStage.value.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <p style={{ fontSize:12, color:tc, lineHeight:1.6, marginBottom:8 }}>{activeStage.desc}</p>
                <p style={{ fontSize:11, color:activeStage.color, fontWeight:600 }}>{activeStage.sub}</p>
              </>
            ) : (
              <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
                <span style={{ fontSize:28 }}>👆</span>
                <p style={{ fontSize:12, color:sc, textAlign:"center" }}>Click any stage to see detailed breakdown</p>
              </div>
            )}
          </GlassCard>

          {/* Drop-off analysis */}
          <GlassCard className="p-4">
            <p style={{ fontSize:12, fontWeight:700, color:tc, marginBottom:12, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>📉 Drop-off Analysis</p>
            {FLOW_STATS.map(s => (
              <div key={s.label} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:sc }}>{s.label}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:s.color }}>{s.val} ({s.pct})</span>
                </div>
                <div style={{ height:4, background:isDark?"rgba(255,255,255,0.07)":"#f1f5f9", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:s.pct, background:s.color, borderRadius:3 }}/>
                </div>
              </div>
            ))}
          </GlassCard>

          {/* Recovery rate card */}
          <GlassCard className="p-4" style={{ background: isDark?"rgba(16,185,129,0.07)":"rgba(16,185,129,0.04)", borderColor:"rgba(16,185,129,0.2)" }}>
            <p style={{ fontSize:11, color:"#10b981", fontWeight:700, marginBottom:4 }}>🏆 National Recovery Rate</p>
            <p className="stat-number" style={{ fontSize:"2rem", fontWeight:900, color:"#10b981", margin:0, fontVariantNumeric:"lining-nums tabular-nums" }}>74.3%</p>
            <p style={{ fontSize:11, color:sc, marginTop:4 }}>▲ 3.4% vs last quarter · Above 74% target</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURE: FRAUD HEATMAP OVERLAY (intensity clustering)
═══════════════════════════════════════════════════════════ */
const FRAUD_CLUSTERS = [
  { name:"North UP Cluster",   state:"UP", lat:27.8, lng:80.9, intensity:94, cases:847,  type:"Identity Fraud",    trend:"↑12%" },
  { name:"Bihar Central",      state:"BR", lat:25.6, lng:85.1, intensity:88, cases:634,  type:"Multiple Loans",    trend:"↑8%"  },
  { name:"MP Industrial Belt", state:"MP", lat:23.2, lng:77.4, intensity:76, cases:412,  type:"Location Anomaly",  trend:"↑5%"  },
  { name:"Jharkhand Mining",   state:"JH", lat:23.8, lng:85.3, intensity:71, cases:389,  type:"Income Mismatch",   trend:"→0%"  },
  { name:"West Bengal Delta",  state:"WB", lat:22.9, lng:88.3, intensity:67, cases:298,  type:"Mobile Mismatch",   trend:"↓3%"  },
  { name:"Odisha Coast",       state:"OD", lat:20.9, lng:85.1, intensity:62, cases:241,  type:"Multiple Loans",    trend:"↑2%"  },
  { name:"Mumbai Metro",       state:"MH", lat:19.1, lng:72.9, intensity:58, cases:312,  type:"Identity Fraud",    trend:"↓5%"  },
  { name:"Rajasthan Border",   state:"RJ", lat:27.0, lng:70.9, intensity:49, cases:187,  type:"Location Anomaly",  trend:"→1%"  },
];

function _RemovedFraudHeatmapPage_UNUSED() {
  const { isDark } = useTheme();
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [viewMode, setViewMode] = useState("intensity");
  const [animPulse, setAnimPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setAnimPulse(n => (n+1)%100), 40);
    return () => clearInterval(t);
  }, []);

  const tc = isDark ? "#f1f5f9" : "#0f172a";
  const sc = isDark ? "#64748b" : "#94a3b8";
  const bd = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const mapBg = isDark ? "#0a1628" : "#dbeafe";

  const intensityColor = i => {
    if (i >= 85) return "#ef4444";
    if (i >= 70) return "#f97316";
    if (i >= 55) return "#f59e0b";
    return "#10b981";
  };

  // Map state positions (approximate SVG viewport 0-810 x 0-910)
  const STATE_POS = {
    UP:{ x:420, y:260 }, BR:{ x:530, y:310 }, MP:{ x:370, y:430 },
    JH:{ x:520, y:380 }, WB:{ x:600, y:350 }, OD:{ x:540, y:460 },
    MH:{ x:270, y:490 }, RJ:{ x:260, y:320 },
  };

  const totalCases = FRAUD_CLUSTERS.reduce((s,c) => s+c.cases, 0);
  const criticalCount = FRAUD_CLUSTERS.filter(c => c.intensity >= 85).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:15, fontWeight:800, color:tc, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Fraud Heatmap Intelligence</h2>
          <p style={{ fontSize:12, color:sc, marginTop:3 }}>Real-time fraud cluster detection · Intensity-based geographic overlay</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["intensity","cases","type"].map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              style={{ fontSize:11, padding:"5px 12px", borderRadius:8, cursor:"pointer", fontWeight:600, textTransform:"capitalize",
                background: viewMode===m ? "rgba(239,68,68,0.15)" : (isDark?"rgba(255,255,255,0.05)":"#f1f5f9"),
                border:`1px solid ${viewMode===m ? "rgba(239,68,68,0.4)" : bd}`,
                color: viewMode===m ? "#ef4444" : sc }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        {[
          { label:"Active Clusters",  val:FRAUD_CLUSTERS.length, color:"#ef4444" },
          { label:"Total Fraud Cases",val:totalCases.toLocaleString("en-IN"), color:"#f97316" },
          { label:"Critical Zones",   val:criticalCount, color:"#8b5cf6" },
          { label:"Avg Intensity",    val:Math.round(FRAUD_CLUSTERS.reduce((s,c)=>s+c.intensity,0)/FRAUD_CLUSTERS.length)+"%", color:"#f59e0b" },
        ].map(s => (
          <GlassCard key={s.label} className="p-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background:`radial-gradient(ellipse at 80% 0%,${s.color}12,transparent 60%)` }}/>
            <div className="absolute bottom-0 left-0 h-0.5 w-full" style={{ background:`linear-gradient(90deg,${s.color},transparent)` }}/>
            <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:sc, marginBottom:6 }}>{s.label}</p>
            <p className="stat-number" style={{ fontSize:"1.4rem", fontWeight:900, color:s.color, lineHeight:1, fontVariantNumeric:"lining-nums tabular-nums" }}>{s.val}</p>
          </GlassCard>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }}>
        {/* SVG Heatmap */}
        <GlassCard className="p-4 overflow-hidden">
          <p style={{ fontSize:11, fontWeight:700, color:sc, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>India Fraud Intensity Map</p>
          <div style={{ position:"relative", borderRadius:12, overflow:"hidden", background:mapBg }}>
            <svg viewBox="0 0 810 910" style={{ width:"100%", height:"auto", display:"block" }}>
              {/* Base map silhouette */}
              <rect x="0" y="0" width="810" height="910" fill={mapBg}/>
              {/* State fills — muted base */}
              {FRAUD_CLUSTERS.map(cluster => {
                const pos = STATE_POS[cluster.state];
                if (!pos) return null;
                const col = intensityColor(cluster.intensity);
                const r = 20 + (cluster.intensity / 100) * 35;
                const pulse = Math.sin((animPulse / 100) * Math.PI * 2) * 0.3 + 0.7;
                return (
                  <g key={cluster.name} onClick={() => setSelectedCluster(selectedCluster?.name === cluster.name ? null : cluster)} style={{ cursor:"pointer" }}>
                    {/* Outer pulse ring */}
                    <circle cx={pos.x} cy={pos.y} r={r * 1.8}
                      fill={col} opacity={0.06 * pulse}/>
                    <circle cx={pos.x} cy={pos.y} r={r * 1.4}
                      fill={col} opacity={0.10 * pulse}/>
                    {/* Main dot */}
                    <circle cx={pos.x} cy={pos.y} r={r}
                      fill={col} opacity={0.75}
                      stroke={selectedCluster?.name === cluster.name ? "white" : "transparent"}
                      strokeWidth={selectedCluster?.name === cluster.name ? 2.5 : 0}/>
                    {/* Intensity label */}
                    <text x={pos.x} y={pos.y+4} textAnchor="middle" fontSize={11} fontWeight="800" fill="white" fontFamily="'Plus Jakarta Sans',sans-serif">
                      {cluster.intensity}
                    </text>
                    {/* State code */}
                    <text x={pos.x} y={pos.y+r+14} textAnchor="middle" fontSize={9.5} fontWeight="700" fill={col} fontFamily="'Inter',sans-serif">
                      {cluster.state}
                    </text>
                  </g>
                );
              })}
              {/* Legend */}
              <g>
                {[{c:"#ef4444",l:"Critical ≥85"},{c:"#f97316",l:"High 70-84"},{c:"#f59e0b",l:"Medium 55-69"},{c:"#10b981",l:"Low <55"}].map((l,i) => (
                  <g key={l.l} transform={`translate(16,${820 + i*20})`}>
                    <circle cx="6" cy="0" r="5" fill={l.c}/>
                    <text x="15" y="4" fontSize="10" fill={isDark?"#94a3b8":"#64748b"} fontFamily="'Inter',sans-serif">{l.l}</text>
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </GlassCard>

        {/* Cluster list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, overflowY:"auto", maxHeight:520 }}>
          <p style={{ fontSize:11, fontWeight:700, color:sc, textTransform:"uppercase", letterSpacing:"0.1em" }}>Fraud Clusters</p>
          {[...FRAUD_CLUSTERS].sort((a,b) => b.intensity - a.intensity).map(cluster => {
            const col = intensityColor(cluster.intensity);
            const isSelected = selectedCluster?.name === cluster.name;
            return (
              <div key={cluster.name}
                onClick={() => setSelectedCluster(isSelected ? null : cluster)}
                style={{
                  background: isSelected ? `${col}12` : (isDark?"rgba(255,255,255,0.03)":"#f8fafc"),
                  border:`1px solid ${isSelected ? col+"44" : bd}`,
                  borderRadius:10, padding:"10px 12px", cursor:"pointer", transition:"all 0.15s",
                }}
                onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = isDark?"rgba(255,255,255,0.06)":"#f1f5f9"; }}
                onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = isDark?"rgba(255,255,255,0.03)":"#f8fafc"; }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:isSelected?col:tc, margin:0, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{cluster.name}</p>
                    <p style={{ fontSize:10, color:sc, marginTop:2 }}>{cluster.type} · {cluster.cases} cases</p>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
                    <p style={{ fontSize:13, fontWeight:900, color:col, margin:0, fontVariantNumeric:"lining-nums tabular-nums" }}>{cluster.intensity}</p>
                    <p style={{ fontSize:10, color: cluster.trend.startsWith("↑") ? "#ef4444" : cluster.trend.startsWith("↓") ? "#10b981" : "#f59e0b", fontWeight:700 }}>{cluster.trend}</p>
                  </div>
                </div>
                {/* Intensity bar */}
                <div style={{ height:3, background:isDark?"rgba(255,255,255,0.07)":"#e2e8f0", borderRadius:2, marginTop:8, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${cluster.intensity}%`, background:col, borderRadius:2, transition:"width 0.5s ease" }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURE: ONE-CLICK PDF REPORT EXPORT
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   AI CHAT ASSISTANT  (Claude-powered)
═══════════════════════════════════════════════════════════ */
const LANGUAGE_OPTIONS = [
  { code: "en",    label: "English",    color: "#3b82f6", nativeName: "English" },
  { code: "hi",    label: "Hindi",      color: "#f97316", nativeName: "हिंदी" },
  { code: "ta",    label: "Tamil",      color: "#ef4444", nativeName: "தமிழ்" },
  { code: "te",    label: "Telugu",     color: "#8b5cf6", nativeName: "తెలుగు" },
  { code: "bn",    label: "Bengali",    color: "#0ea5e9", nativeName: "বাংলা" },
  { code: "mr",    label: "Marathi",    color: "#f59e0b", nativeName: "मराठी" },
  { code: "gu",    label: "Gujarati",   color: "#10b981", nativeName: "ગુજરાતી" },
  { code: "kn",    label: "Kannada",    color: "#ec4899", nativeName: "ಕನ್ನಡ" },
  { code: "ml",    label: "Malayalam",  color: "#14b8a6", nativeName: "മലയാളം" },
  { code: "pa",    label: "Punjabi",    color: "#a855f7", nativeName: "ਪੰਜਾਬੀ" },
];

const SUGGESTED_PROMPTS_BY_LANG = {
  en: [
    "Which states have highest fraud risk?",
    "Suggest recovery strategy for Bihar",
    "What's driving the NPA increase in UP?",
    "Explain the SHAP risk factors",
    "How is recovery trending this quarter?",
    "Which borrowers need immediate action?",
  ],
  hi: [
    "किन राज्यों में धोखाधड़ी का जोखिम सबसे अधिक है?",
    "बिहार के लिए वसूली रणनीति सुझाएं",
    "UP में NPA वृद्धि का कारण क्या है?",
    "SHAP जोखिम कारकों की व्याख्या करें",
    "इस तिमाही में वसूली का रुझान कैसा है?",
    "किन उधारकर्ताओं को तत्काल कार्रवाई की आवश्यकता है?",
  ],
  ta: [
    "மோசடி அபாயம் அதிகமுள்ள மாநிலங்கள் எவை?",
    "பீகாருக்கான மீட்பு உத்தியை பரிந்துரைக்கவும்",
    "UP இல் NPA அதிகரிப்புக்கு காரணம் என்ன?",
    "SHAP ஆபத்து காரணிகளை விளக்கவும்",
    "இந்த காலாண்டில் மீட்பு எவ்வாறு உள்ளது?",
  ],
  te: [
    "అత్యధిక మోసపూరిత రిస్క్ ఉన్న రాష్ట్రాలు ఏవి?",
    "బీహార్‌కు రికవరీ వ్యూహాన్ని సూచించండి",
    "UP లో NPA పెరుగుదలకు కారణమేమిటి?",
    "SHAP రిస్క్ కారకాలను వివరించండి",
    "ఈ త్రైమాసికంలో రికవరీ ట్రెండ్ ఎలా ఉంది?",
  ],
  bn: [
    "কোন রাজ্যে প্রতারণার ঝুঁকি সবচেয়ে বেশি?",
    "বিহারের জন্য পুনরুদ্ধার কৌশল পরামর্শ দিন",
    "UP-তে NPA বৃদ্ধির কারণ কী?",
    "SHAP ঝুঁকির কারণগুলি ব্যাখ্যা করুন",
    "এই ত্রৈমাসিকে পুনরুদ্ধার কেমন চলছে?",
  ],
  mr: [
    "कोणत्या राज्यांमध्ये सर्वाधिक फसवणुकीचा धोका आहे?",
    "बिहारसाठी वसुली धोरण सुचवा",
    "UP मध्ये NPA वाढीचे कारण काय आहे?",
    "SHAP जोखीम घटक स्पष्ट करा",
    "या तिमाहीत वसुलीचा कल कसा आहे?",
  ],
  gu: [
    "કયા રાજ્યોમાં છેતરપિંડીનું સૌથી વધુ જોખમ છે?",
    "બિહાર માટે રિકવરી વ્યૂહ સૂચવો",
    "UP માં NPA વૃદ્ધિ માટે શું કારણ છે?",
    "SHAP જોખમ પ્રભાવ સમજાવો",
    "આ ત્રિમાસિકમાં રિકવરી ટ્રેન્ડ કેવો છે?",
  ],
  kn: [
    "ಯಾವ ರಾಜ್ಯಗಳಲ್ಲಿ ಹೆಚ್ಚಿನ ವಂಚನೆ ಅಪಾಯವಿದೆ?",
    "ಬಿಹಾರಕ್ಕೆ ವಸೂಲಿ ತಂತ್ರ ಸೂಚಿಸಿ",
    "UP ನಲ್ಲಿ NPA ಹೆಚ್ಚಳಕ್ಕೆ ಕಾರಣವೇನು?",
    "SHAP ಅಪಾಯ ಅಂಶಗಳನ್ನು ವಿವರಿಸಿ",
    "ಈ ತ್ರೈಮಾಸಿಕದಲ್ಲಿ ವಸೂಲಿ ಹೇಗಿದೆ?",
  ],
  ml: [
    "ഏത് സംസ്ഥാനങ്ങളിൽ ഏറ്റവും കൂടുതൽ തട്ടിപ്പ് അപകടമുണ്ട്?",
    "ബിഹാറിനായി റിക്കവറി തന്ത്രം നിർദ്ദേശിക്കൂ",
    "UP-ൽ NPA വർദ്ധനവിന് കാരണമെന്ത്?",
    "SHAP റിസ്ക് ഘടകങ്ങൾ വിശദീകരിക്കൂ",
    "ഈ പാദത്തിൽ റിക്കവറി ട്രെൻഡ് എങ്ങനെ?",
  ],
  pa: [
    "ਕਿਹੜੇ ਰਾਜਾਂ ਵਿੱਚ ਸਭ ਤੋਂ ਵੱਧ ਧੋਖਾਧੜੀ ਦਾ ਖਤਰਾ ਹੈ?",
    "ਬਿਹਾਰ ਲਈ ਵਸੂਲੀ ਰਣਨੀਤੀ ਦੱਸੋ",
    "UP ਵਿੱਚ NPA ਵਾਧੇ ਦਾ ਕਾਰਨ ਕੀ ਹੈ?",
    "SHAP ਜੋਖਮ ਕਾਰਕਾਂ ਦੀ ਵਿਆਖਿਆ ਕਰੋ",
    "ਇਸ ਤਿਮਾਹੀ ਵਿੱਚ ਵਸੂਲੀ ਰੁਝਾਨ ਕਿਵੇਂ ਹੈ?",
  ],
};

const WELCOME_MSG_BY_LANG = {
  en: "Hello! I'm your LendQuant AI Assistant 👋\n\nI have real-time access to your loan portfolio, fraud alerts, and recovery data. Ask me anything about risk, strategy, or borrower profiles.",
  hi: "नमस्ते! मैं आपका LendQuant AI सहायक हूँ 👋\n\nमेरे पास आपके लोन पोर्टफोलियो, धोखाधड़ी अलर्ट और वसूली डेटा तक रीयल-टाइम पहुँच है। जोखिम, रणनीति या उधारकर्ता प्रोफाइल के बारे में कुछ भी पूछें।",
  ta: "வணக்கம்! நான் உங்கள் LendQuant AI உதவியாளர் 👋\n\nஉங்கள் கடன் போர்ட்ஃபோலியோ, மோசடி எச்சரிக்கைகள் மற்றும் மீட்பு தரவுகளை நான் அணுகலாம். ஆபத்து, உத்தி அல்லது கடன்தாரர் விவரங்கள் பற்றி கேளுங்கள்.",
  te: "నమస్కారం! నేను మీ LendQuant AI సహాయకుడిని 👋\n\nమీ లోన్ పోర్ట్‌ఫోలియో, మోసం హెచ్చరికలు మరియు రికవరీ డేటాకు నాకు రియల్-టైమ్ యాక్సెస్ ఉంది.",
  bn: "নমস্কার! আমি আপনার LendQuant AI সহকারী 👋\n\nআমার কাছে আপনার লোন পোর্টফোলিও, জালিয়াতি সতর্কতা এবং পুনরুদ্ধার ডেটার রিয়েল-টাইম অ্যাক্সেস রয়েছে।",
  mr: "नमस्कार! मी तुमचा LendQuant AI सहाय्यक आहे 👋\n\nमला तुमच्या कर्ज पोर्टफोलिओ, फसवणूक अलर्ट आणि वसुली डेटामध्ये रिअल-टाइम प्रवेश आहे.",
  gu: "નમસ્તે! હું તમારો LendQuant AI સહાયક છું 👋\n\nમારી પાસે તમારા લોન પોર્ટફોલિઓ, છેતરપિંડી ચેતવણીઓ અને રિકવરી ડેટાની રીઅલ-ટાઇમ ઍક્સેસ છે.",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ LendQuant AI ಸಹಾಯಕ 👋\n\nನಿಮ್ಮ ಸಾಲ ಪೋರ್ಟ್‌ಫೋಲಿಯೋ, ವಂಚನೆ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ರಿಕವರಿ ಡೇಟಾಗೆ ನನಗೆ ರಿಯಲ್-ಟೈಮ್ ಪ್ರವೇಶವಿದೆ.",
};

const getChatSystem = (langCode) => {
  const langNames = { en:"English", hi:"Hindi", ta:"Tamil", te:"Telugu", bn:"Bengali", mr:"Marathi", gu:"Gujarati", kn:"Kannada", ml:"Malayalam", pa:"Punjabi" };
  const langName = langNames[langCode] || "English";
  return `You are LendQuant AI Assistant — an expert in Indian loan risk management, NPA recovery, fraud detection, and NBFC/banking operations. You have deep knowledge of RBI guidelines, SARFAESI Act, and Indian state-wise loan risk patterns.

IMPORTANT: The user has selected ${langName} as their preferred language. You MUST respond ONLY in ${langName}, regardless of what language the user writes in.

You have access to this live dashboard data:
- Total Active Loans: 2,84,712 across 28 states
- High Risk Loans: 41,208 (14.5% of portfolio)
- Fraud Alerts: 1,847 live cases
- National Recovery Rate: 74.3% (above 74% target)
- Top High-Risk States: Bihar (38% default), UP (34%), Jharkhand (33%), MP (29%), West Bengal (27%)
- Top Low-Risk States: Kerala (8%), Gujarat (9%), Tamil Nadu (11%), Karnataka (14%)
- Recent Fraud Alerts: FR-4821 (Ramesh Kumar, UP, Location Anomaly, score 87), FR-4820 (Priya Mehta, MH, Multiple Loans, score 73)
- Recovery Trend: Aug 61% → Feb 77% (improving)
- Strategy Distribution: Soft Reminder 38%, Restructuring 27%, Field Visit 21%, Legal Escalation 14%

Answer concisely and professionally. Use ₹ for currency, reference specific states/borrowers when relevant. Format numbers in Indian style (lakhs/crores). Keep responses under 120 words unless a detailed analysis is asked. Use bullet points for lists.`;
};

function AIChatAssistant() {
  const { isDark } = useTheme();
  const [open, setOpen]       = useState(false);
  const [lang, setLang]       = useState("en");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME_MSG_BY_LANG["en"], ts: new Date() }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const currentLang = LANGUAGE_OPTIONS.find(l => l.code === lang) || LANGUAGE_OPTIONS[0];
  const suggestedPrompts = SUGGESTED_PROMPTS_BY_LANG[lang] || SUGGESTED_PROMPTS_BY_LANG["en"];

  const handleLangChange = (code) => {
    setLang(code);
    setShowLangPicker(false);
    setMessages([{ role: "assistant", content: WELCOME_MSG_BY_LANG[code] || WELCOME_MSG_BY_LANG["en"], ts: new Date() }]);
  };

  useEffect(() => {
    if (open && !minimized) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open, minimized]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg = { role: "user", content: userText, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg]
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: getChatSystem(lang),
          messages: history,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: "assistant", content: reply, ts: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠ Connection error. Please try again.", ts: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const formatTime = d => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const bg       = isDark ? "#080f20" : "#ffffff";
  const border   = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const hdrBg    = isDark ? "linear-gradient(135deg,#0d1f3c,#0a2540)" : "linear-gradient(135deg,#0f172a,#1e3a5f)";
  const msgBg    = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const inputBg  = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const inputBdr = isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0";
  const textCol  = isDark ? "#f1f5f9" : "#0f172a";
  const subCol   = isDark ? "#64748b" : "#94a3b8";

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => { setOpen(o => !o); setMinimized(false); }}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9998,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg,#14b8a6,#0ea5e9)",
          border: "none", cursor: "pointer",
          boxShadow: "0 8px 32px rgba(20,184,166,0.45), 0 2px 8px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          animation: open ? "none" : "glow 3s infinite",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(20,184,166,0.6), 0 2px 8px rgba(0,0,0,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(20,184,166,0.45), 0 2px 8px rgba(0,0,0,0.3)"; }}
      >
        {open ? (
          <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {/* Unread dot */}
        {!open && (
          <div style={{
            position: "absolute", top: 2, right: 2,
            width: 12, height: 12, borderRadius: "50%",
            background: "#ef4444", border: "2px solid white",
            animation: "pulse2 2s infinite",
          }}/>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 96, right: 28, zIndex: 9997,
          width: 380, borderRadius: 20,
          background: bg, border: `1px solid ${border}`,
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)"
            : "0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "chatIn 0.28s cubic-bezier(0.16,1,0.3,1) forwards",
          maxHeight: minimized ? 60 : 560,
          transition: "max-height 0.3s cubic-bezier(0.16,1,0.3,1)",
          fontFamily: "'Inter', sans-serif",
        }}>

          {/* Header */}
          <div style={{
            background: hdrBg, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 10,
            flexShrink: 0, cursor: "pointer",
          }} onClick={() => setMinimized(m => !m)}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#14b8a6,#0ea5e9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 0 12px rgba(20,184,166,0.5)",
            }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>LendQuant AI Assistant</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse2 2s infinite" }}/>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Online · Powered by Claude</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ position: "relative" }}>
                <button
                  onClick={e => { e.stopPropagation(); setShowLangPicker(p => !p); }}
                  style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, height: 26, padding: "0 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  title="Language preference"
                >
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: currentLang.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "white", fontFamily: "'Inter',sans-serif", flexShrink: 0 }}>{currentLang.code.toUpperCase().slice(0,2)}</div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>{currentLang.label.slice(0,3).toUpperCase()}</span>
                  <svg width="8" height="8" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showLangPicker && (
                  <div onClick={e => e.stopPropagation()} style={{
                    position: "fixed", right: 16, bottom: 64,
                    background: isDark ? "#0d1f3c" : "#ffffff",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0"}`,
                    borderRadius: 10, padding: "6px 4px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    zIndex: 10000, minWidth: 170,
                    maxHeight: 360, overflowY: "auto",
                    animation: "slideUp 0.15s ease forwards",
                  }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: isDark ? "#64748b" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", padding: "2px 10px 6px", margin: 0 }}>Response Language</p>
                    {LANGUAGE_OPTIONS.map(l => (
                      <button key={l.code} onClick={() => handleLangChange(l.code)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, width: "100%",
                          padding: "6px 10px", border: "none", borderRadius: 6, cursor: "pointer",
                          background: lang === l.code ? "rgba(20,184,166,0.15)" : "transparent",
                          color: lang === l.code ? "#14b8a6" : (isDark ? "#e2e8f0" : "#334155"),
                          fontFamily: "'Inter',sans-serif",
                        }}
                        onMouseEnter={e => { if(lang!==l.code) e.currentTarget.style.background = isDark?"rgba(255,255,255,0.07)":"#f1f5f9"; }}
                        onMouseLeave={e => { if(lang!==l.code) e.currentTarget.style.background = "transparent"; }}
                      >
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: l.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "white", fontFamily: "'Inter',sans-serif", flexShrink: 0 }}>{l.code.toUpperCase().slice(0,2)}</div>
                        <div style={{ textAlign: "left" }}>
                          <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{l.nativeName}</p>
                          <p style={{ fontSize: 9, color: isDark ? "#64748b" : "#94a3b8", margin: 0 }}>{l.label}</p>
                        </div>
                        {lang === l.code && (
                          <svg style={{ marginLeft: "auto" }} width="10" height="10" fill="none" stroke="#14b8a6" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); setMessages([{ role:"assistant", content:"Chat cleared. How can I help you?", ts: new Date() }]); }}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Clear chat"
              >
                <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); setMinimized(m => !m); }}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d={minimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "14px 14px 8px",
                display: "flex", flexDirection: "column", gap: 10,
                minHeight: 0,
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex", flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                    animation: "msgIn 0.2s ease forwards",
                  }}>
                    {msg.role === "assistant" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#14b8a6,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: subCol, textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Assistant</span>
                        <span style={{ fontSize: 10, color: subCol }}>{formatTime(msg.ts)}</span>
                      </div>
                    )}
                    <div style={{
                      maxWidth: "85%",
                      background: msg.role === "user"
                        ? "linear-gradient(135deg,#14b8a6,#0ea5e9)"
                        : msgBg,
                      border: msg.role === "user" ? "none" : `1px solid ${border}`,
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                      padding: "10px 13px",
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: msg.role === "user" ? "#ffffff" : textCol,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}>
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <span style={{ fontSize: 10, color: subCol, marginTop: 3 }}>{formatTime(msg.ts)}</span>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, animation: "msgIn 0.2s ease" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#14b8a6,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ background: msgBg, border: `1px solid ${border}`, borderRadius: "4px 16px 16px 16px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#14b8a6", animation: `typingDot 1.2s infinite ${i * 0.2}s` }}/>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>

              {/* Suggested prompts */}
              {messages.length <= 1 && (
                <div style={{ padding: "0 14px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {suggestedPrompts.slice(0,4).map(p => (
                    <button key={p} onClick={() => sendMessage(p)}
                      style={{
                        fontSize: 11, padding: "5px 10px", borderRadius: 20,
                        background: isDark ? "rgba(20,184,166,0.12)" : "rgba(20,184,166,0.08)",
                        border: "1px solid rgba(20,184,166,0.25)",
                        color: "#14b8a6", cursor: "pointer", fontWeight: 500,
                        transition: "all 0.15s",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(20,184,166,0.22)"}
                      onMouseLeave={e => e.currentTarget.style.background = isDark ? "rgba(20,184,166,0.12)" : "rgba(20,184,166,0.08)"}
                    >{p}</button>
                  ))}
                </div>
              )}

              {/* Input bar */}
              <div style={{
                padding: "10px 14px 14px", flexShrink: 0,
                borderTop: `1px solid ${border}`,
                background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa",
              }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask about risk, fraud, recovery..."
                    rows={1}
                    style={{
                      flex: 1, resize: "none", border: `1px solid ${inputBdr}`,
                      borderRadius: 12, padding: "9px 13px",
                      fontSize: 12.5, lineHeight: 1.5,
                      background: inputBg, color: textCol,
                      outline: "none", fontFamily: "'Inter', sans-serif",
                      maxHeight: 80, overflowY: "auto",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#14b8a6"}
                    onBlur={e => e.target.style.borderColor = inputBdr}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    style={{
                      width: 38, height: 38, borderRadius: 12, border: "none",
                      background: input.trim() && !loading
                        ? "linear-gradient(135deg,#14b8a6,#0ea5e9)"
                        : isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                      cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {loading ? (
                      <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#ffffff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
                    ) : (
                      <svg width="15" height="15" fill="none" stroke={input.trim() ? "white" : (isDark ? "#475569" : "#94a3b8")} strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                <p style={{ fontSize: 10, color: subCol, marginTop: 6, textAlign: "center" }}>
                  Powered by Claude · Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   APP SHELL
═══════════════════════════════════════════════════════════ */
function AppShell() {
  const { isDark } = useTheme();
  const [active, setActive] = useState("overview");
  const [sideOpen, setSideOpen] = useState(true);
  const [role, setRole] = useState("admin");
  const [notifOpen, setNotifOpen] = useState(false);
  const { toasts, push: toast } = useToast();

  const visibleNav = NAV.filter(n => n.roles.includes(role));
  const handleNav = id => {
    if (!visibleNav.find(n => n.id === id)) { toast("Access denied for your role", "error"); return; }
    setActive(id);
  };

  const pageBg = isDark
    ? { background:"linear-gradient(135deg,#020a1a 0%,#060f28 50%,#020a1a 100%)" }
    : { background:"linear-gradient(135deg,#eef6ff 0%,#e8f4fd 50%,#f0f7ff 100%)" };

  const pageMap = {
    overview: <OverviewPage onToast={toast}/>,
    risk:     <RiskPage/>,
    geo:      <GeoPage/>,
    fraud:    role === "admin"
      ? <FraudPage onToast={toast}/>
      : <div className="flex items-center justify-center h-64"><p className="text-slate-400 text-sm">⚠ Admin access required. Switch in Settings.</p></div>,
    emi:      <EmiPage/>,
    strategy: <StrategyPage/>,
    reports:  <ReportsPage/>,
    predict:   <PredictiveDefaultPage/>,
    funnel:    <RecoveryFunnelPage/>,
    multilang: <MultiLangEMIPage/>,
    settings: <SettingsPage role={role} setRole={r => { setRole(r); handleNav("settings"); }} onToast={toast}/>,
  };

  const pageLabel = visibleNav.find(n => n.id === active)?.label || "Overview";

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="min-h-screen flex" style={{ ...pageBg, fontFamily:"'Inter',sans-serif" }}>
        {/* Ambient glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px]"
            style={{ opacity:isDark?0.05:0.04, background:"radial-gradient(ellipse,#14b8a6,transparent 70%)", filter:"blur(60px)" }}/>
          <div className="absolute bottom-0 right-0 w-80 h-80"
            style={{ opacity:isDark?0.03:0.025, background:"radial-gradient(circle,#3b82f6,transparent 70%)", filter:"blur(80px)" }}/>
        </div>

        <Sidebar active={active} setActive={handleNav} role={role} open={sideOpen}/>

        <div className="flex-1 flex flex-col min-w-0" style={{
          background: isDark
            ? "radial-gradient(circle at 30% 20%, rgba(20,184,166,0.08), transparent 40%)"
            : "radial-gradient(circle at 30% 20%, rgba(59,130,246,0.08), transparent 40%)"
        }}>
          <TopNavbar sideOpen={sideOpen} setSideOpen={setSideOpen} role={role} active={active} onNotifOpen={setNotifOpen} onNav={handleNav}/>
          <LiveTicker/>
          <main className="flex-1 overflow-y-auto p-5">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h1 className="text-xl font-black tracking-tight nav-font" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>{pageLabel}</h1>
                <p className="text-xs mt-0.5" style={{ color: isDark ? "#94a3b8" : "#475569" }}>LendQuant AI · National Loan Risk & Fraud Intelligence</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{animation:"pulse2 2s infinite"}}/>
                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Systems Normal</span>
              </div>
            </div>
            {pageMap[active] || <OverviewPage onToast={toast}/>}
          </main>
        </div>
      </div>
      <ToastContainer toasts={toasts}/>
      <NotificationOverlay open={notifOpen} onClose={() => setNotifOpen(false)} />
      <AIChatAssistant/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════════ */
export default function LendQuantAI() {
  return (
    <ThemeProvider>
      <AppShell/>
    </ThemeProvider>
  );
}
