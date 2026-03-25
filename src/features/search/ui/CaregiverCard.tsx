'use client'

// ═══════════════════════════════════════════════════
//  돌봄이 카드 — Supanova Double-Bezel + Spring
//  - 점수 제거, 유형 설명 표시
//  - 접수 완료 상태 배지 (localStorage)
// ═══════════════════════════════════════════════════
import Link from 'next/link'
import { AnonymizedCaregiver, LV_COLORS, CARE_TYPE_INFO } from '../model/types'
import { useInquiryStore, formatInquiryDate } from '../model/useInquiryStore'

const LV_BADGE: Record<number, string> = {
  1: 'bg-[#F7F5F3] text-[#5C5852]',
  2: 'bg-[#EBF2FC] text-[#1565C0]',
  3: 'bg-[#DDF0EE] text-[#1A7A72]',
  4: 'bg-[#FDF2EE] text-[#C04828]',
  5: 'bg-[#F5EEF8] text-[#6C3483]',
}

interface Props {
  caregiver: AnonymizedCaregiver
}

export function CaregiverCard({ caregiver: c }: Props) {
  const lvNum    = c.level?.num || 1
  const avatarBg = LV_COLORS[lvNum] || '#888'
  const typeInfo = c.careType?.code ? CARE_TYPE_INFO[c.careType.code] : null

  const { getInquiryDate } = useInquiryStore()
  const inquiryDate = getInquiryDate(c._testId)

  return (
    <div className="relative bg-white border border-[#E8E4DF] rounded-2xl p-[22px] overflow-hidden transition-[transform,box-shadow] duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,.10)]">
      {/* Double-Bezel inner ring */}
      <div className="absolute inset-[5px] rounded-[14px] border border-black/[0.04] pointer-events-none" />

      {/* 접수 완료 배지 */}
      {inquiryDate && (
        <div className="relative flex items-center gap-1.5 bg-[#EEF6EF] border border-[#C8E6C9] rounded-lg px-3 py-1.5 mb-3" style={{ zIndex: 1 }}>
          <span className="text-[11px]">✅</span>
          <span className="text-[11px] font-bold text-[#2E7D32]">
            {formatInquiryDate(inquiryDate)} 접수 완료
          </span>
        </div>
      )}

      {/* 상단: 아바타 + 이름 */}
      <div className="relative flex items-center gap-3.5 mb-4" style={{ zIndex: 1 }}>
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl font-extrabold text-white shrink-0"
          style={{ background: avatarBg }}
        >
          {c.avatarLetter}
        </div>
        <div>
          <div className="text-[15px] font-bold text-[#1A1714]">{c.maskedName} 돌봄이</div>
          <div className="text-[12px] text-[#9C9890] mt-0.5">구직 활동 중</div>
        </div>
      </div>

      {/* 배지 */}
      <div className="relative flex flex-wrap gap-1.5 mb-3.5" style={{ zIndex: 1 }}>
        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${LV_BADGE[lvNum] ?? LV_BADGE[1]}`}>
          {c.level?.label || 'Lv.1'}
        </span>
        {c.certStatus === '인증완료' ? (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF6EF] text-[#2E7D32]">
            ✓ 인증 완료
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F7F5F3] text-[#9C9890] border border-[#E8E4DF]">
            {c.certStatus}
          </span>
        )}
        {c.careType && (
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
            style={{ background: c.careType.color || '#888' }}
          >
            {typeInfo?.emoji && <span className="mr-0.5">{typeInfo.emoji}</span>}{c.careType.label}형
          </span>
        )}
      </div>

      {/* 유형 설명 */}
      {typeInfo && (
        <div
          className="relative text-[12px] text-[#5C5852] leading-[1.5] bg-[#F7F5F2] rounded-lg px-3 py-2 mb-3.5"
          style={{ zIndex: 1, wordBreak: 'keep-all' } as React.CSSProperties}
        >
          {typeInfo.desc}
        </div>
      )}

      {/* 선호 지역 */}
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="text-[11px] text-[#9C9890] font-bold uppercase tracking-[.08em] mb-1.5">
          선호 활동 지역
        </div>
        <div className="flex flex-wrap gap-1 mb-3.5">
          {c.regions.length > 0 ? (
            c.regions.map((rg) => (
              <span key={rg} className="bg-[#F7F5F3] border border-[#E8E4DF] rounded px-2 py-0.5 text-[11.5px] text-[#5C5852]">
                {rg}
              </span>
            ))
          ) : (
            <span className="text-[12px] text-[#9C9890]">지역 미등록</span>
          )}
        </div>
      </div>

      {/* 문의하기 — 페이지 이동 링크 */}
      <Link
        href={`/search/${c._testId}`}
        className={`relative block w-full py-2.5 rounded-xl text-white text-[14px] font-bold text-center transition-[transform,background-color] duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] ${
          inquiryDate
            ? 'bg-[#5C5852] hover:bg-[#3D3A36]'
            : 'bg-[#D85A3A] hover:bg-[#C04828]'
        }`}
        style={{ zIndex: 1 }}
      >
        {inquiryDate ? '다시 문의하기' : '문의하기'}
      </Link>
    </div>
  )
}
