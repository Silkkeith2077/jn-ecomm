import { brand } from '@/lib/data';
import { ArrowUpRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
export function ContactMap({ compact = false }: { compact?: boolean }) {
    const address = encodeURIComponent(brand.address);
    return <section className={`contact-map ${compact ? 'footer-map' : ''}`} aria-label="Docs2Travel location">
        <div className="map-heading"><div><h2>{compact ? 'Find Docs2Travel.' : 'Find us on the map.'}</h2><p><MapPinIcon width={20} height={20} aria-hidden="true"/>{brand.address}</p></div><a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${address}`} target="_blank" rel="noreferrer">Open in Google Maps <ArrowUpRightIcon width={20} height={20} aria-hidden="true"/></a></div>
        <iframe title={`Google Maps — ${compact ? 'footer' : 'contact page'} — ${brand.address}`} src={`https://www.google.com/maps?q=${address}&z=15&output=embed`} width="100%" height={compact ? 260 : 420} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/>
    </section>;
}
