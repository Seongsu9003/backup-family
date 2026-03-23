'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchCaregivers } from '../model/useSearchCaregivers'
import { AnonymizedCaregiver, TYPE_COLORS, scoreRange } from '../model/types'
import { CaregiverCard } from './CaregiverCard'
import { InquireModal } from './InquireModal'
import { InviteModal } from './InviteModal'

// ── 필터 상태 타입 ──────────────────────────────
interface Filters {
  region:       string
  level:        string
  cert:         string
  typeCode:     string
  scoreRange:   string   // scoreRange() 결과값 기준
  activeOnly:   boolean  // true = 적극적으로 구직 중만
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

// 점수 구간 옵션 (scoreRange() 반환값과 1:1 매칭)
const SCORE_RANGE_OPTIONS = [
  { value: '',                    label: '전체 점수 구간' },
  { value: '최상위 (90점 이상)',   label: '최상위 (90점 이상)' },
  { value: '상위 (80점대)',        label: '상위 (80점대)' },
  { value: '중상위 (70점대)',      label: '중상위 (70점대)' },
  { value: '중위 (60점대)',        label: '중위 (60점대)' },
  { value: '중하위 (50점대)',      label: '중하위 (50점대)' },
  { value: '하위 (50점 미만)',     label: '하위 (50점 미만)' },
]

// 활성 필터 수 계산 (activeOnly는 별도 토글이므로 제외)
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

  // ── 지역 옵션 동적 생성 ─────────────────────
  const regionOptions = useMemo(() => {
    const set = new Set<string>()
    allCaregivers.forEach((c) => c.regions.forEach((r) => set.add(r)))
    return [...set].sort()
  }, [allCaregivers])

  // ── 필터 적용 ───────────────────────────────
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

