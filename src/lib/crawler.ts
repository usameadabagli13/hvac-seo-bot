/**
 * Lightweight HTML scraper for the SEO audit feature. Pulls the bits Gemini
 * needs to give recommendations: title, meta description, H1, H2 count, word
 * count, image alt coverage, and whether the page already has JSON-LD.
 *
 * Intentionally regex-based — no DOM library — to keep the route small and
 * cold-start friendly on Vercel.
 */

export interface CrawlResult {
  url:                string;          // final URL after redirects
  pageTitle:          string | null;
  metaDescription:    string | null;
  h1:                 string | null;
  h2Count:            number;
  wordCount:          number;
  imageCount:         number;
  imagesMissingAlt:   number;
  hasSchema:          boolean;
  bodySnippet:        string;          // first ~2000 chars of body text, fed to Gemini
}

export class CrawlError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

const TIMEOUT_MS = 8000;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/gi,  "&")
    .replace(/&lt;/gi,   "<")
    .replace(/&gt;/gi,   ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi,  "'")
    .replace(/&nbsp;/gi, " ");
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi,   " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? decodeEntities(m[1]).trim() : null;
}

/**
 * Fetch the URL and extract SEO-relevant fields. Throws CrawlError with
 * meaningful HTTP-style status codes for the API route to relay.
 */
export async function crawl(rawUrl: string): Promise<CrawlResult> {
  let url: URL;
  try {
    url = new URL(rawUrl);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("bad protocol");
  } catch {
    throw new CrawlError("Invalid URL.", 422);
  }

  // Pre-flight robots.txt check — best-effort only (don't fail the audit on a
  // missing or unreachable robots.txt; only on explicit deny)
  try {
    const robotsRes = await fetch(`${url.origin}/robots.txt`, {
      signal: AbortSignal.timeout(3000),
      headers: { "User-Agent": "HeatRankAI-Audit/1.0" },
    });
    if (robotsRes.ok) {
      const robotsText = await robotsRes.text();
      if (/User-agent:\s*\*[\s\S]*?Disallow:\s*\/(?!\S)/i.test(robotsText)) {
        // robots.txt explicitly blocks all crawlers
        throw new CrawlError("This site's robots.txt blocks crawling. Audit refused.", 403);
      }
    }
  } catch (err) {
    if (err instanceof CrawlError) throw err;
    // ignore network errors on robots — proceed with the audit
  }

  let res: Response;
  try {
    res = await fetch(url.href, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "follow",
      headers: {
        "User-Agent": "HeatRankAI-Audit/1.0 (+https://www.heatrankai.com)",
        "Accept":     "text/html,application/xhtml+xml",
      },
    });
  } catch (err) {
    if ((err as Error).name === "AbortError" || (err as Error).name === "TimeoutError") {
      throw new CrawlError("The site took too long to respond.", 504);
    }
    throw new CrawlError("Could not reach the site. Check the URL.", 502);
  }

  if (!res.ok) {
    throw new CrawlError(`Site returned HTTP ${res.status}.`, 502);
  }

  const ctype = res.headers.get("content-type") ?? "";
  if (!ctype.includes("html")) {
    throw new CrawlError("URL returned non-HTML content.", 415);
  }

  const html = await res.text();
  const finalUrl = res.url || url.href;

  const pageTitle       = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = firstMatch(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i)
                       ?? firstMatch(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const h1              = firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h2Matches       = html.match(/<h2[^>]*>/gi) ?? [];
  const imgMatches      = html.match(/<img\b[^>]*>/gi) ?? [];
  const imgsMissingAlt  = imgMatches.filter((tag) => !/\salt\s*=\s*["'][^"']+["']/i.test(tag)).length;
  const hasSchema       = /application\/ld\+json/i.test(html);

  const bodyText = stripTags(html);
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  return {
    url:                finalUrl,
    pageTitle:          pageTitle ? stripTags(pageTitle) : null,
    metaDescription,
    h1:                 h1 ? stripTags(h1) : null,
    h2Count:            h2Matches.length,
    wordCount,
    imageCount:         imgMatches.length,
    imagesMissingAlt:   imgsMissingAlt,
    hasSchema,
    bodySnippet:        bodyText.slice(0, 2000),
  };
}
