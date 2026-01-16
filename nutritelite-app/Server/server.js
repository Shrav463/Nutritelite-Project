import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

/**
 * ✅ CORS (allow your Netlify frontend + local dev)
 * Put this BEFORE routes.
 */
const allowedOrigins = [
  "https://nutrilite-app.netlify.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Helpful for browser preflight requests
app.options("*", cors());

app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 5000;

const USDA_API_KEY = process.env.USDA_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// -----------------------------
// USDA Proxy (key stays server-side)
// -----------------------------
app.post("/api/usda/search", async (req, res) => {
  try {
    if (!USDA_API_KEY) {
      return res
        .status(500)
        .json({ error: "USDA_API_KEY is not set on the server." });
    }

    const { query, pageSize = 12, dataType } = req.body || {};
    const q = String(query || "").trim();

    if (q.length < 2) return res.json({ foods: [] });

    const resp = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(
        USDA_API_KEY
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          pageSize,
          dataType: Array.isArray(dataType) ? dataType : undefined,
        }),
      }
    );

    const data = await resp.json();
    return res.status(resp.ok ? 200 : resp.status).json(data);
  } catch (err) {
    console.error("USDA search failed:", err);
    return res.status(500).json({ error: "USDA search failed." });
  }
});

app.get("/api/usda/food/:fdcId", async (req, res) => {
  try {
    if (!USDA_API_KEY) {
      return res
        .status(500)
        .json({ error: "USDA_API_KEY is not set on the server." });
    }

    const { fdcId } = req.params;
    if (!fdcId) return res.status(400).json({ error: "Missing fdcId" });

    const resp = await fetch(
      `https://api.nal.usda.gov/fdc/v1/food/${encodeURIComponent(
        fdcId
      )}?api_key=${encodeURIComponent(USDA_API_KEY)}`
    );

    const data = await resp.json();
    return res.status(resp.ok ? 200 : resp.status).json(data);
  } catch (err) {
    console.error("USDA food lookup failed:", err);
    return res.status(500).json({ error: "USDA food lookup failed." });
  }
});

// -----------------------------
// AI Chat (OpenAI) - returns {text}
// -----------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    const text = String(message || "").trim();
    if (!text) return res.status(400).json({ error: "Missing message" });

    if (!openai) {
      return res.status(501).json({ text: "" }); // IMPORTANT: text key
    }

    const system =
      "You are NutriLite Assistant. Only answer questions about NutriLite (features, navigation) and diet/calorie guidance (foods, calories, macros, portions, meal ideas). If unrelated, refuse politely.";

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
      temperature: 0.6,
      max_tokens: 300,
    });

    const out = completion.choices?.[0]?.message?.content?.trim() || "";
    return res.json({ text: out }); // IMPORTANT: text key
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Chat failed", text: "" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
