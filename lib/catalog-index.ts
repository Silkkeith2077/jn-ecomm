import { services } from "./data";
import { products } from "./products";

export type CatalogItem = {
  slug: string;
  name: string;
  category: string;
  image: string;
  href: string;
};

/** Resolve a cart slug against services first, then products. */
export function itemForSlug(slug: string): CatalogItem | undefined {
  const s = services.find((x) => x.slug === slug);
  if (s) {
    return { slug: s.slug, name: s.name, category: s.category, image: s.image, href: `/catalog/${s.slug}` };
  }
  const p = products.find((x) => x.slug === slug);
  if (p) {
    return { slug: p.slug, name: p.name, category: p.category, image: p.image, href: `/products/${p.slug}` };
  }
  return undefined;
}

export function nameForSlug(slug: string): string | undefined {
  return itemForSlug(slug)?.name;
}

export function isKnownSlug(slug: string): boolean {
  return services.some((s) => s.slug === slug) || products.some((p) => p.slug === slug);
}