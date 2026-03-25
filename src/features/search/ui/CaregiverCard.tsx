'use client'

// ═══════════════════════════════════════════════════
//  돌봄이 카드 — Supanova Double-Bezel + Spring
//  Phase 1+2 개선:
//  - 레벨: Lv.{num} 만 표시 (레이블 제거)
//  - 유형 배지: 중복 "형형" 제거
//  - 아바타: DiceBear fun-emoji (testId seed, 임시)
//  - 닉네임: nickname 설정 시 우선 표시, 없으면 maskedName
//  - bio: 설정 시 유형 설명 대신 표시
//  - 등록일: "N개월 전 합류" 표시
//  - 접수 완료 배지
// ═══════════════════════════════════════════════════
import Link from 'next/link'
import Image from 'next/image'
import { AnonymizedCaregiver, CARE_TYPE_INFO } from '../model/types'
import { useInquiryStore, formatInquiryDate } from '../model/useInquiryStore'

const LV_BADGE: Record<number, string> = {
  1: 'bg-[#F7F5F3] text-[#5C5852] border border-[#E8E4DF]',
  2: 'bg-[#EBF2FC] text-[#1565C0]',
  3: 'bg-[#DDF0EE] text-[#1A7A72]',
  4: 'bg-[#FDF2EE] text-[#C04828]',
  5: 'bg-[#F5EEF8] text-[#6C3483]',
}

/** testId seed 기반 DiceBear fun-emoji 아바타 URL */
function avatarUrl(testId: string): string {
  return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${encodeURIComponent(testId)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

/** 등록일로부터 경과 시간 표시 */
function relativeJoinedAt(isoDate: string): string {
  if (!isoDate) return ''
  const diff = Date.now() - new Date(isoDate).getTime()
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 1)  return '오늘 합류'
  if (days < 7)  return `${days}일 전 합류`
  if (days < 30) return `${Math.floor(days / 7)}주 전 합류`
  const months = Math.floor(days / 30)
  return `${months}개월 전 합류`
}

interface Props {
  caregiver: AnonymizedCaregiver
}

export function CaregiverCard({ caregiver: c }: Props) {
  const lvNum    = c.level?.num || 1
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

      {/* 상단: 아바타 + 닉네임 + 합류일 */}
      <div className="relative flex items-center gap-3.5 mb-4" style={{ zIndex: 1 }}>
        {/* DiceBear 캐릭터 아바타 (임시) */}
        <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-[#E8E4DF] bg-[#F7F5F2] shrink-0 flex items-center justify-center">
          <Image
            src={avatarUrl(c._testId)}
            alt="돌봄이 캐릭터"
            width={52}
            height={52}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-[#1A1714] truncate">
              {c.nickname || c.maskedName}
            </span>
            {c.nickname && (
              <span className="text-[11px] text-[#9C9890] font-medium shrink-0">닉네임</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-[#9C9890]">구직 활동 중</span>
            {c.joinedAt && (
              <>
                <span className="text-[#E8E4DF]">·</span>
                <span className="text-[11px] text-[#B8B4AF]">{relativeJoinedAt(c.joinedAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 배지 행 */}
      <div className="relative flex flex-wrap gap-1.5 mb-3.5" style={{ zIndex: 1 }}>
        {/* #1 레벨: Lv.{num} 만 표시 */}
        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${LV_BADGE[lvNum] ?? LV_BADGE[1]}`}>
          Lv.{lvNum}
        </span>

        {/* 인증 상태 */}
        {c.certStatus === '인증완료' ? (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF6EF] text-[#2E7D32]">
            ✓ 인증 완료
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F7F5F3] text-[#9C9890] border border-[#E8E4DF]">
            {c.certStatus}
          </span>
        )}

        {/* #3 유형: label 그대로 사용 (label에 이미 "형" 포함) */}
        {c.careType && (
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
            style={{ background: c.careType.color || '#888' }}
          >
            {typeInfo?.emoji && <span className="mr-0.5">{typeInfo.emoji}</span>}
            {c.careType.label}
          </span>
        )}
      </div>

      {/* bio 또는 유형 설명 */}
      {(c.bio || typeInfo) && (
        <div
          className="relative text-[12px] text-[#5C5852] leading-[1.5] bg-[#F7F5F2] rounded-lg px-3 py-2 mb-3.5"
          style={{ zIndex: 1, wordBreak: 'keep-all' } as React.CSSProperties}
        >
          {c.bio || typeInfo?.desc}
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
