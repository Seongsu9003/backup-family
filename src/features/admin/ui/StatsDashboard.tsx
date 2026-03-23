'use client'

// ═══════════════════════════════════════════════════
//  운영 통계 대시보드 (GRW-01)
//  - KPI 카드 5개 (기존 StatsBar 대체)
//  - 레벨별·인증상태·돌봄유형·구직의향 분포 차트
//  - 지역별 TOP 8
//  - 주간 신청 추이 (최근 4주)
//  외부 차트 라이브러리 없이 CSS 바 차트로 구현
// ═══════════════════════════════════════════════════
import { useMemo, useState } from 'react'
import type { TestResult } from '@/shared/types'
import { isExpiringSoon } from '../model/types'

interface Props {
  results: TestResult[]
}

// ── CSS 바 차트 공통 컴포넌트 ──────────────────────
function BarRow({
  label,
  count,
  max,
  color,
  total,
}: {
  label: string
  count: number
  max: number
  color: string
  total: number
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  const ratio = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3 mb-2 last:mb-0">
      <div className="w-[90px] shrink-0 text-[.78rem] text-[#4A4A4A] font-medium truncate text-right">
        {label}
      </div>
      <div className="flex-1 h-5 bg-[#F7F5F3] rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="w-[52px] shrink-0 text-right text-[.78rem] font-bold text-[#1A1A1A]">
        {count}명
      </div>
      <div className="w-[36px] shrink-0 text-right text-[.72rem] text-[#8A8A8A]">
        {ratio}%
      </div>
    </div>
  )
}

// ── 섹션 카드 래퍼 ─────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E4E0DC] rounded-xl px-5 py-4">
      <h3 className="text-[.8rem] font-bold text-[#8A8A8A] uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  )
}

// ── 주간 추이 계산 ─────────────────────────────────
function getWeeklyTrend(results: TestResult[]): { label: string; count: number }[] {
  const now = new Date()
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const end   = new Date(now)
    end.setDate(now.getDate() - i * 7)
    const start = new Date(end)
    start.setDate(end.getDate() - 6)
    return {
      label: i === 0 ? '이번 주' : i === 1 ? '지난 주' : `${i + 1}주 전`,
      start,
      end,
    }
  }).reverse()

  return weeks.map(({ label, start, end }) => ({
    label,
    count: results.filter((r) => {
      const d = new Date(r.meta?.created_at)
      return d >= start && d <= end
    }).length,
  }))
}

