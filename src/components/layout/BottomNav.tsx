import { CalendarDays, CheckSquare, Ticket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppTab } from '../../types/travel';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

interface NavItem {
  id: AppTab;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'itinerary', label: '일정', icon: CalendarDays },
  { id: 'checklist', label: '체크리스트', icon: CheckSquare },
  { id: 'voucher', label: '바우처·SOS', icon: Ticket },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 w-full max-w-[430px] h-16 bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-[0_-4px_16px_rgba(15,23,42,0.04)]"
    >
      <ul className="grid grid-cols-3 h-full">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <li key={id} className="h-full">
              <button
                type="button"
                onClick={() => onTabChange(id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
                className={`relative flex flex-col items-center justify-center w-full h-full min-h-[44px] gap-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[var(--color-primary)] font-semibold'
                    : 'text-[#64748B] hover:text-[var(--color-text-main)] font-medium'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-11 rounded-b-full bg-[var(--color-primary)]"
                  />
                )}
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
                <span className="text-[11px] leading-none tracking-tight">
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
