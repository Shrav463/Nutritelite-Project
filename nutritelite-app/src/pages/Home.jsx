import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ✅ hover background image
import bgImg from "../assets/Background_img.png";
import NutriLiteAssistant from "../components/AIChatWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b6f66]">
      {/* Top Navbar */}
      <Navbar />

      {/* Page content starts after fixed navbar */}
      <main className="pt-24">
        {/* HERO */}
        <section className="hero-hover-wrap bg-[#0b6f66]">
          {/* ✅ BG image appears + animates on hover */}
          <div
            className="hero-bg-hover"
            style={{ backgroundImage: `url(${bgImg})` }}
          />
          {/* ✅ overlay stays for readability */}
          <div className="hero-hover-overlay" />

          {/* content */}
          <div className="relative z-10">
            <div className="mx-auto max-w-6xl px-4 py-14 grid lg:grid-cols-2 gap-10 items-center">
              {/* Left */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-lime-300" />
                  Calorie counter + diet recommendations
                </div>

                <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight">
                  Be healthy <br /> with NutriLite.
                </h1>

                <p className="mt-5 text-white/85 text-lg leading-relaxed max-w-xl">
                  Track calories, build meals, and get simple diet guidance in one clean dashboard.
                  Save your history so your progress stays with you.
                </p>

                {/* quick stats */}
                <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
                  <StatBox title="37K+" subtitle="Foods searchable" />
                  <StatBox title="Meal Log" subtitle="Save & revisit history" />
                  <StatBox title="Smart" subtitle="Diet goal guidance" />
                </div>
              </div>

              {/* Right mock dashboard card */}
              <div className="relative">
                <div className="rounded-[2.5rem] bg-white/10 border border-white/15 p-6 backdrop-blur-xl shadow-2xl">
                  <div className="text-white/90 text-sm font-semibold">Today</div>
                  <div className="text-white text-2xl font-extrabold">Dashboard</div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <MiniStat label="Budget" value="1900" />
                    <MiniStat label="Eaten" value="980" />
                    <MiniStat label="Left" value="920" />
                  </div>

                  <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-slate-900">Quick Food Search</div>
                      <div className="text-xs text-slate-500">calories</div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-slate-500 text-sm">
                      e.g., chicken breast, rice, apple...
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Pill>Breakfast</Pill>
                      <Pill>Lunch</Pill>
                      <Pill>Dinner</Pill>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-100 p-4">
                      <div className="font-extrabold text-slate-900">Meal Summary</div>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <RowItem left="Oats + Banana" right="320 kcal" />
                        <RowItem left="Chicken Salad" right="410 kcal" />
                        <RowItem left="Greek Yogurt" right="180 kcal" />
                      </div>

                      <button className="mt-4 w-full rounded-xl bg-teal-800 text-white py-3 font-extrabold hover:bg-teal-900 transition">
                        Add Meal
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decorative circles */}
                <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 -right-6 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES (Flip cards section you asked for) */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-4xl font-extrabold text-slate-900">
              Everything you need to track smarter
            </h2>
            <p className="mt-2 text-slate-600">
              NutriLite is built for simple tracking first — then smarter recommendations.
            </p>

            <div className="mt-10 grid md:grid-cols-3 gap-6">
              <FlipFeatureCard
                icon="🔎"
                title="Calorie Search"
                desc="Search foods and get quick calorie estimates."
                back="Use simple names like “apple” or “chicken breast” and pick from USDA results."
              />
              <FlipFeatureCard
                icon="🍽️"
                title="Meal Builder"
                desc="Combine foods into breakfast/lunch/dinner and track totals."
                back="Log meals and see how each meal contributes to your daily calories + macros."
              />
              <FlipFeatureCard
                icon="📈"
                title="Diet Guidance"
                desc="Suggestions based on your goal: cut, maintain, or bulk."
                back="Get recommendations aligned to your daily goal and meal balance."
              />
              <FlipFeatureCard
                icon="🗓️"
                title="Saved History"
                desc="Store logs and access them anytime."
                back="Review past days, totals, notes, and patterns."
              />
              <FlipFeatureCard
                icon="📊"
                title="Analytics"
                desc="Trends & insights for calories and macros."
                back="See weekly/monthly trends and understand what’s working for you."
                />
              <FlipFeatureCard
                icon="🤖"
                title="NutriLite AI"
                desc="Diet-only assistant inside the dashboard."
                back="Ask diet/calorie questions only — it won’t answer unrelated topics."
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-[#2bb0a6]">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-4xl font-extrabold text-slate-900">How it works</h2>
            <p className="mt-2 text-slate-800/80">A simple flow that feels easy every day.</p>

            <div className="mt-10 grid lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <StepCard n="01" title="Create account" desc="Sign up and set your goal." />
                <StepCard n="02" title="Search foods" desc="Find items and calories fast." />
                <StepCard n="03" title="Log meals" desc="Save meals and review history." />
                <StepCard n="04" title="Get guidance" desc="See diet-friendly suggestions." />
              </div>

              <div className="rounded-[2.5rem] bg-white/60 border border-white/40 p-8 shadow-sm">
                <h3 className="text-2xl font-extrabold text-slate-900">What you get</h3>
                <p className="mt-2 text-slate-700">
                  Built for students & busy people who want clarity and consistency.
                </p>

                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <InfoBadge title="History" desc="Save meal logs & totals." />
                  <InfoBadge title="Analytics" desc="Trends for calories/macros." />
                  <InfoBadge title="NutriLite AI" desc="Diet-only assistant in dashboard." />
                  <InfoBadge title="USDA Search" desc="Real foods & nutrition data." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="rounded-[2.5rem] bg-gradient-to-r from-teal-900 to-emerald-700 text-white p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-sm">
              <div>
                <h3 className="text-3xl font-extrabold">Build your best habits now.</h3>
                <p className="mt-2 text-white/85 max-w-xl">
                  Track meals, understand calories, and stay consistent — with history,
                  analytics, and a diet-only AI assistant.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="inline-flex px-7 py-3.5 rounded-full bg-white text-teal-900 font-extrabold hover:bg-white/90 transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-flex px-7 py-3.5 rounded-full bg-white/10 border border-white/25 text-white font-bold hover:bg-white/15 transition"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>

          {/* ✅ Footer */}
          <Footer />
        </section>
      </main>
      <NutriLiteAssistant/>
    </div>
  );
}

