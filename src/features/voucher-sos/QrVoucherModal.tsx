import { useEffect, useState } from 'react';
import { Check, Copy, Info, X } from 'lucide-react';
import type { VoucherItem, VoucherType } from '../../types/travel';
import { MockQrSvg } from './MockQrSvg';

const MODAL_BADGE_META: Record<
  VoucherType,
  { label: string; bg: string; color: string }
> = {
  항공권: { label: '항공권', bg: '#EBF3FE', color: '#1D6FE2' },
  호텔: { label: '호텔 바우처', bg: '#CCFBF1', color: '#0D9488' },
  입장권: { label: '입장권', bg: '#F3E8FF', color: '#7C3AED' },
};

async function copyTextSafely(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function QrVoucherModal({
  voucher,
  onClose,
}: {
  voucher: VoucherItem | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [voucher?.id]);

  useEffect(() => {
    if (!voucher) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [voucher, onClose]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!voucher) {
    return null;
  }

  const badge = MODAL_BADGE_META[voucher.type];

  const handleCopyCode = async () => {
    const ok = await copyTextSafely(voucher.reservationCode);
    if (ok) {
      setCopied(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-voucher-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-[calc(100%-32px)] max-w-[356px] max-h-[90vh] overflow-y-auto rounded-[20px] bg-[var(--color-surface)] p-6 shadow-2xl"
      >
        {/* Top Row: Pill badge + circular close button */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="바우처 QR 모달 닫기"
            className="w-11 h-11 -mr-2 -mt-2 inline-flex items-center justify-center rounded-full text-[var(--color-text-sub)] transition-colors hover:bg-slate-100 active:bg-slate-200"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Title & Subtitle */}
        <h2
          id="qr-voucher-modal-title"
          className="mt-2 text-lg font-extrabold text-[var(--color-text-main)] leading-snug tracking-tight"
        >
          {voucher.title}
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-sub)]">
          {voucher.subtitle}
        </p>

        {/* QR Code Container */}
        <div className="mt-4 bg-[var(--color-bg-app)] rounded-2xl border border-[var(--color-border)] p-5 flex flex-col items-center">
          <div className="rounded-xl bg-white p-2 shadow-xs border border-slate-100">
            <MockQrSvg value={voucher.qrPayload} size={188} />
          </div>
          <p className="mt-3 text-center text-xs font-medium text-[var(--color-text-sub)]">
            현장 직원 또는 키오스크에 제시해 주세요
          </p>
        </div>

        {/* Reservation Number Box */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-slate-50 px-3.5 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-text-muted)]">
              예약번호
            </p>
            <p className="mt-0.5 font-mono text-base font-extrabold tracking-wide text-[var(--color-text-main)] truncate">
              {voucher.reservationCode}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleCopyCode()}
            aria-label="예약번호 복사"
            className={`min-h-[40px] shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
              copied
                ? 'bg-[var(--color-success-soft)] text-[var(--color-success)] border border-emerald-200'
                : 'bg-white text-[var(--color-primary)] border border-[var(--color-border)] hover:bg-[var(--color-primary-soft)]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>복사</span>
              </>
            )}
          </button>
        </div>

        {/* Details List */}
        {voucher.details.length > 0 && (
          <dl className="mt-4 space-y-2.5 border-t border-[var(--color-border)] pt-3.5">
            {voucher.details.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-3 text-xs"
              >
                <dt className="shrink-0 font-medium text-[var(--color-text-muted)]">
                  {row.label}
                </dt>
                <dd className="text-right font-semibold text-[var(--color-text-main)] leading-snug">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* Note */}
        {voucher.note && (
          <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-[var(--color-primary-soft)]/80 px-3.5 py-2.5 text-xs leading-relaxed text-[var(--color-text-sub)]">
            <Info
              className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-primary)]"
              aria-hidden="true"
            />
            <p>{voucher.note}</p>
          </div>
        )}

        {/* Close CTA */}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full h-12 rounded-xl bg-[var(--color-primary)] text-[15px] font-bold text-white transition-colors hover:bg-[var(--color-primary-hover)] active:scale-[0.99]"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
