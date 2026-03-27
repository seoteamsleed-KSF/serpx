export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { keyword } = req.body || {};
  if (!keyword?.trim()) return res.status(400).json({ error: 'keyword required' });

  const AHREFS_KEY = process.env.AHREFS_API_KEY;
  const CRUX_KEY = process.env.CRUX_API_KEY;

  if (!AHREFS_KEY) return res.status(500).json({ error: 'AHREFS_API_KEY not configured' });
  if (!CRUX_KEY) return res.status(500).json({ error: 'CRUX_API_KEY not configured' });

  try {
    // 1. Ahrefs SERP — GET with query params
    const url = new URL('https://api.ahrefs.com/v3/serp-overview');
    url.searchParams.set('keyword', keyword.trim());
    url.searchParams.set('country', 'gr');
    url.searchParams.set('select', 'position,url,title,domain_rating,refdomains');
    url.searchParams.set('top_positions', '10');

    const ahrefsRes = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AHREFS_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!ahrefsRes.ok) {
      const txt = await ahrefsRes.text();
      return res.status(502).json({ error: `Ahrefs: ${ahrefsRes.status} — ${txt}` });
    }

    const ahrefsData = await ahrefsRes.json();
    const positions = ahrefsData.positions || [];
    if (!positions.length) return res.status(200).json({ keyword, results: [] });

    // 2. CrUX — all parallel
    const cruxData = await Promise.all(positions.map(async (p) => {
      try {
        const r = await fetch(
          `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${CRUX_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: new URL(p.url).origin,
              formFactor: 'PHONE',
              metrics: ['largest_contentful_paint', 'interaction_to_next_paint', 'cumulative_layout_shift']
            })
          }
        );
        if (!r.ok) return { position: p.position, lcp: null, inp: null, cls: null };
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
    }));

    const cruxMap = Object.fromEntries(cruxData.map(c => [c.position, c]));
    const results = positions.map(p => ({
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
