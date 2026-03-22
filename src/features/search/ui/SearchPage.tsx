'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchCaregivers } from '../model/useSearchCaregivers'
import { AnonymizedCaregiver, TYPE_COLORS } from '../model/types'
import { CaregiverCard } from './CaregiverCard'
import { InquireModal } from './InquireModal'
import { InviteModal } from './InviteModal'

// ── 필터 상태 타입 ──────────────────────────────
interface Filters {
  region: string
  level: string
  cert: string
  typeCode: string
}

const INITIAL_FILTERS: Filters = { region: '', level: '', cert: '', typeCode: '' }

const TYPE_PILLS = [
  { code: '', label: '전체 타입' },
  { code: 'ACT', label: '활동형' },
  { code: 'CAL', label: '차분형' },
  { code: 'EDU', label: '교육형' },
  { code: 'CRE', label: '창의형' },
]

export function SearchPage() {
  const { data: allCaregivers = [], isLoading, isError } = useSearchCaregivers()

  const [filters, setFilters]         = useState<Filters>(INITIAL_FILTERS)
  const [inquireTarget, setInquire]   = useState<AnonymizedCaregiver | null>(null)
  const [showInvite, setShowInvite]   = useState(false)

  // ── 지역 옵션 동적 생성 ─────────────────────
  const regionOptions = useMemo(() => {
    const set = new Set<string>()
    allCaregivers.forEach((c) => c.regions.forEach((r) => set.add(r)))
    return [...set].sort()
  }, [allCaregivers])

  // ── 필터 적용 ───────────────────────────────
  const filtered = useMemo(() => {
    return allCaregivers.filter((c) => {
      if (filters.region   && !c.regions.includes(filters.region))           return false
      if (filters.level    && String(c.level?.num) !== filters.level)         return false
      if (filters.cert     && c.certStatus !== filters.cert)                  return false
      if (filters.typeCode && c.careType?.code !== filters.typeCode)          return false
      return true
    })
  }, [allCaregivers, filters])

  const setFilter = (key: keyof Filters) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

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
          구직 의사가 있는 돌봄이만 표시되며, 개인정보는 철저히 보호됩니다.
        </p>
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-5 py-1.5 text-[.82rem] font-semibold">
          {isLoading
            ? '구직 활동 중인 돌봄이 조회 중...'
            : `현재 ${allCaregivers.length}명의 돌봄이가 구직 중입니다`}
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

        {/* 필터 바 */}
        <div className="bg-white border border-[#E4E0DC] rounded-2xl px-6 py-5 mb-5 flex flex-wrap gap-3.5 items-end">
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

          <button
            onClick={() => setFilters(INITIAL_FILTERS)}
            className="px-4 py-2 rounded-lg border-[1.5px] border-[#E4E0DC] text-[#4A4A4A] text-[.84rem] font-semibold hover:border-[#F0A090] hover:text-[#D85A3A] transition-colors self-end"
          >
            필터 초기화
          </button>
          <span className="ml-auto text-[.84rem] text-[#8A8A8A] self-end pb-0.5">
            <strong className="text-[#D85A3A]">{filtered.length}</strong>명 표시 중
          </span>
        </div>

        {/* 타입 필터 Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
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

        {/* 카드 그리드 */}
        {isError ? (
          <div className="text-center py-20 text-[#8A8A8A]">데이터를 불러오는 중 오류가 발생했습니다.</div>
        ) : isLoading ? (
          <div className="text-center py-20 text-[#8A8A8A]">불러오는 중…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#8A8A8A]">
            <p className="text-[1.8rem] mb-3">🔍</p>
            <p className="text-[.92rem] leading-relaxed">
              조건에 맞는 돌봄이가 없습니다.<br />
              필터를 변경하거나 초대 기능으로 돌봄이를 모집해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {filtered.map((c) => (
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
