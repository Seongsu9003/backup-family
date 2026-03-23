<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key differences in Next.js 16 App Router:
- `params` is a **Promise** — always `await params` before accessing properties
- `generateMetadata` can be async; wrap external API calls in try-catch for crawler safety
- Server Components by default — add `'use client'` only when browser APIs are needed
- `middleware.ts` is deprecated → use `proxy.ts` (same export signature, just renamed)
<!-- END:nextjs-agent-rules -->

---

# BUF 프로젝트 에이전트 가이드

## 아키텍처 원칙

이 프로젝트는 **FSD(Feature-Sliced Design)** 를 사용합니다.

```
features/<name>/
  model/   ← 상태, 훅, 타입, 비즈니스 로직
  ui/      ← React 컴포넌트
  index.ts ← 공개 API (re-export만)
```

- feature 간 직접 import 금지. 반드시 `index.ts`를 통해서만 참조합니다.
- 공통 타입은 `src/shared/types/index.ts`, 공통 유틸은 `src/shared/lib/`에 위치합니다.
- 새 파일 작성 전 항상 `shared/lib/`와 기존 feature의 `index.ts`를 먼저 확인하세요.

## 데이터 접근 패턴

- **읽기:** TanStack Query `useQuery` 사용
- **쓰기:** TanStack Query `useMutation` 사용
- **Supabase 클라이언트:** `src/shared/lib/supabase.ts` 싱글턴만 사용 (직접 `createClient` 호출 금지)
- DB 컬럼 타입은 `src/shared/types/index.ts`의 `TestResult` 인터페이스를 기준으로 합니다.

## 알림 패턴 (텔레그램)

- **서버 전용 유틸:** `src/shared/lib/telegramNotify.ts`
  - `notifyNewResult()` — 돌봄이 신규 신청 시 (`useSaveResult` → `/api/notify/result`)
  - `notifyContactRequest()` — 보호자 연결 요청 시 (`/api/notify/contact`)
- 알림 실패는 항상 silent fail (저장/요청 흐름에 영향 없음)
- API Route에서만 호출. 클라이언트 컴포넌트에서 직접 호출 금지.

## 코드 작성 규칙

- **타입:** `any` 절대 금지. 불확실한 타입은 `unknown` 후 타입 가드를 작성합니다.
- **ID 생성:** `Math.random()` 금지 → `crypto.randomUUID()` 사용
- **URL 상수:** `BASE_URL` 등 공통 상수는 `src/shared/lib/constants.ts`에서 import
- **스타일:** Tailwind CSS 클래스만 사용. 인라인 `style={{}}` 는 동적 색상 등 불가피한 경우에만 허용
- **에러 처리:** 모든 Supabase 호출은 `try-catch` 또는 TanStack Query의 `onError` 처리
- **이름 마스킹:** `src/shared/lib/maskName.ts`의 `maskName()` 사용. 별도 구현 금지.

## 테스트

- 테스트 프레임워크: **Vitest**
- 비즈니스 로직 함수(`calcScores`, `getLevel`, `calcCareType`, `buildResult` 등)는 반드시 테스트를 작성합니다.
- 테스트 파일 위치: `src/features/<name>/model/__tests__/<filename>.test.ts`
- 텔레그램 알림 테스트: `src/shared/lib/__tests__/telegramNotify.test.ts` 참고 (`vi.hoisted` fetch mock 패턴)

## 주의 사항

- `profile/[testId]/page.tsx`의 `generateMetadata`는 Supabase를 호출합니다. try-catch로 감싸 조회 실패 시 기본값 fallback이 적용됩니다. (크롤러 빌드 안전)
- 관리자 인증은 Supabase Auth 기반이지만 `/admin` URL은 클라이언트 사이드 가드만 존재합니다. 서버사이드 보호가 필요하면 `proxy.ts`에 세션 검증을 추가하세요.
- `AnonymizedCaregiver._testId`는 화면에 노출하지 마세요. 관리자 텔레그램 알림용 내부 필드입니다.
