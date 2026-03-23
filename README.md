# backup-family (BUF)

> 아이돌봄이 레벨 인증 플랫폼 — 돌봄인력 레벨 테스트 · 인증 · 구인 DB

**배포:** https://backup-family.vercel.app

---

## 주요 기능

- **레벨 테스트** — 설문(SV) + 시나리오(SC) 문항으로 돌봄 역량을 Lv.1~5로 진단
- **인증 시스템** — 자격증·교육이수증 서류 첨부 후 관리자 검토 → 인증 뱃지 발급
- **공개 프로필** — `/profile/[testId]` URL로 인증 결과 공유 (카카오톡 OG 지원)
- **보호자 검색** — 레벨·인증 여부·선호 지역 필터로 돌봄이 검색
- **관리자 대시보드** — 인증 상태 관리, CSV 내보내기

---

## 로컬 개발 환경 설정

### 1. 환경변수 설정

`.env.example`을 복사하여 `.env.local`을 생성하고 값을 채웁니다.

```bash
cp .env.example .env.local
```

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 공개 키 |
| `NEXT_PUBLIC_KAKAO_APP_KEY` | 카카오 JS SDK 앱 키 |

### 2. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인합니다.

---

## 프로젝트 구조

```
src/
├── app/                        # Next.js App Router 페이지
│   ├── page.tsx                # 메인 — 돌봄이 레벨 테스트
│   ├── admin/page.tsx          # 관리자 인증 관리
│   ├── search/page.tsx         # 보호자용 돌봄이 검색
│   └── profile/[testId]/       # 공개 프로필 (OG 공유)
├── features/                   # FSD 기능 슬라이스
│   ├── level-test/             # 레벨 테스트 (model + ui)
│   ├── admin/                  # 관리자 기능
│   ├── profile/                # 프로필 페이지
│   └── search/                 # 검색 기능
└── shared/                     # 공통 타입, lib, ui
    ├── lib/supabase.ts          # Supabase 클라이언트 싱글턴
    ├── types/index.ts           # 전역 타입 정의
    └── ui/ErrorBoundary.tsx
```

---

## 기술 스택

- **프레임워크:** Next.js 15 (App Router)
- **언어:** TypeScript
- **스타일:** Tailwind CSS
- **DB:** Supabase (PostgreSQL)
- **서버 상태:** TanStack Query v5
- **테스트:** Vitest

---

## 스크립트

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run test      # Vitest 테스트 실행
npm run lint      # ESLint 검사
```
