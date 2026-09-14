// jx4r-bio view counter — Cloudflare Worker + KV. Free tier is plenty.
//
// DASHBOARD DEPLOY (no CLI, ~3 min):
//   1. dash.cloudflare.com > Workers & Pages > Create > Create Worker
//      > name it jx4r-bio-views > Deploy (ignore the starter code).
//   2. Storage & Databases > KV > Create namespace "jx4r-bio-views".
//   3. Back in the worker > Settings > Bindings > Add > KV namespace
//      > variable name EXACTLY: VIEWS > pick the namespace > Deploy.
//   4. Edit code (paste THIS file) > Deploy. Copy the worker URL, e.g.
//      https://jx4r-bio-views.YOU.workers.dev
//   5. In app.js set counterApi to that URL, commit + push. Done.
//
// API (CORS open):
//   GET  /api/views        -> {value}  (read total)
//   POST /api/views        -> {value}  (total + 1)
//   GET  /api/day/2026-09-13 -> {value}
//   POST /api/day/2026-09-13 -> {value} (that day + 1)
//   POST /api/beat {id}    -> {value}  (live viewers right now)
//   GET  /api/now           -> {value}  (live viewers right now)
// (presence keys auto-expire after 90s, so "now" means active tabs)

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-max-age": "86400",
};

const json = (v) =>
  new Response(JSON.stringify({ value: v }), {
    headers: { "content-type": "application/json", ...CORS },
  });

async function getNum(KV, key, dflt) {
  const raw = await KV.get(key);
  const n = parseInt(raw || "", 10);
  return Number.isFinite(n) ? n : dflt;
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const KV = env.VIEWS;
    if (!KV) return new Response("bind a KV namespace as VIEWS", { status: 500 });

    const u = new URL(req.url);

    if (u.pathname === "/api/views") {
      if (req.method === "POST") {
        const n = (await getNum(KV, "total", 0)) + 1;
        await KV.put("total", String(n));
        return json(n);
      }
      return json(await getNum(KV, "total", 0));
    }

    const m = u.pathname.match(/^\/api\/day\/(\d{4}-\d{2}-\d{2})$/);
    if (m) {
      const k = "day:" + m[1];
      if (req.method === "POST") {
        const n = (await getNum(KV, k, 0)) + 1;
        await KV.put(k, String(n));
        return json(n);
      }
      return json(await getNum(KV, k, 0));
    }

    if (u.pathname === "/api/beat" && req.method === "POST") {
      let id = "";
      try {
        id = String((await req.json()).id || "").slice(0, 64);
      } catch { /* ignore */ }
      if (id) await KV.put("here:" + id, "1", { expirationTtl: 90 });
      const list = await KV.list({ prefix: "here:" });
      return json(list.keys.length);
    }

    if (u.pathname === "/api/now") {
      const list = await KV.list({ prefix: "here:" });
      return json(list.keys.length);
    }

    return new Response("jx4r-bio counter: use /api/views or /api/day/YYYY-MM-DD", {
      status: 404,
      headers: CORS,
    });
  },
};
