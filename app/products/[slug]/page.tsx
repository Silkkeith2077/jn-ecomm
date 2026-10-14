import Link from "next/link";
import { notFound } from "next/navigation";
import { products, productBySlug, productsInCategory } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { AddButton, Icon } from "@/components/store";
import { whatsapp } from "@/lib/data";

const SITE = "https://docs2travel.com";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  return { title: p?.name ?? "Product not found", description: p?.headline };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();

  const related = productsInCategory(p.categorySlug).filter((x) => x.slug !== p.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: [p.imageFull],
    description: p.summary,
    category: p.category,
    url: `${SITE}/products/${p.slug}`,
    brand: { "@type": "Brand", name: "Docs2Travel" },
    offers: { "@type": "Offer", url: `${SITE}/products/${p.slug}`, availability: "https://schema.org/InStock" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="section detail">
        <div className="breadcrumb">
          <Link href="/products">Documents</Link>
          <span>/</span>
          <Link href={`/products/category/${p.categorySlug}`}>{p.category}</Link>
          <span>/</span>
          <span>{p.name}</span>
        </div>
        <div className="detail-grid">
          <img className="detail-photo" src={p.imageFull} alt={p.name} />
          <div>
            <div className="detail-service-label">
              <span className="category-label">{p.category}</span>
            </div>
            <h1>{p.name}</h1>
            <p className="detail-tagline">{p.headline}</p>
            <div className="quote-box">
              <h3>Personalized quote</h3>
              <p>
                Fees depend on the document, your details and delivery. Speak with an advisor for a
                clear quote before committing.
              </p>
            </div>
            <AddButton slug={p.slug} />
            <a
              className="text-link"
              href={whatsapp(`Hello Docs2Travel, I would like to ask about ${p.name}.`)}
              target="_blank"
              rel="noreferrer"
            >
              Ask an advisor <Icon name="arrow" />
            </a>
            <p className="form-note">No online payment. No obligation to proceed.</p>
          </div>
        </div>

        <div className="detail-information">
          <div>
            <h2>About this document</h2>
            {p.paragraphs.map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <div>
            <h2>Tags</h2>
            <p>{p.tags.join(" · ")}</p>
            <h2>Source</h2>
            <p>
              <a className="text-link" href={p.sourceUrl} target="_blank" rel="noreferrer">
                View original listing <Icon name="external" className="inline-icon" />
              </a>
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section related">
          <h2>More {p.category.toLowerCase()} documents</h2>
          <div className="service-grid">
            {related.map((x) => <ProductCard key={x.slug} product={x} />)}
          </div>
        </section>
      )}
    </>
  );
}