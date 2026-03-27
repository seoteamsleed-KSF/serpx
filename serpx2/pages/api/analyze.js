import { getAhrefsData } from '../../lib/ahrefs'
import { getSimilarwebData } from '../../lib/similarweb'

const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    return res
  } catch (e) {
    return null
  } finally {
    clearTimeout(id)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { keyword } = req.body

  const SERPER_KEY = process.env.SERPER_API_KEY
  const CRUX_KEY = process.env.CRUX_API_KEY
  const PSI_KEY = process.env.PSI_API_KEY

  try {
    const serpRes = await fetchWithTimeout("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: keyword, gl: "gr", num: 10 })
    })

    const serp = await serpRes?.json()

    const results = await Promise.all(
      (serp.organic || []).map(async (r, i) => {

        let lcp = null
        let inp = null
        let cls = null

        // CRUX
        try {
          const crux = await fetchWithTimeout(
            `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${CRUX_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: r.link, formFactor: "PHONE" })
            }
          )

          const data = await crux?.json()
          const m = data?.record?.metrics || {}

          lcp = m.largest_contentful_paint?.percentiles?.p75 ?? null
          inp = m.interaction_to_next_paint?.percentiles?.p75 ?? null
          cls = m.cumulative_layout_shift?.percentiles?.p75 ?? null

        } catch {}

        // PSI fallback
        try {
          const psi = await fetchWithTimeout(
            `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(r.link)}&key=${PSI_KEY}&strategy=mobile`
          )

          const psiData = await psi?.json()
          const audits = psiData?.lighthouseResult?.audits || {}

          if (lcp === null)
            lcp = audits['largest-contentful-paint']?.numericValue ?? null

          if (inp === null)
            inp = audits['interactive']?.numericValue ?? null

          if (cls === null)
            cls = audits['cumulative-layout-shift']?.numericValue ?? null

        } catch {}

        lcp = Number(lcp)
        inp = Number(inp)
        cls = Number(cls)

        if (isNaN(lcp)) lcp = null
        if (isNaN(inp)) inp = null
        if (isNaN(cls)) cls = null

        // AHREFS
        let dr = "-"
        let traffic = "-"
        let keywords = "-"

        try {
          const domain = new URL(r.link).hostname.replace('www.', '')
          const ahrefs = await getAhrefsData(domain)

          dr = ahrefs?.dr ?? "-"
          traffic = ahrefs?.traffic ?? "-"
          keywords = ahrefs?.keywords ?? "-"
        } catch {}

        // SIMILARWEB (fallback)
        try {
          const domain = new URL(r.link).hostname.replace('www.', '')
          const sw = await getSimilarwebData(domain)

          if (traffic === "-" || traffic === "N/A")
            traffic = sw?.traffic ?? "-"

          if (keywords === "-" || keywords === "N/A")
            keywords = sw?.keywords ?? "-"
        } catch {}

        return {
          position: i + 1,
          url: r.link,
          title: r.title,
          dr,
          traffic,
          keywords,
          lcp,
          inp,
          cls
        }
      })
    )

    res.status(200).json({ results })

  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
