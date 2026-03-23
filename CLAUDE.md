# 프로젝트 페르소나 및 가이드라인

## 📌 프로젝트 개요
- **이름:** backup-family (BUF)
- **목적:** 돌봄인력 레벨 테스트 · 인증 · 구인 DB 구축
- **배포:** https://backup-family.vercel.app
- **주요 진입점:**
  - `src/app/page.tsx` — 돌봄이 레벨 테스트 (메인)
  - `src/app/admin/page.tsx` — 관리자 인증 관리 페이지
  - `src/app/search/page.tsx` — 보호자용 돌봄이 조회 페이지
  - `src/app/profile/[testId]/page.tsx` — 공개 돌봄이 프로필 (OG 공유용)
- **FSD 레이어 구조:**
  - `src/features/level-test/` — 레벨 테스트 기능 (model / ui)
  - `src/features/admin/` — 관리자 기능
  - `src/features/profile/` — 공개 프로필 페이지
  - `src/features/search/` — 보호자용 돌봄이 검색
  - `src/shared/` — 공통 타입, lib, ui
- **데이터 스토어:** Supabase (PostgreSQL) — `test_results` 테이블
- **기술 스택:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase JS v2, TanStack Query v5

## 🗂 주요 데이터 흐름
1. 응시자가 레벨 테스트(설문 + 시나리오) 응시 → `calcScores` / `getLevel` / `calcCareType` 로 결과 산출
2. 이름·연락처 입력 후 `useSaveResult` → Supabase `test_results` upsert (test_id 기준)
3. 저장 후 `/profile/[testId]` 공개 프로필 URL 생성 → 카카오톡 공유 / 링크 복사
4. 보호자는 `/search`에서 레벨·인증 여부·지역 필터로 돌봄이 검색
5. 관리자는 `/admin`에서 인증 상태(미인증 → 검토중 → 인증완료) 관리

## 🛠 코딩 스타일 및 원칙
- **언어:** 모든 주석과 문서화는 한국어로 진행합니다.
- **아키텍처:** FSD(Feature-Sliced Design) 패턴을 준수합니다.
- **컴포넌트:** 함수형 컴포넌트와 Hooks를 사용합니다.
- **상태 관리:** 클라이언트 상태는 `useReducer` (복잡 흐름) 또는 `useState`, 서버 상태는 `TanStack Query`를 사용합니다.
- **스타일링:** Tailwind CSS 클래스만 사용합니다. 인라인 스타일 금지.
- **타입:** `any` 타입 사용 금지. 모든 타입은 `src/shared/types/index.ts` 또는 feature별 types.ts에 정의합니다.

## 📋 작업 규칙 (Workflow)

> **⚠️ 모든 개발 작업은 반드시 아래 순서를 따릅니다.**

1. **계획 먼저:** 구현 전에 변경 범위·파일·로직 구조를 설명하고 승인을 받습니다.
2. **테스트 코드 작성 → 컨펌:** 구현 전에 테스트 코드를 먼저 작성하여 공유하고, 승인 후 본 구현을 진행합니다.
3. **구현:** 승인된 계획과 테스트를 기반으로 코드를 작성합니다.
4. **에러 처리:** 모든 API 호출에는 `try-catch` 블록과 사용자 친화적인 에러 메시지를 포함합니다.
5. **상수:** `BASE_URL`, 환경변수 등 반복 사용되는 값은 `src/shared/lib/constants.ts`에서 관리합니다.

## 🚫 금지 사항
- 중복된 유틸리티 함수를 만들지 마세요.
- `any` 타입을 절대 사용하지 마세요.
- 인라인 스타일링 대신 Tailwind 클래스를 사용하세요.
- `Math.random()` 으로 ID를 생성하지 마세요. `crypto.randomUUID()`를 사용하세요.

## 🔑 환경변수
| 변수명 | 용도 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 공개 키 |
| `NEXT_PUBLIC_KAKAO_APP_KEY` | 카카오 JS SDK 앱 키 |

## 🐛 알려진 기술 부채
- ~~**[SEC-01]** 관리자 인증이 클라이언트 사이드 전용 — Supabase Auth + RLS 설계 필요~~ → ✅ 해결
- ~~**[SEC-02]** `useLookupResult` 전체 이름 스캔 후 클라이언트 필터~~ → ✅ 해결
- ~~**[BUG-01]** `isUpdate` 시 `jobSeeking`/`selectedRegions` 미복원~~ → ✅ 해결
- ~~**[CODE-01]** `BASE_URL` 여러 파일 하드코딩~~ → ✅ 해결
- ~~**[TEST-01]** `buildResult`, `quizReducer` 테스트 미작성~~ → ✅ 해결

## 💬 소통 스타일
- 간결하고 기술적인 톤을 유지하세요.
- 코드를 수정할 때는 수정된 부분과 그 이유를 요약해서 설명하세요.
