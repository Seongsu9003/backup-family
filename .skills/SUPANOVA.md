# Supanova Design Skill — backup-family 전용

> 이 문서는 backup-family 프로젝트의 페이지 디자인 시 반드시 참조해야 하는
> Supanova 디자인 시스템 원칙과 구현 패턴을 정리한 스킬 가이드입니다.

---

## 아키타입: Warm Editorial (따뜻한 편집 감성)

backup-family에 적용하는 아키타입. 신뢰감·따뜻함·전문성을 동시에 표현.

| 특성 | 값 |
|------|-----|
| 배경 팔레트 | `#F7F5F2` (warm off-white) |
| 서피스 | `#FFFFFF` |
| 잉크 1 (헤딩) | `#1A1714` |
| 잉크 2 (본문) | `#5C5852` |
| 잉크 3 (보조) | `#9C9890` |
| 보더 | `#E8E4DF` |
| 포인트 (orange) | `#D85A3A` |
| 포인트 (blue) | `#1565C0` |
| 포인트 (green) | `#2E7D32` |

---

## 폰트 규칙 (MANDATORY)

```css
/* ✅ 반드시 사용 */
font-family: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif;
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';

/* ❌ 절대 사용 금지 */
/* Noto Sans KR — 금지 */
/* @fontsource-variable/noto-sans-kr — 금지 */
```

헤딩 타이포 시스템:
- H1: `font-black` (900) / `tracking-[-0.04em]` / `leading-[1.2]`
- H2(카드): `font-black` (900) / `tracking-[-0.03em]` / `leading-[1.25]`
- 본문: `text-[15.5px]` / `leading-[1.75]` / `text-[#5C5852]`
- 소제목/배지: `font-bold` / `tracking-[.04em]` / 11-13px

---

## 한국어 텍스트 최적화 (MANDATORY)

모든 한국어 헤딩·본문 요소에 반드시 적용:

```tsx
// JSX inline style (Tailwind arbitrary로 처리 안 됨)
style={{ wordBreak: 'keep-all' } as React.CSSProperties}

// globals.css에서 전역 적용
html, body { word-break: keep-all; }
```

---

## 레이아웃 원칙

### ❌ 절대 금지 패턴
```tsx
// 3등분 균등 카드 그리드 — Supanova에서 "가장 제네릭한 AI 패턴"으로 명시 금지
<div className="grid grid-cols-3 gap-4">
  <Card /><Card /><Card />
</div>
```

### ✅ 권장 레이아웃

**Editorial Split (히어로)**
```
[  헤드라인 카피  ] [  신뢰 지표 / 이미지  ]
     1fr                 360-400px
```
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] items-center gap-0">
  <div className="lg:pr-12">/* 헤드라인 */</div>
  <div>/* 스탯 카드 스택 */</div>
</div>
```

**Bento Grid (서비스 카드)**
```
[  피처드 카드 (2/3)  ] [ 작은 카드 1 ]
[  피처드 카드 (2/3)  ] [ 작은 카드 2 ]
```
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-3.5">
  <Card className="lg:row-span-2" /> {/* 피처드: 보호자/주요 CTA */}
  <Card />                           {/* 돌봄이 */}
  <Card />                           {/* 장소 */}
</div>
```

**섹션 패딩 (최소 기준)**
- 섹션: `py-[72px]` (최소 `py-14` / `py-16`)
- 카드 내부: `p-7` ~ `p-8`
- 마지막 섹션 하단: `pb-24`

---

## Double-Bezel 카드 패턴

모든 카드·패널에 적용하는 핵심 패턴. 바깥 border + 안쪽 inset ring.

```tsx
// 기본 구조
<div className="relative rounded-3xl border border-[#E8E4DF] bg-white overflow-hidden ...">
  {/* Double-Bezel inner ring — 반드시 포함 */}
  <div
    className="absolute inset-[6px] rounded-[18px] border border-black/[0.04] pointer-events-none"
    aria-hidden="true"
  />
  {/* 장식 서클 (선택) */}
  <div
    className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-[--accent] opacity-[0.08] pointer-events-none"
    aria-hidden="true"
  />
  {/* 실제 콘텐츠 — z-index 필요 */}
  <div className="relative" style={{ zIndex: 2 }}>
    ...
  </div>
</div>
```

inset 값 가이드:
- 큰 카드 (rounded-3xl): `inset-[6px]` → `rounded-[18px]`
- 중간 카드 (rounded-[20px]): `inset-[5px]` → `rounded-[15px]`
- 작은 카드 (rounded-2xl): `inset-[4px]` → `rounded-xl`

