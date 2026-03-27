export async function getSimilarwebData(domain) {
  const API_KEY = process.env.SIMILARWEB_API_KEY;

  try {
    const res = await fetch(
      `https://api.similarweb.com/v1/website/${domain}/traffic-and-engagement/visits?api_key=${API_KEY}&start_date=2024-01&end_date=2024-01&granularity=monthly&country=ww`
    );

    const data = await res.json();

    // DEBUG (θα δεις αν έρχεται data)
    console.log("SW:", domain, data);

    const visits = data.visits?.[0]?.visits;

    return {
      traffic: visits || "-",
      keywords: visits ? Math.round(visits / 8) : "-"
    };

  } catch (e) {
    console.log("SW ERROR:", e);
    return {
      traffic: "-",
      keywords: "-"
    };
  }
}
