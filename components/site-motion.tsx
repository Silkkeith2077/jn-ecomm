'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export function SiteMotion() {
    const path = usePathname();
    const progress = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (preference.matches) return;
        let frame = 0;
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) if (entry.isIntersecting) {
                entry.target.classList.add('motion-enter');
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.12 });
        const collect = () => {
            document.querySelectorAll('main .section-heading, main .page-intro, main .service-card, main .story-photo, main .story-copy, main .steps > div, main .service-list, main .contact-form, main .detail-photo, main .cta, .contact-map').forEach(element => {
                if (element.hasAttribute('data-motion')) return;
                element.setAttribute('data-motion', 'true');
                if (element.matches('.service-card, .steps > div')) {
                    const siblings = Array.from(element.parentElement?.children || []);
                    (element as HTMLElement).style.setProperty('--motion-delay', `${(siblings.indexOf(element) % 3) * 90}ms`);
                }
                observer.observe(element);
            });
        };
        collect();
        const mutations = new MutationObserver(collect);
        mutations.observe(document.querySelector('main')!, {childList: true, subtree: true});
        const update = () => {
            const height = document.documentElement.scrollHeight - innerHeight;
            progress.current?.style.setProperty('--reading-progress', `${height > 0 ? Math.min(scrollY / height, 1) : 0}`);
            frame = 0;
        };
        const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', scroll, { passive: true });
        window.addEventListener('resize', scroll);
        const reduce = () => {
            if (preference.matches) {
                observer.disconnect();
                document.querySelectorAll('.motion-enter').forEach(e => e.classList.remove('motion-enter'));
            }
        };
        preference.addEventListener('change', reduce);
        return () => {
            observer.disconnect(); mutations.disconnect(); cancelAnimationFrame(frame);
            window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll);
            preference.removeEventListener('change', reduce);
        };
    }, [path]);
    return <div ref={progress} className="reading-progress" aria-hidden="true"/>;
}

export function JourneyGraphic() {
    return <div className="journey-graphic" aria-hidden="true">
        <svg viewBox="0 0 420 180" fill="none"><path className="journey-route" d="M20 140 C90 140 90 45 170 60 S260 155 400 25"/><circle cx="20" cy="140" r="5"/><circle className="journey-arrival" cx="400" cy="25" r="7"/></svg>
        <PaperAirplaneIcon className="journey-aircraft"/>
    </div>;
}
