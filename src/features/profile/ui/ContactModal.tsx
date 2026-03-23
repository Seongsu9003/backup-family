'use client'

// ═══════════════════════════════════════════════════
//  연결 요청 모달 (BIZ-03)
//  보호자가 프로필 페이지에서 돌봄이 연결을 요청할 때 사용
//  현재: 운영팀 중개 방식 (프리랜서 단일 유형)
//  추후: 파견업체 소속 시 업체 연락처 직접 표시로 분기 예정
// ═══════════════════════════════════════════════════
import { useState } from 'react'

type RequestState = 'idle' | 'sending' | 'done' | 'error'

interface Props {
  caregiverName: string   // 마스킹된 이름 (예: 홍*동)
  profileUrl: string
  onClose: () => void
}

export function ContactModal({ caregiverName, profileUrl, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [reqState, setReqState] = useState<RequestState>('idle')

  const copyUrl = async () => {
    try { await navigator.clipboard.writeText(profileUrl) }
    catch { /* fallback 생략 */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRequest = async () => {
    if (reqState !== 'idle') return
    setReqState('sending')
    try {
      await fetch('/api/notify/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverName, profileUrl }),
      })
      setReqState('done')
    } catch {
      setReqState('error')
    }
  }

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
            운영팀을 통해 <strong>{caregiverName}</strong> 님과 연결해 드립니다
          </p>
        </div>

        <div className="p-6">
          {reqState === 'done' ? (
            /* ── 요청 완료 뷰 ── */
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-[.95rem] font-bold text-[#1A1A1A] mb-2">연결 요청이 접수되었습니다</p>
              <p className="text-[.82rem] text-[#8A8A8A] leading-relaxed mb-6">
                운영팀이 확인 후 <strong>{caregiverName}</strong> 님께 연결 의향을 확인하고
                연락처를 안내해 드립니다.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg bg-[#D85A3A] text-white text-[.87rem] font-bold hover:bg-[#C04830] transition-colors"
              >
                확인
              </button>
            </div>
          ) : (
            /* ── 기본 뷰 ── */
            <>
              <p className="text-[.84rem] text-[#4A4A4A] leading-relaxed mb-4">
                버튼을 누르면 운영팀에 연결 요청이 전달됩니다.
                해당 돌봄이에게 연결 의향을 확인 후 연락처를 안내해 드립니다.
              </p>

              {/* 운영팀 직접 연락 */}
              <div className="bg-[#F7F5F3] rounded-lg px-4 py-3 text-[.78rem] text-[#8A8A8A] text-center mb-4">
                직접 문의: <strong className="text-[#4A4A4A]">hello@backup-family.com</strong>
                <span className="mx-1.5">·</span>
                카카오채널 <strong className="text-[#4A4A4A]">@backup-family</strong>
              </div>

              {/* 프로필 링크 */}
              <div className="bg-[#F7F5F3] rounded-lg px-4 py-3 mb-5">
                <p className="text-[.72rem] text-[#8A8A8A] mb-1">이 돌봄이의 프로필 링크</p>
                <p className="text-[.78rem] font-semibold text-[#D85A3A] truncate">{profileUrl}</p>
              </div>

              {/* 버튼 */}
              <button
                onClick={handleRequest}
                disabled={reqState === 'sending'}
                className="w-full py-3 rounded-lg bg-[#D85A3A] text-white text-[.9rem] font-bold hover:bg-[#C04830] disabled:opacity-50 transition-colors mb-2.5"
              >
                {reqState === 'sending' ? '요청 중…' : '운영팀에 연결 요청하기'}
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={copyUrl}
                  className="py-2.5 rounded-lg border-[1.5px] border-[#E4E0DC] text-[#4A4A4A] text-[.84rem] font-bold hover:border-[#F0A090] hover:text-[#D85A3A] transition-colors"
                >
                  {copied ? '복사 완료!' : '링크 복사'}
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 rounded-lg border-[1.5px] border-[#E4E0DC] text-[#4A4A4A] text-[.84rem] font-bold hover:border-[#E4E0DC] transition-colors"
                >
                  닫기
                </button>
              </div>
              {reqState === 'error' && (
                <p className="text-[.76rem] text-[#D85A3A] text-center mt-2">
                  요청 전송에 실패했습니다. 직접 운영팀에 연락해 주세요.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
