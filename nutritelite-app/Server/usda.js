import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/usda/search", async (req, res) => {
  try {
    const USDA_KEY = process.env.USDA_API_KEY;
    if (!USDA_KEY) return res.status(400).json({ error: "Missing USDA_API_KEY" });

    const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "USDA proxy failed", details: err.message });
  }
});

app.listen(5000, () => console.log("✅ USDA Proxy running on http://localhost:5000"));
