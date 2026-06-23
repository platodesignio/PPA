import type { MetadataRoute } from "next";

const BASE = "https://ppa-plum.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,               lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/audit`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/method`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/privacy`,  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,    lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];
}
