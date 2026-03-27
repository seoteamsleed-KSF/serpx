export async function getSimilarwebData(domain) {
  const API_KEY = process.env.SIMILARWEB_API_KEY;

  try {
    // TRAFFIC
    const trafficRes = await fetch(
      `https://api.similarweb.com/v1/website/${domain}/total-traffic-and-engagement/visits?api_key=${API_KEY}&start_date=2024-01&end_date=2024-01&granularity=monthly`
    );

    const trafficData = await trafficRes.json();
    const visits = trafficData.visits?.[0]?.visits || null;

    // KEYWORDS
    const keywordsRes = await fetch(
      `https://api.similarweb.com/v1/website/${domain}/search/organic?api_key=${API_KEY}&limit=1`
    );

    const keywordsData = await keywordsRes.json();
    const keywords = keywordsData.searches?.length || null;

    // AUTHORITY (DTS σαν DR)
    const rankRes = await fetch(
      `https://api.similarweb.com/v1/website/${domain}/global-rank/global-rank?api_key=${API_KEY}`
    );

    const rankData = await rankRes.json();

    // fake DR από rank (inverse scaling)
    let dr = null;
    if (rankData.global_rank?.rank) {
      const r = rankData.global_rank.rank;
      dr = Math.max(1, 100 - Math.log10(r) * 10);
      dr = Math.round(dr);
    }

    return {
      dr: dr || "-",
      traffic: visits || "-",
      keywords: keywords || "-"
    };

  } catch (e) {
    return {
      dr: "-",
      traffic: "-",
      keywords: "-"
    };
  }
}
