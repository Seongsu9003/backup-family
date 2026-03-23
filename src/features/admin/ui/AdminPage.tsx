'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'
import type { TestResult } from '@/shared/types'
import { useAdminResults } from '../model/useAdminResults'
import { getTabResults, type TabKey } from '../model/types'
import { getSession, signOut } from '../model/useAdminAuth'
import { LoginScreen } from './LoginScreen'
import { StatsDashboard } from './StatsDashboard'
import { ResultsTable } from './ResultsTable'
import { ResultModal } from './ResultModal'

// CSV 내보내기 유틸
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

export function AdminPage() {
  // Supabase 세션으로 인증 관리 (null = 미확인, false = 미인증, Session = 인증됨)
  const [session,    setSession]    = useState<Session | null | false>(null)
  const [activeTab,  setActiveTab]  = useState<TabKey>('all')
  const [selected,   setSelected]   = useState<TestResult | null>(null)

  const { data: results = [], isLoading, refetch } = useAdminResults()

  // 마운트 시 기존 세션 복원
  useEffect(() => {
    getSession().then((s) => setSession(s ?? false))
  }, [])

  const handleLogout = async () => {
    await signOut()
    setSession(false)
  }

  // 세션 확인 전 (초기 로딩)
  if (session === null) {
    return (
      <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center">
        <p className="text-[#8A8A8A] text-sm">인증 확인 중…</p>
      </div>
    )
  }

  // 미인증
  if (session === false) {
    return <LoginScreen onLogin={(s) => setSession(s)} />
  }

  // 인증됨
  return (
    <>
      {/* ── TOPBAR ──────────────────────────── */}
      <header className="bg-[#2C2C2C] px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-[.97rem]">backup-family 인증 관리</span>
          <span className="text-[#888] text-[.72rem]">BUF v1.3 · DEV</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/search" className="text-[.78rem] text-[#aaa] px-3 py-1.5 border border-[#444] rounded-lg hover:text-white hover:border-[#666] transition-colors">
            보호자 조회 페이지
          </Link>
          <Link href="/" className="text-[.78rem] text-[#aaa] px-3 py-1.5 border border-[#444] rounded-lg hover:text-white hover:border-[#666] transition-colors">
            테스트 페이지
          </Link>
          <button
            onClick={() => refetch()}
            className="text-[.78rem] text-[#aaa] px-3 py-1.5 border border-[#444] rounded-lg hover:text-white hover:border-[#666] transition-colors"
          >
            새로고침
          </button>
          <button
            onClick={handleLogout}
            className="text-[.78rem] text-[#aaa] px-3 py-1.5 border border-[#444] rounded-lg hover:text-white hover:border-[#666] transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────── */}
      <main className="max-w-[1400px] mx-auto px-6 py-6 w-full">
        {isLoading ? (
          <div className="py-20 text-center text-[#8A8A8A]">데이터 불러오는 중…</div>
        ) : (
          <>
            <StatsDashboard results={results} />
            <ResultsTable
              results={results}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onRowClick={setSelected}
              onExportCSV={() => exportCSV(results, activeTab)}
            />
          </>
        )}
      </main>

      {/* ── 상세 모달 ───────────────────────── */}
      {selected && (
        <ResultModal
          result={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
