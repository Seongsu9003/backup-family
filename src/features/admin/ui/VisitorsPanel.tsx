'use client'

// ═══════════════════════════════════════════════════
//  보호자 조회 신청 내역 패널
//  - 이메일 마스킹으로 개인정보 보호 (앞 2자 + *** + @도메인)
//  - 신청 일시 표시
//  - 중복 이메일 집계 (동일 이메일 재방문 횟수)
// ═══════════════════════════════════════════════════
import { useMemo, useState } from 'react'
import { useParentVisitors, type ParentVisitor } from '../model/useParentVisitors'

/** 이메일 마스킹: seongsu9003@gmail.com → se***@gmail.com */
function maskEmail(email: string): string {
  const atIdx = email.indexOf('@')
  if (atIdx < 0) return '***'
  const local  = email.slice(0, atIdx)
  const domain = email.slice(atIdx)
  const visible = local.slice(0, Math.min(2, local.length))
  return `${visible}***${domain}`
}

/** 날짜 포맷: 2026-03-26T12:34:56Z → 2026.03.26 12:34 */
function formatDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function VisitorsPanel() {
  const { data: visitors = [], isLoading, error, refetch } = useParentVisitors()
  const [search, setSearch] = useState('')

  // ── 중복 집계: email → 방문 횟수 ──────────────────
  const deduped = useMemo(() => {
    const map = new Map<string, { visitor: ParentVisitor; count: number }>()
    for (const v of visitors) {
      const key = v.email.toLowerCase()
      if (map.has(key)) {
        map.get(key)!.count++
      } else {
        map.set(key, { visitor: v, count: 1 })
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.visitor.created_at).getTime() - new Date(a.visitor.created_at).getTime()
    )
  }, [visitors])

  // ── 검색 필터 (도메인 기준 — 마스킹된 상태에서도 도메인 검색 허용) ──
  const filtered = useMemo(() => {
    if (!search.trim()) return deduped
    const q = search.toLowerCase()
    return deduped.filter(({ visitor }) =>
      visitor.email.toLowerCase().includes(q)
    )
  }, [deduped, search])

  // ── KPI ──────────────────────────────────────────
  const totalVisits  = visitors.length
  const uniqueEmails = deduped.length
  const todayCount   = useMemo(() => {
    const today = new Date().toDateString()
    return visitors.filter(v => new Date(v.created_at).toDateString() === today).length
  }, [visitors])

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#9C9890] text-sm">
        보호자 내역 불러오는 중…
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#D85A3A] text-sm mb-3">데이터를 불러오지 못했습니다.</p>
        <button
          onClick={() => refetch()}
          className="text-[.82rem] text-[#9C9890] underline hover:text-[#D85A3A]"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* KPI 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '전체 조회 신청',  value: totalVisits,  color: 'text-[#1A1714]' },
          { label: '고유 이메일',     value: uniqueEmails, color: 'text-[#1565C0]' },
          { label: '오늘 신청',       value: todayCount,   color: 'text-[#D85A3A]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#E8E4DF] rounded-xl px-5 py-4 text-center">
            <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
            <div className="text-[.73rem] text-[#9C9890] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* 검색 + 안내 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="도메인으로 검색 (예: gmail)"
            className="pl-9 pr-4 py-2 text-[.84rem] border border-[#E8E4DF] rounded-lg bg-white w-[240px] focus:outline-none focus:border-[#D85A3A] transition-colors"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9890] text-sm">🔍</span>
        </div>
        <span className="text-[.76rem] text-[#9C9890]">
          이메일 앞 2자리 이후 마스킹 처리 · 개인정보 보호 적용
        </span>
      </div>

      {/* 테이블 */}
      <div className="bg-white border border-[#E8E4DF] rounded-xl overflow-hidden">
        <table className="w-full text-[.84rem]">
          <thead>
            <tr className="border-b border-[#E8E4DF] bg-[#F7F5F2]">
              <th className="text-left px-5 py-3 font-bold text-[#5C5852] text-[.74rem] uppercase tracking-[.06em]">
                이메일 (마스킹)
              </th>
              <th className="text-center px-4 py-3 font-bold text-[#5C5852] text-[.74rem] uppercase tracking-[.06em] w-[80px]">
                조회 수
              </th>
              <th className="text-right px-5 py-3 font-bold text-[#5C5852] text-[.74rem] uppercase tracking-[.06em] w-[160px]">
                최초 신청일
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-16 text-[#9C9890] text-sm">
                  {search ? '검색 결과가 없습니다.' : '아직 조회 신청 내역이 없습니다.'}
                </td>
              </tr>
            ) : (
              filtered.map(({ visitor, count }) => (
                <tr
                  key={visitor.id}
                  className="border-b border-[#F0EDE8] last:border-0 hover:bg-[#FAFAF8] transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-[.82rem] text-[#1A1714]">
                    {maskEmail(visitor.email)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {count > 1 ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[.72rem] font-bold bg-[#FFF0EC] text-[#D85A3A]">
                        {count}회
                      </span>
                    ) : (
                      <span className="text-[#9C9890] text-[.8rem]">1회</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-[.8rem] text-[#5C5852]">
                    {formatDate(visitor.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-right text-[.74rem] text-[#9C9890]">
          {filtered.length}개 고유 이메일 · 전체 {totalVisits}건
        </p>
      )}
    </div>
  )
}
