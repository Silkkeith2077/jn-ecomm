"use client";
import {useState} from "react";
import {productCategories, products} from "@/lib/products";
import {ProductCard} from "@/components/product-card";
import {Icon} from "@/components/store";

export default function ProductCatalog({initialCategory}: { initialCategory: string }) {
    const [category, setCategory] = useState(initialCategory);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("Featured");

    let filtered = products.filter(
        (p) =>
            (category === "All products" || p.category === category) &&
            `${p.name} ${p.headline} ${p.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "A–Z") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "Z–A") filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));

    return (
        <section className="section documents">
            <div className="page-intro">
                <h2>Real documents. <em>Real options.</em></h2>
                <p>Browse passports, licences, visas, ID cards and permits from around the world.</p>
            </div>

            <div className="catalog-toolbar">
                <div className="catalog-tools">
                    <div className="search">
                        <Icon name="search"/>
                        <input
                            aria-label="Search products"
                            placeholder="Search for a document…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <label className="sort">
                        Sort by
                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option>Featured</option>
                            <option>A–Z</option>
                            <option>Z–A</option>
                        </select>
                    </label>
                </div>
                <div className="filters">
                    {["All products", ...productCategories.map((c) => c.name)].map((c) => (
                        <button
                            aria-pressed={category === c}
                            className={category === c ? "selected" : ""}
                            key={c}
                            onClick={() => setCategory(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <p className="results-count">{filtered.length} documents available</p>
            <div className="service-grid">
                {filtered.map((p) => <ProductCard key={p.slug} product={p}/>)}
            </div>
            {!filtered.length && (
                <div className="empty">
                    <h2>No matching documents</h2>
                    <p>Try another search or explore the full range.</p>
                    <button className="button" onClick={() => {
                        setQuery("");
                        setCategory("All products");
                    }}>
                        Show all documents
                    </button>
                </div>
            )}
        </section>
    );
}