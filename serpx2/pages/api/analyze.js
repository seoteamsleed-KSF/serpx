export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { keyword } = req.body || {};
  if (!keyword) return res.status(400).json({ error: 'keyword required' });

  const SERPER_KEY = process.env.SERPER_API_KEY;
  const CRUX_KEY = process.env.CRUX_API_KEY;
  const PSI_KEY = process.env.PSI_API_KEY;

  try {
    // 1️⃣ SERP
    const serpRes = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: keyword, gl: "gr", num: 10 })
    });

    const serp = await serpRes.json();

    const results = await Promise.all(
      (serp.organic || []).map(async (r, i) => {

        let lcp, inp, cls;

        // 2️⃣ CRUX
        try {
          const crux = await fetch(
            `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${CRUX_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: r.link,
                formFactor: "PHONE",
                metrics: [
                  "largest_contentful_paint",
                  "interaction_to_next_paint",
                  "cumulative_layout_shift"
                ]
              })
            }
          );

          const data = await crux.json();
          const m = data.record?.metrics || {};

          lcp = m.largest_contentful_paint?.percentiles?.p75;
          inp = m.interaction_to_next_paint?.percentiles?.p75;
          cls = m.cumulative_layout_shift?.percentiles?.p75;

        } catch {}

        // 3️⃣ FALLBACK CLS (PSI)
        if (!cls && PSI_KEY) {
          try {
            const psi = await fetch(
              `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(r.link)}&key=${PSI_KEY}&strategy=mobile`
            );

            const psiData = await psi.json();

            const labCLS =
              psiData.lighthouseResult?.audits?.['cumulative-layout-shift']?.numericValue;

            if (labCLS) cls = labCLS;

          } catch {}
        }

        return {
          position: i + 1,
          url: r.link,
          title: r.title,
          domain_rating: 0,
          lcp,
          inp,
          cls
        };
      })
    );

    return res.status(200).json({ results });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
