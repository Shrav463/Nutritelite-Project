import { useEffect, useMemo, useState } from "react";

const API_KEY = import.meta.env.VITE_USDA_API_KEY;

function getNutrientValue(food, includes = []) {
  const list = food?.foodNutrients || [];
  const found = list.find((n) => {
    const name = (n.nutrient?.name || n.nutrientName || "").toLowerCase();
    return includes.some((k) => name.includes(k));
  });
  return Number(found?.amount ?? found?.value ?? 0) || 0;
}

// These are ONLY suggestions (USDA will still fetch everything)
const EXAMPLES = [
  "apple raw",
  "banana raw",
  "rice cooked",
  "chicken breast cooked",
  "oats",
  "milk",
  "egg",
  "broccoli",
  "peanut butter",
  "pizza",
];

export default function FoodSearchUSDA({ mealType, onAddMeal }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  const [grams, setGrams] = useState(100);

  const [filter, setFilter] = useState("all"); // all | foundation | branded | srLegacy
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  // ✅ Debounced auto-search when user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelected(null);
      setError("");
      return;
    }

    const t = setTimeout(() => {
      searchFoods(query);
    }, 450);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filter]);

  const searchFoods = async (q) => {
    if (!q.trim()) return;

    if (!API_KEY) {
      setError("Missing USDA API key. Add VITE_USDA_API_KEY to your .env and restart.");
      return;
    }

    setError("");
    setLoadingSearch(true);

    try {
      const body = {
        query: q,
        pageSize: 12,
      };

      // USDA supports filtering by dataType
      if (filter === "foundation") body.dataType = ["Foundation"];
      if (filter === "branded") body.dataType = ["Branded"];
      if (filter === "srLegacy") body.dataType = ["SR Legacy"];

      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.foods || []);
    } catch (e) {
      setError("Failed to search USDA foods. Check your API key / internet.");
    } finally {
      setLoadingSearch(false);
    }
  };

  const loadFoodDetails = async (fdcId) => {
    if (!API_KEY) return;

    setError("");
    setLoadingDetails(true);

    try {
      const res = await fetch(
        `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`
      );
      if (!res.ok) throw new Error("Details failed");
      const data = await res.json();
      setSelected(data);
    } catch (e) {
      setError("Failed to fetch nutrition details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // ✅ Calculate per grams (USDA is usually per 100g)
  const nutrition = useMemo(() => {
    if (!selected) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const kcalPer100 = getNutrientValue(selected, ["energy"]);
    const proteinPer100 = getNutrientValue(selected, ["protein"]);
    const carbsPer100 = getNutrientValue(selected, ["carbohydrate"]);
    const fatPer100 = getNutrientValue(selected, ["total lipid", "fat"]);

    const factor = (Number(grams) || 0) / 100;

    return {
      calories: Math.round(kcalPer100 * factor),
      protein: +(proteinPer100 * factor).toFixed(1),
      carbs: +(carbsPer100 * factor).toFixed(1),
      fat: +(fatPer100 * factor).toFixed(1),
    };
  }, [selected, grams]);

  const handleAdd = () => {
    if (!selected) return;

    onAddMeal({
      id: crypto.randomUUID(),
      mealType,
      name: selected.description,
      grams: Number(grams) || 0,
      calories: nutrition.calories,
      p: nutrition.protein,
      c: nutrition.carbs,
      f: nutrition.fat,
    });

    // reset selection only (keep search if you want)
    setSelected(null);
    setGrams(100);
  };

  return (
    <div className="space-y-4">
      {/* How to search (user guidance) */}
      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="font-extrabold text-teal-900">How to search foods</div>
        <ul className="mt-2 text-sm text-teal-900/90 space-y-1 list-disc pl-5">
          <li>Type a simple food name like <b>apple</b>, <b>rice cooked</b>, <b>chicken breast</b>.</li>
          <li>Don’t type “2 apples” — search “apple” and change grams.</li>
          <li>Use filters: <b>Foundation</b> = generic foods, <b>Branded</b> = packaged foods.</li>
        </ul>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => setQuery(x)}
              className="px-3 py-1.5 rounded-full bg-white border border-teal-200 text-teal-900 text-sm font-semibold hover:bg-teal-100 transition"
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      {/* Search input + filter */}
      <div className="flex gap-2">
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Type a food… (example: peanut butter)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-3 bg-white text-sm font-semibold text-slate-700"
        >
          <option value="all">All</option>
          <option value="foundation">Foundation</option>
          <option value="branded">Branded</option>
          <option value="srLegacy">SR Legacy</option>
        </select>
      </div>

      <div className="text-xs text-slate-500">
        {loadingSearch
          ? "Searching USDA…"
          : query.trim()
          ? "Results update automatically as you type."
          : "Start typing to see USDA foods."}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results list */}
      <div className="max-h-64 overflow-auto space-y-2 pr-1">
        {results.map((f) => (
          <button
            key={f.fdcId}
            type="button"
            onClick={() => loadFoodDetails(f.fdcId)}
            className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
          >
            <div className="font-semibold text-slate-900 line-clamp-1">{f.description}</div>
            <div className="text-xs text-slate-500">
              {f.brandName ? `Brand: ${f.brandName} • ` : ""}
              {f.dataType}
            </div>
          </button>
        ))}

        {!loadingSearch && query.trim() && results.length === 0 ? (
          <div className="text-sm text-slate-500">
            No results. Try a simpler name (example: “apple”).
          </div>
        ) : null}
      </div>

      {/* Selected nutrition details */}
      {loadingDetails && <div className="text-sm text-slate-500">Loading nutrition…</div>}

      {selected && !loadingDetails && (
        <div className="rounded-2xl border border-slate-200 p-4 bg-gradient-to-br from-slate-50 to-emerald-50">
          <div className="font-extrabold text-slate-900 line-clamp-2">
            {selected.description}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-semibold">grams</label>
              <input
                type="number"
                min="1"
                className="mt-1 w-full border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-semibold">calories</label>
              <div className="mt-1 w-full border rounded-xl px-4 py-3 bg-white font-extrabold text-teal-800">
                {nutrition.calories} kcal
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <MacroPill label="Protein" value={`${nutrition.protein}g`} className="bg-blue-50 border-blue-200 text-blue-900" />
            <MacroPill label="Carbs" value={`${nutrition.carbs}g`} className="bg-amber-50 border-amber-200 text-amber-900" />
            <MacroPill label="Fat" value={`${nutrition.fat}g`} className="bg-rose-50 border-rose-200 text-rose-900" />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-4 w-full rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold py-3 transition"
          >
            Add to {mealType}
          </button>
        </div>
      )}
    </div>
  );
}

function MacroPill({ label, value, className }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${className}`}>
      <div className="text-[11px] opacity-80">{label}</div>
      <div className="font-extrabold">{value}</div>
    </div>
  );
}