export function StatsDashboard({ results }: Props) {
  const [open, setOpen] = useState(false)

  // ── KPI ───────────────────────────────────────
  const kpi = useMemo(() => ([
    { label: '전체 신청자',    value: results.length,                                                   color: 'text-[#1A1A1A]' },
    { label: '검토 대기',      value: results.filter(r => r.certification.status === '검토중').length,  color: 'text-[#B07D00]' },
    { label: '인증 완료',      value: results.filter(r => r.certification.status === '인증완료').length,color: 'text-[#1A7A45]' },
    { label: '구직 Pool',     value: results.filter(r => r.job_seeking !== '구직 의사 없음').length,   color: 'text-[#1A1A1A]' },
    { label: '만료 임박 (7일)', value: results.filter(r => isExpiringSoon(r)).length,                   color: 'text-[#E65100]' },
  ]), [results])

  // ── 레벨별 분포 ──────────────────────────────
  const levelDist = useMemo(() => {
    const counts = [1,2,3,4,5].map((n) => ({
      label: `Lv.${n}`,
      count: results.filter(r => r.level?.num === n).length,
      color: ['#909090','#4A9FCC','#3A9E94','#D85A3A','#8B4EAB'][n - 1],
    }))
    return counts
  }, [results])

  // ── 인증 상태 분포 ───────────────────────────
  const certDist = useMemo(() => [
    { label: '미인증',   count: results.filter(r => r.certification.status === '미인증').length,   color: '#CCC' },
    { label: '검토중',   count: results.filter(r => r.certification.status === '검토중').length,   color: '#E8C96A' },
    { label: '인증완료', count: results.filter(r => r.certification.status === '인증완료').length, color: '#3A9E94' },
    { label: '반려',     count: results.filter(r => r.certification.status === '반려').length,     color: '#F0A090' },
  ], [results])

  // ── 돌봄 유형 분포 ───────────────────────────
  const typeDist = useMemo(() => {
    const map: Record<string, { label: string; color: string; count: number }> = {
      ACT: { label: '활동형', color: '#D85A3A', count: 0 },
      CAL: { label: '차분형', color: '#3A9E94', count: 0 },
      EDU: { label: '교육형', color: '#4A9FCC', count: 0 },
      CRE: { label: '창의형', color: '#8B4EAB', count: 0 },
    }
    results.forEach(r => {
      const code = r.care_type?.code
      if (code && map[code]) map[code].count++
    })
    return Object.values(map)
  }, [results])

  // ── 구직 의향 분포 ───────────────────────────
  const jobDist = useMemo(() => [
    { label: '적극 구직 중', count: results.filter(r => r.job_seeking === '적극적으로 구직 중').length,     color: '#D85A3A' },
    { label: '탐색 중',      count: results.filter(r => r.job_seeking === '관심은 있지만 탐색 중').length, color: '#4A9FCC' },
    { label: '의사 없음',    count: results.filter(r => r.job_seeking === '구직 의사 없음').length,        color: '#CCC' },
  ], [results])

  // ── 지역별 TOP 8 ─────────────────────────────
  const regionDist = useMemo(() => {
    const map: Record<string, number> = {}
    results.forEach(r => {
      (r.tester?.preferred_region ?? []).forEach(region => {
        map[region] = (map[region] ?? 0) + 1
      })
    })
    return Object.entries(map)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [results])

  // ── 주간 추이 ────────────────────────────────
  const weeklyTrend = useMemo(() => getWeeklyTrend(results), [results])

  const maxLevel   = Math.max(...levelDist.map(d => d.count), 1)
  const maxCert    = Math.max(...certDist.map(d => d.count), 1)
  const maxType    = Math.max(...typeDist.map(d => d.count), 1)
  const maxJob     = Math.max(...jobDist.map(d => d.count), 1)
  const maxRegion  = Math.max(...regionDist.map(d => d.count), 1)
  const maxWeekly  = Math.max(...weeklyTrend.map(d => d.count), 1)

  return (
    <div className="mb-5">
      {/* KPI 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
        {kpi.map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#E4E0DC] rounded-xl px-4 py-3 text-center">
            <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
            <div className="text-[.73rem] text-[#8A8A8A] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* 상세 통계 토글 */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-5 py-3 bg-white border border-[#E4E0DC] rounded-xl text-[.84rem] font-semibold text-[#4A4A4A] hover:border-[#D85A3A] hover:text-[#D85A3A] transition-colors"
      >
        <span>📊 상세 통계</span>
        <span className="text-[#8A8A8A] text-[.8rem]">{open ? '접기 ▲' : '펼치기 ▼'}</span>
      </button>

      {/* 상세 통계 패널 */}
      {open && (
        <div className="mt-3 space-y-3">

          {/* 상단 2열: 레벨별 + 인증 상태 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ChartCard title="레벨별 분포">
              {levelDist.map(({ label, count, color }) => (
                <BarRow key={label} label={label} count={count} max={maxLevel} color={color} total={results.length} />
              ))}
            </ChartCard>

            <ChartCard title="인증 상태">
              {certDist.map(({ label, count, color }) => (
                <BarRow key={label} label={label} count={count} max={maxCert} color={color} total={results.length} />
              ))}
            </ChartCard>
          </div>

          {/* 중단 2열: 돌봄 유형 + 구직 의향 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ChartCard title="돌봄 유형 분포">
              {typeDist.map(({ label, count, color }) => (
                <BarRow key={label} label={label} count={count} max={maxType} color={color} total={results.length} />
              ))}
              {typeDist.every(d => d.count === 0) && (
                <p className="text-[.78rem] text-[#8A8A8A] text-center py-2">데이터 없음</p>
              )}
            </ChartCard>

            <ChartCard title="구직 의향 분포">
              {jobDist.map(({ label, count, color }) => (
                <BarRow key={label} label={label} count={count} max={maxJob} color={color} total={results.length} />
              ))}
            </ChartCard>
          </div>

          {/* 하단 2열: 지역 TOP 8 + 주간 추이 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ChartCard title={`선호 지역 TOP ${regionDist.length}`}>
              {regionDist.length > 0 ? (
                regionDist.map(({ label, count }) => (
                  <BarRow key={label} label={label} count={count} max={maxRegion} color="#D85A3A" total={results.length} />
                ))
              ) : (
                <p className="text-[.78rem] text-[#8A8A8A] text-center py-2">등록된 지역 데이터 없음</p>
              )}
            </ChartCard>

            <ChartCard title="주간 신청 추이 (최근 4주)">
              {weeklyTrend.map(({ label, count }) => (
                <BarRow key={label} label={label} count={count} max={maxWeekly} color="#4A9FCC" total={results.length} />
              ))}
              <p className="text-[.72rem] text-[#AAAAAA] mt-3 text-right">* 신청일 기준</p>
            </ChartCard>
          </div>

        </div>
      )}
    </div>
  )
}
