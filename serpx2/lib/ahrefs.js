export async function getAhrefsData(domain) {
  try {
    // προσωρινό fallback (για να μη σπάει)
    return {
      dr: "-",
      traffic: "-",
      keywords: "-"
    }
  } catch {
    return {
      dr: "-",
      traffic: "-",
      keywords: "-"
    }
  }
}
