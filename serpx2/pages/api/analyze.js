export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { keyword } = req.body || {};
  if (!keyword?.trim()) {
    return res.status(400).json({ error: 'keyword required' });
  }

  const SERPER_KEY = process.env.SERPER_API_KEY;
  const CRUX_KEY = process.env.CRUX_API_KEY;

  if (!SERPER_KEY) return res.status(500).json({ error: 'SERPER_API_KEY missing' });
  if (!CRUX_KEY) return res.status(500).json({ error: 'CRUX_API_KEY missing' });

  try {
    // ✅ SERPER
    const serpRes = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: keyword,
        gl: "gr",
        num: 10
      })
    });

    const serpData = await serpRes.json();

    // ✅ FREE DR (Moz-style proxy)
    async function getDA(domain) {
      try {
        const r = await fetch(`https://api.allorigins.win/raw?url=https://api.seoreviewtools.com/website-authority-checker/?domain=${domain}`);
        const d = await r.json();
        return d?.domain_authority || 0;
      } catch {
        return 0;
      }
    }

    // ✅ BUILD RESULTS
    const positions = await Promise.all(
      (serpData.organic || []).map(async (r, i) => {
        const domain = new URL(r.link).hostname.replace("www.", "");

        const da = await getDA(domain);

        return {
          position: i + 1,
          url: r.link,
          title: r.title,
          domain_rating: da,
          refdomains: 0
        };
      })
    );

    // ✅ CRUX
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

          if (!r.ok) return { position: p.position };

          const d = await r.json();
          const m = d.record?.metrics || {};

          return {
            position: p.position,
            lcp: m.largest_contentful_paint?.percentiles?.p75,
            inp: m.interaction_to_next_paint?.percentiles?.p75,
            cls: m.cumulative_layout_shift?.percentiles?.p75
          };
        } catch {
          return { position: p.position };
        }
      })
    );

    const cruxMap = Object.fromEntries(cruxData.map(c => [c.position, c]));

    const results = positions.map(p => ({
      ...p,
      lcp: cruxMap[p.position]?.lcp,
      inp: cruxMap[p.position]?.inp,
      cls: cruxMap[p.position]?.cls
    }));

    return res.status(200).json({ results });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
