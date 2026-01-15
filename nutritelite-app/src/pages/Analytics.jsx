import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { loadDays, getBurnedForDay } from "../utils/nutriliteStorage";
import NutriLiteAssistant from "../components/AIChatWidget";


function clsx(...arr) {
  return arr.filter(Boolean).join(" ");
}
function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}
function round(n) {
  return Math.round(n);
}
function kcal(n) {
  return `${round(n)} kcal`;
}

// Local date key YYYY-MM-DD
function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseKeyToDate(key) {
  const [y, m, d] = String(key).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function safeTotals(day) {
  const t = day?.totals || {};
  return {
    calories: Number(t.calories) || 0,
    protein: Number(t.protein) || 0,
    carbs: Number(t.carbs) || 0,
    fat: Number(t.fat) || 0,
  };
}

// Simple ring (donut) chart using conic-gradient (no chart libs needed)
function Donut({ label, value, total, color = "#10b981" }) {
  const pct = total > 0 ? clamp((value / total) * 100, 0, 100) : 0;
  const bg = `conic-gradient(${color} ${pct}%, rgba(2,6,23,0.08) 0)`;
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-14 w-14 rounded-full"
        style={{ background: bg }}
        aria-label={`${label} ${round(pct)}%`}
        title={`${label}: ${round(pct)}%`}
      >
        <div className="h-14 w-14 rounded-full p-[6px]">
          <div className="h-full w-full rounded-full bg-white" />
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-600">{label}</div>
        <div className="text-sm font-extrabold text-slate-900">
          {round(value)}g{" "}
          <span className="text-slate-500 font-semibold">({round(pct)}%)</span>
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-5",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <div className="text-lg font-extrabold text-slate-900">{title}</div>
          )}
          {subtitle && <div className="text-sm text-slate-600">{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

function Kpi({ label, value, icon, tint }) {
  return (
    <div className={clsx("rounded-3xl border p-4 shadow-sm", tint)}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-white/70 border border-white/60 flex items-center justify-center text-lg">
          {icon}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-600">{label}</div>
          <div className="text-lg font-extrabold text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();

  // ✅ REAL DATA from localStorage
  const state = useMemo(() => {
    const daysMap = loadDays();
    const todayKey = getLocalDateKey(new Date());

    const today = daysMap?.[todayKey] || null;
    const dailyGoal = Number(today?.goal) || 2000;
    const mode = today?.mode || "Maintain";

    // last 7 local days ending today
    const last7Keys = [];
    const end = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      last7Keys.push(getLocalDateKey(d));
    }

    const last7 = last7Keys.map((k) => {
      const day = daysMap?.[k];
      return Number(day?.totals?.calories) || 0; // 0 if no saved day
    });

    // today totals + macros
    const totals = safeTotals(today);
    const consumedToday = totals.calories;

    // Burned from steps (or stored burned)
    const burnedToday = today ? getBurnedForDay(today) : 0;
    const netToday = Math.max(0, consumedToday - burnedToday);

    const remainingToday = Math.max(0, dailyGoal - consumedToday);

    // Macro grams today (from totals)
    const macros = {
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    };

    const valid = last7.filter((x) => x > 0);
    const avg7 = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
    const bestDay = valid.length ? Math.max(...valid) : 0;
    const worstDay = valid.length ? Math.min(...valid) : 0;

    const hitRate = valid.length
      ? Math.round((valid.filter((x) => x <= dailyGoal).length / valid.length) * 100)
      : 0;

    return {
      dailyGoal,
      mode,
      last7,
      avg7,
      bestDay,
      worstDay,
      hitRate,
      macros,
      consumedToday,
      remainingToday,
      burnedToday,
      netToday,
      hasToday: !!today,
    };
  }, []);

  const maxBar = Math.max(...state.last7, state.dailyGoal);

  const totalMacros =
    state.macros.protein + state.macros.carbs + state.macros.fat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8fbf6] via-[#eafcf8] to-[#effcf8]">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#0e8277] via-[#0f8c7d] to-[#16a34a] text-white shadow-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold">Analytics</div>
            <div className="text-xs opacity-90">
              Trends, macro breakdown, and progress insights.
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded-xl bg-white/15 border border-white/25 hover:bg-white/20 font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Kpi
            label="Daily Goal"
            value={kcal(state.dailyGoal)}
            icon="🎯"
            tint="bg-emerald-100 border-emerald-200"
          />
          <Kpi
            label="Consumed (Today)"
            value={kcal(state.consumedToday)}
            icon="🔥"
            tint="bg-green-100 border-green-200"
          />
          <Kpi
            label="Burned (Steps)"
            value={kcal(state.burnedToday)}
            icon="🏃‍♀️"
            tint="bg-sky-100 border-sky-200"
          />
          <Kpi
            label="Net"
            value={kcal(state.netToday)}
            icon="🧾"
            tint="bg-pink-100 border-pink-200"
          />
        </div>

        {!state.hasToday && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
            Today is not saved yet. Go to Dashboard → add foods → click <b>Save Day</b>.
          </div>
        )}

        {/* Main analytics grid */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* 7-day trend */}
          <Card
            className="xl:col-span-8"
            title="Calories Trend"
            subtitle="Last 7 days compared with your daily goal."
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-700">
                Average:{" "}
                <span className="font-extrabold text-slate-900">
                  {kcal(state.avg7)}
                </span>
              </div>

              <div className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
                Goal: {state.dailyGoal} kcal
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 items-end h-44">
              {state.last7.map((v, idx) => {
                const h = maxBar ? (v / maxBar) * 100 : 0;
                const over = v > state.dailyGoal && v > 0;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="text-[11px] text-slate-500">{v ? round(v) : "—"}</div>
                    <div className="w-full flex justify-center">
                      <div className="w-8 h-32 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div
                          className={clsx(
                            "w-full rounded-full",
                            over ? "bg-rose-500" : "bg-emerald-600"
                          )}
                          style={{ height: `${v ? h : 3}%` }}
                          title={v ? `${round(v)} kcal` : "No saved day"}
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Day {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-700">
                Best day:{" "}
                <span className="font-extrabold text-slate-900">
                  {kcal(state.bestDay)}
                </span>
              </div>
              <div className="text-sm text-slate-700">
                Lowest day:{" "}
                <span className="font-extrabold text-slate-900">
                  {kcal(state.worstDay)}
                </span>
              </div>
              <div className="text-sm text-slate-700">
                Goal hit rate:{" "}
                <span className="font-extrabold text-emerald-700">
                  {state.hitRate}%
                </span>
              </div>
            </div>
          </Card>

          {/* Macro breakdown */}
          <Card
            className="xl:col-span-4"
            title="Macros Breakdown"
            subtitle="Today’s macro distribution."
          >
            <div className="space-y-4">
              <Donut
                label="Protein"
                value={state.macros.protein}
                total={totalMacros}
                color="#10b981"
              />
              <Donut
                label="Carbs"
                value={state.macros.carbs}
                total={totalMacros}
                color="#0ea5e9"
              />
              <Donut
                label="Fat"
                value={state.macros.fat}
                total={totalMacros}
                color="#f59e0b"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="font-extrabold text-slate-900">Quick insight</div>
              <div className="text-sm text-slate-700 mt-2 leading-relaxed">
                If you want better satiety, increase <b>protein + fiber</b>. For training days, increase <b>carbs</b>.
              </div>
            </div>
          </Card>

          {/* Insights */}
          <Card
            className="xl:col-span-12"
            title="Insights"
            subtitle="Small recommendations based on trends."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-extrabold text-slate-900">
                  Consistency score
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  You stayed at/under your goal{" "}
                  <b className="text-emerald-700">{state.hitRate}%</b> of saved days.
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${state.hitRate}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-extrabold text-slate-900">
                  Average vs goal
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  Your 7-day average is <b className="text-slate-900">{kcal(state.avg7)}</b>. That is{" "}
                  <b className="text-slate-900">
                    {round(state.avg7 - state.dailyGoal)}
                  </b>{" "}
                  kcal compared to your goal.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-extrabold text-slate-900">Next step</div>
                <div className="mt-2 text-sm text-slate-700">
                  Save your day from Dashboard so Analytics always uses real data.
                </div>
                <button
                  onClick={() => navigate("/history")}
                  className="mt-3 w-full rounded-xl bg-emerald-600 text-white font-extrabold py-2 hover:bg-emerald-700 transition"
                >
                  View History
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
<NutriLiteAssistant/>
      <Footer />
    </div>
  );
}
