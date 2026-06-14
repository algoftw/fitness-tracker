import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  Dumbbell, Plus, Trash2, ChevronLeft, ChevronRight, TrendingUp,
  CalendarDays, Flame, Activity, Trophy,
} from "lucide-react";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

/* ---------------- storage (Firestore) ---------------- */
const store = {
  async get(k, fb) {
    try {
      const snap = await getDoc(doc(db, "data", k));
      return snap.exists() ? snap.data().value : fb;
    } catch { return fb; }
  },
  async set(k, v) {
    try {
      await setDoc(doc(db, "data", k), { value: v });
    } catch (e) { console.error(e); }
  },
};

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
  const [range, setRange] = useState(30);

  useEffect(() => {
    const l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap";
    document.head.appendChild(l);
  }, []);
  useEffect(() => { (async () => {
    setLog(await store.get("trainingLog", {}));
    setBodyLog(await store.get("bodyLog", {}));
    setLoaded(true);
  })(); }, []);

  const save = (next) => { setLog(next); store.set("trainingLog", next); };
  const saveBody = (next) => { setBodyLog(next); store.set("bodyLog", next); };
  const setBodyField = (k, v) => {
    const entry = bodyLog[date] || {};
    saveBody({ ...bodyLog, [date]: { ...entry, [k]: v } });
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
          {[["session","Session",<Dumbbell size={17}/>],["progress","Progress",<TrendingUp size={17}/>],
            ["plan","Full Split",<CalendarDays size={17}/>]].map(([id,l,ic]) => (
            <button key={id} onClick={() => setTab(id)} role="tab" aria-selected={tab===id}
              style={{ flex: 1, border: "none", cursor: "pointer", borderRadius: 9, padding: "11px 8px", minHeight: 44,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              background: tab === id ? C.green : "transparent", color: tab === id ? "#04140a" : C.muted,
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

          <DailyCheckin entry={bodyLog[date] || {}} onChange={setBodyField} />
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
        </>}
        {tab === "plan" && <PlanView />}

        <footer style={{ marginTop: 40, textAlign: "center", color: C.faint, font: `500 12px ${F_MONO}`, letterSpacing: .5 }}>
          Synced across all devices · progressive overload is the whole game
        </footer>
      </div>
    </div>
  );
}

/* ---------------- daily check-in ---------------- */
function DailyCheckin({ entry, onChange }) {
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
          {[14, 30, 90].map((r) => (
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
