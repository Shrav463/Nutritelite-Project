import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import NutriLiteAssitant from "../components/AIChatWidget";

import {
  loadDays,
  saveDays,
  loadDraft,
  saveDraft,
  clearDraft,
  getLocalDateKey,
  makeEmptyLog,
  computeTotals,
} from "../utils/nutriliteStorage";

export default function Dashboard() {
  const navigate = useNavigate();

  // -----------------------------
  // UI / Mode
  // -----------------------------
  const [mode, setMode] = useState("Maintain"); // Cut | Maintain | Bulk
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // -----------------------------
  // Body metrics
  // -----------------------------
  const [units, setUnits] = useState("US"); // US | Metric
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(70);

  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);
  const [weightLb, setWeightLb] = useState(154);

  useEffect(() => {
    if (units === "US") {
      const cm = Math.round((heightFt * 12 + heightIn) * 2.54);
      const kg = Math.round((weightLb / 2.20462) * 10) / 10;
      setHeightCm(cm || 0);
      setWeightKg(kg || 0);
    }
  }, [units, heightFt, heightIn, weightLb]);

  useEffect(() => {
    if (units === "Metric") {
      const totalIn = (heightCm || 0) / 2.54;
      const ft = Math.floor(totalIn / 12);
      const inch = Math.round(totalIn - ft * 12);
      setHeightFt(ft || 0);
      setHeightIn(inch || 0);
      setWeightLb(Math.round((weightKg || 0) * 2.20462));
    }
  }, [units, heightCm, weightKg]);

  const bmi = useMemo(() => {
    const hM = (heightCm || 0) / 100;
    if (!hM) return 0;
    return Math.round(((weightKg || 0) / (hM * hM)) * 10) / 10;
  }, [heightCm, weightKg]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return "—";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obesity";
  }, [bmi]);

  const suggestedCalories = useMemo(() => {
    const w = weightKg || 0;
    if (!w) return 0;

    let low = 25,
      high = 30;
    if (mode === "Cut") {
      low = 20;
      high = 25;
    } else if (mode === "Bulk") {
      low = 30;
      high = 35;
    }

    let adjust = 0;
    if (bmiCategory === "Underweight") adjust = +150;
    if (bmiCategory === "Overweight") adjust = -150;
    if (bmiCategory === "Obesity") adjust = -250;

    const mid = Math.round(((low + high) / 2) * w + adjust);
    return Math.max(1200, mid);
  }, [weightKg, mode, bmiCategory]);

  const applySuggestedGoal = () => {
    if (suggestedCalories) setDailyGoal(suggestedCalories);
  };

  // -----------------------------
  // Meals / Log
  // -----------------------------
  const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const [selectedMeal, setSelectedMeal] = useState("Breakfast");

  const [mealLog, setMealLog] = useState(makeEmptyLog());
  const [waterCups, setWaterCups] = useState(0);
  const [steps, setSteps] = useState(2500);

  const todayKey = useMemo(() => getLocalDateKey(new Date()), []);

  const addFoodToLog = (food) => {
    setMealLog((prev) => ({
      ...prev,
      [selectedMeal]: [food, ...(prev[selectedMeal] || [])],
    }));
  };

  const removeFood = (mealName, idx) => {
    setMealLog((prev) => ({
      ...prev,
      [mealName]: (prev[mealName] || []).filter((_, i) => i !== idx),
    }));
  };

  // -----------------------------
  // Totals (computed from mealLog)
  // -----------------------------
  const totals = useMemo(() => computeTotals(mealLog), [mealLog]);

  const remaining = Math.max(0, dailyGoal - totals.calories);
  const percent = dailyGoal
    ? Math.min(100, Math.round((totals.calories / dailyGoal) * 100))
    : 0;

  const macroTargets = useMemo(() => {
    let p = 150,
      c = 220,
      f = 65;
    if (mode === "Cut") {
      p = 160;
      c = 180;
      f = 55;
    } else if (mode === "Bulk") {
      p = 170;
      c = 280;
      f = 75;
    }
    return { p, c, f };
  }, [mode]);

  // -----------------------------
  // Draft: load once, save always
  // -----------------------------
