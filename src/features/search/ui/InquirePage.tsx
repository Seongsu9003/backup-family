'use client'

// ═══════════════════════════════════════════════════
//  돌봄이 연결 요청 페이지 — /search/[id]
//  보호자가 연락처를 남기면 → /api/notify/contact → 텔레그램 알림
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import Link from 'next/link'
import { useCaregiver } from '../model/useCaregiver'
import { scoreRange } from '../model/types'
import { BASE_URL } from '@/shared/lib/constants'

type RequestState = 'idle' | 'sending' | 'done' | 'error'

interface Props {
  testId: string
}

export function InquirePage({ testId }: Props) {
  const { data: c, isLoading, isError } = useCaregiver(testId)

  const [parentName, setParentName]       = useState('')
  const [parentContact, setParentContact] = useState('')
  const [reqState, setReqState]           = useState<RequestState>('idle')

  // ── 로딩 / 에러 / 미존재 ───────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center text-[#9C9890] text-[14px]">
        불러오는 중…
      </div>
    )
  }

  if (isError || !c) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-[2rem]">🔍</p>
        <p className="text-[15px] text-[#5C5852]" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
          해당 돌봄이를 찾을 수 없습니다.
        </p>
        <Link href="/search" className="text-[13px] font-bold text-[#D85A3A] hover:underline">
          ← 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const typeLabel    = c.careType ? c.careType.label + '형 돌봄이' : '타입 미진단'
  const certLabel    = c.certStatus === '인증완료' ? '인증 완료' : c.certStatus
  const regionText   = c.regions.length ? c.regions.join(' · ') : '미등록'
  const profileUrl   = `${BASE_URL}/profile/${testId}`
  const canRequest   = parentContact.trim() !== ''

  const rows: [string, string][] = [
    ['레벨',          c.level?.label || '-'],
    ['돌봄 타입',     typeLabel],
    ['역량 점수 구간', scoreRange(c.score)],
    ['인증 상태',     certLabel],
    ['선호 지역',     regionText],
  ]

  const handleRequest = async () => {
    if (!canRequest || reqState !== 'idle') return
    setReqState('sending')
    try {
      await fetch('/api/notify/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverName: `${c.maskedName} 돌봄이 (검색 페이지)`,
          caregiverSummary: `${c.level?.label || '-'} · ${typeLabel} · ${scoreRange(c.score)} · ${regionText} · ${certLabel}`,
          profileUrl,
          parentName: parentName.trim() || '미입력',
          parentContact: parentContact.trim(),
        }),
      })
      setReqState('done')
    } catch {
      setReqState('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2]">

      {/* ── HEADER — warm sticky nav ── */}
      <header className="sticky top-0 z-20 bg-[#F7F5F2]/95 backdrop-blur-sm border-b border-[#E8E4DF] px-5 h-14 flex items-center gap-3">
        <Link
          href="/search"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#5C5852] hover:bg-[#E8E4DF] transition-colors"
          aria-label="목록으로"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <span className="text-[15px] font-bold text-[#1A1714]">돌봄이 연결 요청</span>
      </header>

      <main className="max-w-[480px] mx-auto px-5 py-8">

        {reqState === 'done' ? (
          /* ── 요청 완료 뷰 ── */
          <div className="relative bg-white rounded-2xl border border-[#E8E4DF] p-8 overflow-hidden text-center">
            <div className="absolute inset-[5px] rounded-[14px] border border-black/[0.04] pointer-events-none" />
            <div className="relative" style={{ zIndex: 1 }}>
              <div className="text-[3rem] mb-4">✅</div>
              <p className="text-[17px] font-bold text-[#1A1714] mb-2">연결 요청이 접수되었습니다</p>
              <p
                className="text-[14px] text-[#5C5852] leading-[1.7] mb-7"
                style={{ wordBreak: 'keep-all' } as React.CSSProperties}
              >
                운영팀이 돌봄이의 연결 의향을 확인하고<br />
                입력하신 연락처로 안내해 드립니다.
              </p>
              <Link
                href="/search"
                className="block w-full py-3 rounded-xl bg-[#D85A3A] text-white text-[14px] font-bold text-center hover:bg-[#C04828] transition-colors"
              >
                목록으로 돌아가기
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── 돌봄이 요약 카드 — Double-Bezel ── */}
            <div className="relative bg-white rounded-2xl border border-[#E8E4DF] p-5 mb-5 overflow-hidden">
              <div className="absolute inset-[5px] rounded-[14px] border border-black/[0.04] pointer-events-none" />
              <div className="relative" style={{ zIndex: 1 }}>
                <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#9C9890] mb-3">돌봄이 정보</p>
                {rows.map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-[#F0EDE9] last:border-0 text-[14px]">
                    <span className="text-[#9C9890] font-medium">{label}</span>
                    <span className="font-bold text-[#1A1714] text-right max-w-[200px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 연결 요청 폼 — Double-Bezel ── */}
            <div className="relative bg-white rounded-2xl border border-[#E8E4DF] p-5 overflow-hidden">
              <div className="absolute inset-[5px] rounded-[14px] border border-black/[0.04] pointer-events-none" />
              <div className="relative" style={{ zIndex: 1 }}>
                <p
                  className="text-[14px] text-[#5C5852] leading-[1.7] mb-5"
                  style={{ wordBreak: 'keep-all' } as React.CSSProperties}
                >
                  운영팀이 연락드릴 수 있도록 연락처를 남겨주세요.
                </p>

                {/* 보호자 이름 */}
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-[12px] font-bold text-[#5C5852]">
                    이름 <span className="text-[#9C9890] font-normal">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="홍길동"
                    className="px-4 py-3 border border-[#E8E4DF] rounded-xl text-[15px] bg-[#FAFAF9] outline-none focus:border-[#D85A3A] transition-colors"
                  />
                </div>

                {/* 보호자 연락처 */}
                <div className="flex flex-col gap-1.5 mb-6">
                  <label className="text-[12px] font-bold text-[#5C5852]">
                    연락처 <span className="text-[#D85A3A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={parentContact}
                    onChange={(e) => setParentContact(e.target.value)}
                    placeholder="010-0000-0000 또는 이메일"
                    className="px-4 py-3 border border-[#E8E4DF] rounded-xl text-[15px] bg-[#FAFAF9] outline-none focus:border-[#D85A3A] transition-colors"
                  />
                  <span className="text-[12px] text-[#9C9890]">운영팀이 이 연락처로 연락드립니다.</span>
                </div>

                {/* 요청 버튼 */}
                <button
                  onClick={handleRequest}
                  disabled={!canRequest || reqState === 'sending'}
                  className="w-full py-3.5 rounded-xl bg-[#D85A3A] text-white text-[15px] font-bold hover:bg-[#C04828] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 mb-3"
                >
                  {reqState === 'sending' ? '요청 중…' : '운영팀에 연결 요청하기'}
                </button>

                {reqState === 'error' && (
                  <p className="text-[12px] text-[#D85A3A] text-center mb-3">
                    전송에 실패했습니다. hello@backup-family.com 으로 직접 문의해 주세요.
                  </p>
                )}

                <p className="text-[11px] text-[#9C9890] text-center">
                  직접 문의: hello@backup-family.com · 카카오채널 @backup-family
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
