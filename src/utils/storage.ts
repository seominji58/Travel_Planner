export const STORAGE_KEYS = {
  ITINERARY: 'tp_itinerary_v1',
  NOTICE: 'tp_notice_v1',
  CHECKLIST: 'tp_checklist_v1',
  VOUCHERS: 'tp_vouchers_v1',
} as const;

const MAX_STORAGE_PAYLOAD_BYTES = 100_000;

/**
 * Safe JSON parser that strips prototype-pollution keys (`__proto__`, `constructor`, `prototype`).
 */
function safeJsonParse(raw: string): unknown {
  return JSON.parse(raw, (key, value: unknown) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });
}

export function loadFromStorage<T>(
  key: string,
  fallback: T,
  sanitizer?: (parsed: unknown, fallback: T) => T,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw.length > MAX_STORAGE_PAYLOAD_BYTES) {
      return fallback;
    }
    const parsed = safeJsonParse(raw);
    if (sanitizer) {
      return sanitizer(parsed, fallback);
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > MAX_STORAGE_PAYLOAD_BYTES) {
      return false;
    }
    window.localStorage.setItem(key, serialized);
    return true;
  } catch {
    // Ignore storage quota errors in private browsing modes
    return false;
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
