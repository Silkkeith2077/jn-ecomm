import { AcademicCapIcon, ArrowPathIcon, BriefcaseIcon, BuildingOffice2Icon, BuildingStorefrontIcon, CalendarDaysIcon, ClipboardDocumentCheckIcon, DocumentCheckIcon, DocumentTextIcon, GlobeAltIcon, IdentificationIcon, PaperAirplaneIcon, PencilSquareIcon, PrinterIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
const serviceIcons = {
    'visa-assistance': GlobeAltIcon,
    'passport-assistance': IdentificationIcon,
    'work-residence-permits': BriefcaseIcon,
    'flight-reservations': PaperAirplaneIcon,
    'hotel-bookings': BuildingOffice2Icon,
    'study-abroad': AcademicCapIcon,
    'exam-registration': ClipboardDocumentCheckIcon,
    'id-driver-licence': IdentificationIcon,
    'document-replacement': ArrowPathIcon,
    'travel-insurance': ShieldCheckIcon,
    'civil-documents': DocumentCheckIcon,
    'business-admin': BuildingStorefrontIcon,
    'cv-cover-letter': PencilSquareIcon,
    'online-applications': CalendarDaysIcon,
    'printing-formatting': PrinterIcon,
};
export function ServiceIcon({ slug, className = '' }: { slug: string; className?: string }) {
    const Component = serviceIcons[slug as keyof typeof serviceIcons] ?? DocumentTextIcon;
    return <span className={`service-symbol ${className}`}><Component aria-hidden="true" /></span>;
}