/* -----------------------------
   Small helper components
------------------------------ */

function StatBox({ title, subtitle }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-4">
      <div className="text-2xl font-extrabold text-white">{title}</div>
      <div className="text-xs text-white/70 mt-1">{subtitle}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
      <div className="text-white/70 text-xs font-semibold">{label}</div>
      <div className="text-white text-lg font-extrabold">{value}</div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <div className="rounded-xl bg-slate-100 border border-slate-200 py-2 text-center text-sm font-semibold text-slate-700">
      {children}
    </div>
  );
}

function RowItem({ left, right }) {
  return (
    <div className="flex items-center justify-between">
      <div>{left}</div>
      <div className="text-slate-500">{right}</div>
    </div>
  );
}

function StepCard({ n, title, desc }) {
  return (
    <div className="rounded-3xl bg-white/60 border border-white/50 p-6 flex items-start gap-4 shadow-sm">
      <div className="h-12 w-12 rounded-2xl bg-teal-900 text-white grid place-items-center font-extrabold">
        {n}
      </div>
      <div>
        <div className="text-lg font-extrabold text-slate-900">{title}</div>
        <div className="text-slate-700">{desc}</div>
      </div>
    </div>
  );
}

function InfoBadge({ title, desc }) {
  return (
    <div className="rounded-2xl bg-white/70 border border-white/70 p-4">
      <div className="text-sm font-bold text-slate-900">{title}</div>
      <div className="text-sm text-slate-700 mt-1">{desc}</div>
    </div>
  );
}

function FlipFeatureCard({ title, desc, icon, back }) {
  return (
    <div className="flip-card h-56">
      <div className="flip-inner relative h-full w-full">
        {/* FRONT */}
        <div className="flip-front absolute inset-0 rounded-3xl bg-white shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 grid place-items-center text-2xl">
            {icon}
          </div>
          <div className="mt-4 text-lg font-extrabold text-slate-900">{title}</div>
          <div className="mt-1 text-slate-600">{desc}</div>
          <div className="mt-auto text-sm text-teal-700 font-semibold">→</div>
        </div>

        {/* BACK */}
        <div className="flip-back absolute inset-0 rounded-3xl bg-teal-900 text-white p-6 flex flex-col">
          <div className="text-xl font-extrabold">{title}</div>
          <p className="mt-3 text-white/90 text-sm leading-relaxed">{back}</p>
          <div className="mt-auto text-sm font-bold text-white/95">Available inside NutriLite →</div>
        </div>
      </div>
    </div>
  );
}
