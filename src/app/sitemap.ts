import type { MetadataRoute } from "next";
import { CITIES } from "@/data/cities";
import { ARTICLES } from "@/data/articles";

const BASE_URL = "https://www.heatrankai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,        lastModified, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/pricing`,        lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/vs-seo-agency`,  lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/vs-podium`,      lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/vs-birdeye`,     lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources`,      lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`,                              lastModified, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE_URL}/case-studies`,                       lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/faq`,                                lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`,                            lastModified, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE_URL}/glossary`,                           lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/tools`,                              lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tools/title-tag-checker`,            lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/tools/meta-description-generator`,   lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/tools/keyword-density`,              lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/integrations`,                       lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/roadmap`,                            lastModified, changeFrequency: "weekly",  priority: 0.5 },
    { url: `${BASE_URL}/changelog`,                          lastModified, changeFrequency: "weekly",  priority: 0.5 },
    { url: `${BASE_URL}/privacy`,        lastModified, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/terms`,   lastModified, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url:             `${BASE_URL}/hvac-seo/${city.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority:        0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url:             `${BASE_URL}/resources/${a.slug}`,
    lastModified:    new Date(a.published),
    changeFrequency: "yearly",
    priority:        0.6,
  }));

  const stateSlugs = [...new Set(CITIES.map((c) => c.state.toLowerCase()))];
  const stateRoutes: MetadataRoute.Sitemap = stateSlugs.map((slug) => ({
    url:             `${BASE_URL}/hvac-seo/state/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority:        0.7,
  }));

  return [...staticRoutes, ...articleRoutes, ...stateRoutes, ...cityRoutes];
}
