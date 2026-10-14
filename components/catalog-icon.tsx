import { ServiceIcon } from "@/components/service-icon";
import { Icon } from "@/components/icon";
import { services } from "@/lib/data";

/** Services keep their bespoke icons; products fall back to a generic mark. */
export function CatalogIcon({ slug, className = "" }: { slug: string; className?: string }) {
    if (services.some((s) => s.slug === slug)) {
        return <ServiceIcon slug={slug} className={className} />;
    }
    return <Icon name="bag" className={className} />;
}