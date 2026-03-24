# backup-family 운영 매뉴얼

> **대상:** 서비스 운영 담당자
> **최종 업데이트:** 2026-03-24

---

## 1. 인증 관리

### 1-1. 인증 유효 기간

| 항목 | 값 |
|------|----|
| 유효 기간 | **3개월** |
| 기준 시점 | 관리자 인증 처리 시각 (`certified_at`) |
| 만료일 컬럼 | `test_results.cert_expiry` |
| 임박 기준 | 만료 **7일 이내** (어드민 대시보드 오렌지 표시) |

> 유효 기간을 변경하려면 `src/shared/lib/dateUtils.ts`의 `CERT_VALIDITY_MONTHS` 상수만 수정하면 됩니다.

### 1-2. 인증 처리 흐름

```
돌봄이 레벨 테스트 완료
  → cert_status: '미인증' (서류 미첨부)
  → cert_status: '검토중' (서류 첨부)

관리자 /admin 접속
  → 검토중 탭에서 서류 확인
  → 개별 인증완료 또는 일괄 인증완료 처리
    → cert_status: '인증완료'
    → cert_issued: 처리 시각
    → cert_expiry: 처리 시각 + 3개월

만료 도래 전 7일
  → 어드민 대시보드 '만료 임박' 배지 노출
  → 돌봄이에게 재테스트 안내 (현재 수동 운영)

만료 후
  → /profile/[testId] 접속 시 만료 화면 표시
  → 재테스트 버튼으로 이름·연락처·지역 자동 채워진 상태로 재응시
```

### 1-3. 인증 상태값

| 상태 | 설명 |
|------|------|
| `미인증` | 테스트 완료, 서류 미첨부 |
| `검토중` | 서류 첨부 완료, 관리자 검토 대기 |
| `인증완료` | 관리자 인증 처리 완료 |
| `반려` | 서류 미비 등으로 반려 |

### 1-4. 일괄 인증 처리

1. `/admin` 접속 → **검토중** 탭 선택
2. 체크박스로 대상 돌봄이 선택 (헤더 체크박스 = 전체 선택)
3. 액션바 **"일괄 인증완료"** 버튼 클릭
4. 처리 결과 토스트 확인 (`N건 성공 / N건 실패`)

> 일괄 처리는 `Promise.allSettled`로 병렬 실행됩니다. 일부 실패해도 나머지는 정상 처리됩니다.

---

## 2. 파트너 유입 추적

### 2-1. 파트너 등록

1. `/admin` → **파트너** 탭 접속
2. `+ 파트너 추가` 클릭 → 업체명·구분·메모 입력
3. 파트너 코드 자동 부여 (`BUF00001`, `BUF00002`, …)

### 2-2. 유입 링크 생성

파트너 행 클릭 → 우측 상세 패널 → **유입 링크 복사**

```
https://backup-family.vercel.app/?partner=BUF00001
```

파트너가 이 링크를 통해 돌봄이를 유입하면:
- 브라우저에 30일 쿠키 `buf_partner=BUF00001` 저장
- 테스트 완료 시 `test_results.partner_code = 'BUF00001'` 기록

### 2-3. 파트너별 통계 확인

파트너 패널 목록에서 **신청자 수** 컬럼으로 확인합니다.

---

## 3. 관리자 접근

### 3-1. 로그인

- URL: `/admin/login`
- 인증: Supabase Auth 이메일 + 비밀번호
- 세션: 브라우저 세션 쿠키 (`buf_admin_session`, 24시간)

### 3-2. 접근 보안 구조

- **1차 (서버):** `proxy.ts` — `buf_admin_session` 쿠키 없으면 `/admin/login` 리다이렉트
- **2차 (클라이언트):** Supabase Auth 세션 만료 시 자동 로그아웃 + 리다이렉트

---

## 4. 모니터링

### 4-1. 텔레그램 알림

| 알림 | 트리거 |
|------|--------|
| 신규 테스트 완료 | `/api/notify/result` |
| 보호자 연결 요청 | `/api/notify/contact` |

알림 실패 시에도 서비스 흐름에는 영향 없음 (fire-and-forget).

### 4-2. 에러 추적

- Sentry v9 통합 (`NEXT_PUBLIC_SENTRY_DSN`)
- Sentry 대시보드에서 런타임 에러 확인

---

## 6. 추천 장소 관리

### 6-1. 장소 등록 방법

**단건 등록:** `/admin` → 장소 관리 → `+ 장소 추가` 탭

**CSV 대량 등록:** `/admin` → 장소 관리 → `↑ CSV 가져오기` 탭
1. **템플릿 다운로드** 버튼으로 CSV 양식 확보
2. 엑셀에서 데이터 입력 후 CSV로 저장
3. 파일 선택 → 미리보기 확인 → **N건 일괄 등록** 클릭

### 6-2. CSV 형식

```
name,category,description,address,hours,closed_days,is_free,tags,image_url
```

| 컬럼 | 형식 | 예시 |
|------|------|------|
| `category` | 텍스트 | `도서관` \| `공원` \| `문화센터` \| `기타` |
| `is_free` | boolean | `true` 또는 `false` |
| `tags` | 파이프 구분 | `영유아\|무료\|평일추천` |
| `image_url` | URL 또는 빈 값 | `https://...` |

### 6-3. 장소 노출 규칙

- `is_active = true` 인 장소만 `/places` 공개 페이지에 노출됩니다.
- 어드민 목록에서 토글로 즉시 활성/비활성 전환 가능합니다.

### 6-4. 지도 연동

- "지도 보기" 버튼은 카카오맵 검색 딥링크로 연결됩니다 (API 키 불필요).
- 링크 형식: `https://map.kakao.com/link/search/{장소명+주소}`

---

## 5. 주요 설정값 변경 위치

| 설정 | 파일 | 변수명 |
|------|------|--------|
| 인증 유효 기간 | `src/shared/lib/dateUtils.ts` | `CERT_VALIDITY_MONTHS` |
| 만료 임박 기준 (일) | `src/shared/lib/dateUtils.ts` | `isExpiringSoon` 함수 내 `<= 7` |
| 페이지당 표시 건수 | `src/features/admin/model/usePagination.ts` | `PAGE_SIZE` |
| 파트너 쿠키 유효 기간 | `src/shared/lib/partnerCookie.ts` | `max-age` (초 단위) |
| 관리자 세션 유효 기간 | `src/app/api/admin/session/route.ts` | `maxAge` (초 단위) |
