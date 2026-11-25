import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { DAY_INFO, INITIAL_ITINERARY } from '../../data/mockData';
import type {
  DayNumber,
  ScheduleItem,
  ScheduleStatus,
} from '../../types/travel';
import {
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
} from '../../utils/storage';
import { DayRouteMap } from './DayRouteMap';
import { ScheduleCard } from './ScheduleCard';
import { ScheduleFormModal } from './ScheduleFormModal';

interface ItineraryPageProps {
  resetKey: number;
}

const DAYS: DayNumber[] = [1, 2, 3];

const NEXT_STATUS: Record<ScheduleStatus, ScheduleStatus> = {
  예정: '진행 중',
  '진행 중': '완료',
  완료: '예정',
};

function hydrateMissingLocations(saved: ScheduleItem[]): ScheduleItem[] {
  const initialMap = new Map(INITIAL_ITINERARY.map((item) => [item.id, item]));
  return saved.map((item) => {
    const seed = initialMap.get(item.id);
    if (!seed) return item;
    return {
      ...item,
      address: item.address ?? seed.address,
      lat: typeof item.lat === 'number' ? item.lat : seed.lat,
      lng: typeof item.lng === 'number' ? item.lng : seed.lng,
    };
  });
}

export function ItineraryPage({ resetKey }: ItineraryPageProps) {
  const [items, setItems] = useState<ScheduleItem[]>(() =>
    hydrateMissingLocations(
      loadFromStorage<ScheduleItem[]>(STORAGE_KEYS.ITINERARY, INITIAL_ITINERARY),
    ),
  );
  const [selectedDay, setSelectedDay] = useState<DayNumber>(1);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const prevResetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (prevResetKeyRef.current !== resetKey) {
      prevResetKeyRef.current = resetKey;
      setItems(INITIAL_ITINERARY);
      setSelectedDay(1);
      setFocusedItemId(null);
      setIsModalOpen(false);
      setEditingItem(null);
    }
  }, [resetKey]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ITINERARY, items);
  }, [items]);

  const dayItems = useMemo(() => {
    return items
      .filter((item) => item.day === selectedDay)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [items, selectedDay]);

  const completedCount = useMemo(
    () => dayItems.filter((item) => item.status === '완료').length,
    [dayItems],
  );

  const inProgressCount = useMemo(
    () => dayItems.filter((item) => item.status === '진행 중').length,
    [dayItems],
  );

  const handleSelectDay = (day: DayNumber) => {
    setSelectedDay(day);
    setFocusedItemId(null);
  };

  const handleFocusOnMap = (id: string) => {
    setFocusedItemId(id);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveSchedule = (
    data: Omit<ScheduleItem, 'id'>,
    editId?: string,
  ) => {
    if (editId) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editId ? { ...data, id: editId } : item,
        ),
      );
      setSelectedDay(data.day);
      setFocusedItemId(editId);
    } else {
      const newId = `sch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newItem: ScheduleItem = {
        ...data,
        id: newId,
      };
      setItems((prev) => [...prev, newItem]);
      setSelectedDay(data.day);
      setFocusedItemId(newId);
    }
    handleCloseModal();
  };

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: NEXT_STATUS[item.status] } : item,
      ),
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (focusedItemId === id) {
      setFocusedItemId(null);
    }
  };

  return (
    <section aria-label="여행 일정 타임라인" className="space-y-3.5">
      {/* Top Control Row: Day Selector Pills + Add Schedule Button */}
      <div className="flex items-center justify-between gap-2">
        <div
          role="tablist"
          aria-label="여행 일차 선택"
          className="flex items-center gap-1.5 overflow-x-auto"
        >
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectDay(day)}
                className={`min-h-[40px] px-3 rounded-full text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-sub)] border border-[var(--color-border)] hover:bg-slate-50'
                }`}
              >
                {DAY_INFO[day].label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 min-h-[40px] px-3.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[13px] font-semibold text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>일정 추가</span>
        </button>
      </div>

      {/* Day Summary Bar */}
      <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-3.5 py-2.5 text-[12.5px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--color-text-main)]">
            {DAY_INFO[selectedDay].date}
          </span>
          <span className="text-[var(--color-border)]">|</span>
          <span className="font-medium text-[var(--color-text-sub)]">
            총 <strong className="text-[var(--color-text-main)]">{dayItems.length}</strong>개 일정
          </span>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-semibold">
          {inProgressCount > 0 && (
            <span className="text-[var(--color-primary)]">
              진행 중 {inProgressCount}
            </span>
          )}
          <span className="text-[var(--color-success)]">
            완료 {completedCount}
          </span>
        </div>
      </div>

      {/* Interactive Route Map */}
      <div ref={mapSectionRef}>
        <DayRouteMap
          day={selectedDay}
          items={dayItems}
          focusedItemId={focusedItemId}
          onSelectItem={setFocusedItemId}
        />
      </div>

      {/* Vertical Timeline or Empty State */}
      {dayItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <CalendarDays className="w-6 h-6" />
          </div>
          <p className="mt-3.5 text-[15px] font-bold text-[var(--color-text-main)]">
            등록된 일정이 없습니다
          </p>
          <p className="mt-1 text-[13px] text-[var(--color-text-sub)]">
            {DAY_INFO[selectedDay].label} ({DAY_INFO[selectedDay].date}) 일정을
            추가해 보세요.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-5 inline-flex items-center gap-1.5 min-h-[44px] px-5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[14px] font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>첫 일정 추가하기</span>
          </button>
        </div>
      ) : (
        <ol className="relative pt-1">
          {dayItems.map((item, index) => {
            const isLast = index === dayItems.length - 1;
            const isCompleted = item.status === '완료';
            const isInProgress = item.status === '진행 중';

            return (
              <li key={item.id} className="flex items-stretch gap-2.5">
                {/* Left Time Column */}
                <div className="w-11 shrink-0 pt-3.5 text-right">
                  <span
                    className={`text-[13px] font-bold tabular-nums leading-none ${
                      isInProgress
                        ? 'text-[var(--color-primary)]'
                        : isCompleted
                          ? 'text-[var(--color-text-muted)]'
                          : 'text-[var(--color-text-main)]'
                    }`}
                  >
                    {item.time}
                  </span>
                </div>

                {/* Center Connector & Status Dot */}
                <div className="relative flex flex-col items-center w-4 shrink-0">
                  <div className="mt-[17px] relative flex items-center justify-center z-10">
                    {isInProgress ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="absolute h-4 w-4 rounded-full bg-[var(--color-primary)]/30 animate-ping"
                        />
                        <span className="relative h-3 w-3 rounded-full bg-[var(--color-primary)] ring-[3px] ring-[var(--color-primary-soft)]" />
                      </>
                    ) : isCompleted ? (
                      <span className="h-3 w-3 rounded-full bg-[var(--color-success)] ring-[3px] ring-[var(--color-success-soft)]" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300 ring-[3px] ring-[var(--color-bg-app)]" />
                    )}
                  </div>

                  {!isLast && (
                    <div
                      aria-hidden="true"
                      className="w-[2px] flex-1 bg-[#E2E8F0] my-1"
                    />
                  )}
                </div>

                {/* Right Schedule Card */}
                <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-3.5'}`}>
                  <ScheduleCard
                    item={item}
                    stepNumber={index + 1}
                    isFocused={focusedItemId === item.id}
                    onFocusMap={handleFocusOnMap}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteSchedule}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Add / Edit Schedule Modal */}
      <ScheduleFormModal
        isOpen={isModalOpen}
        day={selectedDay}
        initialItem={editingItem}
        onClose={handleCloseModal}
        onSave={handleSaveSchedule}
      />
    </section>
  );
}
