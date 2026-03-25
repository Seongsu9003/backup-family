# 프로젝트 페르소나 및 가이드라인

## 📌 프로젝트 개요
- **이름:** backup-family (BUF)
- **목적:** 돌봄인력 레벨 테스트 · 인증 · 구인 DB 구축
- **배포:** https://backup-family.vercel.app
- **현재 버전:** v0.4.0 (2026-03-25)

### 주요 진입점
| 경로 | 역할 |
|------|------|
| `src/app/page.tsx` | 홈 랜딩 (Editorial 히어로 + Bento Grid) |
| `src/app/test/page.tsx` | 돌봄이 레벨 테스트 |
| `src/app/search/page.tsx` | 보호자용 돌봄이 조회 |
| `src/app/admin/page.tsx` | 관리자 인증 관리 |
| `src/app/places/page.tsx` | 추천 장소 조회 |
| `src/app/profile/page.tsx` | 돌봄이 프로필 |

### FSD 레이어 구조
```
src/
├── app/                     — Next.js App Router (라우트·레이아웃·API)
│   └── api/                 — API Route Handlers (service_role 키 필요 시)
├── features/
│   ├── home/                — 홈 랜딩 기능
│   ├── level-test/          — 레벨 테스트 (model / ui)
│   ├── admin/               — 관리자 기능
│   ├── search/              — 돌봄이 조회 (model / ui)
│   ├── places/              — 추천 장소 (model / ui)
│   └── profile/             — 돌봄이 프로필
└── shared/                  — 공통 타입, lib, ui
```

- **데이터 스토어:** Supabase (PostgreSQL) — `test_results`, `places` 테이블
- **기술 스택:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Supabase JS v2, TanStack Query v5, Pretendard Variable 폰트

---

## 🎨 디자인 시스템 — Supanova Warm Editorial

> **반드시 준수.** 새 컴포넌트 작성 시 아래 패턴을 기본으로 사용합니다.

### 컬러 토큰
| 용도 | 값 |
|------|-----|
| 배경 (warm white) | `#F7F5F2` |
| 카드 배경 | `#FFFFFF` |
| 테두리 | `#E8E4DF` |
| 텍스트 1차 | `#1A1714` |
| 텍스트 2차 | `#5C5852` |
| 텍스트 3차 (muted) | `#9C9890` |
| 포인트 (coral) | `#D85A3A` |
| 포인트 hover | `#C04828` |
| 포인트 헤더 | `#C04830` |
| 민트 (장소) | `#3A9E94` |
| 블루 (인증) | `#1565C0` |

### Double-Bezel 카드 패턴
```tsx
<div className="relative bg-white rounded-2xl border border-[#E8E4DF] p-5 overflow-hidden">
  {/* 내부 베젤 — 항상 포함 */}
  <div className="absolute inset-[5px] rounded-[14px] border border-black/[0.04] pointer-events-none" />
  {/* 콘텐츠는 relative + z-index 필요 */}
  <div className="relative" style={{ zIndex: 1 }}>...</div>
</div>
```

### Spring 애니메이션
```tsx
// hover 인터랙션에 사용
className="transition-[transform,box-shadow] duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:shadow-lg"
```

### Sticky 헤더 (warm nav)
```tsx
<header className="sticky top-0 z-20 bg-[#F7F5F2]/95 backdrop-blur-sm border-b border-[#E8E4DF] px-6 h-14 flex items-center justify-between">
```

### Typography
- **폰트:** Pretendard Variable (`pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css`)
- **Headline:** `font-black tracking-[-0.04em]`, `clamp(26px, 3.5vw, 38px)`
- **Body:** `text-[15px] leading-[1.7]`
- **Label:** `text-[11px] font-bold uppercase tracking-[.08em] text-[#9C9890]`
- **한국어 줄바꿈:** `style={{ wordBreak: 'keep-all' }}` 항상 적용

---

## 📱 모바일 반응형 원칙

