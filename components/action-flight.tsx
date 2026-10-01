'use client';
import { useEffect, useState } from 'react';
export function ActionFlight() {
    const [flight, setFlight] = useState(0);
    useEffect(() => {
        const fly = () => {
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setFlight(value => value + 1);
        };
        window.addEventListener('docs2travel:flight', fly);
        return () => window.removeEventListener('docs2travel:flight', fly);
    }, []);
    if (!flight) return null;
    return <div key={flight} className="action-flight" aria-hidden="true" onAnimationEnd={() => setFlight(0)}><span className="flight-trail"/><img src="/brand/airplane.svg" alt="" width={90} height={90}/></div>;
}
export function triggerFlight() {
    window.dispatchEvent(new Event('docs2travel:flight'));
}
