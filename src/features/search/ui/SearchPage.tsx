'use client'

// ═══════════════════════════════════════════════════
//  돌봄이 조회 페이지 — Supanova Warm Editorial
//  - sticky 헤더 (warm bg)
//  - Editorial 히어로 (ink-on-beige)
//  - Double-Bezel 필터 바 + 카드 그리드
// ═══════════════════════════════════════════════════
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchCaregivers } from '../model/useSearchCaregivers'
import { AnonymizedCaregiver, TYPE_COLORS, scoreRange } from '../model/types'
import { CaregiverCard } from './CaregiverCard'
import { InquireModal } from './InquireModal'
import { InviteModal } from './InviteModal'

// ── 필터 상태 타입 ──────────────────────────────
interface Filters {
  region:     string
  level:      string
  cert:       string
  typeCode:   string
  scoreRange: string
  activeOnly: boolean
}

type SortKey = 'recent' | 'level_desc' | 'score_desc' | 'cert_first'

const INITIAL_FILTERS: Filters = {
  region: '', level: '', cert: '', typeCode: '', scoreRange: '', activeOnly: false,
}

const TYPE_PILLS = [
  { code: '', label: '전체 타입' },
  { code: 'ACT', label: '활동형' },
  { code: 'CAL', label: '차분형' },
  { code: 'EDU', label: '교육형' },
  { code: 'CRE', label: '창의형' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent',     label: '최근 등록순' },
  { value: 'level_desc', label: '레벨 높은순' },
  { value: 'score_desc', label: '점수 높은순' },
  { value: 'cert_first', label: '인증 완료 우선' },
]

const SCORE_RANGE_OPTIONS = [
  { value: '',                    label: '전체 점수 구간' },
  { value: '최상위 (90점 이상)',   label: '최상위 (90점 이상)' },
  { value: '상위 (80점대)',        label: '상위 (80점대)' },
  { value: '중상위 (70점대)',      label: '중상위 (70점대)' },
  { value: '중위 (60점대)',        label: '중위 (60점대)' },
  { value: '중하위 (50점대)',      label: '중하위 (50점대)' },
  { value: '하위 (50점 미만)',     label: '하위 (50점 미만)' },
]

function activeFilterCount(f: Filters): number {
  return [f.region, f.level, f.cert, f.typeCode, f.scoreRange].filter(Boolean).length +
    (f.activeOnly ? 1 : 0)
}

export function SearchPage() {
  const { data: allCaregivers = [], isLoading, isError } = useSearchCaregivers()

  const [filters, setFilters]       = useState<Filters>(INITIAL_FILTERS)
  const [sortKey, setSortKey]       = useState<SortKey>('recent')
  const [inquireTarget, setInquire] = useState<AnonymizedCaregiver | null>(null)
  const [showInvite, setShowInvite] = useState(false)

  const regionOptions = useMemo(() => {
    const set = new Set<string>()
    allCaregivers.forEach((c) => c.regions.forEach((r) => set.add(r)))
    return [...set].sort()
  }, [allCaregivers])

  const filtered = useMemo(() => {
    return allCaregivers.filter((c) => {
      if (filters.activeOnly && c.jobSeeking !== '적극적으로 구직 중') return false
      if (filters.region     && !c.regions.includes(filters.region))   return false
      if (filters.level      && String(c.level?.num) !== filters.level) return false
      if (filters.cert       && c.certStatus !== filters.cert)          return false
      if (filters.typeCode   && c.careType?.code !== filters.typeCode)  return false
      if (filters.scoreRange && scoreRange(c.score) !== filters.scoreRange) return false
      return true
    })
  }, [allCaregivers, filters])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sortKey) {
      case 'level_desc': return arr.sort((a, b) => (b.level?.num ?? 0) - (a.level?.num ?? 0))
      case 'score_desc': return arr.sort((a, b) => b.score - a.score)
      case 'cert_first': return arr.sort((a, b) => {
        if (a.certStatus === '인증완료' && b.certStatus !== '인증완료') return -1
        if (a.certStatus !== '인증완료' && b.certStatus === '인증완료') return 1
        return 0
      })
      default: return arr
    }
  }, [filtered, sortKey])

  const setFilter = (key: keyof Filters) => (value: string | boolean) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const activeChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = []
    if (filters.activeOnly) chips.push({ label: '적극 구직 중', clear: () => setFilter('activeOnly')(false) })
    if (filters.region)     chips.push({ label: `지역: ${filters.region}`, clear: () => setFilter('region')('') })
    if (filters.level)      chips.push({ label: `Lv.${filters.level}`, clear: () => setFilter('level')('') })
    if (filters.cert)       chips.push({ label: '인증 완료', clear: () => setFilter('cert')('') })
    if (filters.typeCode) {
      const t = TYPE_PILLS.find((p) => p.code === filters.typeCode)
      chips.push({ label: t?.label ?? filters.typeCode, clear: () => setFilter('typeCode')('') })
    }
    if (filters.scoreRange) chips.push({ label: filters.scoreRange, clear: () => setFilter('scoreRange')('') })
    return chips
  }, [filters])

  const activeJobs = allCaregivers.filter((c) => c.jobSeeking === '적극적으로 구직 중').length

  return (
    <>
      {/* ── HEADER — Supanova warm sticky nav ── */}
      <header className="sticky top-0 z-20 bg-[#F7F5F2]/95 backdrop-blur-sm border-b border-[#E8E4DF] px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-[15px] font-black tracking-[-0.03em] text-[#1A1714]"
        >
          backup<span className="text-[#D85A3A]">-family</span>
        </Link>
        <nav className="flex gap-2">
          <button
            onClick={() => setShowInvite(true)}
            className="text-[13px] text-[#5C5852] px-3.5 py-1.5 border border-[#E8E4DF] rounded-lg font-semibold hover:border-[#9C9890] hover:text-[#1A1714] transition-[border-color,color] duration-200"
          >
            테스트 초대하기
          </button>
          <Link
            href="/test"
            className="text-[13px] bg-[#D85A3A] text-white px-3.5 py-1.5 rounded-lg font-bold hover:bg-[#C04828] transition-colors duration-200"
          >
            레벨 테스트
          </Link>
        </nav>
      </header>

      {/* ── HERO — Editorial, ink-on-warm ── */}
      <section className="bg-[#F7F5F2] px-6 pt-12 pb-10 border-b border-[#E8E4DF]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6">
          <div>
            <span className="inline-flex items-center gap-2 bg-[#EBF2FC] border border-[#1565C0]/20 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[.04em] text-[#1565C0] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]" />
              돌봄이 조회
            </span>
            <h1
              className="text-[clamp(26px,3.5vw,38px)] font-black leading-[1.2] tracking-[-0.04em] text-[#1A1714] mb-3"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              우리 아이에게 맞는<br />돌봄이를 찾아보세요
            </h1>
            <p
              className="text-[15px] text-[#5C5852] leading-[1.7] max-w-[480px]"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              레벨 테스트로 역량이 확인된 돌봄이를 조회할 수 있습니다.
              개인정보는 철저히 보호됩니다.
            </p>
          </div>

          {/* 통계 pills */}
          <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
            <div className="relative bg-white rounded-[16px] border border-[#E8E4DF] px-5 py-3.5 flex items-center gap-3">
              <div className="absolute inset-[4px] rounded-[12px] border border-black/[0.04] pointer-events-none" />
              <span className="text-[22px]">👩‍🍼</span>
              <div>
                <p className="text-[18px] font-black leading-none tracking-[-0.04em] text-[#1565C0]">
                  {isLoading ? '—' : `${allCaregivers.length}명`}
                </p>
                <p className="text-[11px] text-[#9C9890] mt-0.5 font-medium">등록된 돌봄이</p>
              </div>
            </div>
            <div className="relative bg-white rounded-[16px] border border-[#E8E4DF] px-5 py-3.5 flex items-center gap-3">
              <div className="absolute inset-[4px] rounded-[12px] border border-black/[0.04] pointer-events-none" />
              <span className="text-[22px]">🟢</span>
              <div>
                <p className="text-[18px] font-black leading-none tracking-[-0.04em] text-[#2E7D32]">
                  {isLoading ? '—' : `${activeJobs}명`}
                </p>
                <p className="text-[11px] text-[#9C9890] mt-0.5 font-medium">적극 구직 중</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRIVACY NOTICE ── */}
      <div className="bg-[#FDF2EE] border-b border-[#F0D5CD] px-6 py-3 flex items-center gap-2.5 text-[13px] text-[#C04828]">
        <span className="shrink-0 text-base" aria-hidden="true">🔒</span>
        <span style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
          돌봄이의 실명·연락처 등 개인정보는 제공되지 않습니다.
          관심 있는 분이 있으면 <strong>문의하기</strong>를 눌러 운영팀에 연결 요청을 보내주세요.
        </span>
      </div>

      {/* ── MAIN ── */}
      <main className="max-w-[1200px] mx-auto px-5 lg:px-6 py-7 w-full">

        {/* 초대 배너 — Double-Bezel */}
        <div className="relative bg-white rounded-2xl border border-[#E8E4DF] p-5 mb-6 flex items-center gap-5 flex-wrap overflow-hidden">
          <div className="absolute inset-[5px] rounded-[14px] border border-black/[0.04] pointer-events-none" />
          <div className="relative w-12 h-12 rounded-xl bg-[#DDF0EE] flex items-center justify-center text-xl shrink-0" style={{ zIndex: 1 }}>
            📨
          </div>
          <div className="relative flex-1 min-w-[200px]" style={{ zIndex: 1 }}>
            <strong className="block text-[15px] font-bold text-[#1A1714] mb-1">아는 돌봄이가 있으신가요?</strong>
            <p className="text-[13px] text-[#9C9890] leading-snug">
              주변 돌봄이에게 레벨 테스트를 권유하고 이 페이지에서 조회할 수 있도록 초대해 보세요.
            </p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="relative px-5 py-2.5 rounded-xl bg-[#3A9E94] text-white text-[13px] font-bold hover:bg-[#2E8A80] transition-colors duration-200 whitespace-nowrap"
            style={{ zIndex: 1 }}
          >
            초대 메시지 만들기
          </button>
        </div>

        {/* ── 필터 바 — Double-Bezel ── */}
        <div className="relative bg-white rounded-2xl border border-[#E8E4DF] px-6 py-5 mb-3 overflow-hidden">
          <div className="absolute inset-[5px] rounded-[14px] border border-black/[0.04] pointer-events-none" />

          {/* 상단: 레이블 + 초기화 */}
          <div className="relative flex items-center justify-between mb-4" style={{ zIndex: 1 }}>
            <span className="text-[13px] font-bold text-[#1A1714] flex items-center gap-2">
              필터
              {activeFilterCount(filters) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#D85A3A] text-white text-[11px] font-bold">
                  {activeFilterCount(filters)}
                </span>
              )}
            </span>
            <button
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="text-[12px] text-[#9C9890] hover:text-[#D85A3A] transition-colors font-semibold"
            >
              전체 초기화
            </button>
          </div>

          {/* 필터 그룹 행 */}
          <div className="relative flex flex-wrap gap-3.5 items-end mb-4" style={{ zIndex: 1 }}>
            <FilterGroup label="지역">
              <select
                value={filters.region}
                onChange={(e) => setFilter('region')(e.target.value)}
                className="filter-select"
              >
                <option value="">전체 지역</option>
                {regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </FilterGroup>

            <FilterGroup label="레벨">
              <select
                value={filters.level}
                onChange={(e) => setFilter('level')(e.target.value)}
                className="filter-select"
              >
                <option value="">전체 레벨</option>
                {[1,2,3,4,5].map((n) => (
                  <option key={n} value={String(n)}>Lv.{n}</option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="점수 구간">
              <select
                value={filters.scoreRange}
                onChange={(e) => setFilter('scoreRange')(e.target.value)}
                className="filter-select"
              >
                {SCORE_RANGE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </FilterGroup>

            <FilterGroup label="인증 여부">
              <select
                value={filters.cert}
                onChange={(e) => setFilter('cert')(e.target.value)}
                className="filter-select"
              >
                <option value="">전체</option>
                <option value="인증완료">인증 완료만</option>
              </select>
            </FilterGroup>

            <FilterGroup label="정렬">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="filter-select"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </FilterGroup>

            <span className="ml-auto text-[13px] text-[#9C9890] self-end pb-0.5">
              <strong className="text-[#D85A3A] font-black">{sorted.length}</strong>명 표시 중
            </span>
          </div>

          {/* 타입 Pills */}
          <div className="relative flex flex-wrap gap-2 mb-4" style={{ zIndex: 1 }}>
            {TYPE_PILLS.map(({ code, label }) => {
              const active = filters.typeCode === code
              const color  = TYPE_COLORS[code]
              return (
                <button
                  key={code}
                  onClick={() => setFilter('typeCode')(code)}
                  className="px-4 py-1.5 rounded-full border text-[13px] font-semibold transition-[transform,box-shadow,background,color,border-color] duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03]"
                  style={
                    active && color
                      ? { background: color, color: '#fff', borderColor: color }
                      : active
                      ? { background: '#1A1714', color: '#fff', borderColor: '#1A1714' }
                      : { background: '#fff', color: '#5C5852', borderColor: '#E8E4DF' }
                  }
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* 구직 중 토글 */}
          <div className="relative" style={{ zIndex: 1 }}>
            <label className="flex items-center gap-2.5 cursor-pointer w-fit">
              <button
                role="switch"
                aria-checked={filters.activeOnly}
                onClick={() => setFilter('activeOnly')(!filters.activeOnly)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                  filters.activeOnly ? 'bg-[#D85A3A]' : 'bg-[#D8D4CF]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    filters.activeOnly ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="text-[13px] font-semibold text-[#1A1714]">
                적극적으로 구직 중인 분만 보기
              </span>
              {!filters.activeOnly && (
                <span className="text-[12px] text-[#9C9890]">(탐색 중인 분 포함)</span>
              )}
            </label>
          </div>
        </div>

        {/* 활성 필터 칩 */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeChips.map(({ label, clear }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2EE] border border-[#EDCFC7] text-[12px] font-semibold text-[#C04828]"
              >
                {label}
                <button
                  onClick={clear}
                  className="text-[#D85A3A] hover:text-[#B03820] leading-none font-bold transition-colors"
                  aria-label={`${label} 필터 해제`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* 카드 그리드 */}
        {isError ? (
          <div className="text-center py-20 text-[#9C9890]">
            <p className="text-[2rem] mb-3">⚠️</p>
            <p className="text-[14px]">데이터를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 text-[#9C9890] text-[14px]">불러오는 중…</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-[#9C9890]">
            <p className="text-[2rem] mb-3">🔍</p>
            <p
              className="text-[14px] leading-relaxed"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              조건에 맞는 돌봄이가 없습니다.<br />
              필터를 변경하거나 초대 기능으로 돌봄이를 모집해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {sorted.map((c) => (
              <CaregiverCard
                key={c._internalRef}
                caregiver={c}
                onInquire={() => setInquire(c)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 모달 */}
      {inquireTarget && (
        <InquireModal caregiver={inquireTarget} onClose={() => setInquire(null)} />
      )}
      {showInvite && (
        <InviteModal onClose={() => setShowInvite(false)} />
      )}
    </>
  )
}

// ── FilterGroup helper ─────────────────────────
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[160px]">
      <label className="text-[11px] font-bold text-[#9C9890] uppercase tracking-[.08em]">{label}</label>
      {children}
    </div>
  )
}
