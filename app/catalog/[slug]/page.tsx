import { ServiceIcon } from '@/components/service-icon';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { services, whatsapp } from '@/lib/data';
import { AddButton, Icon, ServiceCard } from '@/components/store';
export function generateStaticParams() { return services.map(s => ({ slug: s.slug })); }
export async function generateMetadata({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) { const { slug } = await params; return { title: services.find(s => s.slug === slug)?.name || 'Service not found' }; }
export default async function Detail({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) { const { slug } = await params; const s = services.find(s => s.slug === slug); if (!s)
    notFound(); return <><section className="section detail"><div className="breadcrumb"><Link href="/catalog">Catalog</Link><span>/</span><span>{s.name}</span></div><div className="detail-grid"><img className="detail-photo" src={s.image} alt={s.name + ' travel inspiration'}/><div><div className="detail-service-label"><ServiceIcon slug={s.slug} className="service-symbol-large"/><span className="category-label">{s.category}</span></div><h1>{s.name}</h1><p className="detail-tagline">{s.headline}</p><p>{s.description}</p><div className="quote-box"><h3>Personalized quote</h3><p>Fees depend on your destination, requirements and the level of assistance. Speak with an advisor for a clear quote before committing.</p></div><AddButton slug={s.slug}/><a className="text-link" href={whatsapp(`Hello Docs2Travel, I would like to ask about ${s.name}.`)} target="_blank" rel="noreferrer">Ask an advisor <Icon name="arrow"/></a><p className="form-note">No online payment. No obligation to proceed.</p></div></div><div className="detail-information"><div><h2>What happens next?</h2><p>Share your plans with an advisor. We’ll identify the relevant requirements, agree on the scope of assistance and provide a quote. Once you’re ready, we’ll help you prepare the next steps.</p></div><div><h2>Before you begin</h2><p>Requirements vary by country and issuing authority. Please do not send passports, identification numbers or other sensitive records through this website. Your advisor will discuss an appropriate way to provide necessary documents.</p><p>We provide application assistance. Decisions, appointment availability and processing times are determined by the relevant authorities. We cannot guarantee approvals.</p></div></div></section><section className="section related"><h2>You may also need</h2><div className="service-grid">{services.filter(x => x.slug !== s.slug && x.category === s.category).slice(0, 3).map(x => <ServiceCard key={x.slug} service={x}/>)}</div></section></>; }
