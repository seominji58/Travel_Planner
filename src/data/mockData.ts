import type {
  ChecklistItem,
  DayNumber,
  EmergencyContactItem,
  HotelTaxiCardData,
  NoticeData,
  NoticeTemplate,
  PlacePreset,
  ScheduleItem,
  VoucherItem,
} from '../types/travel';

export const TOUR_META = {
  title: '도쿄 2박 3일 투어',
  dateRange: '2026.11.27 - 11.29',
  subtitle: '가이드 · 여행객 통합',
} as const;

export const DAY_INFO: Record<DayNumber, { label: string; date: string }> = {
  1: { label: 'Day 1', date: '11.27(금)' },
  2: { label: 'Day 2', date: '11.28(토)' },
  3: { label: 'Day 3', date: '11.29(일)' },
};

export const TOKYO_PLACE_PRESETS: PlacePreset[] = [
  {
    id: 'preset-shibuya-sky',
    name: '시부야 스카이 전망대',
    address: '도쿄도 시부야구 시부야 2-24-12',
    lat: 35.6584,
    lng: 139.7022,
    category: '관광',
  },
  {
    id: 'preset-tokyo-tower',
    name: '도쿄 타워',
    address: '도쿄도 미나토구 시바코엔 4-2-8',
    lat: 35.6586,
    lng: 139.7454,
    category: '관광',
  },
  {
    id: 'preset-ginza-six',
    name: '긴자 식스 (GINZA SIX)',
    address: '도쿄도 추오구 긴자 6-10-1',
    lat: 35.6696,
    lng: 139.764,
    category: '관광',
  },
  {
    id: 'preset-ueno-park',
    name: '우에노 공원',
    address: '도쿄도 다이토구 우에노코엔 5-20',
    lat: 35.7141,
    lng: 139.7741,
    category: '관광',
  },
  {
    id: 'preset-tokyo-station',
    name: '도쿄역 마루노우치',
    address: '도쿄도 치요다구 마루노우치 1-9-1',
    lat: 35.6812,
    lng: 139.7671,
    category: '이동',
  },
  {
    id: 'preset-hotel',
    name: '신주쿠 프린스 호텔',
    address: '도쿄도 신주쿠구 가부키초 1-30-1',
    lat: 35.6951,
    lng: 139.7004,
    category: '숙소',
  },
];

