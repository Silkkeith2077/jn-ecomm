import Link from "next/link";
import ProductCatalog from "@/components/product-catalog";
import { LegalDocuments } from "@/components/legal-documents";
import { categories } from "@/lib/categories";

export const metadata = {
    title: "Buy legal documents online",
    description:
        "Browse passports, driving licences, visas, ID cards and residence permits. Real and replica documents, sourced worldwide.",
};

export default async function Page({
                                       searchParams,
                                   }: {
    searchParams: Promise<{ category?: string }>;
}) {
    const params = await searchParams;
    return (
        <>
            <LegalDocuments />

            <nav className="category-strip" aria-label="Document categories">
                {categories.map((c) => (
                    <Link key={c.slug} href={`/products/category/${c.slug}`}>{c.name}</Link>
                ))}
            </nav>

            <ProductCatalog key={params.category || "all"} initialCategory={params.category || "All products"} />
        </>
    );
}