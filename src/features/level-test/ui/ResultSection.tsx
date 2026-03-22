'use client'

// ═══════════════════════════════════════════════════
//  결과 화면 — 점수 링 · 레벨 · 돌봄 타입 · 저장 폼
//  (SaveForm / RegionSelector / DocAttach / downloadPng 로 분리됨)
// ═══════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { LV_COLORS } from '../model/downloadPng'
import type { QuizState, CertDocs } from '../model/types'
import { SaveForm } from './SaveForm'

interface Props {
  state: QuizState
  onRestart: () => void
  onSetDoc: (key: keyof CertDocs, value: string | null) => void
  onMarkSaved: () => void
}

export function ResultSection({ state, onRestart, onSetDoc, onMarkSaved }: Props) {
  const { totalScore, surveyNorm, scenarioNorm, level, careType, certDocs } = state
  const lvColor = LV_COLORS[level?.num ?? 1]

  // 점수 카운트업 애니메이션
  const [displayScore, setDisplayScore] = useState(0)
  useEffect(() => {
    let n = 0
    const timer = setInterval(() => {
      n = Math.min(n + 2, totalScore)
      setDisplayScore(n)
      if (n >= totalScore) clearInterval(timer)
    }, 20)
    return () => clearInterval(timer)
  }, [totalScore])

  const attachedCount = Object.values(certDocs).filter(Boolean).length
  const certStatus = attachedCount > 0 ? '검토중' : '미인증'

  const certBadgeClass = attachedCount > 0
    ? 'bg-[#FEFAED] text-[#9A6B00] border border-[#E8C96A]'
    : 'bg-[#F5F5F4] text-[#888] border border-dashed border-[#CCC]'

  const circumference = 326.73
  const ringOffset = circumference - (totalScore / 100) * circumference

  return (
    <section className="w-full max-w-[640px] overflow-hidden">
      <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,.08)] border border-[#E4E0DC] px-5 sm:px-7 py-9 animate-[fadeUp_.4s_ease]">

        {/* ── 상단 레벨 표시 ── */}
        <div className="text-center mb-6">
          <div className="text-[1.9rem] font-extrabold mb-1.5 tracking-[-0.02em]">
            <span style={{ color: lvColor }}>
              {level?.label} {level?.title}
            </span>
          </div>
          <div className="text-[.92rem] text-[#8A8A8A] font-medium">
            총점 {totalScore}점 (설문 {surveyNorm} + 시나리오 {scenarioNorm})
          </div>
        </div>

        {/* ── 점수 링 ── */}
        <div className="relative w-[130px] h-[130px] mx-auto mb-6">
          <svg viewBox="0 0 130 130" width="130" height="130" className="-rotate-90">
            <circle className="fill-none stroke-[#E4E0DC]" strokeWidth="10" cx="65" cy="65" r="52" />
            <circle
              className="fill-none stroke-linecap-round transition-[stroke-dashoffset_1s_ease]"
              style={{ stroke: lvColor, strokeWidth: 10, strokeLinecap: 'round', strokeDasharray: circumference, strokeDashoffset: ringOffset }}
              cx="65" cy="65" r="52"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-[1.9rem] font-extrabold tabular-nums w-[54px] text-center" style={{ color: lvColor }}>{displayScore}</div>
            <div className="text-[.75rem] text-[#8A8A8A]">/ 100점</div>
          </div>
        </div>

        {/* ── 인증 상태 배지 ── */}
        <div className={`flex items-center justify-center gap-2 mb-5 px-4 py-3 rounded-lg text-[.88rem] font-semibold ${certBadgeClass}`}>
          {attachedCount > 0
            ? `인증 신청 중 · 서류 ${attachedCount}건 첨부됨 (관리자 검토 후 인증 완료)`
            : '미인증 · 서류 제출 시 인증 가능'}
        </div>

        {/* ── 돌봄 타입 ── */}
        {careType && (
          <div className="bg-[#F7F5F3] border border-[#E4E0DC] rounded-xl px-5 py-5 mb-4">
            <div className="flex items-center gap-2.5 mb-3.5">
              <span
                className="px-3.5 py-[5px] rounded-full text-[.82rem] font-bold text-white"
                style={{ background: careType.color }}
              >
                {careType.label}
              </span>
              <span className="text-base font-bold text-[#1A1A1A]">{careType.fullLabel}</span>
            </div>
            <p className="text-[.86rem] text-[#4A4A4A] leading-[1.65] mb-3">{careType.summary}</p>
            <div className="flex flex-wrap gap-[7px] mb-2.5">
              {careType.strengths.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full text-[.78rem] font-semibold bg-white border border-[#E4E0DC] text-[#4A4A4A]">{s}</span>
              ))}
            </div>
            <div className="text-[.8rem] text-[#8A8A8A] leading-[1.5] pt-2 border-t border-[#E4E0DC]">
              매칭 추천: {careType.matchDesc}
            </div>
          </div>
        )}

        {/* ── 점수 분류 ── */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { label: '설문 점수', val: surveyNorm, unit: '/50' },
            { label: '시나리오 점수', val: scenarioNorm, unit: '/50' },
          ].map(({ label, val, unit }) => (
            <div key={label} className="bg-[#F7F5F3] rounded-lg px-4 py-4 text-center border border-[#E4E0DC]">
              <div className="text-[.76rem] text-[#8A8A8A] mb-1.5 font-medium">{label}</div>
              <div className="text-[1.35rem] font-extrabold text-[#1A1A1A]">
                {val}<span className="text-[.75rem] font-normal text-[#8A8A8A]">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── 레벨 설명 ── */}
        {level && (
          <>
            <div className="bg-[#F7F5F3] rounded-xl px-4 py-4 text-[.88rem] leading-[1.7] mb-4 border border-[#E4E0DC]">
              <h4 className="text-[.84rem] font-bold text-[#D85A3A] mb-2">진단 결과</h4>
              <p>{level.descText}</p>
            </div>
            <div className="bg-[#F7F5F3] border border-[#E4E0DC] rounded-xl px-4 py-4 text-[.86rem] leading-[1.7] mb-7">
              <h4 className="text-[.84rem] font-bold text-[#4A4A4A] mb-2.5">추천 다음 단계</h4>
              <ul className="pl-4 list-disc">
                {level.next.map((s) => (
                  <li key={s} className="mb-1 text-[#4A4A4A]">{s}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        <hr className="border-[#E4E0DC] mb-7" />

        {/* ── 저장 폼 / 완료 뷰 ── */}
        <SaveForm
          state={state}
          level={level}
          careType={careType}
          certStatus={certStatus}
          onMarkSaved={onMarkSaved}
          onSetDoc={onSetDoc}
        />

        {/* 다시 테스트 */}
        <button
          onClick={onRestart}
          className="w-full py-3 mt-2 border-[1.5px] border-[#E4E0DC] rounded-xl bg-transparent text-[.88rem] font-semibold text-[#8A8A8A] hover:border-[#F0A090] hover:text-[#D85A3A] transition-all"
        >
          다시 테스트하기
        </button>
      </div>
    </section>
  )
}