export const INITIAL_ITINERARY: ScheduleItem[] = [
  // Day 1
  {
    id: 'sch-101',
    day: 1,
    time: '09:30',
    title: '나리타 공항 도착 및 전용버스 탑승',
    category: '이동',
    memo: '터미널 1 북쪽 출구 미팅보드 앞 집결',
    status: '완료',
    address: '치바현 나리타시 나리타 국제공항 제1터미널',
    lat: 35.7647,
    lng: 140.3863,
  },
  {
    id: 'sch-102',
    day: 1,
    time: '11:30',
    title: '센소지 & 나카미세 거리 투어',
    category: '관광',
    memo: '가이드와 카미나리몬 앞 단체사진 촬영',
    status: '진행 중',
    address: '도쿄도 다이토구 아사쿠사 2-3-1',
    lat: 35.7148,
    lng: 139.7967,
  },
  {
    id: 'sch-103',
    day: 1,
    time: '13:00',
    title: '아사쿠사 현지 텐동 점심식사',
    category: '식사',
    memo: '알레르기 있으신 분 가이드에게 사전 말씀',
    status: '예정',
    address: '도쿄도 다이토구 아사쿠사 1-37-1',
    lat: 35.7119,
    lng: 139.7959,
  },
  {
    id: 'sch-104',
    day: 1,
    time: '15:30',
    title: '신주쿠 프린스 호텔 체크인',
    category: '숙소',
    memo: '여권 지참, 로비 2층 프론트 데스크',
    status: '예정',
    address: '도쿄도 신주쿠구 가부키초 1-30-1',
    lat: 35.6951,
    lng: 139.7004,
  },
  // Day 2
  {
    id: 'sch-201',
    day: 2,
    time: '08:30',
    title: '호텔 로비 집합 및 전용버스 출발',
    category: '이동',
    memo: '조식 07:30 2층 레스토랑 이용 후 로비 집결',
    status: '예정',
    address: '도쿄도 신주쿠구 가부키초 1-30-1',
    lat: 35.6951,
    lng: 139.7004,
  },
  {
    id: 'sch-202',
    day: 2,
    time: '10:00',
    title: '메이지 신궁 & 하라주쿠 산책',
    category: '관광',
    memo: '자유 관람 1시간 후 오모테산도 입구 집결',
    status: '예정',
    address: '도쿄도 시부야구 요요기카미조노초 1-1',
    lat: 35.6764,
    lng: 139.6993,
  },
  {
    id: 'sch-203',
    day: 2,
    time: '12:30',
    title: '시부야 스시 오마카세 런치',
    category: '식사',
    memo: '예약 좌석 배정 완료, 음료 별도',
    status: '예정',
    address: '도쿄도 시부야구 우다가와초 21-1',
    lat: 35.6595,
    lng: 139.7004,
  },
  {
    id: 'sch-204',
    day: 2,
    time: '16:00',
    title: '도쿄 스카이트리 전망대 관람',
    category: '관광',
    memo: '바우처 탭의 QR 코드 미리 준비해 주세요',
    status: '예정',
    address: '도쿄도 스미다구 오시아게 1-1-2',
    lat: 35.7101,
    lng: 139.8107,
  },
  // Day 3
  {
    id: 'sch-301',
    day: 3,
    time: '09:00',
    title: '신주쿠 프린스 호텔 체크아웃',
    category: '숙소',
    memo: '객실 키 반납 및 캐리어 버스 적재 확인',
    status: '예정',
    address: '도쿄도 신주쿠구 가부키초 1-30-1',
    lat: 35.6951,
    lng: 139.7004,
  },
  {
    id: 'sch-302',
    day: 3,
    time: '10:30',
    title: '오다이바 해변공원 & 쇼핑 자유시간',
    category: '관광',
    memo: '13:00 다이버시티 정문 앞 재집결',
    status: '예정',
    address: '도쿄도 미나토구 다이바 1-4-1',
    lat: 35.6252,
    lng: 139.7755,
  },
  {
    id: 'sch-303',
    day: 3,
    time: '14:30',
    title: '나리타 공항 이동 및 출국 수속',
    category: '이동',
    memo: '대한항공 KE704편 · 여권/면세품 영수증 확인',
    status: '예정',
    address: '치바현 나리타시 나리타 국제공항 제1터미널',
    lat: 35.7647,
    lng: 140.3863,
  },
];

export const INITIAL_NOTICE: NoticeData = {
  content: '내일 조식은 07:30 2층 레스토랑, 버스 탑승은 08:30 로비 집합입니다. 여권 지참 필수!',
  updatedAt: '방금 전',
};

export const NOTICE_TEMPLATES: NoticeTemplate[] = [
  {
    id: 'tpl-breakfast',
    label: '조식·집합 안내',
    content: '내일 조식은 07:30 2층 레스토랑, 버스 탑승은 08:30 로비 집합입니다. 여권 지참 필수!',
  },
  {
    id: 'tpl-rain',
    label: '우천 일정 변경',
    content: '오후 비 예보로 야외 일정을 실내 전망대 중심으로 조정합니다. 우산 꼭 챙겨 주세요!',
  },
  {
    id: 'tpl-freetime',
    label: '자유시간 집결',
    content: '자유시간 종료 후 16:50 정문 시계탑 앞에서 집결합니다. 늦으실 경우 가이드에게 바로 연락 주세요.',
  },
];

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: 'chk-1',
    text: '여권 및 e-티켓 사본 지참',
    category: '준비물',
    completed: true,
  },
  {
    id: 'chk-2',
    text: '일본 유심 / 포켓 와이파이 수령',
    category: '준비물',
    completed: true,
  },
  {
    id: 'chk-3',
    text: '1조 인원 출석 확인 (김민수 외 4명)',
    category: '인원 출석',
    completed: true,
  },
  {
    id: 'chk-4',
    text: '110V 멀티 어댑터 (돼지코)',
    category: '준비물',
    completed: false,
  },
  {
    id: 'chk-5',
    text: '2조 인원 출석 확인 (이서연 외 3명)',
    category: '인원 출석',
    completed: false,
  },
];

