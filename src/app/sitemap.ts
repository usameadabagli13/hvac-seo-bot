import type { MetadataRoute } from "next";
import { CITIES } from "@/data/cities";

const BASE_URL = "https://www.heatrankai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,        lastModified, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/pricing`,        lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/vs-seo-agency`,  lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources`,      lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/privacy`,        lastModified, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/terms`,   lastModified, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url:             `${BASE_URL}/hvac-seo/${city.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority:        0.8,
  }));

  return [...staticRoutes, ...cityRoutes];
}
