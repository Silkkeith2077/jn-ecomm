import { ServiceIcon } from '@/components/service-icon';
import Link from 'next/link';
import { services } from '@/lib/data';
import { Icon } from '@/components/store';
export default function Services() { return <section className="section"><div className="page-intro"><h1>A little help.<br /><em>A whole new horizon.</em></h1><p>From immigration applications to the details of your departure, explore how we can accompany you.</p></div>{['Travel & visas', 'Documents', 'Bookings', 'Study abroad'].map(c => <section className="service-list" key={c}><h2>{c}</h2><div>{services.filter(s => s.category === c).map(s => <Link key={s.slug} href={`/catalog/${s.slug}`}><ServiceIcon slug={s.slug}/><div className="service-list-copy"><h3>{s.name}</h3><p>{s.description}</p></div><Icon name="arrow"/></Link>)}</div></section>)}</section>; }
