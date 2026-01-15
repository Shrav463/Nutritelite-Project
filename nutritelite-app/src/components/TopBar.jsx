// src/components/TopBar.jsx
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function clsx(...arr) {
  return arr.filter(Boolean).join(" ");
}

export default function TopBar() {
  const loc = useLocation();

  const navBtn = (to, label) => {
    const active = loc.pathname === to;
    return (
      <Link
        to={to}
        className={clsx(
          "px-4 py-2 rounded-xl border font-bold transition",
          active
            ? "bg-white text-[#0f766e] border-white shadow"
            : "bg-white/15 text-white border-white/20 hover:bg-white/20"
        )}
      >
        {label}
      </Link>
    );
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-[#0d9488] to-[#0f766e] shadow-md">
      <div className="px-5 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 text-white">
          <div className="h-10 w-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            🥗
          </div>
          <div>
            <div className="font-extrabold leading-tight">NutriLite</div>
            <div className="text-xs text-white/80">
              USDA-powered calorie tracking
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {navBtn("/dashboard", "Dashboard")}
          {navBtn("/history", "History")}
          {navBtn("/analytics", "Analytics")}

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-white text-[#0f766e] font-extrabold hover:bg-[#ecfdf5] transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
