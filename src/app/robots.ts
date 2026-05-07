import type { MetadataRoute } from "next";

const BASE_URL = "https://www.heatrankai.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  ["/admin", "/dashboard", "/api", "/auth"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host:    BASE_URL,
  };
}
