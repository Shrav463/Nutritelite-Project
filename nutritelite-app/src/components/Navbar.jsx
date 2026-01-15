import { Link } from "react-router-dom";
import logo from "../assets/logo_nutritelite.png";

export default function Navbar() {
  const navBtn =
    "px-5 py-2 rounded-full font-semibold transition border border-white/20 text-white bg-white/10 hover:bg-white/20 backdrop-blur";

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/10 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-20 flex items-center justify-between">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/15 border border-white/20 grid place-items-center">
             🥗
            </div>

            <div className="text-white leading-tight">
              <div className="text-2xl font-extrabold tracking-tight">
                NutriLite
              </div>
              <div className="text-xs text-white/70">
                Calorie tracking • Meal planning • Diet guidance
              </div>
            </div>
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-3">
            <Link to="/" className={navBtn}>Home</Link>
            <Link to="/login" className={navBtn}>Login</Link>
            <Link to="/signup" className={navBtn}>Sign Up</Link>
            <Link to="/about" className={navBtn}>About</Link>
          </div>

        </div>
      </div>
    </header>
  );
}
