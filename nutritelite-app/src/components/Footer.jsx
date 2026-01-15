import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-plant-bg text-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        {/* Top grid */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 grid place-items-center text-lg">
                🥗
              </div>
              <div className="text-xl font-extrabold">NutriLite</div>
            </div>
            <p className="mt-4 text-white/80 text-sm leading-relaxed">
              Track calories, plan meals, and stay consistent with smart diet
              guidance — all in one clean dashboard.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-lg">Product</h4>
            <ul className="mt-4 space-y-2 text-white/80 text-sm">
              <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link to="/history" className="hover:text-white">History</Link></li>
              <li><Link to="/analytics" className="hover:text-white">Analytics</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">AI Chat</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg">Company</h4>
            <ul className="mt-4 space-y-2 text-white/80 text-sm">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-lg">Resources</h4>
            <ul className="mt-4 space-y-2 text-white/80 text-sm">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/support" className="hover:text-white">Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-white/20" />

        {/* Bottom */}
        <div className="text-center text-white/70 text-sm">
          © {new Date().getFullYear()} NutriLite. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
