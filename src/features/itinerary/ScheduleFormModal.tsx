import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { MapPin, X } from 'lucide-react';
import { DAY_INFO, TOKYO_PLACE_PRESETS } from '../../data/mockData';
import type {
  DayNumber,
  PlacePreset,
  ScheduleCategory,
  ScheduleItem,
  ScheduleStatus,
} from '../../types/travel';
import {
  INPUT_LIMITS,
  isValidTimeString,
  parseCoordinatePair,
  sanitizeMultiLine,
  sanitizeSingleLine,
} from '../../utils/validation';

interface ScheduleFormModalProps {
  isOpen: boolean;
  day: DayNumber;
  initialItem: ScheduleItem | null;
  onClose: () => void;
  onSave: (data: Omit<ScheduleItem, 'id'>, editId?: string) => void;
}

const DAYS: DayNumber[] = [1, 2, 3];
const CATEGORIES: ScheduleCategory[] = ['이동', '관광', '식사', '숙소'];
const STATUSES: ScheduleStatus[] = ['예정', '진행 중', '완료'];

const CATEGORY_ACTIVE_STYLE: Record<
  ScheduleCategory,
  { color: string; bg: string; border: string }
> = {
  이동: { color: '#0284C7', bg: '#E0F2FE', border: '#7DD3FC' },
  관광: { color: '#7C3AED', bg: '#F3E8FF', border: '#C4B5FD' },
  식사: { color: '#EA580C', bg: '#FFEDD5', border: '#FDBA74' },
  숙소: { color: '#0D9488', bg: '#CCFBF1', border: '#5EEAD4' },
};

