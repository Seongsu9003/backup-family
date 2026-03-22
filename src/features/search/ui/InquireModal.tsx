'use client'

import { useState } from 'react'
import { AnonymizedCaregiver, scoreRange } from '../model/types'

interface Props {
  caregiver: AnonymizedCaregiver | null
  onClose: () => void
}

export function InquireModal({ caregiver: c, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  if (!c) return null

  const typeLabel  = c.careType ? c.careType.label + '형 돌봄이' : '타입 미진단'
  const certLabel  = c.certStatus === '인증완료' ? '인증 완료' : c.certStatus
  const regionText = c.regions.length ? c.regions.join(' · ') : '미등록'

  const profileMsg =
    `[돌봄이 연결 문의]\n` +
    `레벨: ${c.level?.label || '-'} / 돌봄 타입: ${typeLabel}\n` +
    `역량 점수 구간: ${scoreRange(c.score)}\n` +
    `선호 지역: ${regionText}\n` +
    `인증 상태: ${certLabel}`

  const copyProfile = async () => {
    try { await navigator.clipboard.writeText(profileMsg) }
    catch { /* fallback 생략 */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const rows: [string, string][] = [
    ['레벨',        c.level?.label || '-'],
    ['돌봄 타입',   typeLabel],
    ['역량 점수 구간', scoreRange(c.score)],
    ['인증 상태',   certLabel],
    ['선호 지역',   regionText],
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
        <div className="px-6 py-5 bg-[#C04830] text-white">
          <h3 className="text-base font-bold">돌봄이 연결 문의</h3>
          <p className="text-[.82rem] text-white/75 mt-1">아래 프로필 정보를 운영팀에 전달해 주세요</p>
        </div>

        <div className="p-6">
          {/* 프로필 요약 */}
          <div className="bg-[#F7F5F3] rounded-lg px-4 py-3 mb-4">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between items-center mb-1.5 last:mb-0 text-[.84rem]">
                <span className="text-[#8A8A8A] font-medium">{label}</span>
                <span className="font-bold text-[#1A1A1A] text-right max-w-[200px]">{value}</span>
              </div>
            ))}
          </div>

          <p className="text-[.84rem] text-[#4A4A4A] leading-relaxed mb-4">
            이 프로필 정보를 운영팀에 전달하시면, 해당 돌봄이에게 연결 의향을 확인 후 연락처를 안내해 드립니다.
          </p>

          <div className="bg-[#DDF0EE] rounded-lg px-4 py-3 text-[.82rem] text-[#3A9E94] font-semibold text-center mb-5">
            운영팀: <strong>hello@backup-family.com</strong> · 카카오채널 <strong>@backup-family</strong>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={copyProfile}
              className="py-3 rounded-lg border-[1.5px] border-[#E4E0DC] text-[#4A4A4A] text-[.87rem] font-bold hover:border-[#F0A090] hover:text-[#D85A3A] transition-colors"
            >
              {copied ? '복사 완료!' : '프로필 복사'}
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
