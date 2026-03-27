export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { keyword } = req.body || {};
  if (!keyword?.trim()) {
    return res.status(400).json({ error: 'keyword required' });
  }

  const SERPER_KEY = process.env.SERPER_API_KEY;
  const CRUX_KEY = process.env.CRUX_API_KEY;

  if (!SERPER_KEY) {
    return res.status(500).json({ error: 'SERPER_API_KEY not configured' });
  }
  if (!CRUX_KEY) {
    return res.status(500).json({ error: 'CRUX_API_KEY not configured' });
  }

  try {
    // ✅ 1. SERPER (Google results)
    const serpRes = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: keyword.trim(),
        gl: "gr",
        num: 10
      })
    });

    if (!serpRes.ok) {
      const txt = await serpRes.text();
      return res.status(502).json({ error: `Serper: ${serpRes.status} — ${txt}` });
    }

    const serpData = await serpRes.json();

    const positions = (serpData.organic || []).map((r, i) => ({
      position: i + 1,
      url: r.link,
      title: r.title,
      domain_rating: 0,
      refdomains: 0
    }));

    if (!positions.length) {
      return res.status(200).json({ keyword, results: [] });
    }

    // ✅ 2. CrUX (Core Web Vitals)
    const cruxData = await Promise.all(
      positions.map(async (p) => {
        try {
          const r = await fetch(
            `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${CRUX_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                origin: new URL(p.url).origin,
                formFactor: "PHONE",
                metrics: [
                  "largest_contentful_paint",
                  "interaction_to_next_paint",
                  "cumulative_layout_shift"
                ]
              })
            }
          );

          if (!r.ok) {
            return { position: p.position, lcp: null, inp: null, cls: null };
          }

          const d = await r.json();
          const m = d.record?.metrics || {};

          return {
            position: p.position,
            lcp: m.largest_contentful_paint?.percentiles?.p75 ?? null,
            inp: m.interaction_to_next_paint?.percentiles?.p75 ?? null,
            cls: m.cumulative_layout_shift?.percentiles?.p75 ?? null
          };
        } catch {
          return { position: p.position, lcp: null, inp: null, cls: null };
        }
      })
    );

    const cruxMap = Object.fromEntries(
      cruxData.map((c) => [c.position, c])
    );

    const results = positions.map((p) => ({
      ...p,
      lcp: cruxMap[p.position]?.lcp ?? null,
      inp: cruxMap[p.position]?.inp ?? null,
      cls: cruxMap[p.position]?.cls ?? null
    }));

    return res.status(200).json({ keyword, results });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
