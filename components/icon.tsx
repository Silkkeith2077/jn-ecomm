import { ArrowRightIcon, ArrowUpRightIcon, Bars3Icon, CheckIcon, ChevronDownIcon, ChatBubbleLeftRightIcon, GlobeAltIcon, MagnifyingGlassIcon, MinusIcon, PaperAirplaneIcon, PhoneIcon, PlusIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline';
const icons = {
    bag: ShoppingBagIcon,
    arrow: ArrowRightIcon,
    external: ArrowUpRightIcon,
    plane: GlobeAltIcon,
    check: CheckIcon,
    menu: Bars3Icon,
    chevron: ChevronDownIcon,
    telegram: PaperAirplaneIcon,
    x: ChatBubbleLeftRightIcon,
    phone: PhoneIcon,
    search: MagnifyingGlassIcon,
    close: XMarkIcon,
    minus: MinusIcon,
    plus: PlusIcon,
};
export type IconName = keyof typeof icons;
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
    const Component = icons[name];
    return <Component className={className} width={22} height={22} aria-hidden="true" />;
}
