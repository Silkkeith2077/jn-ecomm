import Link from "next/link";
import { notFound } from "next/navigation";
import { type ReactNode } from "react";
import { categories, categoryBySlug, leadParagraph, type Block } from "@/lib/categories";
import { productsInCategory } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Icon } from "@/components/icon";
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
        description: leadParagraph(c).slice(0, 155),
        alternates: { canonical: `/products/category/${c.slug}` },
    };
}

/** Group consecutive list items into a single <ul>. */
function renderBlocks(blocks: Block[]): ReactNode[] {
    const nodes: ReactNode[] = [];
    let list: string[] = [];

    const flush = (key: string) => {
        if (!list.length) return;
        nodes.push(<ul key={key}>{list.map((t, i) => <li key={i}>{t}</li>)}</ul>);
        list = [];
    };

    blocks.forEach((b, i) => {
        if (b.type === "li") {
            list.push(b.text);
            return;
        }
        flush(`ul-${i}`);
        if (b.type === "h2") nodes.push(<h2 key={i}>{b.text}</h2>);
        else if (b.type === "h3") nodes.push(<h3 key={i}>{b.text}</h3>);
        else nodes.push(<p key={i}>{b.text}</p>);
    });
    flush("ul-end");
    return nodes;
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const c = categoryBySlug(slug);
    if (!c) notFound();

    const items = productsInCategory(c.slug);
    const lead = leadParagraph(c);

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
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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

                <div className="category-layout">
                    <div className="category-copy">
                        {renderBlocks(c.blocks.filter((b) => b.text !== lead))}
                    </div>

                    <aside className="category-aside">
                        <h2>{items.length} documents</h2>
                        <ul className="aside-list">
                            {items.slice(0, 8).map((p) => (
                                <li key={p.slug}>
                                    <Link href={`/products/${p.slug}`}>{p.name}</Link>
                                </li>
                            ))}
                        </ul>
                        <a
                            className="button"
                            href={whatsapp(`Hello Docs2Travel, I have a question about ${c.name.toLowerCase()}.`)}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Ask an advisor <Icon name="arrow" />
                        </a>
                        <p className="form-note">No online payment. Quote on request.</p>
                    </aside>
                </div>
            </section>

            <section className="section">
                <h2>All {c.name.toLowerCase()} documents</h2>
                <div className="service-grid">
                    {items.map((p) => <ProductCard key={p.slug} product={p} />)}
                </div>
            </section>
        </>
    );
}