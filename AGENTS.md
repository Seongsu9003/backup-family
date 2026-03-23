<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key differences in Next.js 15 App Router:
- `params` is a **Promise** — always `await params` before accessing properties
- `generateMetadata` can be async; avoid external API calls inside it for crawlers
- Server Components by default — add `'use client'` only when browser APIs are needed
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

## 코드 작성 규칙

- **타입:** `any` 절대 금지. 불확실한 타입은 `unknown` 후 타입 가드를 작성합니다.
- **ID 생성:** `Math.random()` 금지 → `crypto.randomUUID()` 사용
- **URL 상수:** `BASE_URL` 등 공통 상수는 `src/shared/lib/constants.ts`에서 import
- **스타일:** Tailwind CSS 클래스만 사용. 인라인 `style={{}}` 금지
- **에러 처리:** 모든 Supabase 호출은 `try-catch` 또는 TanStack Query의 `onError` 처리

## 테스트

- 테스트 프레임워크: **Vitest**
- 비즈니스 로직 함수(`calcScores`, `getLevel`, `calcCareType`, `buildResult` 등)는 반드시 테스트를 작성합니다.
- 테스트 파일 위치: `src/features/<name>/model/__tests__/<filename>.test.ts`

## 주의 사항

- `profile/[testId]/page.tsx`의 `generateMetadata`는 Supabase를 호출하지 않습니다. (Kakao 크롤러 타이밍 이슈 방지)
- 관리자 인증은 현재 클라이언트 사이드 전용입니다. 보안 관련 코드를 추가할 때는 반드시 확인 후 작업합니다.
