'use client'

// ═══════════════════════════════════════════════════
//  공개 프로필 카드 — 보호자가 보는 돌봄이 인증 정보
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import type { TestResult } from '@/shared/types'
import { maskName } from '@/shared/lib/maskName'
import { ShareButtons } from './ShareButtons'
import { ContactModal } from './ContactModal'

const LV_COLORS: Record<number, string> = {
  1: '#909090', 2: '#4A9FCC', 3: '#3A9E94', 4: '#D85A3A', 5: '#8B4EAB',
}

const CERT_STYLE: Record<string, { bg: string; border: string; text: string; label: string }> = {
  '인증완료': { bg: '#DDF0EE', border: '#3A9E94', text: '#1A5F58', label: '✓ 인증 완료' },
  '검토중':   { bg: '#FEFAED', border: '#E8C96A', text: '#9A6B00', label: '검토 중' },
  '미인증':   { bg: '#F5F5F4', border: '#CCC',    text: '#888',    label: '미인증' },
  '반려':     { bg: '#FFF0EE', border: '#F0A090', text: '#8A2020', label: '반려' },
}

interface Props {
  result: TestResult
  profileUrl: string
}

export function ProfileCard({ result, profileUrl }: Props) {
  const [contactOpen, setContactOpen] = useState(false)
  const { tester, score, level, care_type, certification, job_seeking, meta } = result
  const lvColor = LV_COLORS[level.num] ?? '#D85A3A'
  const certStyle = CERT_STYLE[certification.status] ?? CERT_STYLE['미인증']

  const circumference = 326.73
  const ringOffset = circumference - (score.total / 100) * circumference

  const expiresDate = new Date(meta.expires_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const shareTitle = `${maskName(tester.name)} 님의 ${level.label} ${result.level.label === 'Lv.5' ? '전문' : level.num >= 4 ? '고급' : level.num >= 3 ? '중급' : '초급'} 돌봄이 인증카드`
  const shareDesc = `총점 ${score.total}점 · backup-family 레벨 테스트`

  return (
    <div className="w-full max-w-[520px] mx-auto">

      {/* ── 프로필 카드 ── */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,.10)] border border-[#E4E0DC] overflow-hidden">

        {/* 헤더 */}
        <div className="bg-[#D85A3A] px-6 py-5 text-center">
          <p className="text-white/70 text-[.8rem] font-medium mb-1">backup-family 인증 프로필</p>
          <h1 className="text-white text-[1.5rem] font-extrabold tracking-[-0.02em]">
            {maskName(tester.name)} 님
          </h1>
        </div>

        <div className="px-6 py-6">

          {/* 점수 링 + 레벨 */}
          <div className="flex items-center gap-5 mb-5">
            <div className="relative w-[90px] h-[90px] shrink-0">
              <svg viewBox="0 0 130 130" width="90" height="90" className="-rotate-90">
                <circle className="fill-none stroke-[#E4E0DC]" strokeWidth="12" cx="65" cy="65" r="52" />
                <circle
                  className="fill-none"
                  style={{ stroke: lvColor, strokeWidth: 12, strokeLinecap: 'round', strokeDasharray: circumference, strokeDashoffset: ringOffset }}
                  cx="65" cy="65" r="52"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[1.3rem] font-extrabold leading-none" style={{ color: lvColor }}>{score.total}</span>
                <span className="text-[.65rem] text-[#8A8A8A]">/ 100</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-[1.25rem] font-extrabold tracking-[-0.02em] mb-1" style={{ color: lvColor }}>
                {level.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {/* 인증 상태 배지 */}
                <span
                  className="px-2.5 py-[3px] rounded-full text-[.76rem] font-bold border"
                  style={{ background: certStyle.bg, borderColor: certStyle.border, color: certStyle.text }}
                >
                  {certStyle.label}
                </span>
                {/* 돌봄 타입 배지 */}
                {care_type && (
                  <span
                    className="px-2.5 py-[3px] rounded-full text-[.76rem] font-bold text-white"
                    style={{ background: care_type.color }}
                  >
                    {care_type.label}형
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 점수 분류 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: '설문 점수', val: score.survey, unit: '/50' },
              { label: '시나리오 점수', val: score.scenario, unit: '/50' },
            ].map(({ label, val, unit }) => (
              <div key={label} className="bg-[#F7F5F3] rounded-lg px-3 py-3 text-center border border-[#E4E0DC]">
                <div className="text-[.72rem] text-[#8A8A8A] mb-1 font-medium">{label}</div>
                <div className="text-[1.1rem] font-extrabold text-[#1A1A1A]">
                  {val}<span className="text-[.7rem] font-normal text-[#8A8A8A]">{unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 구직 상태 */}
          {job_seeking === '적극적으로 구직 중' && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#FAE8E3] border border-[#F0A090] rounded-lg mb-4">
              <span className="w-2 h-2 rounded-full bg-[#D85A3A] animate-pulse shrink-0" />
              <span className="text-[.84rem] font-semibold text-[#C04830]">현재 구직 중입니다</span>
            </div>
          )}

          {/* 활동 지역 */}
          {tester.preferred_region.length > 0 && (
            <div className="mb-4">
              <div className="text-[.76rem] text-[#8A8A8A] font-medium mb-1.5">선호 활동 지역</div>
              <div className="flex flex-wrap gap-1.5">
                {tester.preferred_region.map((r) => (
                  <span key={r} className="px-2 py-0.5 bg-white border border-[#E4E0DC] rounded-full text-[.76rem] text-[#4A4A4A]">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 유효기간 */}
          <div className="text-[.74rem] text-[#8A8A8A] text-center pb-1">
            인증 유효기간 · {expiresDate}까지
          </div>
        </div>

        {/* 연결 요청 버튼 (BIZ-03) */}
        <div className="px-6 pb-5 border-t border-[#F0EDE8] pt-4">
          <button
            onClick={() => setContactOpen(true)}
            className="block w-full py-3 text-center text-[.95rem] font-bold bg-[#D85A3A] text-white rounded-xl hover:bg-[#C04830] transition-colors mb-2"
          >
            연결 요청하기
          </button>
          <ShareButtons profileUrl={profileUrl} title={shareTitle} description={shareDesc} />
        </div>

        {/* 연결 요청 모달 */}
        {contactOpen && (
          <ContactModal
            caregiverName={maskName(tester.name)}
            profileUrl={profileUrl}
            onClose={() => setContactOpen(false)}
          />
        )}
      </div>

      {/* CTA — 테스트 유도 */}
      <div className="mt-5 text-center">
        <p className="text-[.84rem] text-[#8A8A8A] mb-2">나도 레벨 테스트를 받아볼까요?</p>
        <a
          href="/test"
          className="inline-block px-6 py-2.5 border-[1.5px] border-[#D85A3A] rounded-xl text-[.88rem] font-bold text-[#D85A3A] hover:bg-[#FAE8E3] transition-colors"
        >
          무료 레벨 테스트 시작하기
        </a>
      </div>
    </div>
  )
}
