import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  Dumbbell, Plus, Trash2, ChevronLeft, ChevronRight, TrendingUp,
  CalendarDays, Flame, Activity, Trophy, Zap, Camera, Heart, RefreshCw,
} from "lucide-react";

/* ---------------- design tokens ---------------- */
const C = {
  bg: "#0A0606", panel: "#1A1311", panel2: "#251A16",
  line: "rgba(251,191,128,0.16)", lineSoft: "rgba(251,191,128,0.08)",
  green: "#FB923C", greenDim: "#C2410C", lime: "#FBBF24",
  cyan: "#FB7185", violet: "#F472B6", amber: "#FCD34D",
  coral: "#F43F5E",
  text: "#FFF7F2", muted: "#C7A99B", faint: "#8A6F63",
};
const F_DISP = "'Barlow Condensed', system-ui, sans-serif";
const F_BODY = "'Barlow', system-ui, sans-serif";
const F_MONO = "'JetBrains Mono', ui-monospace, monospace";

/* ---------------- motivation content ---------------- */
const QUOTES = [
  { text: "The version of you one year from now is watching every choice you make today. Don't let them down." },
  { text: "Consistency doesn't care about motivation. Show up anyway." },
  { text: "You didn't come this far to only come this far." },
  { text: "Every time you choose your goals over a craving, you get a little stronger." },
  { text: "Showing up is already 80% of winning. You showed up." },
  { text: "Your future body is built in the moments your current self doesn't feel like trying." },
  { text: "Discipline is the bridge between who you are and who you want to be." },
  { text: "The food will still be there tomorrow. The progress you lose won't come back as fast." },
  { text: "Strong is built one rep, one meal, one choice at a time." },
  { text: "You're not tired — you're just used to stopping here. Push past the familiar." },
  { text: "The only bad workout is the one that didn't happen." },
  { text: "Progress isn't loud. It's the quiet accumulation of small daily choices." },
  { text: "Nobody who ever gave their best regretted it.", author: "George Halas" },
  { text: "If it doesn't challenge you, it doesn't change you." },
  { text: "What you do today is who you become tomorrow." },
  { text: "The hardest lift is getting yourself there. Everything after that is just reps." },
  { text: "Motivation gets you started. Habits keep you going. Build the habit." },
  { text: "You're building something. Every session is another brick in the wall." },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The secret is there is no secret. Do the work, every day, without exception." },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Be stronger than your excuses." },
  { text: "You've earned every rep you've done. Don't trade that work for a moment of boredom." },
  { text: "Success isn't owned. It's leased. And rent is due every day.", author: "J.J. Watt" },
  { text: "The pain of discipline weighs ounces. The pain of regret weighs tons." },
  { text: "When you feel like quitting, think about why you started." },
  { text: "Each workout is a conversation between you and your potential." },
  { text: "Your body hears everything your mind says. Tell it the right things." },
  { text: "Every champion was once a beginner who refused to quit." },
  { text: "Fall in love with the process and the results will follow." },
];

const ANTI_SNACK_TIPS = [
  {
    headline: "That's boredom, not hunger.",
    body: "Your brain is looking for stimulation, not calories. Boredom and hunger feel identical in your body — but they're not.",
    action: "Drink a full glass of water right now. Then stand up and walk for 2 minutes. If you still want food in 10 minutes, have a piece of fruit.",
  },
  {
    headline: "The craving will peak and fade in 5 minutes.",
    body: "Cravings are waves — they build, peak, and crash. You just have to outlast the peak. You've done harder things than this.",
    action: "Set a 5-minute timer. Do something with your hands: write, doodle, stretch, or go refill your water bottle. Ride it out.",
  },
  {
    headline: "Are you actually hungry?",
    body: "If someone offered you a plain apple or some carrots right now, would you eat them enthusiastically? If no — you're not hungry. You're bored.",
    action: "Ask yourself what you're actually feeling. Stressed? Restless? Distracted? Address that directly instead of reaching for food.",
  },
  {
    headline: "You've already come too far for this.",
    body: "Every time you resist a craving, you get measurably stronger at resisting the next one. This exact moment is building the skill.",
    action: "Open your Progress tab. Look at what you've built. Remember why you started. Then drink water and get back to work.",
  },
  {
    headline: "Idle hands, hungry mouth.",
    body: "Boredom snacking is almost always about having nothing for your hands and mind to do — not actual hunger.",
    action: "Text a friend, read one article, reorganize your desk, or take a 3-minute walk. Give your brain the stimulation it's actually craving.",
  },
  {
    headline: "The gym version of you says no.",
    body: "You put in real work in the gym. Every unnecessary snack is borrowing against that investment. Don't borrow from yourself.",
    action: "Think about how you feel walking out of the gym after a great session. Protect that feeling. Drink water and wait it out.",
  },
  {
    headline: "Change your location, break the craving.",
    body: "Cravings are tied to context and location. Staying in the same spot with the same thoughts keeps the craving alive.",
    action: "Get up and physically move. Go to a different room, take the long route to the bathroom, or step outside for 60 seconds.",
  },
  {
    headline: "Boredom at work is a signal, not a hunger cue.",
    body: "When you reach for snacks at your desk, your brain is asking for a change — not food. Don't confuse the two.",
    action: "Do 10 desk pushups, stretch for 2 minutes, or write down 3 things you want to finish before end of day. Break the pattern.",
  },
  {
    headline: "Future you is counting on present you.",
    body: "The small decisions stack. Every single snack you skip is a vote for who you're becoming. Make it count.",
    action: "Write down exactly what you're feeling right now and why you wanted to snack. Awareness breaks the automatic loop.",
  },
  {
    headline: "Water first. Always water first.",
    body: "Dehydration mimics hunger almost perfectly. You might just need fluids, not food.",
    action: "Drink 16oz of water right now. All of it. Then wait 10 minutes. Cravings caused by dehydration will fade fast.",
  },
];

/* ---------------- storage (localStorage) ---------------- */
const store = {
  async get(k, fb) {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fb;
    } catch { return fb; }
  },
  async set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { console.error(e); }
  },
};

