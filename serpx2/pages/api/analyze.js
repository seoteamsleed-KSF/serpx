import { getAhrefsData } from '../../lib/ahrefs'
import { getSimilarwebData } from '../../lib/similarweb'

const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
  try {
    const res = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(timeout)
    })
    return res
  } catch {
    return null
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

        // PSI ONLY (σταθερό)
        try {
          const psi = await fetchWithTimeout(
            `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(r.link)}&key=${PSI_KEY}&strategy=mobile`
          )

          const psiData = await psi?.json()
          const audits = psiData?.lighthouseResult?.audits || {}

          lcp = audits['largest-contentful-paint']?.numericValue ?? null
          inp = audits['interactive']?.numericValue ?? null
          cls = audits['cumulative-layout-shift']?.numericValue ?? null

        } catch {}

        // FORMAT
        if (lcp) lcp = (lcp / 1000).toFixed(2) + 's'
        else lcp = "-"

        if (inp) inp = Math.round(inp) + 'ms'
        else inp = "-"

        if (cls !== null) cls = Number(cls).toFixed(2)
        else cls = "-"

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

        // SIMILARWEB fallback
        try {
          const domain = new URL(r.link).hostname.replace('www.', '')
          const sw = await getSimilarwebData(domain)

          if (traffic === "-") traffic = sw?.traffic ?? "-"
          if (keywords === "-") keywords = sw?.keywords ?? "-"
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
