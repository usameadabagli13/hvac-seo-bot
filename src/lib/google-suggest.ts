/**
 * Google Suggest API (the same source that powers the search box autocomplete).
 * Public, no API key needed. We use it to ground keyword generation in real
 * search demand instead of letting the LLM hallucinate.
 */

const SUGGEST_URL = "https://suggestqueries.google.com/complete/search";

async function fetchOne(query: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${SUGGEST_URL}?client=firefox&q=${encodeURIComponent(query)}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next:    { revalidate: 86400 }, // cache for 24h — the suggestion pool barely shifts daily
      },
    );
    if (!res.ok) return [];
    const data = await res.json() as [string, string[]];
    return data[1] ?? [];
  } catch (err) {
    console.error("[google-suggest] fetch error for", query, err);
    return [];
  }
}

/**
 * Fetches Google Suggest results for each seed query in parallel and returns
 * a deduplicated, lowercased list. Returns an empty array on total failure
 * so the caller can fall back gracefully.
 */
export async function fetchGoogleSuggestions(seeds: string[]): Promise<string[]> {
  const results = await Promise.all(seeds.map(fetchOne));
  const out = new Set<string>();
  for (const list of results) {
    for (const s of list) {
      const trimmed = s.trim().toLowerCase();
      if (trimmed.length > 2 && trimmed.length < 100) out.add(trimmed);
    }
  }
  return Array.from(out);
}
