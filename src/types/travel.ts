export type AppTab = 'itinerary' | 'checklist' | 'voucher';

export type DayNumber = 1 | 2 | 3;

export type ScheduleCategory = '이동' | '관광' | '식사' | '숙소';

export type ScheduleStatus = '예정' | '진행 중' | '완료';

export interface ScheduleItem {
  id: string;
  day: DayNumber;
  time: string; // "HH:mm"
  title: string;
  category: ScheduleCategory;
  memo: string;
  status: ScheduleStatus;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface PlacePreset {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: ScheduleCategory;
}

export interface NoticeData {
  content: string;
  updatedAt: string;
}

export interface NoticeTemplate {
  id: string;
  label: string;
  content: string;
}

export type ChecklistCategory = '준비물' | '인원 출석';

export interface ChecklistItem {
  id: string;
  text: string;
  category: ChecklistCategory;
  completed: boolean;
}

export type VoucherType = '항공권' | '호텔' | '입장권';

export interface VoucherDetailRow {
  label: string;
  value: string;
}

export interface VoucherItem {
  id: string;
  type: VoucherType;
  title: string;
  subtitle: string;
  reservationCode: string;
  details: VoucherDetailRow[];
  note: string;
  qrPayload: string;
}

export interface HotelTaxiCardData {
  nameJa: string;
  readingJa: string;
  nameKo: string;
  addressJa: string;
  addressKo: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface EmergencyContactItem {
  id: string;
  label: string;
  sublabel: string;
  phone: string;
  isUrgent: boolean;
}
