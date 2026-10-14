'use client';
import {triggerFlight} from '@/components/action-flight';
import {ContactMap} from '@/components/contact-map';
/* Browser storage is hydrated after mount to keep server and client markup identical. */
/* eslint-disable react-hooks/set-state-in-effect */
import {ServiceIcon} from '@/components/service-icon';
import Link from 'next/link';
import {Icon} from './icon';
import {usePathname} from 'next/navigation';
import {createContext, useContext, useEffect, useState} from 'react';
import {brand, type Service, services, whatsapp} from '@/lib/data';
import {isKnownSlug, nameForSlug} from "@/lib/catalog-index";
import {categories} from '@/lib/categories';
import {SocialIcon} from "@/components/social-icon";

type Item = {
    slug: string;
    quantity: number;
};
type Store = {
    items: Item[];
    add: (slug: string) => void;
    update: (slug: string, quantity: number) => void;
    clear: () => void;
};
const Context = createContext<Store>({
    items: [], add: () => {
    }, update: () => {
    }, clear: () => {
    }
});
export const useStore = () => useContext(Context);
export {Icon} from './icon';

export function Logo() {
    return <Link className="logo" href="/" aria-label="Docs2Travel home"><img src="/brand/docs2travel-horizontal.svg"
                                                                              alt="Docs2Travel — Passport, Visa, Documentation"
                                                                              width={230} height={70}/></Link>;
}

export function StoreProvider({children}: {
    children: React.ReactNode;
}) {
    const [items, setItems] = useState<Item[]>([]);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('docs2travel-cart') || '[]');
            if (Array.isArray(saved))
                setItems(saved.filter(x => isKnownSlug(x.slug) && Number.isInteger(x.quantity) && x.quantity > 0).map(x => ({
                    ...x,
                    quantity: Math.min(x.quantity, 20)
                })));
        } catch {
        }
        setReady(true);
    }, []);
    useEffect(() => {
        if (ready)
            localStorage.setItem('docs2travel-cart', JSON.stringify(items));
    }, [items, ready]);
    return <Context.Provider value={{
        items,
        add: slug => setItems(old => old.some(x => x.slug === slug) ? old.map(x => x.slug === slug ? {
            ...x,
            quantity: Math.min(x.quantity + 1, 20)
        } : x) : [...old, {slug, quantity: 1}]),
        update: (slug, quantity) => setItems(old => quantity <= 0 ? old.filter(x => x.slug !== slug) : old.map(x => x.slug === slug ? {
            ...x,
            quantity: Math.min(quantity, 20)
        } : x)),
        clear: () => setItems([])
    }}>{children}</Context.Provider>;
}

