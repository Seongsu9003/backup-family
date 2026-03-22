'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
}

const STEPS = [
  { text: <>아래 메시지를 복사해 카카오톡, 문자 등으로 <strong className="text-[#1A1A1A]">돌봄이에게 전달</strong>합니다.</> },
  { text: <>돌봄이가 링크에서 <strong className="text-[#1A1A1A]">레벨 테스트를 완료</strong>하고 저장합니다.</> },
  { text: <>돌봄이가 <strong className="text-[#1A1A1A]">&#39;적극적으로 구직 중&#39;</strong>을 선택하면 이 페이지에서 조회할 수 있습니다.</> },
]

export function InviteModal({ onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const testUrl =
    typeof window !== 'undefined'
      ? window.location.origin + '/'
      : 'https://backup-family.vercel.app/'

  const inviteMsg =
    `안녕하세요! 아이돌봄이 레벨 테스트를 소개합니다 😊\n\n` +
    `역량 테스트를 완료하시면 인증된 돌봄 인력으로 등록되고, 보호자들이 조회할 수 있어요.\n\n` +
    `📋 테스트 링크:\n${testUrl}\n\n` +
    `테스트 후 저장 시 구직 의사를 '적극적으로 구직 중'으로 선택해 주세요. ` +
    `이 링크에서 보호자가 돌봄이를 검색하고 연결 요청을 드릴 수 있어요.`

  const copyMsg = async () => {
    try { await navigator.clipboard.writeText(inviteMsg) }
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
        className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 bg-[#3A9E94] text-white">
          <h3 className="text-base font-bold">테스트 초대 메시지</h3>
          <p className="text-[.82rem] text-white/75 mt-1">아래 메시지를 복사해서 돌봄이에게 보내주세요</p>
        </div>

        <div className="p-6">
          {/* 사용 흐름 */}
          <div className="mb-5 space-y-3">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#3A9E94] text-white text-[.75rem] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-[.84rem] text-[#4A4A4A] leading-snug">{step.text}</p>
              </div>
            ))}
          </div>

          {/* 초대 메시지 */}
          <div className="bg-[#F7F5F3] border border-[#E4E0DC] rounded-lg p-4 text-[.84rem] text-[#4A4A4A] leading-relaxed whitespace-pre-wrap break-all mb-4">
            {inviteMsg}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onClose}
              className="py-3 rounded-lg border-[1.5px] border-[#E4E0DC] text-[#4A4A4A] text-[.87rem] font-bold hover:border-[#F0A090] hover:text-[#D85A3A] transition-colors"
            >
              닫기
            </button>
            <button
              onClick={copyMsg}
              className="py-3 rounded-lg bg-[#3A9E94] text-white text-[.87rem] font-bold hover:bg-[#2E8A80] transition-colors"
            >
              {copied ? '복사 완료!' : '메시지 복사'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
