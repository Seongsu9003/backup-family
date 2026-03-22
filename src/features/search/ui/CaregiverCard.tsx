'use client'

import { AnonymizedCaregiver, LV_COLORS, scoreRange } from '../model/types'

const LV_BADGE: Record<number, string> = {
  1: 'bg-[#F7F5F3] text-[#555]',
  2: 'bg-[#EBF5FB] text-[#1A6B9A]',
  3: 'bg-[#DDF0EE] text-[#1A7A72]',
  4: 'bg-[#FAE8E3] text-[#C04830]',
  5: 'bg-[#F5EEF8] text-[#6C3483]',
}

interface Props {
  caregiver: AnonymizedCaregiver
  onInquire: () => void
}

export function CaregiverCard({ caregiver: c, onInquire }: Props) {
  const lvNum    = c.level?.num || 1
  const avatarBg = LV_COLORS[lvNum] || '#888'

  return (
    <div className="bg-white border border-[#E4E0DC] rounded-2xl p-[22px] transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* 상단: 아바타 + 이름 */}
      <div className="flex items-center gap-3.5 mb-4">
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl font-extrabold text-white shrink-0"
          style={{ background: avatarBg }}
        >
          {c.avatarLetter}
        </div>
        <div>
          <div className="text-[.95rem] font-bold text-[#1A1A1A]">{c.maskedName} 돌봄이</div>
          <div className="text-[.75rem] text-[#8A8A8A] mt-0.5">구직 활동 중</div>
        </div>
      </div>

      {/* 배지 */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${LV_BADGE[lvNum] ?? LV_BADGE[1]}`}>
          {c.level?.label || 'Lv.1'}
        </span>
        {c.certStatus === '인증완료' ? (
          <span className="px-2.5 py-0.5 rounded-full text-[.73rem] font-semibold bg-[#D5F5E3] text-[#1A7A45]">
            인증 완료
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-[.73rem] font-semibold bg-[#F7F5F3] text-[#8A8A8A] border border-[#E4E0DC]">
            {c.certStatus}
          </span>
        )}
        {c.careType && (
          <span
            className="px-2.5 py-0.5 rounded-full text-[.73rem] font-bold text-white"
            style={{ background: c.careType.color || '#888' }}
          >
            {c.careType.label}
          </span>
        )}
      </div>

      {/* 선호 지역 */}
      <div className="text-[.7rem] text-[#8A8A8A] font-bold uppercase tracking-wide mb-1.5">
        선호 활동 지역
      </div>
      <div className="flex flex-wrap gap-1 mb-3.5">
        {c.regions.length > 0 ? (
          c.regions.map((rg) => (
            <span key={rg} className="bg-[#F7F5F3] border border-[#E4E0DC] rounded px-2 py-0.5 text-[.73rem] text-[#4A4A4A]">
              {rg}
            </span>
          ))
        ) : (
          <span className="text-[.78rem] text-[#8A8A8A]">지역 미등록</span>
        )}
      </div>

      {/* 점수 구간 */}
      <div className="flex justify-between items-center py-2.5 border-t border-[#E4E0DC] text-[.78rem] text-[#8A8A8A] mb-3.5">
        <span>역량 점수 구간</span>
        <strong className="text-[#4A4A4A]">{scoreRange(c.score)}</strong>
      </div>

      {/* 문의 버튼 */}
      <button
        onClick={onInquire}
        className="w-full py-2.5 rounded-lg bg-[#D85A3A] text-white text-[.87rem] font-bold hover:bg-[#C04830] transition-colors"
      >
        문의하기
      </button>
    </div>
  )
}
