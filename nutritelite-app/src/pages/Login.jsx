/* =========================
   src/pages/Login.jsx
   ========================= */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import mockupImg from "../assets/Calorie_count_img.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    navigate("/dashboard");
  };

  const handleGoogle = async () => {
    setMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setMsg(error.message);
  };

  return (
    <div className="relative min-h-screen bg-plant-pattern flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* ✅ FULL-HEIGHT TRIANGLE IMAGE (covers the top space too) */}
      <div className="hidden lg:block pointer-events-none fixed top-0 right-0 h-screen w-[55%] z-0 clip-triangle-right overflow-hidden">
        {/* soft glow behind image */}
        <div className="absolute inset-0 bg-white/40 blur-3xl" />

        <img
          src={mockupImg}
          alt="NutriLite preview"
          className="
            absolute right-[-6%] top-1/2
            w-[120%] max-w-none
            -translate-y-1/2
            opacity-95
            drop-shadow-[0_40px_60px_rgba(0,0,0,0.35)]
          "
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT */}
        <div className="rounded-3xl shadow-xl overflow-hidden relative h-full">
          <div className="absolute inset-0 bg-plant-bg" />
          <div className="absolute inset-0 pointer-events-none opacity-70">
            <span className="bubble bubble-1" />
            <span className="bubble bubble-2" />
            <span className="bubble bubble-3" />
            <span className="bubble bubble-4" />
            <span className="bubble bubble-5" />
            <span className="bubble bubble-6" />
          </div>

          <div className="relative p-8 md:p-10 text-white flex flex-col h-full">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-full text-sm w-fit">
              <span className="text-lg">🥗</span>
              <span className="font-semibold tracking-wide">NutriLite</span>
              <span className="text-white/70">• Calorie & Diet Assistant</span>
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-extrabold leading-tight">
              Track meals.
              <br />
              Count calories.
              <br />
              Stay consistent.
            </h1>

            <p className="mt-4 text-white/90 leading-relaxed max-w-md">
              Search foods, build meals, and track daily totals — with a clean
              dashboard that keeps your progress organized.
            </p>

            <div className="mt-6 grid grid-rows-3 gap-3">
              <FeatureLine
                title="Food Search"
                desc="Find foods fast and estimate calories instantly."
              />
              <FeatureLine
                title="Meal Logging"
                desc="Add breakfast/lunch/dinner and track totals."
              />
              <FeatureLine
                title="Diet Guidance"
                desc="Recommendations for cut, maintain, or bulk goals."
              />
            </div>

            <div className="mt-auto pt-6 grid grid-cols-3 gap-3">
              <MiniStat value="37K+" label="foods" />
              <MiniStat value="Cloud" label="history" />
              <MiniStat value="Smart" label="guidance" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="h-full bg-white rounded-3xl shadow-xl px-8 py-8 md:px-10 md:py-10 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Login
          </h2>
          <p className="text-slate-500 mt-1">Sign in to continue</p>

          {msg && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {msg}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs text-slate-400">or login with</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              className="w-full rounded-xl border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Continue with Google
            </button>

            <p className="text-sm text-center text-slate-500 pt-2">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-teal-700 font-semibold">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function FeatureLine({ title, desc }) {
  return (
    <div className="h-full rounded-2xl bg-white/10 border border-white/15 p-4 flex flex-col justify-center">
      <div className="font-bold">{title}</div>
      <div className="text-white/85 text-sm mt-1">{desc}</div>
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="h-full min-h-[72px] rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center justify-center text-center">
      <div className="text-lg font-black">{value}</div>
      <div className="text-xs text-white/75 mt-1">{label}</div>
    </div>
  );
}
