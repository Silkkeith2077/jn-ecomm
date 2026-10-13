# Design
Docs2Travel uses a blue brand palette with navy ink, royal blue actions and pale blue supporting surfaces. Poppins typography follows the supplied reference: bold geometric sans-serif headings, upright emphasis and readable regular body text. Destination photography and the original document/aircraft logo remain. WhatsApp and Telegram retain recognizable platform colors. Responsive layouts, visible focus and reduced motion support.

Interface icons use the official Heroicons 24px outline set via components/icon.tsx. Platform contact controls retain explicit accessible names; Heroicons supplies their generic communication symbols. Docs2Travel’s custom logo remains a brand asset.


## Supplied identity
Use public/brand/docs2travel-horizontal.svg in header and footer; supplied standalone emblem and favicon in browser metadata. Navy #0C2340 and accessible cyan #036FA6 for web controls, alongside the original asset colors. Keep user-selected Poppins typography. Source package: Docs2Travel-Brand-Assets. Supplied SVG files remain unchanged.


The supplied vector emblem is animated through public/brand/journey.json with Lottie’s SVG renderer in home CTA, about intro and contact intro. Static asset fallback, reduced-motion handling and visibility pause. Footer contains compact interactive Google Maps embed on every route.


## Path formation animation
journey.json now contains 31 native Lottie shape layers, no image assets. Trim paths draw globe, passport, ribbons and aircraft in sequence; fills appear after outlines. The loop restarts after a 0.5-second completed-logo hold (184 frames at 30fps). Rebuild from supplied SVG using node scripts/build-brand-lottie.mjs. Gradients are represented by matching flat brand colors in animation; static logo retains original gradients.




## Site motion and action flight
Intersection-based staggered content reveals, photograph clip-path entrances, hero route drawing, menu feedback and reading-progress indicator. Supplied airplane vector extracted to public/brand/airplane.svg flies across the viewport on Add to inquiry and successful inquiry preparation. Pointer-transparent, short-lived overlay with reduced-motion opt-out. No generated imagery.

