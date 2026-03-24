# backup-family DB 스키마 정의서

> **규칙:** 테이블이 추가되거나 컬럼이 변경될 때 반드시 이 파일을 함께 업데이트합니다.
> **DB:** Supabase (PostgreSQL)
> **마지막 업데이트:** 2026-03-24

---

## 테이블 목록

| 테이블 | 역할 |
|--------|------|
| [`test_results`](#1-test_results) | 돌봄이 레벨 테스트 결과 저장 (메인) |
| [`partners`](#2-partners) | 파트너 업체 코드 및 유입 채널 관리 |

---

## 1. `test_results`

돌봄이가 레벨 테스트를 완료하면 생성됩니다.
`raw_data` 컬럼에 `TestResult` 전체 구조가 JSONB로 저장되며,
나머지 컬럼은 Supabase 필터·집계를 위해 중복 저장됩니다.

### 컬럼

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `test_id` | text | NO | — | 테스트 고유 ID (PK 역할, upsert 기준) |
| `name` | text | NO | — | 응시자 이름 (평문, 검색용) |
| `phone` | text | NO | — | 연락처 (숫자만, 하이픈 제거) |
| `score_total` | int | NO | — | 총점 (0~100) |
| `score_survey` | int | NO | — | 설문 점수 |
| `score_scenario` | int | NO | — | 시나리오 점수 |
| `level` | jsonb | YES | NULL | `LevelInfo { num, label }` |
| `care_type` | jsonb | YES | NULL | `CareType { code, label, fullLabel, color }` |
| `cert_status` | text | NO | `'미인증'` | `미인증` \| `검토중` \| `인증완료` \| `반려` |
| `cert_issued` | timestamptz | YES | NULL | 인증 완료 일시 |
| `cert_expiry` | timestamptz | YES | NULL | 인증 만료 일시 |
| `job_seeking` | text | NO | `''` | `적극적으로 구직 중` \| `관심은 있지만 탐색 중` \| `구직 의사 없음` |
| `preferred_region` | text | NO | `''` | 선호 지역 (콤마 구분, e.g. `서울,경기`) |
| `admin_memo` | text | NO | `''` | 관리자 메모 |
| `attachment` | text | NO | `''` | 첨부 서류 URL 목록 (세미콜론 구분) |
| `raw_answers` | jsonb | YES | NULL | `QuestionLog[]` — 문항별 응답 로그 |
| `raw_data` | jsonb | YES | NULL | `TestResult` 전체 구조 (정규화 원본) |
| `partner_code` | text | YES | NULL | 파트너 유입 코드 (e.g. `BUF00001`) |
| `created_at` | timestamptz | NO | `now()` | 테스트 완료 일시 |

### 인덱스 / 제약

| 이름 | 대상 | 비고 |
|------|------|------|
| `test_results_pkey` | `test_id` | Supabase 기본 PK |
| `idx_test_results_partner_code` | `partner_code` | 파트너별 집계 조회용 |

### 참고

- `raw_data.partner_code` 와 컬럼 `partner_code` 를 동기화합니다 (`useSaveResult.ts`).
- `name` / `phone` 컬럼은 클라이언트 결과 조회(`useLookupResult`)의 필터 대상입니다.
- 어드민 일괄 인증(`useBulkSetStatus`) 시 `cert_status`, `cert_issued`, `raw_data`를 업데이트합니다.

---

## 2. `partners`

제휴업체·가맹점 등 파트너 유입 채널을 관리합니다.
코드는 `BUF00001` 형식으로 등록 순 자동 부여됩니다.
사업자 정보(`biz_no`, `phone`, `website`, `address`)는 DB에서 직접 관리하며 UI에는 노출하지 않습니다.

### 컬럼

| 컬럼 | 타입 | Nullable | 기본값 | 설명 |
|------|------|----------|--------|------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `seq` | int | NO | — | 등록 순번 (코드 생성 기준, UNIQUE) |
| `code` | text | NO | — | 파트너 코드 `BUF00001` (UNIQUE) |
| `name` | text | NO | — | 업체명 |
| `biz_no` | text | NO | `''` | 사업자등록번호 (000-00-00000) |
| `phone` | text | NO | `''` | 대표 전화번호 |
| `website` | text | NO | `''` | 홈페이지 URL |
| `address` | text | NO | `''` | 사업장 주소 |
| `type` | text | NO | `'agency'` | `agency` \| `franchise` \| `direct` |
| `is_active` | boolean | NO | `true` | 활성 여부 (비활성 시 통계에서만 제외) |
| `memo` | text | NO | `''` | 관리자 메모 |
| `created_at` | timestamptz | NO | `now()` | 등록 일시 |

### 인덱스 / 제약

| 이름 | 대상 | 비고 |
|------|------|------|
| `partners_pkey` | `id` | PK |
| `partners_seq_key` | `seq` | UNIQUE |
| `partners_code_key` | `code` | UNIQUE |

### 코드 생성 규칙

```
code = 'BUF' + seq.toString().padStart(5, '0')
예)  seq=1  →  BUF00001
     seq=42 →  BUF00042
```

### 유입 추적 흐름

```
사용자 접속 /?partner=BUF00001
  → 30일 쿠키 buf_partner 저장 (partnerCookie.ts)
  → 테스트 완료 시 partner_code 컬럼에 기록 (useSaveResult.ts)
  → 어드민 파트너 패널에서 코드별 신청자 수 집계 (usePartnerStats)
```

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-03-24 | 최초 작성 — `test_results`, `partners` 테이블 정의 |
| 2026-03-24 | `test_results.partner_code` 컬럼 추가 (파트너 유입 추적) |
