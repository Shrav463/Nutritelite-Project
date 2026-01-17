export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const key = process.env.USDA_API_KEY;
    if (!key) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing USDA_API_KEY in Netlify env variables" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const query = (body.query || "").trim();
    const pageSize = body.pageSize || 12;
    const dataType = body.dataType || ["Foundation", "Branded"];

    if (!query) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing query in request body" }),
      };
    }

    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${key}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, pageSize, dataType }),
    });

    const text = await resp.text();

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "USDA API failed", details: text }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Function crashed", details: String(err) }),
    };
  }
}
