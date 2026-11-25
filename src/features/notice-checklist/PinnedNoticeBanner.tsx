import { useEffect, useRef, useState } from 'react';
import { Megaphone, Pencil } from 'lucide-react';
import { INITIAL_NOTICE } from '../../data/mockData';
import type { NoticeData } from '../../types/travel';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../../utils/storage';
import { NoticeEditModal } from './NoticeEditModal';

interface PinnedNoticeBannerProps {
  resetKey: number;
}

function formatCurrentTimeLabel(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} 수정`;
}

export function PinnedNoticeBanner({ resetKey }: PinnedNoticeBannerProps) {
  const [notice, setNotice] = useState<NoticeData>(() =>
    loadFromStorage<NoticeData>(STORAGE_KEYS.NOTICE, INITIAL_NOTICE),
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const prevResetKeyRef = useRef<number>(resetKey);

  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      setNotice(INITIAL_NOTICE);
      setIsEditModalOpen(false);
    }
  }, [resetKey]);

  const handleSaveNotice = (nextContent: string) => {
    const updatedNotice: NoticeData = {
      content: nextContent,
      updatedAt: formatCurrentTimeLabel(),
    };
    setNotice(updatedNotice);
    saveToStorage<NoticeData>(STORAGE_KEYS.NOTICE, updatedNotice);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <section
        aria-label="가이드 긴급공지 배너"
        className="rounded-2xl border border-[var(--color-notice-border)] bg-[var(--color-notice-bg)] p-3.5 shadow-xs"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-[var(--color-notice-text)]">
              <Megaphone
                className="h-3 w-3 text-[var(--color-notice-accent)]"
                aria-hidden="true"
              />
              가이드 긴급공지
            </span>
            <span className="truncate text-[11px] font-medium text-amber-800/80 tabular-nums">
              {notice.updatedAt}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            aria-label="가이드 긴급공지 수정"
            className="inline-flex min-h-[32px] shrink-0 items-center gap-1 rounded-lg border border-amber-300/90 bg-white/80 px-2.5 py-1 text-xs font-bold text-[var(--color-notice-text)] transition-colors hover:bg-white active:scale-95"
          >
            <Pencil className="h-3 w-3 text-[var(--color-notice-accent)]" aria-hidden="true" />
            수정
          </button>
        </div>

        <p className="mt-2 text-[13.5px] font-semibold leading-snug text-[var(--color-notice-text)] break-words">
          {notice.content}
        </p>
      </section>

      <NoticeEditModal
        isOpen={isEditModalOpen}
        initialContent={notice.content}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveNotice}
      />
    </>
  );
}