### iOS 줌인 방지 (전역 적용 완료)
```css
/* globals.css — 이미 적용됨, 중복 추가 금지 */
input, select, textarea {
  font-size: max(16px, 1em);
}
```

### 모달 — 바텀시트 패턴
모바일에서는 하단 슬라이드업, 데스크톱에서는 중앙 다이얼로그.
```tsx
{/* 오버레이 */}
<div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6">
  {/* 모달 패널 */}
  <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-[460px] shadow-2xl overflow-hidden max-h-[92svh] flex flex-col">
    {/* 헤더: shrink-0 */}
    <div className="shrink-0">...</div>
    {/* 스크롤 바디: overflow-y-auto flex-1 + safe-area */}
    <div className="overflow-y-auto flex-1 pb-[env(safe-area-inset-bottom,20px)]">...</div>
  </div>
</div>
```

### 터치 타겟
- 모든 버튼/아이콘 버튼: 최소 `w-11 h-11` (44px)
- 닫기 버튼 예시: `className="w-11 h-11 rounded-full flex items-center justify-center"`

### 필터 바 그리드 (모바일 2열)
```tsx
{/* 컨테이너 */}
<div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-3.5 items-end">
  {/* FilterGroup */}
  <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[160px]">...</div>
  {/* 카운트 표시: grid에서 ml-auto 미작동 → col-span-2 사용 */}
  <span className="col-span-2 sm:col-auto ml-auto text-right sm:text-left">...</span>
</div>
```

---

## 🛠 코딩 스타일 및 원칙
- **언어:** 모든 주석과 문서화는 한국어로 진행합니다.
- **아키텍처:** FSD(Feature-Sliced Design) 패턴을 준수합니다.
- **컴포넌트:** 함수형 컴포넌트와 Hooks를 사용합니다.
- **상태 관리:** 클라이언트 상태는 `useReducer` (복잡 흐름) 또는 `useState`, 서버 상태는 `TanStack Query`를 사용합니다.

## 📋 작업 규칙 (Workflow)
1. **코드 작성 전:** 복잡한 로직은 먼저 논리적 구조(의사코드)를 제안하고 내 승인을 받으세요.
2. **에러 처리:** 모든 API 호출에는 `try-catch` 블록과 사용자 친화적인 에러 메시지를 포함합니다.
3. **테스트:** 비즈니스 로직이 포함된 유틸리티 함수에는 `Vitest` 기반의 테스트 코드를 함께 작성합니다.
4. **새 컴포넌트:** Supanova 디자인 토큰·패턴을 기본으로 적용하고, `buf-app/.skills/SUPANOVA.md` 참조.

## 🚫 금지 사항
- 중복된 유틸리티 함수를 만들지 마세요. (`/utils` 폴더 확인 필수)
- `any` 타입을 절대 사용하지 마세요.
- 인라인 스타일링 대신 Tailwind 클래스를 사용하세요. (단, `wordBreak: 'keep-all'`은 Tailwind 미지원으로 인라인 허용)
- `font-size < 16px` input 요소 생성 금지 (iOS 줌 트리거).
- 모달에서 `overflow: hidden` 단독 사용 금지 — 바텀시트 패턴(`max-h-[92svh] flex flex-col + overflow-y-auto flex-1`) 사용.

## 💬 소통 스타일
- 간결하고 기술적인 톤을 유지하세요.
- 코드를 수정할 때는 수정된 부분과 그 이유를 요약해서 설명하세요.

---

## 🏷 버전 히스토리
| 태그 | 커밋 | 내용 |
|------|------|------|
| v0.4.0 | f356737 | Supanova 리디자인 + 모바일 반응형 완성 (iOS 줌 방지, 바텀시트 모달, 필터 그리드) |
| v0.3.0 | f2a3b04 | Supanova Warm Editorial 전면 리디자인 (홈·검색·카드·장소·레벨테스트) |
| v0.2.x | ~f3b843f | 장소 기능, 인증 유효기간, 하우스클리닝 |
