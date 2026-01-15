import { useEffect, useMemo, useRef, useState } from "react";

function clsx(...a) {
  return a.filter(Boolean).join(" ");
}

function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function formatKcal(n) {
  return `${Math.round(safeNum(n))} kcal`;
}

export default function NutriLiteChatbot({
  title = "NutriLite Helper",
  subtitle = "Offline Q/A",
  context = {
    mode: "Maintain",
    goal: 2000,
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    burned: 0,
    steps: 0,
    dateLabel: "",
  },
  defaultQuestions = [],
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  const goal = safeNum(context.goal);
  const cal = safeNum(context.totals?.calories);
  const protein = safeNum(context.totals?.protein);
  const carbs = safeNum(context.totals?.carbs);
  const fat = safeNum(context.totals?.fat);
  const steps = safeNum(context.steps);
  const burned = safeNum(context.burned);

  const remaining = Math.max(0, goal - cal);
  const net = Math.max(0, cal - burned);

  const chips = useMemo(() => {
    const base = [
      "How many calories left today?",
      "Show my macros today",
      "How can I increase protein?",
      "Give me a healthy snack idea",
      "How many calories did I eat?",
      "What does Maintain/Cut/Bulk mean?",
      "How much water should I drink?",
    ];
    const merged = [...(defaultQuestions || []), ...base];
    // de-dupe
    return Array.from(new Set(merged)).slice(0, 8);
  }, [defaultQuestions]);

  const [msgs, setMsgs] = useState(() => [
    {
      role: "assistant",
      text:
        `Hi! I’m NutriLite helper (offline).\n` +
        `Ask about calories, macros, portions, and quick tips.`,
    },
  ]);

  // Scroll to bottom
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs, open]);

  const answerFor = (qRaw) => {
    const q = String(qRaw || "").toLowerCase();

    if (q.includes("calories left") || q.includes("remaining")) {
      return `You’ve consumed ${formatKcal(cal)} out of ${formatKcal(goal)}.\nRemaining: ${formatKcal(remaining)}.`;
    }

    if (q.includes("how many calories did i eat") || q.includes("calories did i eat")) {
      return `Total consumed: ${formatKcal(cal)}.${burned ? `\nEstimated burned: ${formatKcal(burned)}.\nNet: ${formatKcal(net)}.` : ""}`;
    }

    if (q.includes("macro")) {
      return `Macros so far:\n• Protein: ${Math.round(protein)} g\n• Carbs: ${Math.round(carbs)} g\n• Fat: ${Math.round(fat)} g\nCalories: ${formatKcal(cal)}.`;
    }

    if (q.includes("increase protein") || q.includes("more protein")) {
      return `Easy protein boost ideas:\n• Greek yogurt / cottage cheese\n• Eggs or egg whites\n• Chicken/turkey/lean fish\n• Lentils/chickpeas\n• Protein shake (if needed)\nAim for ~25–35g protein per meal.`;
    }

    if (q.includes("snack")) {
      return `Healthy snack ideas:\n• Apple + peanut butter\n• Greek yogurt + berries\n• Hummus + carrots\n• Nuts + a fruit\n• Boiled eggs\nPick based on your goal (Cut: more protein/fiber, Bulk: add carbs too).`;
    }

    if (q.includes("maintain") || q.includes("cut") || q.includes("bulk")) {
      return `Mode quick guide:\n• Cut = calorie deficit (lose fat)\n• Maintain = around maintenance calories (stable)\n• Bulk = calorie surplus (gain muscle/weight)\nProtein stays high in all modes.`;
    }

    if (q.includes("water")) {
      return `Water tip:\nA simple target is ~2–3 liters/day (more if active).\nTry 8–12 cups/day as a starting point.`;
    }

    if (q.includes("steps")) {
      return `Steps today: ${Math.round(steps)}.\nEstimated burned (rough): ${formatKcal(burned)}.\nMore accurate burn needs age/sex/intensity.`;
    }

    return `Try asking:\n• "How many calories left?"\n• "Show my macros"\n• "Healthy snack idea"\n• "How to increase protein?"`;
  };

  const send = (q) => {
    const content = String(q ?? text).trim();
    if (!content) return;

    setMsgs((p) => [...p, { role: "user", text: content }]);
    setText("");

    const a = answerFor(content);
    setMsgs((p) => [...p, { role: "assistant", text: a }]);
  };

  const headerLine = `${subtitle} • ${context.dateLabel ? `${context.dateLabel} • ` : ""}Goal: ${context.mode || "Maintain"} • ${Math.round(cal)}/${Math.round(goal)}`;

  return (
    <>
      {/* Floating open button */}
      <button
    onClick={() => setOpen(true)}
    className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-black hover:bg-gray-900 text-white shadow-xl flex items-center justify-center text-xl z-50 border border-gray-800"
    title="NutriLite helper"
  >
    {/*Emoji from: https://emojiterra.com/robot-face/ */}
    🤖  
  </button>


      {open && (
        <div className="fixed bottom-24 right-5 w-[420px] max-w-[92vw] h-[70vh] max-h-[560px] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0e8277] via-[#0f8c7d] to-[#16a34a] text-white px-4 py-3 flex items-start justify-between">
            <div>
              <div className="font-extrabold">{title}</div>
              <div className="text-xs opacity-90">{headerLine}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-9 w-9 rounded-xl bg-white/15 border border-white/20 font-extrabold grid place-items-center"
            >
              ✕
            </button>
          </div>

          {/* Quick questions */}
          <div className="px-3 py-2 border-b border-slate-200 bg-white">
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  className="text-xs font-extrabold px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2 bg-slate-50">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={clsx(
                  "rounded-2xl px-3 py-2 text-sm whitespace-pre-line",
                  m.role === "user"
                    ? "bg-emerald-700 text-white ml-10"
                    : "bg-white border border-slate-200 text-slate-800 mr-10"
                )}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Ask about calories, meals, macros…"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <button
                onClick={() => send()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