useEffect(() => {
  const draft = loadDraft();

  // 1) Prefer draft (what user is currently working on)
  if (draft && draft.dateKey === todayKey) {
    setMealLog(draft.mealLog || makeEmptyLog());
    setWaterCups(Number(draft.waterCups) || 0);
    setSteps(Number(draft.steps) || 2500);
    if (draft.mode) setMode(draft.mode);
    if (draft.dailyGoal) setDailyGoal(Number(draft.dailyGoal) || 2000);
    setLastSavedAt(draft.lastSavedAt || null);
    return;
  }

  // 2) If no draft, load from SAVED day (so old meals don’t disappear)
  const days = loadDays();
  const savedToday = days?.[todayKey];

  if (savedToday) {
    setMealLog(savedToday.mealLog || makeEmptyLog());
    setWaterCups(Number(savedToday.waterCups) || 0);
    setSteps(Number(savedToday.steps) || 2500);
    if (savedToday.mode) setMode(savedToday.mode);
    if (savedToday.goal) setDailyGoal(Number(savedToday.goal) || 2000);
    setLastSavedAt(savedToday.savedAt || null);

    // Create draft from saved so dashboard stays consistent while navigating
    saveDraft({
      dateKey: todayKey,
      mealLog: savedToday.mealLog || makeEmptyLog(),
      waterCups: Number(savedToday.waterCups) || 0,
      steps: Number(savedToday.steps) || 2500,
      mode: savedToday.mode || "Maintain",
      dailyGoal: Number(savedToday.goal) || 2000,
      lastSavedAt: savedToday.savedAt || null,
      updatedAt: new Date().toISOString(),
    });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  // useEffect(() => {
  //   saveDraft({
  //     dateKey: todayKey,
  //     mealLog,
  //     waterCups,
  //     steps,
  //     mode,
  //     dailyGoal,
  //     lastSavedAt,
  //     updatedAt: new Date().toISOString(),
  //   });
  // }, [todayKey, mealLog, waterCups, steps, mode, dailyGoal, lastSavedAt]);
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

// Merge old + new meal logs WITHOUT deleting old items.
// Also tries to avoid duplicates by (description+grams+kcal+ts).
function mergeMealLogs(oldLog, newLog) {
  const o = safeMealLog(oldLog);
  const n = safeMealLog(newLog);

  const dedupe = (items) => {
    const seen = new Set();
    const out = [];
    for (const it of items) {
      const key = [
        String(it?.description || ""),
        String(it?.grams || ""),
        String(it?.kcal || ""),
        String(it?.ts || ""),
      ].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out;
  };

  return {
    Breakfast: dedupe([...(o.Breakfast || []), ...(n.Breakfast || [])]),
    Lunch: dedupe([...(o.Lunch || []), ...(n.Lunch || [])]),
    Dinner: dedupe([...(o.Dinner || []), ...(n.Dinner || [])]),
    Snack: dedupe([...(o.Snack || []), ...(n.Snack || [])]),
  };
}

  // -----------------------------
  // SAVE DAY (goes to History/Analytics)
  // IMPORTANT: Save should NOT clear dashboard
  // -----------------------------
 const saveDay = () => {
  const days = loadDays();
  const nowIso = new Date().toISOString();

  const existing = days?.[todayKey] || null;

  // ✅ merge meal logs so older meals never get deleted
  const mergedMealLog = mergeMealLogs(existing?.mealLog, mealLog);

  // If you want “burned” from steps (simple estimate):
  // 1000 steps ≈ ~40 kcal (very rough)
  const burned = Math.round((Number(steps) || 0) * 0.04);

  const totalsNow = computeTotals(mergedMealLog);

  days[todayKey] = {
    dateKey: todayKey,
    savedAt: nowIso,
    mode,
    goal: dailyGoal,
    waterCups,
    steps,
    burned,                 // ✅ now stored
    mealLog: mergedMealLog, // ✅ merged
    totals: totalsNow,      // ✅ totals from merged data
  };

  saveDays(days);

  // update UI
  setLastSavedAt(nowIso);

  // also update draft to match merged saved day
  setMealLog(mergedMealLog);
  saveDraft({
    dateKey: todayKey,
    mealLog: mergedMealLog,
    waterCups,
    steps,
    mode,
    dailyGoal,
    lastSavedAt: nowIso,
    updatedAt: nowIso,
  });
};

  // -----------------------------
  // CLEAR DAY (dashboard draft only)
  // DOES NOT delete saved history
  // -----------------------------
  const clearDayDraft = () => {
    setMealLog(makeEmptyLog());
    setWaterCups(0);
    setSteps(2500);
    setLastSavedAt(null);
    clearDraft();
  };

  // -----------------------------
  // USDA Search (backend proxy)
  // -----------------------------
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("All"); // All | Foundation | Branded
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState(null);
  const [grams, setGrams] = useState(100);
  const debounceRef = useRef(null);

  const foodTypesParam = useMemo(() => {
    if (searchType === "Foundation") return ["Foundation"];
    if (searchType === "Branded") return ["Branded"];
    return ["Foundation", "Branded", "Survey (FNDDS)", "SR Legacy"];
  }, [searchType]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/usda/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: query.trim(),
            pageSize: 12,
            dataType: foodTypesParam,
          }),
        });

        const data = await res.json();
        const foods = Array.isArray(data?.foods) ? data.foods : [];

        setResults(
          foods.map((f) => ({
            fdcId: f.fdcId,
            description: f.description,
            brandName: f.brandName || "",
            dataType: f.dataType || "",
          }))
        );
      } catch (err) {
        console.error("USDA search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, foodTypesParam]);

  const pickFood = async (item) => {
    setPicked(null);

    try {
      const res = await fetch(`/api/usda/food/${item.fdcId}`);
      if (!res.ok) throw new Error("Failed to fetch food details");
      const data = await res.json();

      const nutrients = Array.isArray(data?.foodNutrients) ? data.foodNutrients : [];

      const getN = (names) => {
        const found = nutrients.find((n) => names.includes(n?.nutrient?.name));
        return Number(found?.amount) || 0;
      };

      const kcal = getN(["Energy"]);
      const protein = getN(["Protein"]);
      const carbs = getN(["Carbohydrate, by difference"]);
      const fat = getN(["Total lipid (fat)"]);

      setPicked({
        fdcId: item.fdcId,
        description: data.description || item.description,
        brandName: data.brandName || item.brandName || "",
        dataType: data.dataType || item.dataType || "",
        per100g: { kcal, protein, carbs, fat },
      });
    } catch (e) {
      console.error("Pick food error:", e);
      setPicked(null);
    }
  };

  const addPickedToMeal = () => {
    if (!picked) return;
    const g = Number(grams) || 0;
    const ratio = g / 100;
    const now = new Date();

    const food = {
      description: picked.description,
      brandName: picked.brandName,
      dataType: picked.dataType,
      grams: g,
      kcal: Math.round((picked.per100g.kcal || 0) * ratio),
      protein: Math.round((picked.per100g.protein || 0) * ratio * 10) / 10,
      carbs: Math.round((picked.per100g.carbs || 0) * ratio * 10) / 10,
      fat: Math.round((picked.per100g.fat || 0) * ratio * 10) / 10,
      ts: now.toISOString(),
    };

    addFoodToLog(food);
    setPicked(null);
  };

  // -----------------------------
  // Chat (offline) + Default questions
  // -----------------------------
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatMsgs, setChatMsgs] = useState([
    {
      role: "assistant",
      text: "Hi! I’m NutriLite helper (offline). Ask about calories, meals, macros, portions, and healthy tips.",
    },
  ]);

  const QUICK_QUESTIONS = [
    "How many calories left today?",
    "Show my macros for today",
    "High-protein snack ideas",
    "Best foods to maintain weight",
    "What should I eat for dinner under 500 kcal?",
    "How to reduce carbs but keep protein high?",
    "Healthy breakfast ideas",
    "How to hit my calorie goal faster?",
  ];

  const QA = [
    {
      q: /how many calories left|remaining/i,
      a: `Right now you’ve consumed ${totals.calories}/${dailyGoal} kcal. Remaining: ${remaining} kcal.`,
    },
    {
      q: /macro|macros/i,
      a: `Today macros: Protein ${totals.protein}g, Carbs ${totals.carbs}g, Fat ${totals.fat}g.`,
    },
    {
      q: /high protein snack|protein snack/i,
      a: "High-protein snacks: Greek yogurt, boiled eggs, cottage cheese, roasted chana, protein shake, tuna sandwich, paneer cubes, edamame.",
    },
    {
      q: /maintain|maintain calories/i,
      a: "To maintain: build each meal with protein + carbs + veggies + healthy fats. Keep portions consistent and use your Daily Goal as your daily total.",
    },
    {
      q: /dinner under 500/i,
      a: "Dinner under 500 kcal ideas: grilled chicken + salad, veggie stir-fry + tofu, dal + small rice portion, egg omelette + veggies, tuna wrap.",
    },
    {
      q: /reduce carbs/i,
      a: "To reduce carbs: swap rice/bread with veggies/salads, keep protein high (eggs/chicken/tofu), and use healthy fats in small amounts.",
    },
    {
      q: /healthy breakfast/i,
      a: "Healthy breakfasts: oats + fruit, eggs + toast, Greek yogurt + berries, poha/upma with veggies, smoothie with protein.",
    },
    {
      q: /hit my calorie goal|reach my calories/i,
      a: "To hit calories: if low, add calorie-dense items (rice/oats/nuts/peanut butter). If high, reduce oils/sugary snacks and add veggies + lean protein.",
    },
  ];

  const sendChat = () => {
    const q = chatText.trim();
    if (!q) return;

    setChatMsgs((prev) => [...prev, { role: "user", text: q }]);
    setChatText("");

    const hit = QA.find((x) => x.q.test(q));
    const answer =
      hit?.a ||
      "Ask me about: calories remaining, macro tips, maintain/cut/bulk meals, protein snacks, portion sizing.";

    setChatMsgs((prev) => [...prev, { role: "assistant", text: answer }]);
  };

  const askQuick = (text) => {
    setChatText(text);
    // If you want auto-send, uncomment:
    // setTimeout(() => sendChat(), 0);
  };

  // -----------------------------
  // UI styles
  // -----------------------------
  const shade = {
    goal: "bg-[#d7fff0] border-emerald-200",
    consumed: "bg-[#dffcf2] border-emerald-200",
    remaining: "bg-[#fff7c7] border-amber-200",
    mode: "bg-[#ffe3ef] border-pink-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8fbf6] via-[#eafcf8] to-[#effcf8]">
      {/* Top bar */}
      <div className="w-full bg-gradient-to-r from-[#0e8277] via-[#0f8c7d] to-[#16a34a] text-white shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              🥗
            </div>
            <div>
              <div className="text-lg font-extrabold leading-tight">NutriLite</div>
              <div className="text-xs opacity-90">USDA-powered calorie tracking</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/history"
              className="px-4 py-2 rounded-xl bg-white/15 border border-white/25 hover:bg-white/20 font-bold"
            >
              History
            </Link>
            <Link
              to="/analytics"
              className="px-4 py-2 rounded-xl bg-white/15 border border-white/25 hover:bg-white/20 font-bold"
            >
              Analytics
            </Link>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-extrabold hover:bg-emerald-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard className={shade.goal} title="Daily Goal" value={`${dailyGoal} kcal`} icon="🎯" />
          <SummaryCard className={shade.consumed} title="Consumed" value={`${totals.calories} kcal`} icon="🔥" />
          <SummaryCard className={shade.remaining} title="Remaining" value={`${remaining} kcal`} icon="⏳" />
          <SummaryCard className={shade.mode} title="Mode" value={mode} icon="🧠" />
        </div>

        {/* MAIN GRID */}
        <div className="mt-5 grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN */}
          <div className="xl:col-span-5 space-y-5">
            {/* Food Search */}
            <Card className="bg-[#f0fff7] border-emerald-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Food Search</h2>
                  <p className="text-sm text-slate-600">Choose a meal → search USDA → pick an item → add it.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Real USDA data
                </span>
              </div>

              {/* Meal buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {MEALS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMeal(m)}
                    className={[
                      "px-4 py-2 rounded-full border font-bold text-sm",
                      selectedMeal === m
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-white/70 text-slate-800 border-emerald-200 hover:bg-white",
                    ].join(" ")}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="mt-2 text-sm text-slate-600">
                Selected meal: <span className="font-extrabold text-emerald-800">{selectedMeal}</span>
              </div>

              {/* Search row */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Type a food (example: "apple", "rice cooked")'
                  className="md:col-span-9 w-full px-4 py-3 rounded-2xl border border-emerald-200 bg-white/70 outline-none focus:ring-2 focus:ring-emerald-300"
                />
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="md:col-span-3 w-full px-3 py-3 rounded-2xl border border-emerald-200 bg-white/70 font-bold text-slate-800"
                >
                  <option>All</option>
                  <option>Foundation</option>
                  <option>Branded</option>
                </select>
              </div>

              <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full border font-bold bg-emerald-50 text-emerald-800 border-emerald-200">
                  USDA: Connected (via server)
                </span>
                {loading && <span className="font-bold text-emerald-700">Searching…</span>}
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="mt-4 max-h-56 overflow-auto pr-1 space-y-2 relative z-50">
                  {results.map((r) => (
                    <button
                      key={r.fdcId}
                      onClick={() => pickFood(r)}
                      className="w-full text-left rounded-2xl border border-emerald-200 bg-white/75 hover:bg-white px-4 py-3"
                    >
                      <div className="font-extrabold text-slate-900">{r.description}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {r.brandName ? `Brand: ${r.brandName} • ` : ""}
                        <span className="font-bold">{r.dataType}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Picked food */}
              {picked && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-900">{picked.description}</div>
                      <div className="text-xs text-slate-600">
                        {picked.brandName ? `Brand: ${picked.brandName} • ` : ""}
                        <span className="font-bold">{picked.dataType}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-2">
                        Per 100g:{" "}
                        <span className="font-bold">
                          {Math.round(picked.per100g.kcal)} kcal • P {Math.round(picked.per100g.protein)}g • C{" "}
                          {Math.round(picked.per100g.carbs)}g • F {Math.round(picked.per100g.fat)}g
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setPicked(null)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-extrabold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">Grams</span>
                      <input
                        type="number"
                        min={1}
                        value={grams}
                        onChange={(e) => setGrams(e.target.value)}
                        className="w-28 px-3 py-2 rounded-xl border border-emerald-200 bg-white/70 font-bold"
                      />
                    </div>

                    <button
                      onClick={addPickedToMeal}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold"
                    >
                      Add to {selectedMeal}
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {/* Body Metrics */}
            <Card className="bg-[#ecfff6] border-emerald-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Body Metrics</h3>
                  <p className="text-sm text-slate-600">
                    Enter height + weight → see BMI + a suggested calorie goal for your mode.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUnits("US")}
                    className={[
                      "px-3 py-2 rounded-xl border font-extrabold text-sm",
                      units === "US"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-white/70 text-slate-800 border-emerald-200",
                    ].join(" ")}
                  >
                    US
                  </button>
                  <button
                    onClick={() => setUnits("Metric")}
                    className={[
                      "px-3 py-2 rounded-xl border font-extrabold text-sm",
                      units === "Metric"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-white/70 text-slate-800 border-emerald-200",
                    ].join(" ")}
                  >
                    Metric
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {units === "US" ? (
                  <>
                    <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
                      <div className="text-sm font-extrabold text-slate-800">Height</div>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="number"
                          min={0}
                          value={heightFt}
                          onChange={(e) => setHeightFt(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white font-bold"
                          placeholder="ft"
                        />
                        <input
                          type="number"
                          min={0}
                          value={heightIn}
                          onChange={(e) => setHeightIn(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white font-bold"
                          placeholder="in"
                        />
                      </div>
                      <div className="text-xs text-slate-600 mt-2">≈ {heightCm} cm</div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
                      <div className="text-sm font-extrabold text-slate-800">Weight</div>
                      <div className="mt-2">
                        <input
                          type="number"
                          min={0}
                          value={weightLb}
                          onChange={(e) => setWeightLb(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white font-bold"
                          placeholder="lb"
                        />
                      </div>
                      <div className="text-xs text-slate-600 mt-2">≈ {weightKg} kg</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
                      <div className="text-sm font-extrabold text-slate-800">Height (cm)</div>
                      <div className="mt-2">
                        <input
                          type="number"
                          min={0}
                          value={heightCm}
                          onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white font-bold"
                          placeholder="cm"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
                      <div className="text-sm font-extrabold text-slate-800">Weight (kg)</div>
                      <div className="mt-2">
                        <input
                          type="number"
                          min={0}
                          value={weightKg}
                          onChange={(e) => setWeightKg(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white font-bold"
                          placeholder="kg"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
                  <div className="text-xs text-slate-600">BMI</div>
                  <div className="text-2xl font-extrabold text-slate-900">{bmi ? bmi : "—"}</div>
                  <div className="text-sm font-bold text-emerald-800">{bmiCategory}</div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4 md:col-span-2">
                  <div className="text-xs text-slate-600">Suggested goal (for {mode})</div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {suggestedCalories ? `${suggestedCalories} kcal/day` : "—"}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={applySuggestedGoal}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold"
                    >
                      Apply to Daily Goal
                    </button>
                    <span className="text-xs text-slate-600">Simple estimate (weight/height + mode).</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Today’s Log */}
          <Card className="xl:col-span-7 bg-white/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Today’s Log</h2>
                <p className="text-sm text-slate-600">
                  Add foods → then click <span className="font-extrabold">Save Day</span>.
                </p>

                <div className="text-xs text-slate-500 mt-1">
                  Today key: <span className="font-bold">{todayKey}</span> (local timezone)
                  {lastSavedAt ? (
                    <span className="ml-2">
                      • Last saved:{" "}
                      <span className="font-bold">{new Date(lastSavedAt).toLocaleString()}</span>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveDay}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold"
                >
                  Save Day
                </button>
                <button
                  onClick={clearDayDraft}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 font-extrabold"
                >
                  Clear Day
                </button>
              </div>
            </div>

            {/* Calories progress */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Calories</div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {totals.calories} / {dailyGoal}
                  </div>
                  <div className="text-xs text-emerald-700 font-bold mt-1">Remaining: {remaining} kcal</div>
                </div>

                <div className="h-12 w-12 rounded-full border-4 border-emerald-200 flex items-center justify-center font-extrabold text-emerald-800 bg-white">
                  {percent}%
                </div>
              </div>

              <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
              </div>
            </div>

            {/* Macros */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <MacroCard label="Protein" value={totals.protein} target={macroTargets.p} />
              <MacroCard label="Carbs" value={totals.carbs} target={macroTargets.c} />
              <MacroCard label="Fat" value={totals.fat} target={macroTargets.f} />
            </div>

            {/* Meal buckets */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {MEALS.map((m) => (
                <div key={m} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-slate-900">{m}</div>
                    <div className="text-xs text-slate-500">{(mealLog[m] || []).length} items</div>
                  </div>

                  {(mealLog[m] || []).length === 0 ? (
                    <div className="text-sm text-slate-500 mt-2">No items yet. Add food from the left.</div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {(mealLog[m] || []).slice(0, 6).map((item, idx) => (
                        <div key={`${item.description}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-900 leading-snug">{item.description}</div>
                              <div className="text-xs text-slate-600">
                                {item.grams}g • {item.kcal} kcal • P {item.protein}g • C {item.carbs}g • F {item.fat}g{" "}
                                {" • "}
                                {item.ts
                                  ? new Date(item.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                  : ""}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFood(m, idx)}
                              className="text-xs font-extrabold text-rose-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Water + Steps */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-extrabold text-slate-900">Water</div>
                <div className="text-sm text-slate-600">Track daily cups.</div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setWaterCups((c) => Math.max(0, c - 1))}
                    className="h-10 w-10 rounded-xl border border-slate-200 bg-white font-extrabold"
                  >
                    −
                  </button>

                  <div className="flex-1 h-10 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-center font-extrabold text-emerald-900">
                    {waterCups} cups 💧
                  </div>

                  <button
                    onClick={() => setWaterCups((c) => c + 1)}
                    className="h-10 w-10 rounded-xl bg-emerald-700 text-white font-extrabold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-extrabold text-slate-900">Steps</div>
                <div className="text-sm text-slate-600">Simple activity estimator.</div>

                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={20000}
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="font-extrabold text-slate-900 w-16 text-right">{steps}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Floating chat */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg flex items-center justify-center text-xl"
        title="NutriLite helper"
      >
        🤖
      </button>

      {chatOpen && (
        <div className="fixed bottom-24 right-5 w-[420px] max-w-[92vw] h-[70vh] max-h-[560px] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-[#0e8277] via-[#0f8c7d] to-[#16a34a] text-white px-4 py-3 flex items-start justify-between">
            <div>
              <div className="font-extrabold">NutriLite Helper</div>
              <div className="text-xs opacity-90">
                Offline Q/A • Goal: {mode} • {totals.calories}/{dailyGoal}
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="h-9 w-9 rounded-xl bg-white/15 border border-white/20 font-extrabold grid place-items-center"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-2 bg-slate-50">
            {chatMsgs.map((m, i) => (
              <div
                key={i}
                className={[
                  "rounded-2xl px-3 py-2 text-sm whitespace-pre-line",
                  m.role === "user"
                    ? "bg-emerald-700 text-white ml-10"
                    : "bg-white border border-slate-200 text-slate-800 mr-10",
                ].join(" ")}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* ✅ Quick Questions (default buttons) */}
          <div className="px-3 py-2 bg-white border-t border-slate-200">
            <div className="text-xs font-extrabold text-slate-700 mb-2">Quick questions</div>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => askQuick(t)}
                  className="text-xs px-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-white"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex gap-2">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendChat();
                }}
                placeholder="Ask about calories, meals, macros…"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <button
                onClick={sendChat}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

/* -----------------------------
   Small components
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

function MacroCard({ label, value, target }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="font-extrabold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">
          {value}/{target}g
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