  // ── 정렬 ────────────────────────────────────
  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sortKey) {
      case 'level_desc':
        return arr.sort((a, b) => (b.level?.num ?? 0) - (a.level?.num ?? 0))
      case 'score_desc':
        return arr.sort((a, b) => b.score - a.score)
      case 'cert_first':
        return arr.sort((a, b) => {
          if (a.certStatus === '인증완료' && b.certStatus !== '인증완료') return -1
          if (a.certStatus !== '인증완료' && b.certStatus === '인증완료') return 1
          return 0
        })
      default:
        return arr // 최근 등록순 = 쿼리 기본 순서 유지
    }
  }, [filtered, sortKey])

  const setFilter = (key: keyof Filters) => (value: string | boolean) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  // ── 활성 필터 칩 목록 생성 ───────────────────
  const activeChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = []
    if (filters.activeOnly)   chips.push({ label: '적극 구직 중', clear: () => setFilter('activeOnly')(false) })
    if (filters.region)       chips.push({ label: `지역: ${filters.region}`, clear: () => setFilter('region')('') })
    if (filters.level)        chips.push({ label: `Lv.${filters.level}`, clear: () => setFilter('level')('') })
    if (filters.cert)         chips.push({ label: '인증 완료', clear: () => setFilter('cert')('') })
    if (filters.typeCode) {
      const t = TYPE_PILLS.find((p) => p.code === filters.typeCode)
      chips.push({ label: t?.label ?? filters.typeCode, clear: () => setFilter('typeCode')('') })
    }
    if (filters.scoreRange)   chips.push({ label: filters.scoreRange, clear: () => setFilter('scoreRange')('') })
    return chips
  }, [filters])

  const activeJobs = allCaregivers.filter((c) => c.jobSeeking === '적극적으로 구직 중').length

  return (
    <>
      {/* ── HEADER ──────────────────────────── */}
      <header className="bg-[#C04830] px-8 h-14 flex items-center justify-between">
        <h1 className="text-[.97rem] font-bold text-white">backup-family</h1>
        <nav className="flex gap-2">
          <button
            onClick={() => setShowInvite(true)}
            className="text-[.8rem] text-white/80 px-3 py-1.5 border border-white/30 rounded-lg font-semibold hover:text-white hover:border-white/60 transition-colors"
          >
            테스트 초대하기
          </button>
          <Link
            href="/"
            className="text-[.8rem] text-white/80 px-3 py-1.5 border border-white/30 rounded-lg font-semibold hover:text-white hover:border-white/60 transition-colors"
          >
            레벨 테스트
          </Link>
        </nav>
      </header>

      {/* ── HERO ────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#C04830] to-[#B03820] px-8 py-12 text-center text-white">
        <h2 className="text-[1.7rem] font-extrabold tracking-tight mb-2.5">
          우리 아이에게 맞는 돌봄이를 찾아보세요
        </h2>
        <p className="text-[.92rem] text-white/80 leading-relaxed mb-6">
          레벨 테스트를 통해 역량이 확인된 돌봄이를 조회할 수 있습니다.<br />
          개인정보는 철저히 보호됩니다.
        </p>
        <div className="inline-flex items-center gap-3 bg-white/15 border border-white/30 rounded-full px-5 py-1.5 text-[.82rem] font-semibold">
          {isLoading ? (
            '돌봄이 조회 중...'
          ) : (
            <>
              <span>총 {allCaregivers.length}명 등록</span>
              <span className="w-px h-3 bg-white/40" />
              <span>🟢 적극 구직 중 {activeJobs}명</span>
            </>
          )}
        </div>
      </section>

      {/* ── PRIVACY NOTICE ──────────────────── */}
      <div className="bg-[#FAE8E3] border-l-4 border-[#D85A3A] px-5 py-3.5 flex items-start gap-2.5 text-[.84rem] text-[#C04830] leading-relaxed">
        <span className="text-base shrink-0">🔒</span>
        <span>
          돌봄이의 실명·연락처 등 개인정보는 제공되지 않습니다. 관심 있는 돌봄이가 있으면{' '}
          <strong>문의하기</strong>를 눌러 운영팀에 연결 요청을 보내주세요.
        </span>
      </div>

      {/* ── MAIN ────────────────────────────── */}
      <main className="max-w-[1200px] mx-auto px-6 py-7 w-full">

        {/* 초대 배너 */}
        <div className="bg-white border border-[#E4E0DC] rounded-2xl p-5 mb-6 flex items-center gap-5 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-[#DDF0EE] flex items-center justify-center text-xl shrink-0">
            📨
          </div>
          <div className="flex-1 min-w-[200px]">
            <strong className="block text-[.95rem] font-bold mb-1">아는 돌봄이가 있으신가요?</strong>
            <p className="text-[.82rem] text-[#8A8A8A] leading-snug">
              주변의 돌봄이에게 레벨 테스트를 권유하고, 이 페이지에서 조회할 수 있도록 초대해 보세요.
            </p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="px-5 py-2.5 rounded-lg bg-[#3A9E94] text-white text-[.85rem] font-bold hover:bg-[#2E8A80] transition-colors whitespace-nowrap"
          >
            초대 메시지 만들기
          </button>
        </div>

        {/* ── 필터 바 ──────────────────────────────────── */}
        <div className="bg-white border border-[#E4E0DC] rounded-2xl px-6 py-5 mb-3">

          {/* 상단: 레이블 + 초기화 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[.82rem] font-bold text-[#4A4A4A] flex items-center gap-2">
              필터
              {activeFilterCount(filters) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#D85A3A] text-white text-[.72rem] font-bold">
                  {activeFilterCount(filters)}
                </span>
              )}
            </span>
            <button
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="text-[.78rem] text-[#8A8A8A] hover:text-[#D85A3A] transition-colors font-semibold"
            >
              전체 초기화
            </button>
          </div>

          {/* 필터 그룹 행 */}
          <div className="flex flex-wrap gap-3.5 items-end mb-4">
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

            {/* 정렬 */}
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

            <span className="ml-auto text-[.84rem] text-[#8A8A8A] self-end pb-0.5">
              <strong className="text-[#D85A3A]">{sorted.length}</strong>명 표시 중
            </span>
          </div>

          {/* 타입 Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {TYPE_PILLS.map(({ code, label }) => {
              const active = filters.typeCode === code
              const color  = TYPE_COLORS[code]
              return (
                <button
                  key={code}
                  onClick={() => setFilter('typeCode')(code)}
                  className="px-4 py-1.5 rounded-full border-[1.5px] text-[.82rem] font-semibold transition-all"
                  style={
                    active && color
                      ? { background: color, color: '#fff', borderColor: color }
                      : active
                      ? { background: '#1A1A1A', color: '#fff', borderColor: '#1A1A1A' }
                      : { background: '#fff', color: '#4A4A4A', borderColor: '#E4E0DC' }
                  }
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* 구직 중 토글 */}
          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <button
              role="switch"
              aria-checked={filters.activeOnly}
              onClick={() => setFilter('activeOnly')(!filters.activeOnly)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                filters.activeOnly ? 'bg-[#D85A3A]' : 'bg-[#CCC]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  filters.activeOnly ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="text-[.82rem] font-semibold text-[#4A4A4A]">
              적극적으로 구직 중인 분만 보기
            </span>
            {!filters.activeOnly && (
              <span className="text-[.74rem] text-[#8A8A8A]">(탐색 중인 분 포함)</span>
            )}
          </label>
        </div>

        {/* 활성 필터 칩 */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeChips.map(({ label, clear }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAE8E3] border border-[#F0A090] text-[.78rem] font-semibold text-[#C04830]"
              >
                {label}
                <button
                  onClick={clear}
                  className="text-[#D85A3A] hover:text-[#B03820] leading-none font-bold"
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
          <div className="text-center py-20 text-[#8A8A8A]">데이터를 불러오는 중 오류가 발생했습니다.</div>
        ) : isLoading ? (
          <div className="text-center py-20 text-[#8A8A8A]">불러오는 중…</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-[#8A8A8A]">
            <p className="text-[1.8rem] mb-3">🔍</p>
            <p className="text-[.92rem] leading-relaxed">
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

      {/* ── 모달 ────────────────────────────── */}
      {inquireTarget && (
        <InquireModal caregiver={inquireTarget} onClose={() => setInquire(null)} />
      )}
      {showInvite && (
        <InviteModal onClose={() => setShowInvite(false)} />
      )}
    </>
  )
}

// ── 재사용 FilterGroup ─────────────────────────
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[160px]">
      <label className="text-[.72rem] font-bold text-[#8A8A8A] uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}
