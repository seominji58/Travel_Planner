import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Phone,
  ShieldAlert,
  Siren,
  UserCheck,
} from 'lucide-react';
import type { EmergencyContactItem } from '../../types/travel';
import { sanitizeTelHref } from '../../utils/validation';

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

export function EmergencyContacts({
  contacts,
}: {
  contacts: EmergencyContactItem[];
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopyPhone = async (contact: EmergencyContactItem) => {
    const ok = await copyTextSafely(contact.phone);
    if (!ok) {
      return;
    }

    setCopiedId(contact.id);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setCopiedId(null);
      timerRef.current = null;
    }, 1800);
  };

  return (
    <section aria-labelledby="emergency-sos-heading">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <ShieldAlert
            className="w-5 h-5 text-[var(--color-danger)]"
            aria-hidden="true"
          />
          <h2
            id="emergency-sos-heading"
            className="text-[17px] font-bold text-[#DC2626] tracking-tight"
          >
            현지 비상연락처 (SOS)
          </h2>
        </div>
        <span className="text-xs font-semibold text-[var(--color-text-muted)]">
          24시간 원터치 연결
        </span>
      </div>

      <div className="space-y-2.5">
        {contacts.map((contact) => {
          const telHref = sanitizeTelHref(contact.phone);
          const isCopied = copiedId === contact.id;

          return (
            <div
              key={contact.id}
              className={`rounded-2xl border bg-[var(--color-surface)] p-4 shadow-xs flex items-center justify-between gap-3 ${
                contact.isUrgent
                  ? 'border-red-200 bg-gradient-to-r from-red-50/40 to-white'
                  : 'border-[var(--color-border)]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    contact.isUrgent
                      ? 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                      : 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                  }`}
                >
                  {contact.isUrgent ? (
                    <Siren className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <UserCheck className="w-5 h-5" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-[14px] font-bold text-[var(--color-text-main)] leading-snug">
                      {contact.label}
                    </h3>
                    {contact.isUrgent && (
                      <span className="inline-flex items-center rounded-full bg-[var(--color-danger-soft)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-danger)]">
                        긴급
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-sub)] mt-0.5 truncate">
                    {contact.sublabel}
                  </p>
                  <p
                    className={`mt-1 font-mono text-sm font-extrabold tabular-nums ${
                      contact.isUrgent
                        ? 'text-[#DC2626]'
                        : 'text-[var(--color-text-main)]'
                    }`}
                  >
                    {contact.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void handleCopyPhone(contact)}
                  aria-label={`${contact.label} 전화번호 복사`}
                  className={`min-h-[44px] inline-flex items-center gap-1 rounded-xl border px-2.5 text-xs font-bold transition-colors ${
                    isCopied
                      ? 'border-emerald-200 bg-[var(--color-success-soft)] text-[var(--color-success)]'
                      : 'border-[var(--color-border)] bg-white text-[var(--color-text-sub)] hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  {isCopied ? (
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

                <a
                  href={telHref}
                  aria-label={`${contact.label} 전화 걸기 (${contact.phone})`}
                  className={`w-11 h-11 rounded-full inline-flex items-center justify-center text-white shadow-xs transition-colors active:scale-95 ${
                    contact.isUrgent
                      ? 'bg-[#EF4444] hover:bg-[#DC2626]'
                      : 'bg-[#1D6FE2] hover:bg-[#1558B8]'
                  }`}
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Tip Banner */}
      <div className="mt-3.5 flex items-start gap-2.5 rounded-2xl border border-[var(--color-notice-border)] bg-[var(--color-notice-bg)]/80 p-3.5 text-xs leading-relaxed text-[var(--color-notice-text)]">
        <AlertCircle
          className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-notice-accent)]"
          aria-hidden="true"
        />
        <p className="font-medium">
          응급 상황 발생 시 가이드에게 즉시 연락하거나 관광통역안내(1330 / 일본 내
          050-3816-2787)를 활용하세요.
        </p>
      </div>
    </section>
  );
}
