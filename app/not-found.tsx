import Link from 'next/link';
export default function NotFound() { return <section className="section empty"><h1>This path takes a little detour.</h1><p>The page or service could not be found.</p><Link className="button" href="/catalog">Explore our services</Link></section>; }