export function ScheduleFormModal({
  isOpen,
  day,
  initialItem,
  onClose,
  onSave,
}: ScheduleFormModalProps) {
  const [selectedDay, setSelectedDay] = useState<DayNumber>(day);
  const [time, setTime] = useState('10:00');
  const [category, setCategory] = useState<ScheduleCategory>('관광');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [latStr, setLatStr] = useState('');
  const [lngStr, setLngStr] = useState('');
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState<ScheduleStatus>('예정');
  const [timeError, setTimeError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [coordError, setCoordError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (initialItem) {
      setSelectedDay(initialItem.day);
      setTime(initialItem.time);
      setCategory(initialItem.category);
      setTitle(initialItem.title);
      setAddress(initialItem.address ?? '');
      setLatStr(typeof initialItem.lat === 'number' ? String(initialItem.lat) : '');
      setLngStr(typeof initialItem.lng === 'number' ? String(initialItem.lng) : '');
      setMemo(initialItem.memo);
      setStatus(initialItem.status);
    } else {
      setSelectedDay(day);
      setTime('10:00');
      setCategory('관광');
      setTitle('');
      setAddress('');
      setLatStr('');
      setLngStr('');
      setMemo('');
      setStatus('예정');
    }
    setTimeError('');
    setTitleError('');
    setCoordError('');
  }, [isOpen, initialItem, day]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleApplyPreset = (preset: PlacePreset) => {
    setTitle(preset.name);
    setAddress(preset.address);
    setLatStr(String(preset.lat));
    setLngStr(String(preset.lng));
    setCategory(preset.category);
    if (titleError) setTitleError('');
    if (coordError) setCoordError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;

    const trimmedTime = time.trim();
    if (!isValidTimeString(trimmedTime)) {
      setTimeError('올바른 시간 형식(HH:mm, 00:00~23:59)을 입력해 주세요.');
      hasError = true;
    } else {
      setTimeError('');
    }

    const cleanTitle = sanitizeSingleLine(title, INPUT_LIMITS.SCHEDULE_TITLE_MAX);
    if (!cleanTitle) {
      setTitleError('장소명을 입력해 주세요.');
      hasError = true;
    } else {
      setTitleError('');
    }

    const coordResult = parseCoordinatePair(latStr, lngStr);
    if (!coordResult.ok) {
      setCoordError(coordResult.error);
      hasError = true;
    } else {
      setCoordError('');
    }

    if (hasError || !coordResult.ok) {
      return;
    }

    const cleanAddress = sanitizeSingleLine(address, INPUT_LIMITS.SCHEDULE_ADDRESS_MAX);
    const cleanMemo = sanitizeMultiLine(memo, INPUT_LIMITS.SCHEDULE_MEMO_MAX);

    onSave(
      {
        day: selectedDay,
        time: trimmedTime,
        title: cleanTitle,
        category,
        memo: cleanMemo,
        status,
        address: cleanAddress || undefined,
        lat: coordResult.lat,
        lng: coordResult.lng,
      },
      initialItem?.id,
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="max-w-[376px] w-[calc(100%-32px)] max-h-[90vh] overflow-y-auto rounded-[20px] bg-[var(--color-surface)] p-5 shadow-2xl border border-[var(--color-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="schedule-modal-title"
              className="text-[18px] font-bold text-[var(--color-text-main)] leading-tight"
            >
              {initialItem ? '일정 수정' : '새 일정 추가'}
            </h2>
            <p className="mt-1 text-[12px] font-medium text-[var(--color-text-sub)]">
              좌표나 명소 프리셋을 선택하면 지도에 핀이 자동 표시됩니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="모달 닫기"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-[var(--color-text-sub)] hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3.5">
          {/* Day Selector */}
          <div>
            <span className="block text-[12.5px] font-semibold text-[var(--color-text-main)] mb-1.5">
              여행 일차
            </span>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1">
              {DAYS.map((d) => {
                const isSelected = selectedDay === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    aria-pressed={isSelected}
                    className={`min-h-[36px] rounded-lg text-[12.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-white text-[var(--color-primary)] shadow-xs'
                        : 'text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]'
                    }`}
                  >
                    {DAY_INFO[d].label} ({DAY_INFO[d].date.slice(0, 5)})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Tokyo Place Presets */}
          <div>
            <span className="flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-text-main)] mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              도쿄 추천 명소 빠른 입력 (주소·좌표 자동)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TOKYO_PLACE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-app)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--color-text-sub)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] transition-colors"
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label
              htmlFor="schedule-time"
              className="block text-[12.5px] font-semibold text-[var(--color-text-main)] mb-1.5"
            >
              시간 <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              id="schedule-time"
              type="time"
              required
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                if (timeError) setTimeError('');
              }}
              aria-invalid={Boolean(timeError)}
              className={`w-full min-h-[44px] rounded-xl border px-3.5 text-[14px] font-medium text-[var(--color-text-main)] tabular-nums focus:bg-white focus:outline-none focus:ring-2 ${
                timeError
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger-soft)]/40 focus:border-[var(--color-danger)] focus:ring-red-500/15'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-app)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/15'
              }`}
            />
            {timeError && (
              <p role="alert" className="mt-1 text-[11.5px] font-medium text-[var(--color-danger)]">
                {timeError}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <span className="block text-[12.5px] font-semibold text-[var(--color-text-main)] mb-1.5">
              카테고리
            </span>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const activeColors = CATEGORY_ACTIVE_STYLE[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    aria-pressed={isSelected}
                    className={`min-h-[38px] rounded-full border text-[12.5px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'shadow-xs'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-sub)] hover:bg-slate-50'
                    }`}
                    style={
                      isSelected
                        ? {
                            color: activeColors.color,
                            backgroundColor: activeColors.bg,
                            borderColor: activeColors.border,
                          }
                        : undefined
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="schedule-title"
                className="text-[12.5px] font-semibold text-[var(--color-text-main)]"
              >
                장소명 <span className="text-[var(--color-danger)]">*</span>
              </label>
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] tabular-nums">
                {title.length} / {INPUT_LIMITS.SCHEDULE_TITLE_MAX}
              </span>
            </div>
            <input
              id="schedule-title"
              type="text"
              required
              maxLength={INPUT_LIMITS.SCHEDULE_TITLE_MAX}
              value={title}
              aria-invalid={Boolean(titleError)}
              onChange={(e) => {
                setTitle(e.target.value.slice(0, INPUT_LIMITS.SCHEDULE_TITLE_MAX));
                if (titleError) setTitleError('');
              }}
              placeholder="예: 시부야 스카이 전망대 입장"
              className={`w-full min-h-[44px] rounded-xl border px-3.5 text-[14px] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:bg-white focus:outline-none focus:ring-2 ${
                titleError
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger-soft)]/40 focus:border-[var(--color-danger)] focus:ring-red-500/15'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-app)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/15'
              }`}
            />
            {titleError && (
              <p
                role="alert"
                className="mt-1 text-[12px] font-medium text-[var(--color-danger)]"
              >
                {titleError}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="schedule-address"
              className="block text-[12.5px] font-semibold text-[var(--color-text-main)] mb-1.5"
            >
              주소 (선택)
            </label>
            <input
              id="schedule-address"
              type="text"
              maxLength={INPUT_LIMITS.SCHEDULE_ADDRESS_MAX}
              value={address}
              onChange={(e) =>
                setAddress(e.target.value.slice(0, INPUT_LIMITS.SCHEDULE_ADDRESS_MAX))
              }
              placeholder="예: 도쿄도 시부야구 시부야 2-24-12"
              className="w-full min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-app)] px-3.5 text-[13.5px] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
            />
          </div>

          {/* GPS Coordinates */}
          <div>
            <span className="block text-[12.5px] font-semibold text-[var(--color-text-main)] mb-1.5">
              GPS 좌표 — 위도 / 경도 (지도 핀 표시용, 선택)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                min={-90}
                max={90}
                inputMode="decimal"
                aria-label="위도 (Latitude)"
                aria-invalid={Boolean(coordError)}
                value={latStr}
                onChange={(e) => {
                  setLatStr(e.target.value);
                  if (coordError) setCoordError('');
                }}
                placeholder="위도 35.6584"
                className="w-full min-h-[42px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-app)] px-3 font-mono text-[12.5px] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
              />
              <input
                type="number"
                step="any"
                min={-180}
                max={180}
                inputMode="decimal"
                aria-label="경도 (Longitude)"
                aria-invalid={Boolean(coordError)}
                value={lngStr}
                onChange={(e) => {
                  setLngStr(e.target.value);
                  if (coordError) setCoordError('');
                }}
                placeholder="경도 139.7022"
                className="w-full min-h-[42px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-app)] px-3 font-mono text-[12.5px] text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
              />
            </div>
            {coordError && (
              <p
                role="alert"
                className="mt-1 text-[11.5px] font-medium text-[var(--color-danger)]"
              >
                {coordError}
              </p>
            )}
          </div>

          {/* Memo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="schedule-memo"
                className="text-[12.5px] font-semibold text-[var(--color-text-main)]"
              >
                메모
              </label>
              <span className="text-[11px] font-medium text-[var(--color-text-muted)] tabular-nums">
                {memo.length} / {INPUT_LIMITS.SCHEDULE_MEMO_MAX}
              </span>
            </div>
            <textarea
              id="schedule-memo"
              rows={2}
              maxLength={INPUT_LIMITS.SCHEDULE_MEMO_MAX}
              value={memo}
              onChange={(e) =>
                setMemo(e.target.value.slice(0, INPUT_LIMITS.SCHEDULE_MEMO_MAX))
              }
              placeholder="집결 위치, 준비물, 참고사항 등을 입력해 주세요."
              className="w-full min-h-[68px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-app)] p-3 text-[13.5px] leading-relaxed text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <span className="block text-[12.5px] font-semibold text-[var(--color-text-main)] mb-1.5">
              진행 상태
            </span>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1">
              {STATUSES.map((st) => {
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    aria-pressed={isSelected}
                    className={`min-h-[36px] rounded-lg text-[12.5px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs'
                        : 'text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-1.5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[14px] font-semibold text-[var(--color-text-sub)] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[14px] font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              일정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
