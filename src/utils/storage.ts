export const STORAGE_KEYS = {
  ITINERARY: 'tp_itinerary_v1',
  NOTICE: 'tp_notice_v1',
  CHECKLIST: 'tp_checklist_v1',
  VOUCHERS: 'tp_vouchers_v1',
} as const;

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in private browsing modes
  }
}

export function resetAllTravelData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch {
    // Ignore storage access errors
  }
}
