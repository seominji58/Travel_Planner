interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const safeTotal = Math.max(0, total);
  const safeCompleted = Math.min(Math.max(0, completed), safeTotal);
  const percent = safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100);

  return (
    <section
      aria-label="투어 준비 및 인원 체크 현황"
      className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-xs"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text-main)]">
            투어 준비 및 인원 체크 현황
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-sub)]">
            {safeTotal === 0
              ? '아래에서 첫 체크 항목을 추가해 보세요'
              : percent === 100
                ? '모든 준비와 인원 확인이 완료되었습니다!'
                : '출발 전 필수 항목과 조별 출석을 확인하세요'}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-2xl font-extrabold leading-none text-[var(--color-success)] tabular-nums">
            {percent}%
          </div>
          <div className="mt-1 text-xs font-semibold text-[var(--color-text-sub)] tabular-nums">
            {safeCompleted} / {safeTotal} 완료
          </div>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="투어 준비 및 인원 체크 진행률"
        className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className="h-full rounded-full bg-[var(--color-success)] transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}
