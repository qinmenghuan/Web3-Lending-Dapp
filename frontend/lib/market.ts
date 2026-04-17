const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function getMarkets() {
  const markets = await fetch(`${API_BASE_URL}/markets`).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch markets");
    }
    return res.json();
  });
  return markets;
}
