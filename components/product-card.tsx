import Link from "next/link";
import { Icon } from "@/components/store";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="service-card">
      <Link href={`/products/${product.slug}`} className="card-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span>{product.category}</span>
        <i><Icon name="arrow" /></i>
      </Link>
      <div className="card-copy">
        <h3 className="service-title">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p>{product.headline}</p>
        <div>
          <span>Personalized quote</span>
          <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
            View details <Icon name="external" className="inline-icon" />
          </Link>
        </div>
      </div>
    </article>
  );
}