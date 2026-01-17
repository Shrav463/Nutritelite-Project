import express from "express";

const router = express.Router();

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

// POST /api/usda/search
router.post("/search", async (req, res) => {
  try {
    const key = process.env.USDA_API_KEY;
    if (!key) {
      return res.status(500).json({
        error: "Missing USDA_API_KEY on server",
      });
    }

    const query = String(req.body?.query || "").trim();
    const pageSize = Number(req.body?.pageSize || 12);
    const dataType = Array.isArray(req.body?.dataType)
      ? req.body.dataType
      : ["Foundation", "Branded"];

    if (!query) {
      return res.status(400).json({ error: "query is required" });
    }

    const url = `${USDA_BASE}/foods/search?api_key=${key}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, pageSize, dataType }),
    });

    const text = await resp.text();

    // Always return JSON with details if USDA fails
    if (!resp.ok) {
      return res.status(resp.status).json({
        error: "USDA API failed",
        details: text,
      });
    }

    // USDA already returns JSON text
    res.type("json").send(text);
  } catch (e) {
    res.status(500).json({
      error: "Internal server error in /api/usda/search",
      details: String(e),
    });
  }
});

// GET /api/usda/food/:fdcId
router.get("/food/:fdcId", async (req, res) => {
  try {
    const key = process.env.USDA_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "Missing USDA_API_KEY on server" });
    }

    const fdcId = req.params.fdcId;
    if (!fdcId) return res.status(400).json({ error: "fdcId required" });

    const url = `${USDA_BASE}/food/${fdcId}?api_key=${key}`;

    const resp = await fetch(url);
    const text = await resp.text();

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: "USDA API failed",
        details: text,
      });
    }

    res.type("json").send(text);
  } catch (e) {
    res.status(500).json({
      error: "Internal server error in /api/usda/food/:fdcId",
      details: String(e),
    });
  }
});

export default router;