/* ---------- photo storage: canvas compress + IndexedDB ---------- */
let _photoDB = null;
async function getPhotoDB() {
  if (_photoDB) return _photoDB;
  return new Promise((res, rej) => {
    const r = indexedDB.open("fit-photos", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("p", { keyPath: "id", autoIncrement: true });
    r.onsuccess = () => { _photoDB = r.result; res(_photoDB); };
    r.onerror = () => rej(r.error);
  });
}
async function compressPhoto(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 800;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) { const k = Math.min(MAX/w, MAX/h); w = Math.round(w*k); h = Math.round(h*k); }
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      res(c.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = rej; img.src = url;
  });
}
async function dbSavePhoto(date, file) {
  const db2 = await getPhotoDB();
  const dataUrl = await compressPhoto(file);
  const id = await new Promise((res, rej) => {
    const tx = db2.transaction("p", "readwrite");
    const req = tx.objectStore("p").add({ date, dataUrl, ts: Date.now() });
    req.onsuccess = () => res(req.result);
    tx.onerror = () => rej(tx.error);
  });
  return { id, dataUrl };
}
async function dbDeletePhoto(id) {
  const db2 = await getPhotoDB();
  return new Promise((res, rej) => {
    const tx = db2.transaction("p", "readwrite");
    tx.objectStore("p").delete(id);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}
async function dbLoadAllPhotos() {
  const db2 = await getPhotoDB();
  return new Promise((res, rej) => {
    const tx = db2.transaction("p", "readonly");
    const req = tx.objectStore("p").getAll();
    req.onsuccess = () => {
      const out = {};
      req.result.forEach(r => { (out[r.date] = out[r.date] || []).push({ id: r.id, dataUrl: r.dataUrl }); });
      res(out);
    };
    req.onerror = () => rej(req.error);
  });
}

/* ---------------- date helpers ---------------- */
const dstr = (d) => { const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; };
const TODAY = dstr(new Date());
const addDays = (s, n) => { const [y,m,d]=s.split("-").map(Number); return dstr(new Date(y,m-1,d+n)); };
const pretty = (s) => { const [y,m,d]=s.split("-").map(Number);
  return new Date(y,m-1,d).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"}); };
const shortD = (s) => { const [,m,d]=s.split("-").map(Number); return `${m}/${d}`; };
const round = (n) => Math.round(n);

/* ---------------- the split ---------------- */
const WEEKDAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SPLIT = [
  { name: "Quad-Focused Legs", color: C.violet, lifts: [
    { n: "Leg Adductor", s: 2, r: 12 },
    { n: "Smith Machine Squat", s: 3, r: 8 },
    { n: "Pendulum Squat", s: 3, r: 8 },
    { n: "Bulgarian Split Squat", s: 3, r: 8 },
    { n: "Leg Extension", s: 3, r: 8 },
    { n: "Incline Treadmill", cardio: true, min: 30 },
  ]},
  { name: "Chest & Back", color: C.green, lifts: [
    { n: "Incline Smith Machine Press", s: 3, r: 8 },
    { n: "Flat Machine Press", s: 3, r: 8 },
    { n: "Pec Deck", s: 3, r: 8 },
    { n: "Chest-Supported Machine Row", s: 3, r: 8 },
    { n: "Close-Grip Lat Pulldown", s: 3, r: 8 },
    { n: "Close-Grip Cable Row", s: 3, r: 8 },
    { n: "Pull-Ups", s: 2, r: "F" },
    { n: "Incline Treadmill", cardio: true, min: 30 },
  ]},
  { name: "Shoulders & Arms", color: C.cyan, lifts: [
    { n: "Military Press", s: 3, r: 8 },
    { n: "Cable Lateral Raise", s: 3, r: 8 },
    { n: "Rear Delt Fly", s: 3, r: 8 },
    { n: "Preacher Curl", s: 3, r: 8 },
    { n: "Overhead Triceps Press", s: 3, r: 8 },
    { n: "Hammer Curl", s: 3, r: 8 },
    { n: "Triceps Pushdown", s: 3, r: 8 },
    { n: "Incline Treadmill", cardio: true, min: 30 },
  ]},
  { name: "Core & Cardio", color: C.lime, lifts: [
    { n: "Core Machine", s: 3, r: 10 },
    { n: "Ab Crunch", s: 3, r: 10 },
    { n: "Leg Raises", s: 3, r: "F" },
    { n: "Incline Treadmill", cardio: true, min: 30 },
  ]},
  { name: "Upper Body", color: C.green, lifts: [
    { n: "Incline Smith Machine Press", s: 3, r: 8 },
    { n: "Pec Deck", s: 3, r: 8 },
    { n: "Chest-Supported Machine Row", s: 3, r: 8 },
    { n: "Close-Grip Lat Pulldown", s: 3, r: 8 },
    { n: "Lateral Raise Machine", s: 3, r: 8 },
    { n: "Preacher Curl", s: 3, r: 8 },
    { n: "Triceps Pushdown", s: 3, r: 8 },
    { n: "Incline Treadmill", cardio: true, min: 30 },
  ]},
  { name: "Hamstring-Focused Legs", color: C.violet, lifts: [
    { n: "Seated Hamstring Curl", s: 3, r: 8 },
    { n: "Romanian Deadlift", s: 3, r: 8 },
    { n: "Single-Leg Curl", s: 3, r: 8 },
    { n: "Adductor Machine", s: 2, r: 12 },
    { n: "Incline Treadmill", cardio: true, min: 30 },
  ]},
  { name: "Core & Cardio", color: C.lime, lifts: [
    { n: "Core Machine", s: 3, r: 10 },
    { n: "Ab Crunch", s: 3, r: 8 },
    { n: "Leg Raises", s: 3, r: "F" },
    { n: "Incline Treadmill", cardio: true, min: 30 },
  ]},
];
const splitFor = (date) => SPLIT[(new Date(date + "T12:00:00").getDay() + 6) % 7];
const liftLabel = (l) => l.cardio ? `${l.min} min ${l.n}` : `${l.s} × ${l.r === "F" ? "F" : l.r}  ${l.n}`;

/* ---------------- primitives ---------------- */
const Panel = ({ children, style }) => (
  <div style={{ background: `linear-gradient(180deg, ${C.panel}, #0b1326 140%)`,
    border: `1px solid ${C.line}`, borderRadius: 16, ...style }}>{children}</div>
);
const Eyebrow = ({ children, color = C.muted }) => (
  <div style={{ font: `600 12px ${F_MONO}`, letterSpacing: 2.5, textTransform: "uppercase", color }}>{children}</div>
);
const Btn = ({ children, onClick, bg = C.green, fg = "#04140a", style, label }) => (
  <button onClick={onClick} aria-label={label} style={{ border: "none", borderRadius: 10, padding: "11px 17px",
    cursor: "pointer", font: `700 14px ${F_BODY}`, letterSpacing: .3, display: "inline-flex", alignItems: "center",
    gap: 7, background: bg, color: fg, transition: "filter .2s, background-color .2s", minHeight: 44, ...style }}
    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.12)")}
    onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}>{children}</button>
);
const GhostBtn = ({ children, onClick, style, label }) => (
  <button onClick={onClick} aria-label={label} style={{ border: `1px solid ${C.line}`, borderRadius: 10,
    padding: "11px 15px", cursor: "pointer", font: `600 14px ${F_BODY}`, background: C.panel2, color: C.text,
    display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, transition: "border-color .2s, background-color .2s", ...style }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.green; e.currentTarget.style.background = "#243042"; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.background = C.panel2; }}>{children}</button>
);
const cell = { background: C.bg, border: `1px solid ${C.line}`, borderRadius: 8, padding: "11px 12px",
  color: C.text, font: `600 16px ${F_MONO}`, outline: "none", width: "100%", boxSizing: "border-box", minHeight: 44 };

