'use client';
import { useEffect, useRef } from 'react';
export function BrandMotion({ className = '' }: { className?: string }) {
    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const element = container.current;
        if (!element) return;
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        let disposed = false;
        let animation: import('lottie-web').AnimationItem | undefined;
        const synchronize = () => {
            if (!animation) return;
            if (preference.matches || document.hidden) animation.pause();
            else animation.play();
        };
        const observer = new IntersectionObserver(entries => {
            if (!animation) return;
            if (entries[0].isIntersecting && !preference.matches && !document.hidden) animation.play();
            else animation.pause();
        });
        if (!preference.matches) {
            import('lottie-web').then(({ default: lottie }) => {
                if (disposed) return;
                animation = lottie.loadAnimation({ container: element, renderer: 'svg', loop: true, autoplay: false, path: '/brand/journey.json' });
                animation.addEventListener('DOMLoaded', () => {
                    if (disposed) return;
                    element.classList.add('motion-ready');
                    observer.observe(element);
                });
            });
        }
        preference.addEventListener('change', synchronize);
        document.addEventListener('visibilitychange', synchronize);
        return () => {
            disposed = true;
            observer.disconnect();
            preference.removeEventListener('change', synchronize);
            document.removeEventListener('visibilitychange', synchronize);
            animation?.destroy();
        };
    }, []);
    return <div className={`brand-motion ${className}`} aria-hidden="true"><img className="brand-motion-fallback" src="/brand/docs2travel-icon.svg" alt="" width={500} height={500}/><div ref={container} className="brand-motion-player"/></div>;
}
