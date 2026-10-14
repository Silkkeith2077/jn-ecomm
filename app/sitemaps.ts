import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { categories } from "@/lib/categories";

const SITE = "https://docs2travel.com";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return [
        { url: SITE, lastModified: now, priority: 1 },
        { url: `${SITE}/products`, lastModified: now, priority: 0.9 },
        { url: `${SITE}/products/category`, lastModified: now, priority: 0.8 },
        ...categories.map((c) => ({
            url: `${SITE}/products/category/${c.slug}`,
            lastModified: now,
            priority: 0.8,
        })),
        ...products.map((p) => ({
            url: `${SITE}/products/${p.slug}`,
            lastModified: now,
            priority: 0.7,
        })),
    ];
}