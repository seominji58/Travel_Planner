# 도쿄 2박 3일 여행일정관리 웹 앱 — UI 디자인 시스템 & 멀티 에이전트 협업 계획서

## 1. Stitch MCP 프로젝트 및 산출물 매핑

- **Stitch 프로젝트**: `도쿄 2박 3일 여행일정관리 웹 앱`
- **Project ID**: `15691898742563339938` (`projects/15691898742563339938`)
- **Design System**: `Clean Daylight Travel` (`assets/12067909128721539429`)
- **Stitch 웹 확인**: https://stitch.withgoogle.com

| 담당 에이전트 | 화면명 | Screen ID | 주요 포함 UI |
| :--- | :--- | :--- | :--- |
| **Agent A** | 도쿄 2박 3일 투어 일정 관리 | `ddeec70a036949bdb26e53dc56b3c209` | 상단 헤더(초기화), 고정 공지 슬롯, Day 1~3 탭, `+ 일정 추가`, 시간순 타임라인(카테고리·상태 토글·수정/삭제), 하단 3탭 네비게이션 |
| **Agent A** | 새 일정 추가 모달 (도쿄 투어) | `5861337ddebf4df88adf1d3c1388a3f3` | 딤 백드롭, Day 뱃지, 시간·카테고리 4종·장소명·메모·진행 상태 세그먼트, 취소/일정 저장 CTA |
| **Agent B** | 도쿄 투어 공지 및 체크리스트 | `763f89b10db5431fb118205574ad2aef` | 상단 고정 앰버 공지 배너(`수정`), 완료율(%) 프로그레스 바 카드, 필터 칩(`전체`/`준비물`/`인원 출석`), 빠른 추가 입력바, 체크리스트 카드 |
| **Agent B** | 가이드 긴급 공지 수정 모달 | `2f35157456574120ad785b35cd9319c4` | 실시간 앰버 배너 미리보기, 자주 쓰는 템플릿 칩 3종, 120자 카운터 텍스트에어리어, 공지 저장 CTA |
| **Agent C** | 도쿄 투어 바우처 및 긴급 SOS | `ef5f262bc4d04262a324f6569ec5d09b` | 디지털 바우처 티켓 카드 3종(항공·호텔·입장권), 고대비 일본어/한국어 현지어 택시 카드(`크게 보기`), 현지 비상연락처(가이드·대사관·110·119) |
| **Agent C** | 신주쿠 프린스 호텔 바우처 QR 모달 | `92adcecaaed644ff89c3ed4850f671d7` | 딤 백드롭, 호텔 배지/타이틀/닫기 버튼, 대형 고대비 QR 코드, 예약번호(`HTL-2026-991`) 복사, 체크인 안내, 풀위드 닫기 버튼 |

---

## 2. 공통 디자인 토큰 (`src/styles/tokens.css` 기준)

```css
:root {
  /* Brand & Accent */
  --color-primary: #1D6FE2;
  --color-primary-hover: #1558B8;
  --color-primary-soft: #EBF3FE;

  /* Pinned Notice Banner */
  --color-notice-bg: #FEF3C7;
  --color-notice-border: #FCD34D;
  --color-notice-text: #92400E;
  --color-notice-accent: #D97706;

  /* Surfaces & Borders */
  --color-bg-outer: #EEF2F7;
  --color-bg-app: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;

  /* Typography */
  --color-text-main: #0F172A;
  --color-text-sub: #475569;
  --color-text-muted: #94A3B8;

  /* Status */
  --color-success: #10B981;
  --color-success-soft: #ECFDF5;
  --color-danger: #EF4444;
  --color-danger-soft: #FEF2F2;
  --color-upcoming: #64748B;
  --color-upcoming-soft: #F1F5F9;

  /* Category Badges */
  --color-cat-transport: #0284C7;
  --color-cat-transport-bg: #E0F2FE;
  --color-cat-sightseeing: #7C3AED;
  --color-cat-sightseeing-bg: #F3E8FF;
  --color-cat-dining: #EA580C;
  --color-cat-dining-bg: #FFEDD5;
  --color-cat-hotel: #0D9488;
  --color-cat-hotel-bg: #CCFBF1;

  /* Radius & Sizing */
  --radius-card: 16px;
  --radius-control: 12px;
  --radius-modal: 20px;
  --radius-pill: 9999px;
  --app-max-width: 430px;
}
```

---

## 3. 멀티 에이전트 분배 및 충돌 방지 계약

### Phase 0 (선행 고정 — 읽기 전용 공통 영역)
- `src/styles/tokens.css`
- `src/types/travel.ts`
- `src/data/mockData.ts` (도쿄 2박 3일 기본 일정, 공지 1건, 체크리스트 5건, 바우처 3건, 호텔 택시 카드, 비상연락처)
- `src/utils/storage.ts` (`LocalStorage` 유틸 + `resetAllData()`)

### Phase 1 (병렬 코딩 — 배타적 파일 소유권)

| 에이전트 | 독점 소유 폴더/파일 | LocalStorage 키 | 외부 노출 컴포넌트 인터페이스 |
| :--- | :--- | :--- | :--- |
| **Agent A** | `src/components/layout/*`<br>`src/features/itinerary/*`<br>`src/App.tsx` | `tp_itinerary_v1` | `AppShell`, `BottomNav`, `ItineraryPage({ resetKey })` |
| **Agent B** | `src/features/notice-checklist/*` | `tp_notice_v1`, `tp_checklist_v1` | `PinnedNoticeBanner({ resetKey })`, `ChecklistPage({ resetKey })` |
| **Agent C** | `src/features/voucher-sos/*` | `tp_vouchers_v1` | `VoucherSosPage({ resetKey })` |

### 전역 초기화 동기화 규칙
- 헤더의 `[초기화]` 버튼(Agent A) 클릭 → 확인 후 `resetAllData()` 실행 및 `resetKey` 상태 `+1` 증가.
- Agent A, B, C 각 모듈은 `useEffect([resetKey])`로 초기 목업 데이터를 즉시 재로드하여 상호 결합 없이 동기화.