export function Header() {
    const path = usePathname();
    const {items} = useStore();

    const [open, setOpen] = useState(false);
    // was: const [drop, setDrop] = useState(false);
    const [drop, setDrop] = useState<string | null>(null);

    const cartCount = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <>
            <div className="announcement">
                Your documents. Your travel. Our assistance.
                <a
                    href={whatsapp('Hello! I would like to speak with a travel advisor.')}
                    target="_blank"
                    rel="noreferrer"
                >
                    Let’s talk <Icon name="external" className="inline-icon"/>
                </a>
            </div>

            <header>
                <Logo/>

                <button
                    className="mobile-toggle"
                    aria-label="Toggle navigation"
                    aria-expanded={open}
                    onClick={() => setOpen(!open)}
                >
                    <Icon name="menu"/>
                </button>

                <nav
                    className={open ? 'open' : ''}
                    onClick={(e) => {
                        if ((e.target as HTMLElement).closest('a')) {
                            setOpen(false);
                            setDrop(null);
                        }
                    }}
                >
                    <Link className={path === '/' ? 'active' : ''} href="/">Home</Link>

                    <Link className={path === '/about' ? 'active' : ''} href="/about">About us</Link>

                    <div className="dropdown">
                        <button
                            aria-expanded={drop === 'services'}
                            onClick={() => setDrop(drop === 'services' ? null : 'services')}
                        >
                            What we do
                            <span className={drop === 'services' ? 'rotated' : ''}>
                <Icon name="chevron" className="inline-icon"/>
            </span>
                        </button>

                        {drop === 'services' && (
                            <div className="dropdown-menu">
                                <Link href="/services">Explore all services <Icon name="arrow"/></Link>

                                {['Travel & visas', 'Documents', 'Bookings', 'Study abroad'].map((category) => (
                                    <Link key={category} href={`/catalog?category=${encodeURIComponent(category)}`}>
                                        {category}
                                    </Link>
                                ))}

                                <hr/>

                                {categories.map((category) => (
                                    <Link key={category.slug} href={`/products/category/${category.slug}`}>
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link className={path.startsWith('/catalog') ? 'active' : ''} href="/catalog">Catalog</Link>

                    <div className="dropdown">
                        <button
                            className={path.startsWith('/products') ? 'active' : ''}
                            aria-expanded={drop === 'documents'}
                            onClick={() => setDrop(drop === 'documents' ? null : 'documents')}
                        >
                            Documents
                            <span className={drop === 'documents' ? 'rotated' : ''}>
                <Icon name="chevron" className="inline-icon"/>
            </span>
                        </button>

                        {drop === 'documents' && (
                            <div className="dropdown-menu">
                                <Link href="/products">Browse all documents <Icon name="arrow"/></Link>

                                {categories.map((category) => (
                                    <Link
                                        key={category.slug}
                                        className={path === `/products/category/${category.slug}` ? 'active' : ''}
                                        href={`/products/category/${category.slug}`}
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link className={path === '/contact' ? 'active' : ''} href="/contact">Contact</Link>
                </nav>

                <div className="header-actions">
                    <Link
                        href="/cart"
                        className="bag"
                        aria-label={`Service cart, ${cartCount} items`}
                    >
                        <Icon name="bag"/>
                        {cartCount > 0 && <span>{cartCount}</span>}
                    </Link>

                    <Link className="button small" href="/contact">
                        Get in touch <Icon name="arrow"/>
                    </Link>
                </div>
            </header>
        </>
    );
}

export function Footer() {
    const path = usePathname();
    return <footer>
        <div className="footer-top">
            <div><Logo/><p>A little guidance.<br/>A world of possibilities.</p></div>
            <div><h3>Explore</h3><Link href="/about">Our story</Link><Link href="/catalog">Service catalog</Link><Link
                className={path.startsWith('/products') ? 'active' : ''} href="/products">Documents</Link><Link
                href="/services">What we do</Link><Link href="/cart">Your selections</Link></div>
            <div><h3>How we help</h3>{['Travel & visas', 'Documents', 'Study abroad', 'Bookings'].map(c => <Link key={c}
                                                                                                                 href={`/catalog?category=${encodeURIComponent(c)}`}>{c}</Link>)}
            </div>
            <div><h3>Let’s connect</h3><a href={`tel:+${brand.whatsapp}`}>{brand.phone}</a>
                <a href={whatsapp('Hello Docs2Travel!')} target="_blank" rel="noreferrer">
                    Chat on WhatsApp <SocialIcon name="whatsapp" className="inline-icon"/>
                </a>
                <a href={`mailto:${brand.email}`}>{brand.email}</a><a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`}
                    target="_blank" rel="noreferrer">{brand.address}</a><Link href="/contact">Send an
                    inquiry</Link><span>Personal help, wherever you are.</span>
            </div>
        </div>
        <ContactMap compact/>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Docs2Travel. All rights reserved.</span><span>Independent assistance. Issuing authorities determine approvals and timelines.</span>
        </div>
    </footer>;
}

export function FloatingChat() {
    const [channel, setChannel] = useState('');
    return <aside className="floating" aria-label="Communication channels">
        {channel && <div className="channel-popover">
            <button className="close" onClick={() => setChannel('')} aria-label="Close"><Icon name="close"/></button>
            <strong>Connect on {channel}</strong>
            <p>Our {channel} account is being connected. Reach an advisor on WhatsApp or by phone today.</p>
        </div>}
        <a className="chat whatsapp" href={whatsapp('Hello! I would like assistance with travel or documents.')}
           target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><SocialIcon name="whatsapp"/></a>
        <button className="chat telegram"
                onClick={() => brand.telegram ? window.open(brand.telegram, '_blank', 'noopener,noreferrer') : setChannel('Telegram')}
                aria-label="Telegram contact"><SocialIcon name="telegram"/></button>
        <button className="chat x"
                onClick={() => brand.x ? window.open(brand.x, '_blank', 'noopener,noreferrer') : setChannel('X')}
                aria-label="X contact"><SocialIcon name="x"/></button>
    </aside>;
}

export function AddButton({slug}: {
    slug: string;
}) {
    const {add} = useStore();
    const [added, setAdded] = useState(false);
    return <button className="button" onClick={() => {
        add(slug);
        triggerFlight();
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    }}><Icon name={added ? 'check' : 'bag'}/>{added ? 'Added to your selections' : 'Add to inquiry'}</button>;
}

export function ServiceCard({service}: {
    service: Service;
}) {
    return <article className="service-card"><Link href={`/catalog/${service.slug}`} className="card-image"><img
        src={service.image} alt={service.name + ' destination inspiration'}
        loading="lazy"/><span>{service.category}</span><i><Icon name="arrow"/></i></Link>
        <div className="card-copy"><h3 className="service-title"><ServiceIcon slug={service.slug}/><Link
            href={`/catalog/${service.slug}`}>{service.name}</Link></h3><p>{service.headline}</p>
            <div><span>Personalized quote</span><Link href={`/catalog/${service.slug}`}
                                                      aria-label={`Explore ${service.name}`}>Explore service <Icon
                name="external" className="inline-icon"/></Link></div>
        </div>
    </article>;
}

export function ContactForm({checkout = false}: {
    checkout?: boolean;
}) {
    const {items} = useStore();
    const [url, setUrl] = useState('');
    return <form className="contact-form" onSubmit={e => {
        e.preventDefault();
        triggerFlight();
        const f = new FormData(e.currentTarget);
        const selected = items.map(x => `${nameForSlug(x.slug)} × ${x.quantity}`).join('\n');
        setUrl(whatsapp(`Hello Docs2Travel!\nName: ${f.get('name')}\nEmail: ${f.get('email')}\nPhone: ${f.get('phone')}\n${checkout ? 'My service inquiry:\n' + selected : 'Service: ' + f.get('service')}\nDestination: ${f.get('destination')}\nMessage: ${f.get('message')}\nPlease send a quote and next steps.`));
    }}>
        <div className="form-row"><label>Full name<input name="name" autoComplete="name" required maxLength={100}
                                                         placeholder="Your name"/></label><label>Email address<input
            name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label></div>
        <div className="form-row"><label>Phone number<input name="phone" type="tel" autoComplete="tel" required
                                                            maxLength={40}
                                                            placeholder="Including country code"/></label><label>Destination<input
            name="destination" maxLength={100} placeholder="Where are you headed?"/></label></div>
        {!checkout && <label>How can we help?<select name="service">
            <option>General inquiry</option>
            {services.map(s => <option key={s.slug}>{s.name}</option>)}</select></label>}<label>A little about your
        plans<textarea name="message" required maxLength={2000} rows={4}
                       placeholder="Tell us what you need and your preferred travel dates. Please do not include sensitive document details."/></label><label
        className="checkbox"><input type="checkbox" required/>I agree to share these details with an advisor via
        WhatsApp.</label>
        <button className="button" type="submit">Prepare {checkout ? 'service request' : 'inquiry'} <Icon name="arrow"/>
        </button>
        <p className="form-note">No payment is collected. Your inquiry is sent only when you send the message in
            WhatsApp.</p>{url &&
        <div className="success" role="status"><strong>Your message is ready.</strong><p>Open WhatsApp, review your
            inquiry, then send it to our advisor.</p><a className="button" href={url} target="_blank" rel="noreferrer">Continue
            to WhatsApp <Icon name="arrow"/></a></div>}</form>;
}

