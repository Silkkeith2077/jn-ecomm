'use client';
import Link from 'next/link';
import { useStore, ContactForm } from '@/components/store';
import { CatalogIcon } from '@/components/catalog-icon';
import { itemForSlug } from '@/lib/catalog-index';

export default function Checkout() {
    const { items } = useStore();
    return (
        <section className="section">
            <div className="page-intro">
                <h1>Let’s move<br /><em>your plans forward.</em></h1>
                <p>Request a personalized quote. No online payment required.</p>
            </div>
            {items.length ? (
                <div className="contact-grid">
                    <div className="summary">
                        <h2>Your selections</h2>
                        {items.map((x) => {
                            const s = itemForSlug(x.slug);
                            if (!s) return null;
                            return (
                                <p className="checkout-service" key={x.slug}>
                                    <CatalogIcon slug={s.slug} className="service-symbol-small" />
                                    {s.name}<strong> × {x.quantity}</strong>
                                </p>
                            );
                        })}
                        <hr />
                        <p>Complete your details to prepare your request. You’ll review and send it in WhatsApp.</p>
                        <Link className="text-link" href="/cart">Edit selections</Link>
                    </div>
                    <ContactForm checkout />
                </div>
            ) : (
                <div className="empty">
                    <h2>Select a service to begin</h2>
                    <Link className="button" href="/catalog">Browse services</Link>
                </div>
            )}
        </section>
    );
}