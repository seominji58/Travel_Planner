import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Briefcase, Check, ClipboardCheck, Plus, Trash2, Users } from 'lucide-react';
import { INITIAL_CHECKLIST } from '../../data/mockData';
import type { ChecklistCategory, ChecklistItem } from '../../types/travel';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../../utils/storage';
import {
  INPUT_LIMITS,
  sanitizeSingleLine,
  sanitizeStoredChecklist,
} from '../../utils/validation';
import { ProgressBar } from './ProgressBar';

type ChecklistFilter = '전체' | ChecklistCategory;

interface ChecklistPageProps {
  resetKey: number;
}

export function ChecklistPage({ resetKey }: ChecklistPageProps) {
  const [items, setItems] = useState<ChecklistItem[]>(() =>
    loadFromStorage<ChecklistItem[]>(
      STORAGE_KEYS.CHECKLIST,
      INITIAL_CHECKLIST,
      sanitizeStoredChecklist,
    ),
  );
  const [activeFilter, setActiveFilter] = useState<ChecklistFilter>('전체');
  const [newCategory, setNewCategory] = useState<ChecklistCategory>('준비물');
  const [newText, setNewText] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');
  const prevResetKeyRef = useRef<number>(resetKey);

  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      setItems(INITIAL_CHECKLIST);
      setActiveFilter('전체');
      setNewCategory('준비물');
      setNewText('');
      setInputError('');
    }
  }, [resetKey]);

  const persistItems = (nextItems: ChecklistItem[]) => {
    setItems(nextItems);
    saveToStorage<ChecklistItem[]>(STORAGE_KEYS.CHECKLIST, nextItems);
  };

  const completedCount = items.filter((item) => item.completed).length;
  const packingCount = items.filter((item) => item.category === '준비물').length;
  const attendanceCount = items.filter((item) => item.category === '인원 출석').length;

  const filteredItems =
    activeFilter === '전체'
      ? items
      : items.filter((item) => item.category === activeFilter);

  const handleToggleItem = (id: string) => {
    const nextItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    persistItems(nextItems);
  };

  const handleDeleteItem = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id);
    persistItems(nextItems);
  };

  const handleToggleNewCategory = () => {
    setNewCategory((prev) => (prev === '준비물' ? '인원 출석' : '준비물'));
  };

  const handleAddItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = sanitizeSingleLine(newText, INPUT_LIMITS.CHECKLIST_TEXT_MAX);
    if (cleaned.length === 0) {
      setInputError('추가할 항목 내용을 입력해 주세요.');
      return;
    }

    if (items.length >= INPUT_LIMITS.CHECKLIST_MAX_ITEMS) {
      setInputError(
        `체크리스트는 최대 ${INPUT_LIMITS.CHECKLIST_MAX_ITEMS}개까지 등록할 수 있습니다.`,
      );
      return;
    }

    const isDuplicate = items.some(
      (item) =>
        item.category === newCategory &&
        item.text.toLocaleLowerCase() === cleaned.toLocaleLowerCase(),
    );
    if (isDuplicate) {
      setInputError(`'${newCategory}'에 이미 동일한 항목이 등록되어 있습니다.`);
      return;
    }

    const createdItem: ChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: cleaned,
      category: newCategory,
      completed: false,
    };

    persistItems([createdItem, ...items]);
    setNewText('');
    setInputError('');

    if (activeFilter !== '전체' && activeFilter !== newCategory) {
      setActiveFilter('전체');
    }
  };

  const filterOptions: Array<{ key: ChecklistFilter; label: string; count: number }> = [
    { key: '전체', label: '전체', count: items.length },
    { key: '준비물', label: '준비물', count: packingCount },
    { key: '인원 출석', label: '인원 출석', count: attendanceCount },
  ];

  const isAddDisabled = newText.trim().length === 0;

  return (
    <div className="space-y-4">
      <ProgressBar completed={completedCount} total={items.length} />

      {/* Category Filter Chips */}
      <div
        role="tablist"
        aria-label="체크리스트 카테고리 필터"
        className="flex items-center gap-2 overflow-x-auto pb-0.5"
      >
        {filterOptions.map((option) => {
          const isActive = activeFilter === option.key;
          return (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(option.key)}
              className={`min-h-[44px] shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors tabular-nums ${
                isActive
                  ? 'bg-[#1D6FE2] text-white shadow-xs'
                  : 'border border-[var(--color-border)] bg-white text-[var(--color-text-sub)] hover:bg-slate-50'
              }`}
            >
              {option.label} ({option.count})
            </button>
          );
        })}
      </div>

      {/* Quick Add Input Bar */}
      <form
        onSubmit={handleAddItem}
        aria-label="새 체크리스트 항목 추가"
        className="rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-xs"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-[var(--color-text-sub)]">
            추가할 항목 분류
          </span>
          <button
            type="button"
            onClick={handleToggleNewCategory}
            aria-label={`항목 분류 전환 (현재: ${newCategory})`}
            className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              newCategory === '준비물'
                ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:bg-blue-100'
                : 'bg-[var(--color-cat-sightseeing-bg)] text-[var(--color-cat-sightseeing)] hover:bg-purple-100'
            }`}
          >
            {newCategory === '준비물' ? (
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{newCategory}</span>
            <span className="text-[10px] opacity-75">· 탭하여 전환</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newText}
            aria-invalid={Boolean(inputError)}
            onChange={(event) => {
              setNewText(event.target.value.slice(0, INPUT_LIMITS.CHECKLIST_TEXT_MAX));
              if (inputError) setInputError('');
            }}
            placeholder="새 준비물 또는 인원 항목 추가..."
            aria-label="새 준비물 또는 인원 항목 입력"
            maxLength={INPUT_LIMITS.CHECKLIST_TEXT_MAX}
            className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-app)] px-3.5 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          />
          <button
            type="submit"
            disabled={isAddDisabled}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-xl bg-[#1D6FE2] px-4 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            추가
          </button>
        </div>
        {inputError && (
          <p role="alert" className="mt-2 text-xs font-semibold text-[var(--color-danger)]">
            {inputError}
          </p>
        )}
      </form>

      {/* Checklist Item List */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-white px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-bold text-[var(--color-text-main)]">
            {activeFilter === '전체'
              ? '등록된 체크리스트 항목이 없습니다'
              : `'${activeFilter}' 항목이 아직 없습니다`}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-sub)]">
            위 입력창에서 필요한 준비물이나 인원 체크 항목을 바로 추가해 보세요.
          </p>
          {activeFilter !== '전체' && items.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('전체')}
              className="mt-4 min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-app)] px-4 py-2 text-xs font-bold text-[var(--color-text-main)] transition-colors hover:bg-slate-100"
            >
              전체 항목 보기 ({items.length})
            </button>
          )}
        </div>
      ) : (
        <ul aria-label="체크리스트 목록" className="space-y-2.5">
          {filteredItems.map((item) => {
            const isPacking = item.category === '준비물';
            return (
              <li
                key={item.id}
                className={`flex min-h-[54px] items-center justify-between gap-2 rounded-2xl border bg-white px-2.5 py-2 shadow-xs transition-colors ${
                  item.completed
                    ? 'border-emerald-200/80'
                    : 'border-[var(--color-border)]'
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={item.completed}
                  aria-label={`${item.text} (${item.completed ? '완료됨' : '미완료'})`}
                  onClick={() => handleToggleItem(item.id)}
                  className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-xl px-1.5 text-left transition-colors active:bg-slate-50"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      item.completed
                        ? 'border-[var(--color-success)] bg-[var(--color-success)] text-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>

                  <div className="min-w-0 flex-1 py-0.5">
                    <p
                      className={`text-sm font-semibold leading-snug break-words transition-colors ${
                        item.completed
                          ? 'text-[var(--color-text-muted)] line-through'
                          : 'text-[var(--color-text-main)]'
                      }`}
                    >
                      {item.text}
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isPacking
                          ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                          : 'bg-[var(--color-cat-sightseeing-bg)] text-[var(--color-cat-sightseeing)]'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  aria-label={`${item.text} 항목 삭제`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] active:scale-95"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
