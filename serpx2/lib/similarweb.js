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
      `https://api.similarweb.com/v4/website-analysis/keywords?domain=${domain}&api_key=${API_KEY}`
    );

    const keywordsData = await keywordsRes.json();
    const keywords = keywordsData?.meta?.total_results || null;

    // GLOBAL RANK
    const rankRes = await fetch(
      `https://api.similarweb.com/v1/website/${domain}/global-rank/global-rank?api_key=${API_KEY}`
    );

    const rankData = await rankRes.json();
    const rank = rankData.global_rank?.rank || null;

    return {
      dr: rank || "-",        // 👉 rename later στο UI
      traffic: visits || "-",
      keywords: keywords || "-"
    };

  } catch {
    return {
      dr: "-",
      traffic: "-",
      keywords: "-"
    };
  }
}
