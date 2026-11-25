import { useEffect, useState, type FormEvent } from 'react';
import { Megaphone, X } from 'lucide-react';
import { NOTICE_TEMPLATES } from '../../data/mockData';

const MAX_NOTICE_LENGTH = 120;

interface NoticeEditModalProps {
  isOpen: boolean;
  initialContent: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

export function NoticeEditModal({
  isOpen,
  initialContent,
  onClose,
  onSave,
}: NoticeEditModalProps) {
  const [draft, setDraft] = useState<string>(initialContent);

  useEffect(() => {
    if (isOpen) {
      setDraft(initialContent.slice(0, MAX_NOTICE_LENGTH));
    }
  }, [isOpen, initialContent]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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

  const trimmedDraft = draft.trim();
  const isSaveDisabled = trimmedDraft.length === 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaveDisabled) {
      return;
    }
    onSave(trimmedDraft);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-edit-modal-title"
      onClick={onClose}
    >
      <div
        className="w-[calc(100%-32px)] max-w-[368px] rounded-[20px] bg-[var(--color-surface)] p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-notice-bg)] border border-[var(--color-notice-border)] px-2.5 py-1 text-xs font-bold text-[var(--color-notice-text)]">
              <Megaphone className="h-3.5 w-3.5 text-[var(--color-notice-accent)]" aria-hidden="true" />
              가이드 공지
            </span>
            <h2
              id="notice-edit-modal-title"
              className="mt-2.5 text-lg font-extrabold tracking-tight text-[var(--color-text-main)]"
            >
              상단 고정 공지 수정
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-sub)]">
              모든 탭 최상단 배너에 즉시 반영됩니다
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="공지 수정 모달 닫기"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-slate-50 text-[var(--color-text-sub)] transition-colors hover:bg-slate-100 hover:text-[var(--color-text-main)] active:scale-95"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Live Preview Strip */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-[var(--color-text-sub)]">
            실시간 배너 미리보기
          </p>
          <div className="mt-1.5 rounded-xl border border-[#FCD34D] bg-[#FEF3C7] px-3 py-2.5">
            <div className="flex items-start gap-2">
              <Megaphone
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-notice-accent)]"
                aria-hidden="true"
              />
              <p className="text-xs font-semibold leading-relaxed text-[var(--color-notice-text)] break-words">
                {trimmedDraft.length > 0
                  ? trimmedDraft
                  : '공지 내용을 입력하면 상단 배너에 이렇게 표시됩니다.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Template Chips */}
        <div className="mt-4">
          <p className="text-[11px] font-semibold text-[var(--color-text-sub)]">
            자주 쓰는 공지 템플릿
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {NOTICE_TEMPLATES.map((template) => {
              const isSelected = trimmedDraft === template.content.trim();
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setDraft(template.content.slice(0, MAX_NOTICE_LENGTH))}
                  className={`min-h-[36px] rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                      : 'border-[var(--color-border)] bg-slate-50 text-[var(--color-text-sub)] hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {template.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="notice-content-input"
              className="text-xs font-semibold text-[var(--color-text-main)]"
            >
              공지 내용
            </label>
            <span
              className={`text-[11px] font-medium tabular-nums ${
                draft.length >= MAX_NOTICE_LENGTH
                  ? 'text-[var(--color-danger)]'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              {draft.length} / {MAX_NOTICE_LENGTH}자
            </span>
          </div>

          <textarea
            id="notice-content-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, MAX_NOTICE_LENGTH))}
            maxLength={MAX_NOTICE_LENGTH}
            rows={4}
            placeholder="여행객에게 전달할 긴급 공지나 집합 시간을 입력하세요."
            className="mt-1.5 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-app)] p-3 text-sm leading-relaxed text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          />

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-sub)] transition-colors hover:bg-slate-50 active:scale-[0.99]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaveDisabled}
              className="min-h-[44px] rounded-xl bg-[#1D6FE2] px-4 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[var(--color-primary-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              공지 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
