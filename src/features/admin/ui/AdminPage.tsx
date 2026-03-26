'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import type { TestResult } from '@/shared/types'
import { useAdminResults } from '../model/useAdminResults'
import { getTabResults, type TabKey } from '../model/types'
import { getSession, signOut } from '../model/useAdminAuth'
import { useBulkSetStatus } from '../model/useBulkSetStatus'
import { StatsDashboard } from './StatsDashboard'
import { PartnerPanel } from './PartnerPanel'
import { PlacesPanel } from './PlacesPanel'
import { ResultsTable } from './ResultsTable'
import { ResultModal } from './ResultModal'
import { VisitorsPanel } from './VisitorsPanel'

// ── 사이드바 메뉴 정의 ────────────────────────────
type MenuKey = 'dashboard' | 'results' | 'visitors' | 'places' | 'partners'

const MENU_ITEMS: { key: MenuKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: '대시보드',       icon: '📊' },
  { key: 'results',   label: '돌봄이 관리',    icon: '👥' },
  { key: 'visitors',  label: '보호자 조회 내역', icon: '👨‍👩‍👧' },
  { key: 'places',    label: '추천 장소',      icon: '🏥' },
  { key: 'partners',  label: '파트너',         icon: '🤝' },
]

// ── CSV 내보내기 유틸 ─────────────────────────────
function exportCSV(results: TestResult[], tab: TabKey) {
  const list = getTabResults(results, tab)
  if (!list.length) { alert('내보낼 데이터가 없습니다.'); return }

  const headers = ['이름','연락처','레벨','총점','설문점수','시나리오점수','인증상태','구직여부','돌봄타입','선호지역','서류첨부','테스트일자','만료일','관리자메모']
  const rows = list.map(r => [
    r.tester?.name || '',
    r.tester?.contact || '',
    r.level?.label || '',
    r.score?.total || 0,
    r.score?.survey || 0,
    r.score?.scenario || 0,
    r.certification?.status || '',
    r.job_seeking || '',
    r.care_type?.fullLabel || r.care_type?.label || '',
    (r.tester?.preferred_region || []).join(' / '),
    (r.certification?.docs_attached || []).join('; '),
    new Date(r.meta?.created_at).toLocaleDateString('ko-KR'),
    new Date(r.meta?.expires_at).toLocaleDateString('ko-KR'),
    r.certification?.admin_memo || '',
  ])

  const bom = '\uFEFF'
  const csv = bom + [headers, ...rows].map(row =>
    row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  ).join('\n')

  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  a.download = `buf_${tab}_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
}

// ─── SEC-03: 로그아웃 시 서버사이드 세션 쿠키를 삭제합니다 ───
async function clearSessionCookie(): Promise<void> {
  await fetch('/api/admin/session', { method: 'DELETE' })
}

export function AdminPage() {
  const router = useRouter()

  // Supabase 세션 (null = 확인 중, false = 미인증, Session = 인증됨)
  // proxy.ts가 1차 서버사이드 가드, 여기서는 2차 클라이언트 가드를 담당합니다.
  const [session,     setSession]     = useState<Session | null | false>(null)
  const [activeMenu,  setActiveMenu]  = useState<MenuKey>('dashboard')
  const [activeTab,   setActiveTab]   = useState<TabKey>('all')
  const [selected,    setSelected]    = useState<TestResult | null>(null)
  // ── 일괄 처리 선택 상태 (OPS) ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data: results = [], isLoading, refetch } = useAdminResults()
  const bulkSetStatus = useBulkSetStatus()

  // 마운트 시 기존 세션 복원
  useEffect(() => {
    getSession().then((s) => {
      if (!s) {
        clearSessionCookie().then(() => router.push('/admin/login'))
      } else {
        setSession(s)
      }
    })
  }, [router])

  const handleLogout = async () => {
    await signOut()
    await clearSessionCookie()
    router.push('/admin/login')
  }

  // ── 탭 변경 시 선택 초기화 ─────────────────────
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    setSelectedIds(new Set())
  }

  // ── 단일 행 토글 ──────────────────────────────
  const handleToggleSelect = (testId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(testId)) next.delete(testId)
      else next.add(testId)
      return next
    })
  }

  // ── 전체 선택 / 전체 해제 ─────────────────────
  const handleToggleAll = (ids: string[]) => {
    setSelectedIds(new Set(ids))
  }

  // ── 일괄 인증완료 처리 ────────────────────────
  const handleBulkCertify = async () => {
    const targets = results.filter((r) => selectedIds.has(r.meta.test_id))
    if (targets.length === 0) return

    const confirmed = window.confirm(
      `선택된 ${targets.length}건을 일괄 인증완료 처리하시겠습니까?`
    )
    if (!confirmed) return

    try {
      const { succeeded, failed } = await bulkSetStatus.mutateAsync(targets)
      setSelectedIds(new Set())
      if (failed > 0) {
        alert(`처리 완료: ${succeeded}건 성공 / ${failed}건 실패\n실패 건은 개별 확인이 필요합니다.`)
      } else {
        alert(`${succeeded}건 인증완료 처리되었습니다.`)
      }
    } catch {
      alert('일괄 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  // 세션 확인 전 (초기 로딩) 또는 리다이렉트 진행 중
  if (session === null || session === false) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center">
        <p className="text-[#9C9890] text-sm">인증 확인 중…</p>
      </div>
    )
  }

  const activeItem = MENU_ITEMS.find(m => m.key === activeMenu)!

  // 인증됨 — 사이드바 레이아웃
  return (
    <div className="flex min-h-screen bg-[#F7F5F2]">

      {/* ── SIDEBAR ─────────────────────────────── */}
      <aside className="w-[220px] shrink-0 bg-[#1A1714] flex flex-col sticky top-0 h-screen overflow-y-auto">

        {/* 브랜드 */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.07]">
          <div className="text-white font-bold text-[.95rem] leading-tight tracking-[-0.02em]">
            backup-family
          </div>
          <div className="text-[#5C5852] text-[.7rem] mt-1 font-medium uppercase tracking-[.06em]">
            Admin Console
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {MENU_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveMenu(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[.84rem] font-medium transition-colors text-left ${
                activeMenu === key
                  ? 'bg-[#D85A3A] text-white'
                  : 'text-[#9C9890] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* 서비스 링크 */}
        <div className="px-3 pb-2">
          <p className="px-3 py-2 text-[.68rem] font-bold uppercase tracking-[.08em] text-[#444]">
            서비스 페이지
          </p>
          {[
            { href: '/search', label: '보호자 조회' },
            { href: '/places', label: '추천 장소' },
            { href: '/test',   label: '레벨 테스트' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[.8rem] text-[#5C5852] hover:bg-white/[0.06] hover:text-[#9C9890] transition-colors"
            >
              <span className="w-1 h-1 rounded-full bg-[#444] shrink-0" />
              {label}
            </Link>
          ))}
        </div>

        {/* 하단 액션 */}
        <div className="px-3 py-4 border-t border-white/[0.07] space-y-0.5">
          <button
            onClick={() => refetch()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[.82rem] text-[#5C5852] hover:bg-white/[0.06] hover:text-[#9C9890] transition-colors text-left"
          >
            <span className="text-base leading-none">↻</span>
            새로고침
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[.82rem] text-[#5C5852] hover:bg-white/[0.06] hover:text-[#C04828] transition-colors text-left"
          >
            <span className="text-base leading-none">→</span>
            로그아웃
          </button>
        </div>
      </aside>

      {/* ── CONTENT ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* 콘텐츠 헤더 */}
        <header className="shrink-0 bg-white border-b border-[#E8E4DF] px-8 h-14 flex items-center justify-between gap-4">
          <h1 className="flex items-center gap-2.5 text-[1rem] font-bold text-[#1A1714] tracking-[-0.02em]">
            <span className="text-[1.1rem]">{activeItem.icon}</span>
            {activeItem.label}
          </h1>
          <span className="text-[.72rem] text-[#9C9890] font-medium">
            BUF Admin · v1.4
          </span>
        </header>

        {/* 섹션별 콘텐츠 */}
        <main className="flex-1 px-8 py-6 overflow-auto">
          {isLoading ? (
            <div className="py-20 text-center text-[#9C9890] text-sm">
              데이터 불러오는 중…
            </div>
          ) : (
            <>
              {activeMenu === 'dashboard' && (
                <StatsDashboard results={results} />
              )}
              {activeMenu === 'results' && (
                <ResultsTable
                  results={results}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  onRowClick={setSelected}
                  onExportCSV={() => exportCSV(results, activeTab)}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleAll={handleToggleAll}
                  onBulkCertify={handleBulkCertify}
                  isBulkLoading={bulkSetStatus.isPending}
                />
              )}
              {activeMenu === 'visitors' && <VisitorsPanel />}
              {activeMenu === 'places'   && <PlacesPanel />}
              {activeMenu === 'partners' && <PartnerPanel />}
            </>
          )}
        </main>
      </div>

      {/* ── 상세 모달 ───────────────────────── */}
      {selected && (
        <ResultModal
          result={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
