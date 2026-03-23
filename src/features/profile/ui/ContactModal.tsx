'use client'

// ═══════════════════════════════════════════════════
//  연결 요청 모달 (BIZ-03)
//  보호자가 프로필 페이지에서 돌봄이 연결을 요청할 때 사용
//  현재: 운영팀 중개 방식 (프리랜서 단일 유형)
//  추후: 파견업체 소속 시 업체 연락처 직접 표시로 분기 예정
// ═══════════════════════════════════════════════════
import { useState } from 'react'

interface Props {
  caregiverName: string   // 마스킹된 이름 (예: 홍*동)
  profileUrl: string
  onClose: () => void
}

export function ContactModal({ caregiverName, profileUrl, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const copyUrl = async () => {
    try { await navigator.clipboard.writeText(profileUrl) }
    catch { /* fallback 생략 */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          {/* 안내 */}
          <p className="text-[.84rem] text-[#4A4A4A] leading-relaxed mb-4">
            아래 운영팀 채널로 이 프로필 링크를 보내주시면,
            해당 돌봄이에게 연결 의향을 확인 후 연락처를 안내해 드립니다.
          </p>

          {/* 운영팀 연락처 */}
          <div className="bg-[#DDF0EE] rounded-lg px-4 py-3 text-[.82rem] text-[#3A9E94] font-semibold text-center mb-4">
            이메일: <strong>hello@backup-family.com</strong>
            <span className="mx-2 text-[#3A9E94]/50">·</span>
            카카오채널: <strong>@backup-family</strong>
          </div>

          {/* 프로필 링크 복사 */}
          <div className="bg-[#F7F5F3] rounded-lg px-4 py-3 mb-5">
            <p className="text-[.72rem] text-[#8A8A8A] mb-1">이 돌봄이의 프로필 링크</p>
            <p className="text-[.78rem] font-semibold text-[#D85A3A] truncate">{profileUrl}</p>
          </div>

          {/* 버튼 */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={copyUrl}
              className="py-3 rounded-lg border-[1.5px] border-[#E4E0DC] text-[#4A4A4A] text-[.87rem] font-bold hover:border-[#F0A090] hover:text-[#D85A3A] transition-colors"
            >
              {copied ? '복사 완료!' : '링크 복사'}
            </button>
            <button
              onClick={onClose}
              className="py-3 rounded-lg bg-[#D85A3A] text-white text-[.87rem] font-bold hover:bg-[#C04830] transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
