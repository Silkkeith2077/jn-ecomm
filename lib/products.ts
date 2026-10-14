// AUTO-GENERATED wrapper. Edit build_products.py, not this file.
import raw from "./products.json";

export type Product = {
  slug: string; name: string; category: string; categorySlug: string;
  headline: string; summary: string; paragraphs: string[];
  tags: string[]; image: string; imageFull: string; sourceUrl: string;
};

export const products = raw as Product[];

export const productCategories = [
  ...new Map(
    products.map((p) => [p.categorySlug, { slug: p.categorySlug, name: p.category }])
  ).values(),
];

export function productBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function productsInCategory(slug: string) {
  return products.filter((p) => p.categorySlug === slug);
}
