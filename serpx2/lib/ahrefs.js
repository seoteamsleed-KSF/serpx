export async function getAhrefsData(domain) {
  try {
    const res = await fetch(`https://ahrefs.com/site-explorer/overview/v2/subdomains/live?target=${domain}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    const text = await res.text()

    const dr = text.match(/"domainRating":(\d+)/)?.[1]
    const traffic = text.match(/"organicTraffic":(\d+)/)?.[1]
    const keywords = text.match(/"organicKeywords":(\d+)/)?.[1]

    return {
      dr: dr ? Number(dr) : "-",
      traffic: traffic ? Number(traffic) : "-",
      keywords: keywords ? Number(keywords) : "-",
    }
  } catch {
    return {
      dr: "-",
      traffic: "-",
      keywords: "-",
    }
  }
}