/* ================================================================ */
export default function App() {
  const [tab, setTab] = useState("session");
  const [date, setDate] = useState(TODAY);
  const [loaded, setLoaded] = useState(false);
  const [log, setLog] = useState({});
  const [bodyLog, setBodyLog] = useState({});
  const [photos, setPhotos] = useState({});
  const [range, setRange] = useState(14);

  useEffect(() => {
    const l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap";
    document.head.appendChild(l);
  }, []);
  useEffect(() => { (async () => {
    setLog(await store.get("trainingLog", {}));
    setBodyLog(await store.get("bodyLog", {}));
    setPhotos(await dbLoadAllPhotos());
    setLoaded(true);
  })(); }, []);

  const save = (next) => { setLog(next); store.set("trainingLog", next); };
  const saveBody = (next) => { setBodyLog(next); store.set("bodyLog", next); };
  const setBodyField = (k, v) => {
    const entry = bodyLog[date] || {};
    saveBody({ ...bodyLog, [date]: { ...entry, [k]: v } });
  };
  const addPhoto = async (file) => {
    const { id, dataUrl } = await dbSavePhoto(date, file);
    setPhotos(prev => ({ ...prev, [date]: [...(prev[date] || []), { id, dataUrl }] }));
  };
  const deletePhoto = async (photoDate, id) => {
    await dbDeletePhoto(id);
    setPhotos(prev => ({ ...prev, [photoDate]: (prev[photoDate] || []).filter(p => p.id !== id) }));
  };
  const session = log[date] || [];

  const lastBest = useMemo(() => {
    const dates = Object.keys(log).filter((d) => d < date).sort().reverse();
    return (name) => {
      for (const d of dates) {
        const ex = (log[d] || []).find((e) => e.name === name && !e.cardio && e.sets?.some((s) => +s.w));
        if (ex) { const top = ex.sets.reduce((a, s) => (+s.w > +a.w ? s : a), { w: 0, r: 0 });
          return { date: d, w: +top.w, r: +top.r }; }
      }
      return null;
    };
  }, [log, date]);

  const volume = session.reduce((a, ex) => a + (ex.sets || []).reduce((s, x) => s + (+x.w || 0) * (+x.r || 0), 0), 0);

  const streak = useMemo(() => {
    let n = 0, cur = TODAY;
    if (!(log[cur]?.length)) cur = addDays(cur, -1);
    while (log[cur]?.length) { n++; cur = addDays(cur, -1); }
    return n;
  }, [log]);

  const addPrescribed = (l) => {
    const ex = l.cardio
      ? { id: Date.now() + Math.random(), name: l.n, cardio: true, min: l.min, incline: "", speed: "" }
      : { id: Date.now() + Math.random(), name: l.n, target: `${l.s}×${l.r}`,
          sets: Array.from({ length: l.s }, () => ({ w: "", r: l.r === "F" ? "" : l.r })) };
    save({ ...log, [date]: [...session, ex] });
  };
  const addCustom = (name) => { if (!name.trim()) return;
    save({ ...log, [date]: [...session, { id: Date.now()+Math.random(), name: name.trim(), sets: [{ w:"", r:"" }] }] }); };
  const loadFullDay = () => {
    const sp = splitFor(date);
    const existing = new Set(session.map((e) => e.name));
    const toAdd = sp.lifts.filter((l) => !existing.has(l.n)).map((l) => l.cardio
      ? { id: Date.now()+Math.random()+l.n, name: l.n, cardio: true, min: l.min, incline:"", speed:"" }
      : { id: Date.now()+Math.random()+l.n, name: l.n, target: `${l.s}×${l.r}`,
          sets: Array.from({ length: l.s }, () => ({ w:"", r: l.r==="F"?"":l.r })) });
    save({ ...log, [date]: [...session, ...toAdd] });
  };
  const upd = (ns) => save({ ...log, [date]: ns });
  const setField = (id, i, k, v) => upd(session.map((e) => e.id === id
    ? { ...e, sets: e.sets.map((s, j) => j === i ? { ...s, [k]: v } : s) } : e));
  const setCardio = (id, k, v) => upd(session.map((e) => e.id === id ? { ...e, [k]: v } : e));
  const addSet = (id) => upd(session.map((e) => e.id === id
    ? { ...e, sets: [...e.sets, { w: e.sets.at(-1)?.w || "", r: e.sets.at(-1)?.r || "" }] } : e));
  const delSet = (id, i) => upd(session.map((e) => e.id === id
    ? { ...e, sets: e.sets.filter((_, j) => j !== i) } : e).filter((e) => e.cardio || e.sets.length));
  const delEx = (id) => upd(session.filter((e) => e.id !== id));

  if (!loaded) return <div style={{ background: C.bg, minHeight: "100vh", display: "grid",
    placeItems: "center", color: C.muted, font: `600 15px ${F_MONO}` }}>Loading…</div>;

  const sp = splitFor(date);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: F_BODY, color: C.text,
      backgroundImage: `radial-gradient(1100px 520px at 90% -8%, ${sp.color}1f, transparent 58%), radial-gradient(800px 420px at 0% 0%, ${C.green}12, transparent 55%)` }}>
      <div style={{ padding: "24px 32px 60px" }}>

        {/* header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          <div>
            <Eyebrow color={sp.color}>Training Log // Amped Fitness</Eyebrow>
            <h1 style={{ font: `800 40px/.9 ${F_DISP}`, margin: "6px 0 0", letterSpacing: .5, textTransform: "uppercase" }}>
              Beat&nbsp;Last&nbsp;Week
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 16px",
            background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12 }}>
            <Flame size={22} color={streak ? C.green : C.faint} fill={streak ? C.green : "none"} />
            <div><div style={{ font: `700 26px/.85 ${F_DISP}`, color: C.green }}>{streak}</div>
              <div style={{ font: `600 9px ${F_MONO}`, color: C.faint, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>day streak</div></div>
          </div>
        </header>

        {/* tabs */}
        <nav style={{ display: "flex", gap: 6, background: C.panel, padding: 6, borderRadius: 12,
          border: `1px solid ${C.line}`, marginBottom: 20 }} role="tablist">
          {[
            ["session","Session",<Dumbbell size={17}/>],
            ["progress","Progress",<TrendingUp size={17}/>],
            ["motivation","Motivation",<Zap size={17}/>],
            ["plan","Full Split",<CalendarDays size={17}/>],
          ].map(([id,l,ic]) => (
            <button key={id} onClick={() => setTab(id)} role="tab" aria-selected={tab===id}
              style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 9, padding: "11px 8px", minHeight: 44,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              background: tab === id ? (id === "motivation" ? C.violet : C.green) : "transparent",
              color: tab === id ? (id === "motivation" ? "#fff" : "#04140a") : C.muted,
              font: `700 13px ${F_BODY}`, letterSpacing: .3, transition: "background-color .2s, color .2s" }}>{ic}{l}</button>
          ))}
        </nav>

        {tab === "session" && <>
          {/* date nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <GhostBtn onClick={() => setDate(addDays(date,-1))} label="Previous day" style={{ padding: "11px 12px" }}><ChevronLeft size={17}/></GhostBtn>
            <div style={{ font: `700 18px ${F_BODY}`, letterSpacing: .2 }}>{date === TODAY ? "Today" : pretty(date)}</div>
            <GhostBtn onClick={() => date < TODAY && setDate(addDays(date,1))} label="Next day"
              style={{ padding: "11px 12px", opacity: date < TODAY ? 1 : .35 }}><ChevronRight size={17}/></GhostBtn>
            {date !== TODAY && <GhostBtn onClick={() => setDate(TODAY)} style={{ marginLeft: "auto" }}>Today</GhostBtn>}
          </div>

          {/* prescribed session header block */}
          <Panel style={{ padding: 20, marginBottom: 16, borderColor: `${sp.color}55`,
            background: `linear-gradient(135deg, ${sp.color}22, ${C.panel} 58%)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
              <div>
                <Eyebrow color={sp.color}>{WEEKDAYS[(new Date(date+"T12:00:00").getDay()+6)%7]} // Prescribed</Eyebrow>
                <div style={{ font: `800 34px/.95 ${F_DISP}`, marginTop: 6, textTransform: "uppercase", letterSpacing: .5 }}>{sp.name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ font: `800 38px/.85 ${F_DISP}`, color: sp.color }}>{round(volume).toLocaleString()}</div>
                <div style={{ font: `600 10px ${F_MONO}`, color: C.faint, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>lb volume today</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {sp.lifts.map((l) => (
                <button key={l.n} onClick={() => addPrescribed(l)} style={{ background: "rgba(2,6,23,0.55)",
                  border: `1px solid ${C.line}`, borderRadius: 9, padding: "9px 12px", cursor: "pointer", minHeight: 40,
                  color: l.cardio ? C.muted : C.text, font: `600 13px ${F_BODY}`, display: "inline-flex", gap: 6, alignItems: "center",
                  transition: "border-color .2s, background-color .2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = sp.color; e.currentTarget.style.background = "rgba(2,6,23,0.85)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.background = "rgba(2,6,23,0.55)"; }}>
                  {l.cardio ? <Activity size={13} color={sp.color}/> : <Plus size={13} color={sp.color}/>} {liftLabel(l)}
                </button>
              ))}
            </div>
            <Btn onClick={loadFullDay} bg={sp.color} style={{ marginTop: 16 }}><Plus size={16}/> Load full session</Btn>
          </Panel>

          <DailyCheckin entry={bodyLog[date] || {}} onChange={setBodyField} photos={photos[date] || []} onAddPhoto={addPhoto} onDeletePhoto={(id) => deletePhoto(date, id)} />
          <CustomAdd onAdd={addCustom} />

          {session.map((ex) => ex.cardio
            ? <CardioCard key={ex.id} ex={ex} onChange={setCardio} onDel={delEx} accent={sp.color} />
            : <LiftCard key={ex.id} ex={ex} prev={lastBest(ex.name)} accent={sp.color}
                onField={setField} onAddSet={addSet} onDelSet={delSet} onDel={delEx} />)}

          {!session.length && (
            <Panel style={{ padding: 44, textAlign: "center" }}>
              <Dumbbell size={30} color={C.faint} />
              <div style={{ color: C.muted, font: `500 15px ${F_BODY}`, marginTop: 12 }}>
                Tap a prescribed lift to start logging, or load the full session.
              </div>
            </Panel>
          )}
        </>}

        {tab === "progress" && <>
          <AnalyticsView bodyLog={bodyLog} log={log} range={range} setRange={setRange} />
          <ProgressView log={log} />
          <ProgressPhotosView photos={photos} onDelete={deletePhoto} />
        </>}

        {tab === "motivation" && (
          <MotivationTab entry={bodyLog[TODAY] || {}} onChange={(k, v) => {
            const entry = bodyLog[TODAY] || {};
            saveBody({ ...bodyLog, [TODAY]: { ...entry, [k]: v } });
          }} />
        )}

        {tab === "plan" && <PlanView />}

        <footer style={{ marginTop: 40, textAlign: "center", color: C.faint, font: `500 12px ${F_MONO}`, letterSpacing: .5 }}>
          Synced across all devices · progressive overload is the whole game
        </footer>
      </div>
    </div>
  );
}

/* ---------------- motivation tab ---------------- */
function MotivationTab({ entry, onChange }) {
  const dailyQuote = QUOTES[new Date().getDate() % QUOTES.length];
  const [activeQuote, setActiveQuote] = useState(null);
  const [mode, setMode] = useState(null); // null | "boost" | "craving"
  const [cravingIdx, setCravingIdx] = useState(0);

  const getNewQuote = () => {
    let q;
    do { q = QUOTES[Math.floor(Math.random() * QUOTES.length)]; }
    while (q.text === (activeQuote?.text || dailyQuote.text) && QUOTES.length > 1);
    setActiveQuote(q);
    setMode("boost");
  };

  const fightCraving = () => {
    setCravingIdx(Math.floor(Math.random() * ANTI_SNACK_TIPS.length));
    setMode("craving");
  };

  const nextCraving = () => setCravingIdx((cravingIdx + 1) % ANTI_SNACK_TIPS.length);

  const craving = ANTI_SNACK_TIPS[cravingIdx];
  const quote = mode === "boost" && activeQuote ? activeQuote : null;

  const ENERGY = ["1", "2", "3", "4", "5"];
  const ENERGY_COLORS = [C.coral, "#f97316", C.amber, C.lime, C.green];
  const MOOD_EMOJI = ["😖", "😕", "😐", "😊", "😄"];

  const ScaleBtn = ({ i, value, field, colors }) => {
    const selected = entry[field] === i + 1;
    return (
      <button onClick={() => onChange(field, selected ? null : i + 1)}
        style={{ flex: 1, border: `1px solid ${selected ? (colors?.[i] || C.violet) : C.line}`,
          borderRadius: 9, padding: "10px 6px", cursor: "pointer", minHeight: 44,
          background: selected ? `${colors?.[i] || C.violet}33` : C.panel,
          color: selected ? (colors?.[i] || C.violet) : C.muted,
          font: `700 16px ${F_DISP}`, transition: "all .15s", letterSpacing: .3 }}>
        {colors ? ENERGY[i] : MOOD_EMOJI[i]}
      </button>
    );
  };

  return (
    <>
      {/* daily fuel */}
      <Panel style={{ padding: 24, marginBottom: 16, borderColor: `${C.violet}55`,
        background: `linear-gradient(135deg, ${C.violet}1a, ${C.panel} 65%)` }}>
        <Eyebrow color={C.violet}>Today's Fuel</Eyebrow>
        <div style={{ font: `700 24px/1.35 ${F_DISP}`, marginTop: 14, letterSpacing: .3, color: C.text }}>
          "{dailyQuote.text}"
        </div>
        {dailyQuote.author && (
          <div style={{ font: `500 13px ${F_BODY}`, color: C.faint, marginTop: 10 }}>— {dailyQuote.author}</div>
        )}
      </Panel>

      {/* action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Btn onClick={getNewQuote} bg={C.violet} fg="#fff" style={{ justifyContent: "center" }}>
          <Zap size={16}/> More Fuel
        </Btn>
        <Btn onClick={fightCraving} bg={C.coral} fg="#fff" style={{ justifyContent: "center" }}>
          <Heart size={16}/> Fighting a Craving?
        </Btn>
      </div>

      {/* boost quote */}
      {mode === "boost" && quote && (
        <Panel style={{ padding: 22, marginBottom: 16, borderColor: `${C.violet}55`,
          background: `linear-gradient(135deg, ${C.violet}22, ${C.panel} 60%)` }}>
          <Eyebrow color={C.violet}>Your Boost</Eyebrow>
          <div style={{ font: `700 22px/1.4 ${F_DISP}`, marginTop: 12, letterSpacing: .3, color: C.text }}>
            "{quote.text}"
          </div>
          {quote.author && <div style={{ font: `500 13px ${F_BODY}`, color: C.faint, marginTop: 8 }}>— {quote.author}</div>}
          <GhostBtn onClick={getNewQuote} style={{ marginTop: 16 }}>
            <RefreshCw size={14}/> Another one
          </GhostBtn>
        </Panel>
      )}

      {/* craving rescue */}
      {mode === "craving" && (
        <Panel style={{ padding: 22, marginBottom: 16, borderColor: `${C.coral}55`,
          background: `linear-gradient(135deg, ${C.coral}18, ${C.panel} 60%)` }}>
          <Eyebrow color={C.coral}>Beat the Craving</Eyebrow>
          <div style={{ font: `800 26px/1.1 ${F_DISP}`, marginTop: 12, color: C.coral, textTransform: "uppercase", letterSpacing: .4 }}>
            {craving.headline}
          </div>
          <p style={{ font: `500 15px ${F_BODY}`, color: C.text, lineHeight: 1.6, margin: "12px 0 0" }}>
            {craving.body}
          </p>
          <div style={{ background: `${C.coral}1e`, border: `1px solid ${C.coral}44`, borderRadius: 10,
            padding: "14px 16px", marginTop: 16 }}>
            <div style={{ font: `700 11px ${F_MONO}`, color: C.coral, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              Do This Now
            </div>
            <div style={{ font: `500 14px ${F_BODY}`, color: C.text, lineHeight: 1.65 }}>
              {craving.action}
            </div>
          </div>
          <GhostBtn onClick={nextCraving} style={{ marginTop: 14 }}>
            <RefreshCw size={14}/> Different tip
          </GhostBtn>
        </Panel>
      )}

      {/* mood & energy check-in */}
      <Panel style={{ padding: 20, marginBottom: 16, borderColor: `${C.amber}55`,
        background: `linear-gradient(135deg, ${C.amber}12, ${C.panel} 60%)` }}>
        <Eyebrow color={C.amber}>Daily Check-In</Eyebrow>

        <div style={{ marginTop: 16 }}>
          <div style={{ font: `600 11px ${F_MONO}`, color: C.faint, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            Energy Level (1 = drained · 5 = locked in)
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[0,1,2,3,4].map(i => <ScaleBtn key={i} i={i} field="energy" colors={ENERGY_COLORS} />)}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ font: `600 11px ${F_MONO}`, color: C.faint, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            Mood
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[0,1,2,3,4].map(i => <ScaleBtn key={i} i={i} field="mood" />)}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ font: `600 11px ${F_MONO}`, color: C.faint, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
            One Win Today (optional)
          </div>
          <input value={entry.win || ""} onChange={(e) => onChange("win", e.target.value)}
            placeholder="Something you did well today…" style={{ ...cell, font: `500 15px ${F_BODY}` }}
            onFocus={(e) => (e.target.style.borderColor = C.amber)}
            onBlur={(e) => (e.target.style.borderColor = C.line)} />
        </div>
      </Panel>

      {/* past wins */}
      <PastWinsView />
    </>
  );
}

/* ---------------- past wins strip ---------------- */
function PastWinsView() {
  return null; // placeholder — wins are stored in bodyLog and can be expanded later
}

/* ---------------- daily check-in ---------------- */
function DailyCheckin({ entry, onChange, photos, onAddPhoto, onDeletePhoto }) {
  return (
    <Panel style={{ padding: 18, marginBottom: 16, borderColor: `${C.amber}55`,
      background: `linear-gradient(135deg, ${C.amber}18, ${C.panel} 60%)` }}>
      <Eyebrow color={C.amber}>Daily Check-in</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ font: `600 11px ${F_MONO}`, color: C.faint, letterSpacing: 1.5, textTransform: "uppercase" }}>Body Weight (lb)</span>
          <input type="number" inputMode="decimal" value={entry.weight || ""} placeholder="185"
            onChange={(e) => onChange("weight", e.target.value)} style={cell}
            onFocus={(e) => (e.target.style.borderColor = C.amber)}
            onBlur={(e) => (e.target.style.borderColor = C.line)} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ font: `600 11px ${F_MONO}`, color: C.faint, letterSpacing: 1.5, textTransform: "uppercase" }}>Steps</span>
          <input type="number" inputMode="numeric" value={entry.steps || ""} placeholder="8000"
            onChange={(e) => onChange("steps", e.target.value)} style={cell}
            onFocus={(e) => (e.target.style.borderColor = C.amber)}
            onBlur={(e) => (e.target.style.borderColor = C.line)} />
        </label>
      </div>
      <PhotoCheckin photos={photos} onAdd={onAddPhoto} onDelete={onDeletePhoto} />
    </Panel>
  );
}

/* ---------------- photo modal ---------------- */
function PhotoModal({ url, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)",
      display: "grid", placeItems: "center", zIndex: 1000, cursor: "zoom-out" }}>
      <img src={url} onClick={(e) => e.stopPropagation()} alt="Progress photo" style={{
        maxWidth: "92vw", maxHeight: "92vh", objectFit: "contain",
        borderRadius: 12, cursor: "default", boxShadow: "0 0 60px rgba(0,0,0,0.8)",
      }} />
    </div>
  );
}

/* ---------------- photo thumb with x + click-to-view ---------------- */
function PhotoThumb({ photo, size = 88, onDelete, accentColor = C.violet }) {
  const [modal, setModal] = useState(false);
  return (
    <>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <img src={photo.dataUrl} alt="Progress" onClick={() => setModal(true)} style={{
          width: "100%", height: "100%", objectFit: "cover", borderRadius: 10, display: "block",
          border: `1px solid ${C.line}`, cursor: "zoom-in", transition: "border-color .2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = accentColor)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.line)} />
        {onDelete && (
          <button onClick={() => onDelete(photo.id)} aria-label="Delete photo" style={{
            position: "absolute", top: 4, right: 4, width: 20, height: 20,
            background: "rgba(0,0,0,0.75)", border: "none", borderRadius: "50%",
            cursor: "pointer", color: "#fff", fontSize: 13, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
            transition: "background .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.coral)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.75)")}>
            ×
          </button>
        )}
      </div>
      {modal && <PhotoModal url={photo.dataUrl} onClose={() => setModal(false)} />}
    </>
  );
}

/* ---------------- photo check-in ---------------- */
function PhotoCheckin({ photos, onAdd, onDelete }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await onAdd(file);
    } catch (err) {
      setError("Failed to process photo. Try again.");
      console.error(err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ font: `600 11px ${F_MONO}`, color: C.faint, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
        Progress Photo
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
        {photos.map((photo) => (
          <PhotoThumb key={photo.id} photo={photo} size={88} onDelete={onDelete} />
        ))}
        <label style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          width: 88, height: 88, border: `1px dashed ${uploading ? C.violet : C.line}`, borderRadius: 10,
          cursor: uploading ? "default" : "pointer", background: C.panel2, color: uploading ? C.violet : C.muted,
          gap: 5, font: `600 11px ${F_BODY}`, transition: "border-color .2s, color .2s", flexShrink: 0,
        }}
        onMouseEnter={(e) => { if (!uploading) { e.currentTarget.style.borderColor = C.violet; e.currentTarget.style.color = C.text; } }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = uploading ? C.violet : C.line; e.currentTarget.style.color = uploading ? C.violet : C.muted; }}>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} hidden disabled={uploading} />
          <Camera size={18} />
          <span>{uploading ? "Processing…" : "Add Photo"}</span>
        </label>
      </div>
      {error && <div style={{ color: C.coral, font: `500 13px ${F_BODY}`, marginTop: 8 }}>{error}</div>}
    </div>
  );
}

/* ---------------- progress photos gallery ---------------- */
function ProgressPhotosView({ photos, onDelete }) {
  const photoDates = Object.keys(photos).filter(d => photos[d]?.length).sort().reverse();

  return (
    <Panel style={{ padding: 18, marginTop: 16 }}>
      <Eyebrow color={C.violet}>Progress Photos</Eyebrow>
      {!photoDates.length ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0",
          color: C.muted, font: `500 14px ${F_BODY}`, gap: 10 }}>
          <Camera size={26} color={C.faint} />
          Add progress photos from the Session tab's daily check-in.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 14 }}>
          {photoDates.map(d => (
            <div key={d}>
              <div style={{ font: `700 13px ${F_MONO}`, color: C.faint, letterSpacing: 1.5,
                textTransform: "uppercase", marginBottom: 8 }}>{pretty(d)}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {photos[d].map((photo) => (
                  <PhotoThumb key={photo.id} photo={photo} size={110}
                    onDelete={(id) => onDelete(d, id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* ---------------- analytics ---------------- */
function AnalyticsView({ bodyLog, log, range, setRange }) {
  const start = addDays(TODAY, -range + 1);

  const entries = Object.keys(bodyLog).filter((d) => d >= start && d <= TODAY).sort();
  const weights = entries.filter((d) => bodyLog[d]?.weight).map((d) => ({ d, w: +bodyLog[d].weight }));
  const stepsArr = entries.filter((d) => bodyLog[d]?.steps).map((d) => +bodyLog[d].steps);

  const weightChange = weights.length >= 2 ? weights[weights.length - 1].w - weights[0].w : null;
  const currentWeight = weights.length ? weights[weights.length - 1].w : null;
  const avgSteps = stepsArr.length ? Math.round(stepsArr.reduce((a, b) => a + b, 0) / stepsArr.length) : null;
  const workoutDays = Object.keys(log).filter((d) => d >= start && d <= TODAY && log[d]?.length).length;

  const StatCard = ({ label, value, sub, color = C.text }) => (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ font: `600 11px ${F_MONO}`, color: C.faint, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ font: `800 36px/.9 ${F_DISP}`, color, letterSpacing: .3 }}>{value ?? "—"}</div>
      {sub && <div style={{ font: `500 13px ${F_BODY}`, color: C.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <Eyebrow color={C.amber}>Analytics</Eyebrow>
          <div style={{ font: `800 28px/.9 ${F_DISP}`, textTransform: "uppercase", letterSpacing: .5, marginTop: 4 }}>Your signals.</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[7, 14, 21].map((r) => (
            <button key={r} onClick={() => setRange(r)} style={{
              border: `1px solid ${range === r ? C.amber : C.line}`, borderRadius: 9, padding: "8px 14px",
              background: range === r ? C.amber : C.panel, color: range === r ? "#04140a" : C.muted,
              font: `700 13px ${F_BODY}`, cursor: "pointer", transition: "all .2s",
            }}>{r}D</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Weight Change"
          value={weightChange !== null ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} lb` : "—"}
          sub={`${range}-day trend`}
          color={weightChange === null ? C.text : weightChange <= 0 ? C.green : C.coral} />
        <StatCard label="Current Weight"
          value={currentWeight ? `${currentWeight} lb` : "—"}
          sub="Latest entry" />
        <StatCard label="Avg Steps"
          value={avgSteps ? avgSteps.toLocaleString() : "—"}
          sub={`${stepsArr.length} days logged`}
          color={C.cyan} />
        <StatCard label="Workout Days"
          value={workoutDays}
          sub={`${range}-day range`}
          color={C.violet} />
      </div>

      {weights.length > 1 && (
        <Panel style={{ padding: 18, marginBottom: 16 }}>
          <Eyebrow color={C.amber}>Weight Trend</Eyebrow>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weights.map((x) => ({ label: shortD(x.d), weight: x.w }))} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.amber} stopOpacity={0.4}/><stop offset="100%" stopColor={C.amber} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke={C.lineSoft} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: C.faint, fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: C.faint, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip unit=" lb" />} />
              <Area type="monotone" dataKey="weight" name="Weight" stroke={C.amber} strokeWidth={3} fill="url(#wg)" dot={{ r: 3, fill: C.amber }} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {stepsArr.length > 1 && (
        <Panel style={{ padding: 18, marginBottom: 16 }}>
          <Eyebrow color={C.cyan}>Steps Trend</Eyebrow>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={entries.filter((d) => bodyLog[d]?.steps).map((d) => ({ label: shortD(d), steps: +bodyLog[d].steps }))} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.cyan} stopOpacity={0.4}/><stop offset="100%" stopColor={C.cyan} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke={C.lineSoft} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: C.faint, fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={{ fill: C.faint, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip unit=" steps" />} />
              <Area type="monotone" dataKey="steps" name="Steps" stroke={C.cyan} strokeWidth={3} fill="url(#sg)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {weights.length === 0 && stepsArr.length === 0 && (
        <Panel style={{ padding: 36, textAlign: "center", marginBottom: 24 }}>
          <Activity size={28} color={C.faint} />
          <div style={{ color: C.muted, font: `500 14px ${F_BODY}`, marginTop: 10 }}>
            Log your weight and steps in the Session tab to see charts here.
          </div>
        </Panel>
      )}
    </>
  );
}

