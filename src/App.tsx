import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { AppTab } from './types/travel';
import { resetAllTravelData } from './utils/storage';
import { AppShell } from './components/layout/AppShell';
import { ItineraryPage } from './features/itinerary/ItineraryPage';
import { PinnedNoticeBanner } from './features/notice-checklist/PinnedNoticeBanner';
import { ChecklistPage } from './features/notice-checklist/ChecklistPage';
import { VoucherSosPage } from './features/voucher-sos/VoucherSosPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('itinerary');
  const [resetKey, setResetKey] = useState(0);
  const [showResetToast, setShowResetToast] = useState(false);

  const handleResetAll = () => {
    resetAllTravelData();
    setResetKey((prev) => prev + 1);
    setShowResetToast(true);
  };

  useEffect(() => {
    if (!showResetToast) return;
    const timer = window.setTimeout(() => {
      setShowResetToast(false);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [showResetToast]);

  return (
    <>
      <AppShell
        noticeSlot={<PinnedNoticeBanner resetKey={resetKey} />}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onResetAll={handleResetAll}
      >
        {activeTab === 'itinerary' && <ItineraryPage resetKey={resetKey} />}
        {activeTab === 'checklist' && <ChecklistPage resetKey={resetKey} />}
        {activeTab === 'voucher' && <VoucherSosPage resetKey={resetKey} />}
      </AppShell>

      {showResetToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>도쿄 2박 3일 초기 데이터로 복구되었습니다.</span>
        </div>
      )}
    </>
  );
}
