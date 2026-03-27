export async function getSimilarwebData(domain) {
  const API_KEY = process.env.SIMILARWEB_API_KEY

  try {
    const res = await fetch(
      `https://api.similarweb.com/v1/website/${domain}/total-traffic-and-engagement/visits?api_key=${API_KEY}&start_date=2024-01&end_date=2024-01&granularity=monthly`
    )

    const data = await res.json()

    return {
      traffic: data?.visits?.[0]?.visits ?? "-",
      keywords: "-" // Similarweb ΔΕΝ δίνει organic keywords εύκολα
    }

  } catch (e) {
    return {
      traffic: "-",
      keywords: "-"
    }
  }
}
