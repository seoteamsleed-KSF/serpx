export async function getSimilarwebData(domain) {
  const API_KEY = process.env.SIMILARWEB_API_KEY;

  try {
    const res = await fetch(
      `https://api.similarweb.com/v1/website/${domain}/traffic-and-engagement/visits?api_key=${API_KEY}&start_date=2024-01&end_date=2024-01&granularity=monthly&country=ww`
    );

    const data = await res.json();

    const visits = data?.data?.[0]?.visits;

    // 🔥 fallback (αν δεν έχει data)
    if (!visits) {
      return {
        traffic: "N/A",
        keywords: "N/A"
      };
    }

    return {
      traffic: Math.round(visits),
      keywords: Math.round(visits / 8)
    };

  } catch {
    return {
      traffic: "N/A",
      keywords: "N/A"
    };
  }
}
