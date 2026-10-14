import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, categoryBySlug } from "@/lib/categories";
import { productsInCategory } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Icon } from "@/components/store";
import { whatsapp } from "@/lib/data";

const SITE = "https://docs2travel.com";

export function generateStaticParams() {
    return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const c = categoryBySlug(slug);
    if (!c) return { title: "Category not found" };
    return {
        title: `${c.name} — buy online`,
        description: c.paragraphs[0]?.slice(0, 155),
        alternates: { canonical: `/products/category/${c.slug}` },
    };
}

/** Promote short, punctuation-free paragraphs to subheadings. Tune the threshold to taste. */
function isHeading(text: string) {
    return text.length <= 70 && !/[.!?,;:]$/.test(text) && text.split(" ").length <= 9;
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const c = categoryBySlug(slug);
    if (!c) notFound();

    const items = productsInCategory(c.slug);
    const [lead, ...body] = c.paragraphs;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: c.name,
        url: `${SITE}/products/category/${c.slug}`,
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: p.name,
                url: `${SITE}/products/${p.slug}`,
            })),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <section className="section">
                <div className="breadcrumb">
                    <Link href="/products">Documents</Link>
                    <span>/</span>
                    <span>{c.name}</span>
                </div>

                <div className="page-intro">
                    <h1>{c.name}</h1>
                    {lead && <p className="detail-tagline">{lead}</p>}
                </div>

                <div className="detail-information category-copy">
                    {body.map((para, i) =>
                        isHeading(para) ? <h2 key={i}>{para}</h2> : <p key={i}>{para}</p>
                    )}
                </div>

                <a
                    className="button"
                    href={whatsapp(`Hello Docs2Travel, I have a question about ${c.name.toLowerCase()}.`)}
                    target="_blank"
                    rel="noreferrer"
                >
                    Ask about {c.name.toLowerCase()} <Icon name="arrow" />
                </a>
            </section>

            <section className="section">
                <h2>{items.length} {c.name.toLowerCase()} documents</h2>
                <div className="service-grid">
                    {items.map((p) => <ProductCard key={p.slug} product={p} />)}
                </div>
            </section>
        </>
    );
}