---

## 트랜지션 & 애니메이션

### Spring 이징 (MANDATORY)
```css
/* 모든 인터랙션에 적용 */
transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
```

Tailwind:
```tsx
className="[transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
```

### 호버 패턴별 클래스
```tsx
// 카드 호버 (lift + scale)
"transition-[transform,box-shadow] duration-[450ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:scale-[1.005] hover:shadow-[0_16px_48px_rgba(0,0,0,.10)]"

// 버튼 호버 (lift)
"transition-[transform,box-shadow] duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.18)]"

// CTA 화살표 (slide right)
"transition-transform duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5"

// 다크 버튼 (scale)
"transition-transform duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]"
```

---

## 공통 UI 컴포넌트 패턴

### Eyebrow Pill (섹션 레이블)
```tsx
<span className="inline-flex items-center gap-2 bg-[#FDF2EE] border border-[#D85A3A]/20 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[.04em] text-[#D85A3A] mb-6">
  <span className="w-1.5 h-1.5 rounded-full bg-[#D85A3A]" />
  레이블 텍스트
</span>
```

### 강조 언더라인 (헤딩 내 키워드)
```tsx
<span className="relative inline-block text-[#D85A3A]">
  키워드
  <span
    className="absolute left-0 right-0 bottom-0.5 h-[3px] rounded-full bg-[#D85A3A]/25"
    aria-hidden="true"
  />
</span>
```

### Section Divider
```tsx
<div className="flex items-center gap-4">
  <span className="text-[13px] font-bold tracking-[.12em] uppercase text-[#9C9890] shrink-0">
    섹션 이름
  </span>
  <div className="flex-1 h-px bg-[#E8E4DF]" />
</div>
```

### Dark CTA Strip (페이지 하단)
```tsx
<div className="bg-[#1A1714] rounded-3xl px-8 lg:px-12 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
  <div>
    <h3 className="text-[20px] font-black text-white tracking-[-0.03em] mb-1.5"
        style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
      CTA 헤딩
    </h3>
    <p className="text-[14px] text-white/55 leading-relaxed">서브 텍스트</p>
  </div>
  <Link href="..." className="shrink-0 bg-[#D85A3A] text-white rounded-xl px-6 py-3.5 text-[14px] font-bold whitespace-nowrap transition-transform duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]">
    버튼 텍스트 →
  </Link>
</div>
```

### 카드 배지 (서비스 타겟 레이블)
```tsx
// Blue
<span className="inline-flex items-center gap-1.5 bg-[#1565C0]/[0.12] text-[#1565C0] rounded-full px-3 py-1 text-[11px] font-bold tracking-[.04em]">
  👨‍👩‍👧 보호자
</span>
// Orange
<span className="inline-flex items-center gap-1.5 bg-[#D85A3A]/[0.12] text-[#D85A3A] ...">
  📋 돌봄이
</span>
// Green
<span className="inline-flex items-center gap-1.5 bg-[#2E7D32]/[0.12] text-[#2E7D32] ...">
  📍 모두
</span>
```

---

## 페이지별 적용 현황

| 페이지 | 경로 | 상태 | 적용 패턴 |
|--------|------|------|-----------|
| 대문 (홈) | `/` | ✅ 완료 | Editorial Split + Bento Grid + Dark Strip |
| 돌봄이 찾기 | `/search` | 🔜 예정 | — |
| 레벨 테스트 | `/test` | 🔜 예정 | — |
| 장소 | `/places` | 🔜 예정 | — |
| 프로필 | `/profile/[id]` | 🔜 예정 | — |

---

## 리디자인 체크리스트

페이지 리디자인 시 다음 항목을 순서대로 확인:

- [ ] `font-family: Pretendard Variable` 적용 (Noto Sans KR 제거)
- [ ] `word-break: keep-all` 모든 한국어 텍스트에 적용
- [ ] 3등분 균등 카드 그리드 제거
- [ ] 헤딩 `font-black` + `tracking-[-0.04em]` 적용
- [ ] Double-Bezel 카드 패턴 적용 (inset ring)
- [ ] Spring `cubic-bezier(0.16, 1, 0.3, 1)` 트랜지션 적용
- [ ] 섹션 패딩 `py-[72px]` 이상 확보
- [ ] Eyebrow pill 레이블 추가
- [ ] 강조 키워드 언더라인 처리
- [ ] 페이지 하단 Dark CTA Strip 포함
- [ ] 모바일 반응형 (`grid-cols-1 lg:grid-cols-[...]`) 확인
