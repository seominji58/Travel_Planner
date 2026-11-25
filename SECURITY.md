# 보안 및 입력 유효성 검증 가이드 (SECURITY.md)

본 문서는 **도쿄 2박 3일 여행일정관리 웹 앱 (Micro MVP)**에 적용된 클라이언트 보안 통제 및 입력·스토리지 유효성 검증 기준을 정리합니다.

## 1. DOM XSS 방어
- **React 자동 이스케이프 + Leaflet DOM API 전환**: `DayRouteMap.tsx` 및 `TaxiHotelCard.tsx`의 지도 팝업 및 커스텀 마커에서 HTML 문자열 보간을 제거하고 `document.createElement` + `textContent` 기반 DOM 노드 생성으로 통일했습니다.
- **프로토콜 인젝션 차단**:
  - 모든 외부 지도 링크는 `buildSafeGoogleMapsUrl()`을 통해 `https://www.google.com/maps/search/?api=1&query=...` 스킴과 URL 인코딩을 강제하고 `rel="noopener noreferrer"`를 적용합니다.
  - 전화 연결 링크는 `sanitizeTelHref()`로 숫자와 선두 `+` 기호 외 문자를 제거합니다.

## 2. Content Security Policy (CSP) & Referrer 정책
- `vite.config.ts`의 HTML 보안 메타 플러그인을 통해 다음 정책을 자동 주입합니다:
  - `referrer`: `no-referrer`
  - **프로덕션 빌드 CSP**: `default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'` (인라인 스크립트 차단, 지도 타일은 `https://*.tile.openstreetmap.org`만 허용)

## 3. LocalStorage 역직렬화 무결성 및 프로토타입 오염 방어
- `src/utils/storage.ts`:
  - `JSON.parse` reviver에서 `__proto__`, `constructor`, `prototype` 키를 제거합니다.
  - 페이로드 크기 상한(`100KB`)을 두어 스토리지 과부하를 방지합니다.
- `src/utils/validation.ts`:
  - `sanitizeStoredItinerary`, `sanitizeStoredNotice`, `sanitizeStoredChecklist`, `sanitizeStoredVouchers` 런타임 스키마 검증기를 통해 `LocalStorage`가 손상·변조되더라도 유효한 Enum(`DayNumber`, `ScheduleCategory`, `ScheduleStatus`, `ChecklistCategory`, `VoucherType`), 시간 형식(`HH:mm`), 좌표 범위(`lat ∈ [-90, 90]`, `lng ∈ [-180, 180]`), 항목 수 상한을 만족하는 데이터만 안전하게 복원합니다.

## 4. 사용자 입력 유효성 검증 규칙
| 모듈 | 검증 항목 | 기준 |
| :--- | :--- | :--- |
| **일정 추가/수정** | 시간 / 장소명 / 주소 / 메모 / 좌표 / 총 개수 | `HH:mm` 24시간 형식, 장소명 필수(최대 60자), 주소 최대 120자, 메모 최대 200자, 위도(-90~90)·경도(-180~180) 쌍 입력 검증, 제어문자 제거, 최대 100건 |
| **상단 고정 공지** | 내용 / 길이 | 제어문자 제거, 공백 전용 입력 차단, 최대 120자 |
| **체크리스트** | 내용 / 중복 / 총 개수 | 제어문자 제거, 공백 전용 입력 차단, 최대 80자, 동일 카테고리 중복 등록 차단, 최대 100건 |

## 5. 저장소 시크릿 관리 주의사항
- `.gitignore`로 `.env`, `.env.*`, `*.local` 파일이 커밋되지 않도록 차단합니다.
- 본 앱은 No-Backend 정적 웹 앱이므로 API 키나 인증 토큰을 소스 코드 또는 `LocalStorage`에 저장하지 않습니다.
