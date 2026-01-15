import { Link } from "react-router-dom";

export default function AuthShell({
  title = "NutriLite",
  subtitle = "Track calories, build meals, and manage your diet.",
  children,
  bottomText,
  bottomLinkText,
  bottomLinkTo,
}) {
  return (
    <div className="min-h-screen w-full bg-[#0b0b12] text-white flex items-center justify-center px-4 py-10">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute -bottom-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-56 left-[-160px] h-[560px] w-[560px] rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Branding */}
        <div className="hidden lg:block">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Supabase Auth + PostgreSQL
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight">
              {title}
            </h1>
            <p className="mt-3 text-white/75 leading-relaxed">{subtitle}</p>

            <div className="mt-6 grid gap-3 text-sm text-white/75">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Email/Password login
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Google OAuth login
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Save meals to Supabase
              </div>
            </div>
          </div>
        </div>

        {/* Right: Phone mock */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Phone outer */}
            <div className="w-[340px] sm:w-[380px] rounded-[42px] bg-white/10 p-4 shadow-2xl ring-1 ring-white/15 backdrop-blur">
              {/* Phone top notch */}
              <div className="mx-auto h-6 w-40 rounded-b-2xl bg-black/60" />

              {/* Screen */}
              <div className="mt-4 rounded-[32px] bg-gradient-to-b from-violet-600 via-indigo-700 to-indigo-950 p-6 shadow-inner">
                {/* subtle pattern */}
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none" />

                <div className="text-center">
                  <div className="text-white/90 font-semibold tracking-wide">
                    {title}
                  </div>
                  <div className="text-[11px] text-white/70 mt-1">
                    CALCULATE EVERY BITE
                  </div>
                </div>

                {/* Card */}
                <div className="mt-6 rounded-2xl bg-white p-5 text-[#111827] shadow-xl">
                  <div className="text-center font-semibold">{bottomText}</div>
                  <div className="mt-1 text-center text-xs text-slate-500">
                    Fill the below information to continue
                  </div>

                  <div className="mt-4">{children}</div>

                  <div className="mt-5 text-center text-xs text-slate-500">
                    {bottomText === "Login Account"
                      ? "Don't have an account?"
                      : "Already have an account?"}{" "}
                    <Link
                      to={bottomLinkTo}
                      className="font-semibold text-indigo-700 hover:text-indigo-800"
                    >
                      {bottomLinkText}
                    </Link>
                  </div>
                </div>

                <div className="mt-6 text-center text-white/70 text-xs">
                  Don&apos;t forget to appreciate ✨
                </div>
              </div>
            </div>

            {/* Small floating chip */}
            <div className="absolute -bottom-4 left-6 rounded-2xl bg-white/10 px-4 py-2 text-xs text-white/80 ring-1 ring-white/15 backdrop-blur">
              Tip: keep <span className="font-semibold">npm run dev</span>{" "}
              running while testing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
