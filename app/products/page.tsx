import ProductCatalog from "@/components/product-catalog";
import { categories } from "@/lib/categories";
import Link from "next/link";

export const metadata = {
  title: "Document catalog",
  description: "Browse passports, driving licences, visas, ID cards and residence permits.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  return (
      <>
      <nav className="filters" aria-label="Document categories">
        {categories.map((c) => (
            <Link key={c.slug} href={`/products/category/${c.slug}`}>{c.name}</Link>
        ))}
      </nav>
    <ProductCatalog key={params.category || "all"} initialCategory={params.category || "All products"} />
      </>
        );
}