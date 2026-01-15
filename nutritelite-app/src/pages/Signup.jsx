/* =========================
   src/pages/Signup.jsx
   (same triangle image + full height like Login)
   ========================= */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import mockupImg from "../assets/Calorie_count_img.png";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    // If email confirmation is ON, user may need to verify.
    // You can still navigate to login and show message.
    navigate("/login");
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
      {/* ✅ FULL-HEIGHT TRIANGLE IMAGE (same as Login) */}
      <div className="hidden lg:block pointer-events-none fixed top-0 right-0 h-screen w-[55%] z-0 clip-triangle-right overflow-hidden">
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
        {/* LEFT (same style as Login) */}
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
              Create your account.
              <br />
              Start tracking today.
            </h1>

            <p className="mt-4 text-white/90 leading-relaxed max-w-md">
              Join NutriLite to search foods, log meals, and get diet guidance — all
              from one clean dashboard.
            </p>

            <div className="mt-6 grid grid-rows-3 gap-3">
              <FeatureLine
                title="Personal Dashboard"
                desc="See daily calories and progress at a glance."
              />
              <FeatureLine
                title="Food & Meal Tracking"
                desc="Log meals and stay consistent with habits."
              />
              <FeatureLine
                title="Smart Suggestions"
                desc="Guidance for your nutrition goals."
              />
            </div>

            <div className="mt-auto pt-6 grid grid-cols-3 gap-3">
              <MiniStat value="Fast" label="signup" />
              <MiniStat value="Secure" label="auth" />
              <MiniStat value="Ready" label="today" />
            </div>
          </div>
        </div>

        {/* RIGHT (Signup form) */}
        <div className="h-full bg-white rounded-3xl shadow-xl px-8 py-8 md:px-10 md:py-10 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Sign Up
          </h2>
          <p className="text-slate-500 mt-1">Create your account</p>

          {msg && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {msg}
            </div>
          )}

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  First Name
                </label>
                <input
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  type="text"
                  name="firstName"
                  placeholder="Shravani"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <input
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  type="text"
                  name="lastName"
                  placeholder="Kalisetty"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
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
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 transition disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs text-slate-400">or sign up with</span>
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
              Already have an account?{" "}
              <Link to="/login" className="text-teal-700 font-semibold">
                Login
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
