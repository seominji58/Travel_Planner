import type {
  ChecklistCategory,
  ChecklistItem,
  DayNumber,
  NoticeData,
  ScheduleCategory,
  ScheduleItem,
  ScheduleStatus,
  VoucherItem,
  VoucherType,
} from '../types/travel';

export const INPUT_LIMITS = {
  SCHEDULE_TITLE_MAX: 60,
  SCHEDULE_ADDRESS_MAX: 120,
  SCHEDULE_MEMO_MAX: 200,
  SCHEDULE_MAX_ITEMS: 100,
  NOTICE_MAX_LENGTH: 120,
  CHECKLIST_TEXT_MAX: 80,
  CHECKLIST_MAX_ITEMS: 100,
  VOUCHER_MAX_ITEMS: 30,
} as const;

const VALID_DAYS = new Set<number>([1, 2, 3]);
const VALID_SCHEDULE_CATEGORIES = new Set<string>(['이동', '관광', '식사', '숙소']);
const VALID_SCHEDULE_STATUSES = new Set<string>(['예정', '진행 중', '완료']);
const VALID_CHECKLIST_CATEGORIES = new Set<string>(['준비물', '인원 출석']);
const VALID_VOUCHER_TYPES = new Set<string>(['항공권', '호텔', '입장권']);

const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const CONTROL_CHARS_SINGLE = /[\u0000-\u001F\u007F]/g;
const CONTROL_CHARS_MULTI = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Strips non-printable control characters for single-line text inputs.
 */
export function sanitizeSingleLine(raw: string, maxLength: number): string {
  return raw
    .replace(CONTROL_CHARS_SINGLE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Strips dangerous control characters while preserving intentional line breaks.
 */
export function sanitizeMultiLine(raw: string, maxLength: number): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(CONTROL_CHARS_MULTI, '')
    .trim()
    .slice(0, maxLength);
}

export function isValidTimeString(value: string): boolean {
  return TIME_24H_REGEX.test(value.trim());
}

export function isValidLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;
}

export function parseCoordinatePair(
  latStr: string,
  lngStr: string,
): { ok: true; lat?: number; lng?: number } | { ok: false; error: string } {
  const trimmedLat = latStr.trim();
  const trimmedLng = lngStr.trim();

  if (!trimmedLat && !trimmedLng) {
    return { ok: true };
  }

  if (!trimmedLat || !trimmedLng) {
    return {
      ok: false,
      error: '위도와 경도를 둘 다 입력하거나 둘 다 비워 주세요.',
    };
  }

  const lat = Number(trimmedLat);
  const lng = Number(trimmedLng);

  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
    return {
      ok: false,
      error: '위도(-90~90)와 경도(-180~180) 범위의 유효한 숫자를 입력해 주세요.',
    };
  }

  return { ok: true, lat, lng };
}

/**
 * Sanitizes phone numbers for safe use inside `tel:` links.
 */
export function sanitizeTelHref(phone: string): string {
  const cleaned = phone.replace(/[^+\d]/g, '').slice(0, 20);
  if (!cleaned) return 'tel:';
  // Allow leading '+' only once at index 0
  const normalized = cleaned.startsWith('+')
    ? `+${cleaned.slice(1).replace(/\+/g, '')}`
    : cleaned.replace(/\+/g, '');
  return `tel:${normalized}`;
}

/**
 * Builds a validated HTTPS Google Maps URL, preventing protocol injection.
 */
