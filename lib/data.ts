export const brand = { name: 'Docs2Travel', phone: '+1 408 389 8692', whatsapp: '14083898692', email: 'johnhardings347@gmail.com', address: '3150 Sublette Ave, 63139', telegram: '', x: '' };
export const photos = {
    hero: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=85',
    paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=85',
    canada: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=900&q=85',
    japan: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=85',
    flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=85',
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85'
};
const entries = [
    ['visa-assistance', 'Visa application assistance', 'Travel & visas', 'A new destination. A clear way forward.', 'Guidance for Schengen, USA, Canada and other visa applications, including document checklists and appointment preparation.', 'paris'],
    ['passport-assistance', 'Passport assistance', 'Documents', 'Your next chapter starts here.', 'Help with official passport applications, renewals and replacement procedures.', 'flight'],
    ['work-residence-permits', 'Work & residence permits', 'Travel & visas', 'Make room for a new beginning.', 'Application guidance for work and residence permits through the appropriate government authorities.', 'canada'],
    ['flight-reservations', 'Flight & travel reservations', 'Bookings', 'Go further, with less to plan.', 'Discuss routes, travel dates and reservation options with a personal travel advisor.', 'flight'],
    ['hotel-bookings', 'Hotel & accommodation bookings', 'Bookings', 'Find your place in the world.', 'Accommodation planning for your itinerary, preferences and budget.', 'hotel'],
    ['study-abroad', 'University & study abroad', 'Study abroad', 'Big ambitions. Wider horizons.', 'Support with university applications, study planning and application document organization.', 'japan'],
    ['exam-registration', 'International exam registration', 'Study abroad', 'Take the next step with confidence.', 'Registration assistance for IELTS, TOEFL, GRE, GMAT and SAT. Examination fees are confirmed separately.', 'canada'],
    ['id-driver-licence', 'ID & driver’s licence assistance', 'Documents', 'Everyday essentials, made clearer.', 'Guidance for lawful national ID and driver’s licence applications or renewals through official issuing authorities.', 'paris'],
    ['document-replacement', 'Official document replacement', 'Documents', 'Find your way back to the essentials.', 'Assistance requesting official replacements of lost, damaged or expired documents. We do not replicate or fabricate documents.', 'japan'],
    ['travel-insurance', 'Travel insurance assistance', 'Travel & visas', 'Plan for the unexpected.', 'Help exploring travel insurance options and requirements. Coverage and terms depend on the selected provider.', 'hero'],
    ['civil-documents', 'Civil documents & legalisation', 'Documents', 'Important paperwork, thoughtfully handled.', 'Birth and marriage document application guidance, authentication and legalisation through authorized channels.', 'paris'],
    ['business-admin', 'Business & vehicle administration', 'Documents', 'More time for what matters.', 'Business registration and vehicle document application assistance through the relevant authorities.', 'canada'],
    ['cv-cover-letter', 'CV & cover letter preparation', 'Study abroad', 'Put your best story forward.', 'Professional CV and cover letter preparation tailored to your goals.', 'japan'],
    ['online-applications', 'Online applications & appointments', 'Documents', 'A helping hand, every step.', 'Assistance completing online applications and arranging available appointments.', 'flight'],
    ['printing-formatting', 'Printing, scanning & formatting', 'Documents', 'The finishing touches count.', 'Professional document formatting, printing and scanning assistance.', 'hotel']
] as const;
export const services = entries.map(([slug, name, category, headline, description, photo], i) => ({ slug, name, category, headline, description, image: photos[photo], number: i + 1 }));
export type Service = typeof services[number];
export function whatsapp(message: string) { return `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(message)}`; }