export const INITIAL_VOUCHERS: VoucherItem[] = [
  {
    id: 'vch-flight',
    type: '항공권',
    title: '대한항공 KE703 (인천 → 나리타)',
    subtitle: '2026.11.27 09:30 출발 · 일반석 28B',
    reservationCode: 'KE-849201',
    details: [
      { label: '탑승 터미널', value: '인천공항 T2 · 게이트 251' },
      { label: '수하물 안내', value: '위탁 23kg 1개 + 기내 10kg' },
    ],
    note: '출국 수속 카운터 또는 모바일 셀프 체크인 시 QR 코드를 스캔해 주세요.',
    qrPayload: 'VOUCHER:FLIGHT:KE-849201:ICN-NRT:20261127',
  },
  {
    id: 'vch-hotel',
    type: '호텔',
    title: '신주쿠 프린스 호텔 (2박)',
    subtitle: '스탠다드 트윈 (조식포함) · 체크인 15:30',
    reservationCode: 'HTL-2026-991',
    details: [
      { label: '체크인 / 체크아웃', value: '11.27(금) 15:00 ~ 11.29(일) 11:00' },
      { label: '투숙객', value: '도쿄 패키지 투어 단체 (객실 배정 포함)' },
    ],
    note: '체크인 시 프론트 데스크에서 여권과 함께 이 QR 코드를 제시해 주세요.',
    qrPayload: 'VOUCHER:HOTEL:HTL-2026-991:SHINJUKU-PRINCE',
  },
  {
    id: 'vch-ticket',
    type: '입장권',
    title: '도쿄 스카이트리 전망대 입장권',
    subtitle: 'Day 2 16:00 · 덴보데크(350m) 관람',
    reservationCode: 'SKY-55102',
    details: [
      { label: '입장 시간', value: '2026.11.28(토) 16:00 ~ 16:30 입장' },
      { label: '입장 위치', value: '도쿄 스카이트리 4층 단체 티켓 게이트' },
    ],
    note: '입장 게이트 리더기에 QR 코드를 대면 바로 통과할 수 있습니다.',
    qrPayload: 'VOUCHER:TICKET:SKY-55102:SKYTREE-350M',
  },
];

export const INITIAL_HOTEL_TAXI_CARD: HotelTaxiCardData = {
  nameJa: '新宿プリンスホテル',
  readingJa: 'しんじゅく プリンスホテル (Shinjuku Prince Hotel)',
  nameKo: '신주쿠 프린스 호텔',
  addressJa: '〒160-8487 東京都新宿区歌舞伎町1-30-1',
  addressKo: '도쿄도 신주쿠구 가부키초 1-30-1',
  phone: '+81-3-3205-1111',
  lat: 35.6951,
  lng: 139.7004,
};

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContactItem[] = [
  {
    id: 'sos-guide',
    label: '현장 가이드 (박지훈)',
    sublabel: '투어 인솔자 · 24시간 핫라인',
    phone: '+81-90-1234-5678',
    isUrgent: false,
  },
  {
    id: 'sos-embassy',
    label: '주일본 대한민국 대사관',
    sublabel: '도쿄 영사과 · 여권 분실/사건사고',
    phone: '+81-3-3452-7611',
    isUrgent: false,
  },
  {
    id: 'sos-police',
    label: '현지 경찰 긴급신고',
    sublabel: '분실·도난·범죄 신고 (일본 전역)',
    phone: '110',
    isUrgent: true,
  },
  {
    id: 'sos-ambulance',
    label: '현지 구급 · 화재신고',
    sublabel: '응급 환자 이송 · 화재 신고',
    phone: '119',
    isUrgent: true,
  },
];