export function buildSafeGoogleMapsUrl(
  lat?: number,
  lng?: number,
  fallbackQuery?: string,
): string | null {
  if (isValidLatitude(lat) && isValidLongitude(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  const cleanQuery = fallbackQuery ? sanitizeSingleLine(fallbackQuery, 120) : '';
  if (!cleanQuery) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanQuery)}`;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Runtime schema validator & sanitizer for LocalStorage itinerary arrays.
 */
export function sanitizeStoredItinerary(
  raw: unknown,
  fallback: ScheduleItem[],
): ScheduleItem[] {
  if (!Array.isArray(raw)) return fallback;

  const result: ScheduleItem[] = [];
  const seenIds = new Set<string>();

  for (const entry of raw) {
    if (result.length >= INPUT_LIMITS.SCHEDULE_MAX_ITEMS) break;
    if (!isPlainRecord(entry)) continue;

    const id = typeof entry.id === 'string' ? sanitizeSingleLine(entry.id, 64) : '';
    const day = typeof entry.day === 'number' && VALID_DAYS.has(entry.day) ? (entry.day as DayNumber) : null;
    const time = typeof entry.time === 'string' && isValidTimeString(entry.time) ? entry.time.trim() : null;
    const title = typeof entry.title === 'string'
      ? sanitizeSingleLine(entry.title, INPUT_LIMITS.SCHEDULE_TITLE_MAX)
      : '';
    const category = typeof entry.category === 'string' && VALID_SCHEDULE_CATEGORIES.has(entry.category)
      ? (entry.category as ScheduleCategory)
      : null;
    const status = typeof entry.status === 'string' && VALID_SCHEDULE_STATUSES.has(entry.status)
      ? (entry.status as ScheduleStatus)
      : '예정';
    const memo = typeof entry.memo === 'string'
      ? sanitizeMultiLine(entry.memo, INPUT_LIMITS.SCHEDULE_MEMO_MAX)
      : '';

    if (!id || seenIds.has(id) || day === null || !time || !title || !category) {
      continue;
    }

    const address = typeof entry.address === 'string'
      ? sanitizeSingleLine(entry.address, INPUT_LIMITS.SCHEDULE_ADDRESS_MAX) || undefined
      : undefined;
    const hasValidCoords = isValidLatitude(entry.lat) && isValidLongitude(entry.lng);

    seenIds.add(id);
    result.push({
      id,
      day,
      time,
      title,
      category,
      memo,
      status,
      address,
      lat: hasValidCoords ? (entry.lat as number) : undefined,
      lng: hasValidCoords ? (entry.lng as number) : undefined,
    });
  }

  return result;
}

/**
 * Runtime schema validator & sanitizer for LocalStorage notice data.
 */
export function sanitizeStoredNotice(raw: unknown, fallback: NoticeData): NoticeData {
  if (!isPlainRecord(raw)) return fallback;

  const content = typeof raw.content === 'string'
    ? sanitizeMultiLine(raw.content, INPUT_LIMITS.NOTICE_MAX_LENGTH)
    : '';
  const updatedAt = typeof raw.updatedAt === 'string'
    ? sanitizeSingleLine(raw.updatedAt, 32)
    : '';

  if (!content) return fallback;
  return {
    content,
    updatedAt: updatedAt || fallback.updatedAt,
  };
}

/**
 * Runtime schema validator & sanitizer for LocalStorage checklist arrays.
 */
export function sanitizeStoredChecklist(
  raw: unknown,
  fallback: ChecklistItem[],
): ChecklistItem[] {
  if (!Array.isArray(raw)) return fallback;

  const result: ChecklistItem[] = [];
  const seenIds = new Set<string>();

  for (const entry of raw) {
    if (result.length >= INPUT_LIMITS.CHECKLIST_MAX_ITEMS) break;
    if (!isPlainRecord(entry)) continue;

    const id = typeof entry.id === 'string' ? sanitizeSingleLine(entry.id, 64) : '';
    const text = typeof entry.text === 'string'
      ? sanitizeSingleLine(entry.text, INPUT_LIMITS.CHECKLIST_TEXT_MAX)
      : '';
    const category = typeof entry.category === 'string' && VALID_CHECKLIST_CATEGORIES.has(entry.category)
      ? (entry.category as ChecklistCategory)
      : '준비물';
    const completed = typeof entry.completed === 'boolean' ? entry.completed : false;

    if (!id || seenIds.has(id) || !text) continue;
    seenIds.add(id);
    result.push({ id, text, category, completed });
  }

  return result;
}

/**
 * Runtime schema validator & sanitizer for LocalStorage voucher arrays.
 */
export function sanitizeStoredVouchers(
  raw: unknown,
  fallback: VoucherItem[],
): VoucherItem[] {
  if (!Array.isArray(raw)) return fallback;

  const result: VoucherItem[] = [];
  const seenIds = new Set<string>();

  for (const entry of raw) {
    if (result.length >= INPUT_LIMITS.VOUCHER_MAX_ITEMS) break;
    if (!isPlainRecord(entry)) continue;

    const id = typeof entry.id === 'string' ? sanitizeSingleLine(entry.id, 64) : '';
    const type = typeof entry.type === 'string' && VALID_VOUCHER_TYPES.has(entry.type)
      ? (entry.type as VoucherType)
      : null;
    const title = typeof entry.title === 'string' ? sanitizeSingleLine(entry.title, 80) : '';
    const subtitle = typeof entry.subtitle === 'string' ? sanitizeSingleLine(entry.subtitle, 100) : '';
    const reservationCode = typeof entry.reservationCode === 'string'
      ? sanitizeSingleLine(entry.reservationCode, 40)
      : '';
    const note = typeof entry.note === 'string' ? sanitizeMultiLine(entry.note, 200) : '';
    const qrPayload = typeof entry.qrPayload === 'string' ? sanitizeSingleLine(entry.qrPayload, 160) : '';

    if (!id || seenIds.has(id) || !type || !title || !reservationCode || !qrPayload) {
      continue;
    }

    const details = Array.isArray(entry.details)
      ? entry.details
          .filter(isPlainRecord)
          .map((row) => ({
            label: typeof row.label === 'string' ? sanitizeSingleLine(row.label, 40) : '',
            value: typeof row.value === 'string' ? sanitizeSingleLine(row.value, 100) : '',
          }))
          .filter((row) => row.label && row.value)
          .slice(0, 6)
      : [];

    seenIds.add(id);
    result.push({
      id,
      type,
      title,
      subtitle,
      reservationCode,
      details,
      note,
      qrPayload,
    });
  }

  return result.length > 0 ? result : fallback;
}
