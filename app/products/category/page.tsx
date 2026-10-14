import Link from "next/link";
import { categories } from "@/lib/categories";
import { productsInCategory } from "@/lib/products";
import { Icon } from "@/components/store";

export const metadata = {
    title: "Document categories",
    description: "Passports, driving licences, visas, ID cards, residence permits and certificates.",
};

export default function CategoryIndex() {
    return (
        <section className="section">
            <div className="page-intro">
                <h1>Browse by <em>category.</em></h1>
                <p>Six document families, sourced worldwide.</p>
            </div>
            <div className="service-grid">
                {categories.map((c) => {
                    const count = productsInCategory(c.slug).length;
                    return (
                        <article className="service-card" key={c.slug}>
                            <div className="card-copy">
                                <h3 className="service-title">
                                    <Link href={`/products/category/${c.slug}`}>{c.name}</Link>
                                </h3>
                                <p>{count} document{count === 1 ? "" : "s"} available</p>
                                <div>
                                    <span>{c.wordCount.toLocaleString()} words of guidance</span>
                                    <Link href={`/products/category/${c.slug}`}>
                                        Explore <Icon name="external" className="inline-icon" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
