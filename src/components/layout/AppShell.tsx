import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { TOUR_META } from '../../data/mockData';
import type { AppTab } from '../../types/travel';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  noticeSlot: ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onResetAll: () => void;
  children: ReactNode;
}

export function AppShell({
  noticeSlot,
  activeTab,
  onTabChange,
  onResetAll,
  children,
}: AppShellProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    if (!isResetModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsResetModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResetModalOpen]);

  const handleConfirmReset = () => {
    onResetAll();
    setIsResetModalOpen(false);
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-[var(--color-bg-app)] shadow-[0_0_32px_rgba(15,23,42,0.08)] flex flex-col relative">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 h-14 min-h-[56px] bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-[16px] font-bold leading-tight text-[var(--color-text-main)] truncate">
            {TOUR_META.title}
          </h1>
          <p className="text-[11px] font-medium text-[var(--color-text-muted)] leading-tight mt-0.5 truncate">
            {TOUR_META.dateRange} · {TOUR_META.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsResetModalOpen(true)}
          aria-label="전체 데이터 초기화"
          className="shrink-0 inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[12px] font-semibold text-[var(--color-text-sub)] hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>초기화</span>
        </button>
      </header>

      {/* Pinned Notice Slot */}
      <div className="px-4 pt-3">{noticeSlot}</div>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-3 pb-24">{children}</main>

      {/* Bottom Tab Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs px-4"
          onClick={() => setIsResetModalOpen(false)}
        >
          <div
            className="w-full max-w-[348px] rounded-[20px] bg-[var(--color-surface)] p-6 shadow-2xl border border-[var(--color-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[var(--color-notice-bg)] text-[var(--color-notice-accent)] mx-auto mb-3.5">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h2
              id="reset-modal-title"
              className="text-[17px] font-bold text-center text-[var(--color-text-main)]"
            >
              데이터 초기화
            </h2>

            <p className="mt-2 text-[14px] leading-relaxed text-center text-[var(--color-text-sub)]">
              데이터를 초기 도쿄 2박 3일 샘플 상태로 되돌릴까요?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[14px] font-semibold text-[var(--color-text-sub)] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="min-h-[44px] rounded-xl bg-[var(--color-danger)] hover:bg-red-600 text-[14px] font-semibold text-white transition-colors cursor-pointer"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
