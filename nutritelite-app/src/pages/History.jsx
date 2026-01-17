import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { loadDays, saveDays } from "../utils/nutriliteStorage";
import NutriLiteAssistant from "../components/AIChatWidget";

/**
 * History.jsx
 * - Reads saved days from localStorage via loadDays()
 * - Adds Delete button to remove a saved day from history
 */

const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

function getLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function safeMealLog(x) {
  const base = { Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
  if (!x || typeof x !== "object") return base;
  return {
    Breakfast: Array.isArray(x.Breakfast) ? x.Breakfast : [],
    Lunch: Array.isArray(x.Lunch) ? x.Lunch : [],
    Dinner: Array.isArray(x.Dinner) ? x.Dinner : [],
    Snack: Array.isArray(x.Snack) ? x.Snack : [],
  };
}

function computeTotals(mealLog) {
  const all = [
    ...mealLog.Breakfast,
    ...mealLog.Lunch,
    ...mealLog.Dinner,
    ...mealLog.Snack,
  ];
  const sum = (k) => all.reduce((acc, it) => acc + (Number(it?.[k]) || 0), 0);

  return {
    calories: Math.round(sum("kcal")),
    protein: Math.round(sum("protein")),
    carbs: Math.round(sum("carbs")),
    fat: Math.round(sum("fat")),
  };
}

function parseKeyToDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function fmtDayTitle(key) {
  const dt = parseKeyToDate(key);
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function fmtShortDate(key) {
  const dt = parseKeyToDate(key);
  return dt.toLocaleDateString(undefined);
}

function fmtTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function History() {
  // -----------------------------
  // Load saved days
  // -----------------------------
  const [daysMap, setDaysMap] = useState(() => loadDays());

  // Refresh
  const refresh = () => setDaysMap(loadDays());

  // Keys sorted newest first
  const allKeys = useMemo(() => {
    const keys = Object.keys(daysMap || {});
    return keys.sort((a, b) => parseKeyToDate(b) - parseKeyToDate(a));
  }, [daysMap]);

  // Default selection
  const todayKey = useMemo(() => getLocalDateKey(new Date()), []);
  const [selectedKey, setSelectedKey] = useState(() => {
    const initial = loadDays();
    const keys = Object.keys(initial || {}).sort(
      (a, b) => parseKeyToDate(b) - parseKeyToDate(a)
    );
    if (initial?.[todayKey]) return todayKey;
    return keys[0] || todayKey;
  });

  // If selection missing after refresh, choose best key
  useEffect(() => {
    if (selectedKey && daysMap?.[selectedKey]) return;
    if (daysMap?.[todayKey]) setSelectedKey(todayKey);
    else if (allKeys[0]) setSelectedKey(allKeys[0]);
  }, [daysMap, allKeys, selectedKey, todayKey]);

  const selectedDayRaw = daysMap?.[selectedKey] || null;

  // Normalize day fields
  const selectedMealLog = useMemo(
    () => safeMealLog(selectedDayRaw?.mealLog),
    [selectedDayRaw]
  );

  const selectedTotals = useMemo(() => {
    const stored = selectedDayRaw?.totals;
    if (stored && typeof stored === "object") {
      return {
        calories: Number(stored.calories) || 0,
        protein: Number(stored.protein) || 0,
        carbs: Number(stored.carbs) || 0,
        fat: Number(stored.fat) || 0,
      };
    }
    return computeTotals(selectedMealLog);
  }, [selectedDayRaw, selectedMealLog]);

  const selectedGoal = Number(selectedDayRaw?.goal) || 2000;
  const selectedMode = selectedDayRaw?.mode || "Maintain";

  const burned = Number(selectedDayRaw?.burned) || 0;
  const net = Math.max(0, selectedTotals.calories - burned);

  // -----------------------------
  // ✅ Delete a day from history
  // -----------------------------
  const deleteDayFromHistory = (dateKey) => {
    const ok = window.confirm(
      `Delete history for ${dateKey}?\n\nThis permanently removes the day from History.`
    );
    if (!ok) return;

    const nextMap = { ...(daysMap || {}) };
    delete nextMap[dateKey];

    // Persist
    saveDays(nextMap);
    setDaysMap(nextMap);

    // If deleting selected day, move selection
    if (selectedKey === dateKey) {
      const remainingKeys = Object.keys(nextMap).sort(
        (a, b) => parseKeyToDate(b) - parseKeyToDate(a)
      );
      if (nextMap?.[todayKey]) setSelectedKey(todayKey);
      else setSelectedKey(remainingKeys[0] || todayKey);
    }
  };

  // -----------------------------
  // Filters
  // -----------------------------
  const [lastRange, setLastRange] = useState("14");
  const [mealFilter, setMealFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [foodSearch, setFoodSearch] = useState("");

  const filteredKeys = useMemo(() => {
    let keys = [...allKeys];

    // Last N days
    const n = Number(lastRange) || 14;
    if (n > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (n - 1));
      const cutoffDay = new Date(cutoff.getFullYear(), cutoff.getMonth(), cutoff.getDate());
      keys = keys.filter((k) => parseKeyToDate(k) >= cutoffDay);
    }

    // From/to date filter
    if (fromDate) {
      const from = parseKeyToDate(fromDate);
      keys = keys.filter((k) => parseKeyToDate(k) >= from);
    }
    if (toDate) {
      const to = parseKeyToDate(toDate);
      keys = keys.filter((k) => parseKeyToDate(k) <= to);
    }

    // Meal + food search
    const q = foodSearch.trim().toLowerCase();
    if (mealFilter !== "All" || q) {
      keys = keys.filter((k) => {
        const day = daysMap?.[k];
        if (!day) return false;
        const ml = safeMealLog(day.mealLog);
        const mealsToCheck = mealFilter === "All" ? MEALS : [mealFilter];
        const items = mealsToCheck.flatMap((m) => ml[m] || []);
        if (!q) return items.length > 0;
        return items.some((it) =>
          String(it?.description || "").toLowerCase().includes(q)
        );
      });
    }

    return keys;
  }, [allKeys, lastRange, fromDate, toDate, mealFilter, foodSearch, daysMap]);

  // -----------------------------
  // 7-day bars
  // -----------------------------
  const weekBars = useMemo(() => {
    const end = selectedKey ? parseKeyToDate(selectedKey) : new Date();
    const keys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      keys.push(getLocalDateKey(d));
    }

    return keys.map((k, idx) => {
      const day = daysMap?.[k];
      const goal = Number(day?.goal) || selectedGoal || 2000;
      const totals = day?.totals
        ? {
            calories: Number(day.totals.calories) || 0,
            protein: Number(day.totals.protein) || 0,
            carbs: Number(day.totals.carbs) || 0,
            fat: Number(day.totals.fat) || 0,
          }
        : computeTotals(safeMealLog(day?.mealLog));

      const pct = goal ? Math.min(100, Math.round((totals.calories / goal) * 100)) : 0;

      return {
        key: k,
        label: `D${idx + 1}`,
        calories: totals.calories,
        goal,
        pct,
        hasData: !!day,
      };
    });
  }, [daysMap, selectedKey, selectedGoal]);

  // -----------------------------
  // Export JSON
  // -----------------------------
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(daysMap || {}, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nutrilite-history.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setLastRange("14");
    setMealFilter("All");
    setFromDate("");
    setToDate("");
    setFoodSearch("");
  };

  const noDays = filteredKeys.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8fbf6] via-[#eafcf8] to-[#effcf8]">
      {/* Top bar */}
      <div className="w-full bg-gradient-to-r from-[#0e8277] via-[#0f8c7d] to-[#16a34a] text-white shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold leading-tight">Meal History</div>
            <div className="text-xs opacity-90">Daily logs • meals • activity • weight • notes</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportJson}
              className="px-4 py-2 rounded-xl bg-white/15 border border-white/25 hover:bg-white/20 font-bold"
            >
              Export JSON
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-extrabold hover:bg-emerald-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard className="bg-[#d7fff0] border-emerald-200" title="Goal" value={`${selectedGoal} kcal`} icon="🎯" />
          <SummaryCard className="bg-[#dffcf2] border-emerald-200" title="Consumed" value={`${selectedTotals.calories} kcal`} icon="🔥" />
          <SummaryCard className="bg-[#fff7c7] border-amber-200" title="Burned" value={`${burned} kcal`} icon="🏃‍♀️" />
          <SummaryCard className="bg-[#ffe3ef] border-pink-200" title="Net" value={`${net} kcal`} icon="🧾" />
        </div>

        <div className="mt-5 grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* LEFT */}
          <div className="xl:col-span-5 space-y-5">
            {/* Filters */}
            <Card className="bg-white/80">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Filter & Search</h2>
                <p className="text-sm text-slate-600">Find a day by date, meal type, or food name.</p>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-600 mb-1">Last</div>
                  <select
                    value={lastRange}
                    onChange={(e) => setLastRange(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border border-slate-200 bg-white/70 font-bold text-slate-800"
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-600 mb-1">Meal</div>
                  <select
                    value={mealFilter}
                    onChange={(e) => setMealFilter(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border border-slate-200 bg-white/70 font-bold text-slate-800"
                  >
                    <option>All</option>
                    {MEALS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-600 mb-1">From</div>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border border-slate-200 bg-white/70 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-600 mb-1">To</div>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl border border-slate-200 bg-white/70 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xs font-bold text-slate-600 mb-1">Search food name</div>
                <input
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  placeholder={`Try: "chicken" or "rice"`}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={refresh}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold"
                >
                  Refresh
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-extrabold"
                >
                  Clear
                </button>

                <div className="ml-auto">
                  <button
                    onClick={() => {
                      const k = getLocalDateKey(new Date());
                      if (daysMap?.[k]) setSelectedKey(k);
                      else setSelectedKey(allKeys[0] || k);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold"
                  >
                    + Today
                  </button>
                </div>
              </div>
            </Card>

            {/* Days list */}
            <Card className="bg-white/80">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-extrabold text-slate-900">Days</div>
                  <div className="text-sm text-slate-600">{filteredKeys.length} day(s) match your filters</div>
                </div>
              </div>

              {noDays ? (
                <div className="mt-3 text-sm text-slate-600">
                  No days found. Go to Dashboard → add foods → click <span className="font-bold">Save Day</span> → come back.
                </div>
              ) : (
                <div className="mt-3 max-h-[420px] overflow-auto pr-1 space-y-2">
                  {filteredKeys.map((k) => {
                    const d = daysMap?.[k];
                    const goal = Number(d?.goal) || 2000;
                    const ml = safeMealLog(d?.mealLog);
                    const totals = d?.totals
                      ? {
                          calories: Number(d.totals.calories) || 0,
                          protein: Number(d.totals.protein) || 0,
                          carbs: Number(d.totals.carbs) || 0,
                          fat: Number(d.totals.fat) || 0,
                        }
                      : computeTotals(ml);

                    const isSelected = k === selectedKey;

                    return (
                      <div
                        key={k}
                        className={[
                          "w-full rounded-2xl border px-4 py-3 flex items-start gap-3",
                          isSelected ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <button onClick={() => setSelectedKey(k)} className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <div className="font-extrabold text-slate-900">{fmtDayTitle(k)}</div>
                            <div className="text-xs text-slate-500">{k}</div>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            Intake: <span className="font-bold">{totals.calories} kcal</span> • Goal:{" "}
                            <span className="font-bold">{goal} kcal</span>
                          </div>
                          {d?.savedAt && (
                            <div className="text-[11px] text-slate-500 mt-1">
                              Saved:{" "}
                              {new Date(d.savedAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                            </div>
                          )}
                        </button>

                        <button
                          onClick={() => deleteDayFromHistory(k)}
                          className="shrink-0 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs"
                          title="Delete this day from history"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT */}
          <div className="xl:col-span-7 space-y-5">
            {/* 7-day + macros */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="bg-white/80">
                <div className="font-extrabold text-slate-900">7-day calories</div>
                <div className="text-sm text-slate-600">Quick trend view (uses your stored days).</div>

                <div className="mt-4 flex items-end justify-between gap-2">
                  {weekBars.map((b) => (
                    <div key={b.key} className="flex flex-col items-center gap-2 w-full">
                      <div className="h-24 w-4 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="w-full bg-emerald-600"
                          style={{ height: `${Math.max(3, b.pct)}%` }}
                          title={`${b.key}: ${b.calories}/${b.goal} kcal`}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500">{b.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-xs text-slate-500">Tip: bars represent % of the day’s goal.</div>
              </Card>

              <Card className="bg-white/80">
                <div className="font-extrabold text-slate-900">Macros today</div>
                <div className="text-sm text-slate-600">Calories + protein/carbs/fat totals for the selected day.</div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniStat label="Protein" value={`${selectedTotals.protein} g`} />
                  <MiniStat label="Carbs" value={`${selectedTotals.carbs} g`} />
                  <MiniStat label="Fat" value={`${selectedTotals.fat} g`} />
                  <MiniStat label="Calories" value={`${selectedTotals.calories} kcal`} />
                </div>
              </Card>
            </div>

            {/* Logged meals */}
            <Card className="bg-white/80">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-extrabold text-slate-900">
                    Logged meals — {selectedKey ? fmtShortDate(selectedKey) : "—"}
                  </div>
                  <div className="text-sm text-slate-600">Food items, portions, and timestamps (local time).</div>
                </div>

                <div className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                  Mode: {selectedMode}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {MEALS.map((meal) => {
                  const items = selectedMealLog[meal] || [];
                  const t = computeTotals({ ...safeMealLog({}), [meal]: items });

                  return (
                    <div key={meal} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-slate-900">{meal}</div>
                        <div className="text-xs text-slate-500">
                          Totals: {t.calories} kcal • P {Math.round(t.protein)} • C {Math.round(t.carbs)} • F{" "}
                          {Math.round(t.fat)}
                        </div>
                      </div>

                      {items.length === 0 ? (
                        <div className="text-sm text-slate-500 mt-2">No foods logged for {meal}.</div>
                      ) : (
                        <div className="mt-3 overflow-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-slate-500">
                                <th className="text-left font-bold py-2">Food</th>
                                <th className="text-right font-bold py-2">Grams</th>
                                <th className="text-right font-bold py-2">kcal</th>
                                <th className="text-right font-bold py-2">P</th>
                                <th className="text-right font-bold py-2">C</th>
                                <th className="text-right font-bold py-2">F</th>
                                <th className="text-right font-bold py-2">Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((it, idx) => (
                                <tr key={`${it.description}-${idx}`} className="border-t border-slate-100">
                                  <td className="py-2 font-bold text-slate-900">{it.description || "—"}</td>
                                  <td className="py-2 text-right">{Number(it.grams) || 0}</td>
                                  <td className="py-2 text-right">{Number(it.kcal) || 0}</td>
                                  <td className="py-2 text-right">{Number(it.protein) || 0}</td>
                                  <td className="py-2 text-right">{Number(it.carbs) || 0}</td>
                                  <td className="py-2 text-right">{Number(it.fat) || 0}</td>
                                  <td className="py-2 text-right text-slate-700">{fmtTime(it.ts)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <NutriLiteAssistant />
      <Footer />
    </div>
  );
}

/* -----------------------------
   UI components
----------------------------- */

function Card({ className = "", children }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

function SummaryCard({ title, value, icon, className = "" }) {
  return (
    <div className={`rounded-3xl border shadow-sm px-5 py-4 flex items-center justify-between ${className}`}>
      <div>
        <div className="text-xs text-slate-600 font-bold">{title}</div>
        <div className="text-xl font-extrabold text-slate-900 mt-1">{value}</div>
      </div>
      <div className="h-11 w-11 rounded-2xl bg-white/60 border border-white/70 flex items-center justify-center text-xl">
        {icon}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500 font-bold">{label}</div>
      <div className="text-lg font-extrabold text-slate-900 mt-1">{value}</div>
    </div>
  );
}
