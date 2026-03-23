'use client'

// ═══════════════════════════════════════════════════
//  돌봄이 연결 요청 모달 (검색 페이지용)
//  보호자가 연락처를 남기면 → /api/notify/contact → 텔레그램 알림
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { AnonymizedCaregiver, scoreRange } from '../model/types'
import { BASE_URL } from '@/shared/lib/constants'

type RequestState = 'idle' | 'sending' | 'done' | 'error'

interface Props {
  caregiver: AnonymizedCaregiver | null
  onClose: () => void
}

export function InquireModal({ caregiver: c, onClose }: Props) {
  const [parentName, setParentName]       = useState('')
  const [parentContact, setParentContact] = useState('')
  const [reqState, setReqState]           = useState<RequestState>('idle')

  if (!c) return null

  const typeLabel  = c.careType ? c.careType.label + '형 돌봄이' : '타입 미진단'
  const certLabel  = c.certStatus === '인증완료' ? '인증 완료' : c.certStatus
  const regionText = c.regions.length ? c.regions.join(' · ') : '미등록'

  // 텔레그램 알림에 포함될 돌봄이 요약 (익명) + 관리자용 프로필 링크
  const caregiverSummary =
    `${c.level?.label || '-'} · ${typeLabel} · ${scoreRange(c.score)} · ${regionText} · ${certLabel}`
  const profileUrl = c._testId ? `${BASE_URL}/profile/${c._testId}` : undefined

  const canRequest = parentContact.trim() !== ''

  const handleRequest = async () => {
    if (!canRequest || reqState !== 'idle') return
    setReqState('sending')
    try {
      await fetch('/api/notify/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverName: `${c.maskedName} 돌봄이 (검색 페이지)`,
          caregiverSummary,
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

  const rows: [string, string][] = [
    ['레벨',          c.level?.label || '-'],
    ['돌봄 타입',     typeLabel],
    ['역량 점수 구간', scoreRange(c.score)],
    ['인증 상태',     certLabel],
    ['선호 지역',     regionText],
  ]

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl overflow-hidden animate-[slideUp_.22s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-5 bg-[#C04830] text-white">
          <h3 className="text-base font-bold">돌봄이 연결 요청</h3>
          <p className="text-[.82rem] text-white/75 mt-1">
            운영팀을 통해 해당 돌봄이와 연결해 드립니다
          </p>
        </div>

        <div className="p-6">
          {reqState === 'done' ? (
            /* ── 요청 완료 뷰 ── */
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-[.95rem] font-bold text-[#1A1A1A] mb-2">연결 요청이 접수되었습니다</p>
              <p className="text-[.82rem] text-[#8A8A8A] leading-relaxed mb-6">
                운영팀이 돌봄이의 연결 의향을 확인하고
                입력하신 연락처로 안내해 드립니다.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg bg-[#D85A3A] text-white text-[.87rem] font-bold hover:bg-[#C04830] transition-colors"
              >
                확인
              </button>
            </div>
          ) : (
            <>
              {/* 돌봄이 요약 정보 */}
              <div className="bg-[#F7F5F3] rounded-lg px-4 py-3 mb-4">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center mb-1.5 last:mb-0 text-[.84rem]">
                    <span className="text-[#8A8A8A] font-medium">{label}</span>
                    <span className="font-bold text-[#1A1A1A] text-right max-w-[200px]">{value}</span>
                  </div>
                ))}
              </div>

              <p className="text-[.83rem] text-[#4A4A4A] leading-relaxed mb-4">
                운영팀이 연락드릴 수 있도록 연락처를 남겨주세요.
              </p>

              {/* 보호자 이름 */}
              <div className="flex flex-col gap-1 mb-3">
                <label className="text-[.8rem] font-semibold text-[#4A4A4A]">
                  이름 <span className="text-[#8A8A8A] font-normal">(선택)</span>
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="홍길동"
                  className="px-3 py-2.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.88rem] bg-[#FAFAFA] outline-none focus:border-[#D85A3A] transition-colors"
                />
              </div>

              {/* 보호자 연락처 */}
              <div className="flex flex-col gap-1 mb-5">
                <label className="text-[.8rem] font-semibold text-[#4A4A4A]">
                  연락처 <span className="text-[#D85A3A]">*</span>
                </label>
                <input
                  type="text"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="010-0000-0000 또는 이메일"
                  className="px-3 py-2.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.88rem] bg-[#FAFAFA] outline-none focus:border-[#D85A3A] transition-colors"
                />
                <span className="text-[.74rem] text-[#8A8A8A]">운영팀이 이 연락처로 연락드립니다.</span>
              </div>

              {/* 버튼 */}
              <button
                onClick={handleRequest}
                disabled={!canRequest || reqState === 'sending'}
                className="w-full py-3 rounded-lg bg-[#D85A3A] text-white text-[.9rem] font-bold hover:bg-[#C04830] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-2.5"
              >
                {reqState === 'sending' ? '요청 중…' : '운영팀에 연결 요청하기'}
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg border-[1.5px] border-[#E4E0DC] text-[#4A4A4A] text-[.84rem] font-bold hover:border-[#D85A3A] hover:text-[#D85A3A] transition-colors"
              >
                닫기
              </button>

              {reqState === 'error' && (
                <p className="text-[.76rem] text-[#D85A3A] text-center mt-2">
                  전송에 실패했습니다. hello@backup-family.com 으로 직접 문의해 주세요.
                </p>
              )}

              <p className="text-[.72rem] text-[#AAAAAA] text-center mt-3">
                직접 문의: hello@backup-family.com · 카카오채널 @backup-family
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
