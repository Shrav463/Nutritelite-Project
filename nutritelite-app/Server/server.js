import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

// ----------------------------------------------------
// ✅ CORS (Netlify + local dev)
// IMPORTANT: when origin is not allowed, return an ERROR,
// not (false). Returning false causes missing CORS headers.
// ----------------------------------------------------
const allowedOrigins = new Set([
  "https://nutritelite-app.netlify.app",
  "https://reliable-jelly-ac1058.netlify.app",
  "http://localhost:5173",
]);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/server-to-server
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


app.use(cors(corsOptions));

// ✅ Preflight (must use SAME options)
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 5000;

const USDA_API_KEY = process.env.USDA_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

app.get("/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ----------------------------------------------------
// ✅ Helper: fetch with timeout + safe JSON parsing
// ----------------------------------------------------
async function fetchTextWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    const text = await resp.text();
    return { resp, text };
  } finally {
    clearTimeout(timer);
  }
}

function safeJsonParse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// USDA Proxy (key stays server-side)
// ----------------------------------------------------
app.post("/api/usda/search", async (req, res) => {
  try {
    if (!USDA_API_KEY) {
      return res.status(500).json({
        error: "USDA_API_KEY is not set on the server.",
      });
    }

    const { query, pageSize = 12, dataType } = req.body || {};
    const q = String(query || "").trim();

    if (q.length < 2) return res.json({ foods: [] });

    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(
      USDA_API_KEY
    )}`;

    const { resp, text } = await fetchTextWithTimeout(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          pageSize,
          dataType: Array.isArray(dataType) ? dataType : undefined,
        }),
      },
      20000
    );

    const data = safeJsonParse(text);

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: "USDA API returned error",
        status: resp.status,
        details: data || text?.slice(0, 500) || "No response body",
      });
    }

    if (!data) {
      return res.status(502).json({
        error: "USDA API returned non-JSON response",
        details: text?.slice(0, 500) || "Empty response",
      });
    }

    return res.json(data);
  } catch (err) {
    const isTimeout = err?.name === "AbortError";
    console.error("USDA search failed:", err);

    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? "USDA search timed out." : "USDA search failed.",
      details: String(err),
    });
  }
});

app.get("/api/usda/food/:fdcId", async (req, res) => {
  try {
    if (!USDA_API_KEY) {
      return res.status(500).json({
        error: "USDA_API_KEY is not set on the server.",
      });
    }

    const { fdcId } = req.params;
    if (!fdcId) return res.status(400).json({ error: "Missing fdcId" });

    const url = `https://api.nal.usda.gov/fdc/v1/food/${encodeURIComponent(
      fdcId
    )}?api_key=${encodeURIComponent(USDA_API_KEY)}`;

    const { resp, text } = await fetchTextWithTimeout(url, {}, 20000);

    const data = safeJsonParse(text);

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: "USDA API returned error",
        status: resp.status,
        details: data || text?.slice(0, 500) || "No response body",
      });
    }

    if (!data) {
      return res.status(502).json({
        error: "USDA API returned non-JSON response",
        details: text?.slice(0, 500) || "Empty response",
      });
    }

    return res.json(data);
  } catch (err) {
    const isTimeout = err?.name === "AbortError";
    console.error("USDA food lookup failed:", err);

    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? "USDA food lookup timed out." : "USDA food lookup failed.",
      details: String(err),
    });
  }
});

// ----------------------------------------------------
// AI Chat (OpenAI) - returns {text}
// ----------------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    const text = String(message || "").trim();
    if (!text) return res.status(400).json({ error: "Missing message" });

    if (!openai) return res.status(501).json({ text: "" });

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
    return res.json({ text: out });
  } catch (err) {
    console.error("Chat failed:", err);
    return res.status(500).json({ error: "Chat failed", text: "" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
