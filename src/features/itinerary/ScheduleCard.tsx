import { useState } from 'react';
import {
  ExternalLink,
  Info,
  MapPin,
  Navigation,
  Pencil,
  Trash2,
} from 'lucide-react';
import type {
  ScheduleCategory,
  ScheduleItem,
  ScheduleStatus,
} from '../../types/travel';

interface ScheduleCardProps {
  item: ScheduleItem;
  stepNumber: number;
  isFocused: boolean;
  onFocusMap: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_STYLE: Record<
  ScheduleCategory,
  { color: string; bg: string }
> = {
  이동: { color: '#0284C7', bg: '#E0F2FE' },
  관광: { color: '#7C3AED', bg: '#F3E8FF' },
  식사: { color: '#EA580C', bg: '#FFEDD5' },
  숙소: { color: '#0D9488', bg: '#CCFBF1' },
};

const STATUS_STYLE: Record<ScheduleStatus, string> = {
  완료: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-emerald-200 hover:bg-emerald-100/70',
  '진행 중':
    'bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-blue-200 hover:bg-blue-100/80',
  예정: 'bg-[var(--color-upcoming-soft)] text-[var(--color-upcoming)] border-slate-200 hover:bg-slate-200/70',
};

export function ScheduleCard({
  item,
  stepNumber,
  isFocused,
  onFocusMap,
  onToggleStatus,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const categoryColors = CATEGORY_STYLE[item.category];
  const isInProgress = item.status === '진행 중';
  const isCompleted = item.status === '완료';
  const hasCoords =
    typeof item.lat === 'number' &&
    typeof item.lng === 'number' &&
    Number.isFinite(item.lat) &&
    Number.isFinite(item.lng);

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`
    : item.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`
      : null;

  return (
    <article
      className={`rounded-2xl border bg-[var(--color-surface)] p-3.5 shadow-xs transition-all ${
        isFocused
          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/15'
          : 'border-[var(--color-border)]'
      } ${
        isInProgress
          ? 'border-l-[3px] border-l-[var(--color-primary)] shadow-[0_2px_10px_rgba(29,111,226,0.08)]'
          : ''
      }`}
    >
      {/* Top Row: Step + Category Pill + Status Toggle + Edit/Delete */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10.5px] font-extrabold text-[var(--color-text-sub)] tabular-nums">
            {stepNumber}
          </span>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold leading-5 shrink-0"
            style={{
              color: categoryColors.color,
              backgroundColor: categoryColors.bg,
            }}
          >
            {item.category}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onToggleStatus(item.id)}
            aria-label={`${item.title} 상태 변경 (현재: ${item.status})`}
            title="클릭하여 진행 상태 변경"
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold leading-5 transition-colors cursor-pointer whitespace-nowrap ${STATUS_STYLE[item.status]}`}
          >
            {item.status}
          </button>

          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`${item.title} 일정 수정`}
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setConfirmingDelete((prev) => !prev)}
            aria-label={`${item.title} 일정 삭제`}
            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors cursor-pointer ${
              confirmingDelete
                ? 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline Delete Confirmation Bar */}
      {confirmingDelete && (
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-[var(--color-danger-soft)] px-3 py-2">
          <span className="text-[12px] font-semibold text-red-700">
            이 일정을 삭제할까요?
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="min-h-[30px] px-2.5 rounded-lg bg-white border border-red-200 text-[11.5px] font-semibold text-[var(--color-text-sub)] hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="min-h-[30px] px-2.5 rounded-lg bg-[var(--color-danger)] text-[11.5px] font-bold text-white hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        </div>
      )}

      {/* Body: Title, Address/Coords & Memo */}
      <h3
        className={`mt-2.5 text-[15px] font-bold leading-snug break-keep ${
          isCompleted
            ? 'text-[var(--color-text-sub)]'
            : 'text-[var(--color-text-main)]'
        }`}
      >
        {item.title}
      </h3>

      {(item.address || hasCoords) && (
        <div className="mt-1.5 space-y-0.5">
          {item.address && (
            <p className="flex items-start gap-1.5 text-[12px] font-medium text-[var(--color-text-sub)] leading-snug">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--color-primary)]" />
              <span className="break-keep">{item.address}</span>
            </p>
          )}
          {hasCoords && (
            <p className="pl-5 font-mono text-[10.5px] font-semibold text-[var(--color-text-muted)] tabular-nums">
              GPS {item.lat!.toFixed(4)}, {item.lng!.toFixed(4)}
            </p>
          )}
        </div>
      )}

      {item.memo.trim().length > 0 && (
        <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-[var(--color-text-sub)]">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--color-text-muted)]" />
          <span className="break-keep">{item.memo}</span>
        </p>
      )}

      {/* Map Action Strip */}
      {(hasCoords || googleMapsUrl) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
          {hasCoords && (
            <button
              type="button"
              onClick={() => onFocusMap(item.id)}
              className="inline-flex items-center gap-1 min-h-[32px] px-2.5 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-[11.5px] font-bold hover:bg-[#DCEAFE] transition-colors"
            >
              <Navigation className="w-3 h-3" aria-hidden="true" />
              <span>지도 핀 보기</span>
            </button>
          )}
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 min-h-[32px] px-2.5 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-sub)] text-[11.5px] font-semibold hover:bg-slate-50 transition-colors"
            >
              <span>구글 지도</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
