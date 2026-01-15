import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer"; // ✅ correct import + PascalCase
import NutriLiteAssistant from "../components/AIChatWidget";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8fbf6] via-[#eafcf8] to-[#effcf8] flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-gradient-to-r from-[#0e8277] via-[#0f8c7d] to-[#16a34a] text-white">
        <div className="mx-auto max-w-6xl px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/15 border border-white/20 grid place-items-center text-white text-xl">
              🥗
            </div>
            <div className="leading-tight">
              <div className="text-xl font-extrabold tracking-tight">About NutriLite</div>
              <div className="text-xs text-white/80">
                Calorie tracking • Meal logging • History • Analytics • Diet-only AI assistant
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl bg-white/15 border border-white/25 hover:bg-white/20 font-bold"
            >
              Back
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-xl bg-white text-teal-900 font-extrabold hover:bg-white/90 transition shadow"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-5 py-10 flex-1">
        {/* Intro */}
        <section className="rounded-3xl bg-white/90 backdrop-blur border border-slate-200 shadow-sm p-7">
          <h1 className="text-3xl font-extrabold text-slate-900">What is NutriLite?</h1>
          <p className="mt-3 text-slate-700 leading-relaxed">
            NutriLite is a simple calorie and diet tracking website that helps you search foods,
            log meals, and understand your daily totals (calories + macros). It’s designed to keep
            your tracking organized with an easy dashboard, saved history, and analytics insights.
          </p>

          <div className="mt-5 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-4">
              <div className="font-bold text-slate-900">Food Search</div>
              <div className="text-sm text-slate-700 mt-1">
                Search foods fast and log meals with calories & macros.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-teal-50 p-4">
              <div className="font-bold text-slate-900">Meal History</div>
              <div className="text-sm text-slate-700 mt-1">
                Review past days, timestamps, and meal totals.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-lime-50 p-4">
              <div className="font-bold text-slate-900">Analytics</div>
              <div className="text-sm text-slate-700 mt-1">
                See trends, weekly summaries, and macro breakdowns.
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Guide */}
        <section className="mt-8 grid lg:grid-cols-2 gap-6">
          {/* Left: Navigation Steps */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-7">
            <h2 className="text-2xl font-extrabold text-slate-900">How to navigate the website</h2>
            <p className="mt-2 text-slate-600">Follow these steps to use NutriLite properly:</p>

            <div className="mt-6 space-y-5">
              {[
                {
                  step: "01",
                  title: "Home",
                  desc: "Learn what NutriLite does and sign up or log in from the top menu.",
                },
                {
                  step: "02",
                  title: "Dashboard",
                  desc: "Search foods, add meals (breakfast/lunch/dinner/snack), and track calories + macros for today.",
                },
                {
                  step: "03",
                  title: "History",
                  desc: "Check your saved logs by date, view meal timestamps, daily totals, and notes.",
                },
                {
                  step: "04",
                  title: "Analytics",
                  desc: "See graphs and insights such as calorie trends, macro balance, and progress summaries.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-full bg-teal-600 text-white font-bold grid place-items-center">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-slate-700">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-green-800 text-white font-bold hover:bg-slate-800 transition"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
              >
                History
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-lime-600 text-white font-bold hover:bg-lime-700 transition"
              >
                Analytics
              </Link>
            </div>
          </div>

          {/* Right: What to do after Dashboard */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-7">
            <h2 className="text-2xl font-extrabold text-slate-900">
              What users should do after opening Dashboard
            </h2>

            <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-bold text-slate-900">✅ Step 1: Choose a meal</div>
                <div className="text-sm mt-1">
                  Select Breakfast / Lunch / Dinner / Snack before searching.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-bold text-slate-900">✅ Step 2: Search foods</div>
                <div className="text-sm mt-1">
                  Type the food name (example: “rice cooked”, “apple”, “chicken breast”).
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-bold text-slate-900">✅ Step 3: Add items to your log</div>
                <div className="text-sm mt-1">
                  Add food items and portions to update calories + macros automatically.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-bold text-slate-900">✅ Step 4: Use the AI assistant (Diet-only)</div>
                <div className="text-sm mt-1">
                  Ask diet questions like “what should I eat for dinner?” or “high protein snack”.
                  The AI should not answer unrelated topics.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-bold text-slate-900">✅ Step 5: Review progress</div>
                <div className="text-sm mt-1">
                  Use History to see older logs and Analytics to view trends.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ✅ Footer (same footer used across pages) */}
      <NutriLiteAssistant/>
      <Footer />
    </div>
  );
}