/* ---------------- custom add ---------------- */
function CustomAdd({ onAdd }) {
  const [v, setV] = useState("");
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <input value={v} onChange={(e) => setV(e.target.value)} aria-label="Add custom exercise"
        onKeyDown={(e) => e.key === "Enter" && (onAdd(v), setV(""))}
        placeholder="Add any other exercise…" style={{ flex: 1, background: C.panel, border: `1px solid ${C.line}`,
        borderRadius: 10, padding: "12px 15px", color: C.text, font: `500 16px ${F_BODY}`, outline: "none", minHeight: 44 }}
        onFocus={(e) => (e.target.style.borderColor = C.green)} onBlur={(e) => (e.target.style.borderColor = C.line)} />
      <Btn onClick={() => { onAdd(v); setV(""); }}><Plus size={16}/> Add</Btn>
    </div>
  );
}

/* ---------------- lift card ---------------- */
function LiftCard({ ex, prev, accent, onField, onAddSet, onDelSet, onDel }) {
  const vol = ex.sets.reduce((a, s) => a + (+s.w || 0) * (+s.r || 0), 0);
  const beat = prev && ex.sets.some((s) => +s.w > prev.w);
  return (
    <Panel style={{ padding: 18, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ font: `700 19px ${F_DISP}`, letterSpacing: .3, textTransform: "uppercase" }}>{ex.name}
          {ex.target && <span style={{ font: `600 12px ${F_MONO}`, color: C.faint, marginLeft: 9, textTransform: "none" }}>target {ex.target}</span>}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ font: `700 16px ${F_DISP}`, color: accent }}>{round(vol).toLocaleString()} lb</span>
          <button onClick={() => onDel(ex.id)} aria-label={`Remove ${ex.name}`} style={{ background: "none", border: "none", cursor: "pointer", color: C.faint, minHeight: 32, transition: "color .2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.coral)} onMouseLeave={(e) => (e.currentTarget.style.color = C.faint)}><Trash2 size={17}/></button>
        </div>
      </div>

      {prev ? (
        <div style={{ font: `600 12px ${F_MONO}`, color: beat ? C.green : C.muted, marginBottom: 12,
          display: "flex", alignItems: "center", gap: 6 }}>
          {beat && <Trophy size={13} color={C.green} />} last time: {prev.w} lb × {prev.r}{beat ? " — beaten 🔥" : ""}
        </div>
      ) : <div style={{ font: `600 12px ${F_MONO}`, color: C.faint, marginBottom: 12 }}>first time logging this — set the baseline</div>}

      <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr 34px", gap: 8,
        font: `600 10px ${F_MONO}`, color: C.faint, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>
        <span>Set</span><span>Weight (lb)</span><span>Reps</span><span aria-hidden="true"/>
      </div>
      {ex.sets.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "34px 1fr 1fr 34px", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <span style={{ font: `700 16px ${F_DISP}`, color: accent }}>{i+1}</span>
          <input type="number" inputMode="decimal" value={s.w} placeholder="0" aria-label={`Set ${i+1} weight`}
            onChange={(e) => onField(ex.id, i, "w", e.target.value)} style={cell}
            onFocus={(e) => (e.target.style.borderColor = accent)} onBlur={(e) => (e.target.style.borderColor = C.line)} />
          <input type="number" inputMode="numeric" value={s.r} placeholder="0" aria-label={`Set ${i+1} reps`}
            onChange={(e) => onField(ex.id, i, "r", e.target.value)} style={cell}
            onFocus={(e) => (e.target.style.borderColor = accent)} onBlur={(e) => (e.target.style.borderColor = C.line)} />
          <button onClick={() => onDelSet(ex.id, i)} aria-label={`Remove set ${i+1}`} style={{ background: "none", border: "none", cursor: "pointer", color: C.faint, minHeight: 32 }}><Trash2 size={15}/></button>
        </div>
      ))}
      <button onClick={() => onAddSet(ex.id)} style={{ background: "none", border: `1px dashed ${C.line}`,
        borderRadius: 9, padding: 11, cursor: "pointer", color: C.muted, font: `600 13px ${F_BODY}`, width: "100%",
        marginTop: 4, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "border-color .2s, color .2s" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = C.text; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.muted; }}><Plus size={14}/> Add set</button>
    </Panel>
  );
}

