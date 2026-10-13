# Docs2Travel
Next.js service commerce website for an immigration accompaniment agency.

Run `npm run dev` and open http://localhost:3000. Validate with `npm run lint` and `npm run build`.

Includes home, about, service directory, searchable/filterable catalog, service details, persistent browser cart, quote checkout and WhatsApp contact handoff. Payments are intentionally omitted. No database or external service infrastructure.

Configure the business phone and Telegram/X URLs in `lib/data.ts`. Telegram and X show a truthful WhatsApp fallback until account URLs are configured. Prices require a personalized quote. Inquiry forms prepare messages; visitors must send them in WhatsApp. No server-side submission or order storage. Cart is saved only in the visitor’s browser.

The original Facebook image could not be accessed. The original logo uses a document and aircraft symbol; the website uses destination photography from Unsplash and Google Fonts. Replace or self-host remote assets before production if desired.
