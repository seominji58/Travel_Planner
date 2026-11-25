import type { KeyboardEvent } from 'react';
import { Building2, Plane, QrCode, Ticket } from 'lucide-react';
import type { VoucherItem, VoucherType } from '../../types/travel';

interface VoucherTheme {
  stripColor: string;
  iconBg: string;
  iconColor: string;
  badgeLabel: string;
}

const VOUCHER_THEME: Record<VoucherType, VoucherTheme> = {
  항공권: {
    stripColor: '#1D6FE2',
    iconBg: '#EBF3FE',
    iconColor: '#1D6FE2',
    badgeLabel: '항공권',
  },
  호텔: {
    stripColor: '#0D9488',
    iconBg: '#CCFBF1',
    iconColor: '#0D9488',
    badgeLabel: '호텔',
  },
  입장권: {
    stripColor: '#7C3AED',
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
    badgeLabel: '입장권',
  },
};

function VoucherTypeIcon({ type }: { type: VoucherType }) {
  const iconColor = VOUCHER_THEME[type].iconColor;
  switch (type) {
    case '항공권':
      return <Plane className="w-5 h-5" style={{ color: iconColor }} aria-hidden="true" />;
    case '호텔':
      return <Building2 className="w-5 h-5" style={{ color: iconColor }} aria-hidden="true" />;
    case '입장권':
      return <Ticket className="w-5 h-5" style={{ color: iconColor }} aria-hidden="true" />;
  }
}

export function VoucherCardList({
  vouchers,
  onSelect,
}: {
  vouchers: VoucherItem[];
  onSelect: (voucher: VoucherItem) => void;
}) {
  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    voucher: VoucherItem,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(voucher);
    }
  };

  return (
    <section aria-labelledby="voucher-wallet-heading">
      <div className="flex items-center justify-between mb-3">
        <h2
          id="voucher-wallet-heading"
          className="text-[17px] font-bold text-[var(--color-text-main)] tracking-tight"
        >
          디지털 바우처 월렛
        </h2>
        <span className="inline-flex items-center rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--color-primary)] tabular-nums">
          총 {vouchers.length}건
        </span>
      </div>

      {vouchers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-text-muted)]">
          등록된 디지털 바우처가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {vouchers.map((voucher) => {
            const theme = VOUCHER_THEME[voucher.type];
            return (
              <div
                key={voucher.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(voucher)}
                onKeyDown={(e) => handleCardKeyDown(e, voucher)}
                aria-label={`${voucher.title} QR 바우처 열기`}
                className="group rounded-2xl border border-[var(--color-border)] bg-white shadow-xs overflow-hidden flex transition-all hover:border-slate-300 hover:shadow-sm active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] cursor-pointer"
              >
                <div
                  className="w-1.5 shrink-0"
                  style={{ backgroundColor: theme.stripColor }}
                  aria-hidden="true"
                />

                <div className="flex-1 p-4 flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: theme.iconBg }}
                    >
                      <VoucherTypeIcon type={voucher.type} />
                    </div>

                    <div className="min-w-0">
                      <span
                        className="inline-block text-[11px] font-bold mb-0.5"
                        style={{ color: theme.iconColor }}
                      >
                        {theme.badgeLabel}
                      </span>
                      <h3 className="text-[15px] font-bold text-[var(--color-text-main)] leading-snug truncate">
                        {voucher.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-sub)] mt-0.5 truncate">
                        {voucher.subtitle}
                      </p>
                      <p className="mt-1.5 font-mono text-[11px] font-semibold text-[var(--color-text-muted)] tracking-tight">
                        예약번호: <span className="text-[var(--color-text-sub)]">{voucher.reservationCode}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(voucher);
                    }}
                    aria-label={`${voucher.title} QR 보기`}
                    className="min-h-[38px] shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary-soft)] px-3 py-2 text-xs font-bold text-[var(--color-primary)] transition-colors hover:bg-[#DCEAFE] active:bg-[#CFE3FD]"
                  >
                    <QrCode className="w-4 h-4" aria-hidden="true" />
                    <span>QR 보기</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