/* ---------------- cardio card ---------------- */
function CardioCard({ ex, onChange, onDel, accent }) {
  return (
    <Panel style={{ padding: 18, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, font: `700 19px ${F_DISP}`, letterSpacing: .3, textTransform: "uppercase" }}>
          <Activity size={17} color={accent} /> {ex.name}</div>
        <button onClick={() => onDel(ex.id)} aria-label={`Remove ${ex.name}`} style={{ background: "none", border: "none", cursor: "pointer", color: C.faint, minHeight: 32, transition: "color .2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.coral)} onMouseLeave={(e) => (e.currentTarget.style.color = C.faint)}><Trash2 size={17}/></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[["min","Minutes"],["incline","Incline %"],["speed","Speed mph"]].map(([k,l]) => (
          <label key={k} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ font: `600 10px ${F_MONO}`, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint }}>{l}</span>
            <input type="number" inputMode="decimal" value={ex[k] ?? ""} onChange={(e) => onChange(ex.id, k, e.target.value)} style={cell}
              onFocus={(e) => (e.target.style.borderColor = accent)} onBlur={(e) => (e.target.style.borderColor = C.line)} />
          </label>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------- progress ---------------- */
function ProgressView({ log }) {
  const liftNames = useMemo(() => {
    const set = new Set();
    Object.values(log).forEach((day) => day.forEach((e) => { if (!e.cardio) set.add(e.name); }));
    return [...set].sort();
  }, [log]);
  const [pick, setPick] = useState("");
  const sel = pick || liftNames[0] || "";

  const data = useMemo(() => Object.keys(log).sort().map((d) => {
    const ex = (log[d] || []).find((e) => e.name === sel && !e.cardio);
    if (!ex) return null;
    const top = ex.sets.reduce((a, s) => (+s.w > +a.w ? { w: +s.w, r: +s.r } : a), { w: 0, r: 0 });
    return top.w ? { label: shortD(d), top: top.w } : null;
  }).filter(Boolean), [log, sel]);

  const weeklyVol = useMemo(() => Object.keys(log).sort().map((d) => {
    const v = (log[d] || []).reduce((a, e) => a + (e.sets || []).reduce((s, x) => s + (+x.w||0)*(+x.r||0), 0), 0);
    return v ? { label: shortD(d), vol: v } : null;
  }).filter(Boolean), [log]);

  if (!liftNames.length) return (
    <Panel style={{ padding: 44, textAlign: "center" }}>
      <TrendingUp size={30} color={C.faint} />
      <div style={{ color: C.muted, font: `500 15px ${F_BODY}`, marginTop: 12 }}>Log a few sessions and your strength curves show up here.</div>
    </Panel>
  );

  return (
    <>
      <Panel style={{ padding: 18, marginBottom: 16 }}>
        <Eyebrow color={C.green}>Total session volume</Eyebrow>
        <div style={{ font: `500 13px ${F_BODY}`, color: C.faint, margin: "5px 0 12px" }}>Trending up over time means more total work — the driver of growth.</div>
        {weeklyVol.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyVol} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.green} stopOpacity={0.4}/><stop offset="100%" stopColor={C.green} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke={C.lineSoft} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: C.faint, fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={{ fill: C.faint, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip unit=" lb" />} />
              <Area type="monotone" dataKey="vol" name="Volume" stroke={C.green} strokeWidth={3} fill="url(#v)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <NoData />}
      </Panel>

      <Panel style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <Eyebrow color={C.cyan}>Top set // strength curve</Eyebrow>
          <select value={sel} onChange={(e) => setPick(e.target.value)} aria-label="Select lift" style={{ background: C.bg,
            border: `1px solid ${C.line}`, borderRadius: 9, padding: "10px 12px", color: C.text, font: `600 14px ${F_BODY}`, outline: "none", minHeight: 44 }}>
            {liftNames.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.cyan} stopOpacity={0.4}/><stop offset="100%" stopColor={C.cyan} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke={C.lineSoft} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: C.faint, fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis domain={["auto","auto"]} tick={{ fill: C.faint, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip unit=" lb" />} />
              <Area type="monotone" dataKey="top" name="Top set" stroke={C.cyan} strokeWidth={3} fill="url(#t)" dot={{ r: 3, fill: C.cyan }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <NoData text="Log this lift on two or more days to see the curve" />}
      </Panel>
    </>
  );
}
const Tip = ({ active, payload, label, unit = "" }) => active && payload?.length ? (
  <div style={{ background: "#020617", border: `1px solid ${C.line}`, borderRadius: 9, padding: "9px 12px", font: `500 13px ${F_BODY}` }}>
    <div style={{ color: C.faint, marginBottom: 4, font: `600 11px ${F_MONO}` }}>{label}</div>
    {payload.map((p, i) => <div key={i} style={{ color: p.stroke || p.color }}>{p.name}: <b style={{ font: `700 15px ${F_DISP}` }}>{round(p.value)}{unit}</b></div>)}
  </div>
) : null;
const NoData = ({ text = "Not enough data yet" }) => (
  <div style={{ height: 150, display: "grid", placeItems: "center", color: C.faint, font: `500 14px ${F_BODY}` }}>{text}</div>
);

/* ---------------- full split reference ---------------- */
function PlanView() {
  return (
    <Panel style={{ padding: 22 }}>
      <Eyebrow color={C.green}>Weekly split // Amped Fitness</Eyebrow>
      <div style={{ marginTop: 14 }}>
        {SPLIT.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "16px 0", borderTop: i ? `1px solid ${C.lineSoft}` : "none" }}>
            <div style={{ width: 4, alignSelf: "stretch", background: s.color, borderRadius: 3 }} />
            <div style={{ flex: 1 }}>
              <div style={{ font: `700 20px ${F_DISP}`, color: s.color, textTransform: "uppercase", letterSpacing: .4 }}>{WEEKDAYS[i]} · {s.name}</div>
              <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 6 }}>
                {s.lifts.map((l, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, font: `500 14px ${F_BODY}`, color: l.cardio ? C.muted : C.text }}>
                    <span style={{ font: `600 12px ${F_MONO}`, color: s.color, minWidth: 56 }}>{l.cardio ? `${l.min}min` : `${l.s}×${l.r}`}</span>{l.n}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
