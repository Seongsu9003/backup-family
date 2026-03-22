'use client'

// ═══════════════════════════════════════════════════
//  레벨 테스트 페이지 오케스트레이터
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { useLevelTest } from '../model/useLevelTest'
import { LEVELS, getLevel, calcCareType } from '../model/constants'
import { IntroSection } from './IntroSection'
import { QuizSection } from './QuizSection'
import { ResultSection } from './ResultSection'
import { LookupModal } from './LookupModal'
import type { ExistingResult } from '../model/types'
import type { CertDocs } from '../model/types'

export function LevelTestPage() {
  const {
    state,
    startTest,
    selectOption,
    nextQuestion,
    prevQuestion,
    markSaved,
    loadExistingResult,
    setDoc,
    restart,
  } = useLevelTest()

  const [lookupOpen, setLookupOpen] = useState(false)

  // 기존 결과 불러오기 → 결과 화면으로 바로 이동
  const handleLoadExisting = (result: ExistingResult) => {
    // 레벨 / 케어타입 복원 (raw_data에서 읽음)
    loadExistingResult(result)
    setLookupOpen(false)
  }

  return (
    <>
      {/* ── 헤더 ─────────────────────────────── */}
      <header className="text-center mb-9">
        <div className="inline-block text-[.72rem] font-bold tracking-[.12em] uppercase text-[#D85A3A] border-[1.5px] border-[#D85A3A] px-3 py-1 rounded-full mb-3.5">
          돌봄이 · Level Test
        </div>
        <h1 className="text-[1.55rem] font-extrabold text-[#1A1A1A] tracking-[-0.02em] leading-[1.3]">
          아이돌봄이 레벨 테스트
        </h1>
        <p className="text-[.88rem] text-[#8A8A8A] mt-1.5">
          나의 돌봄 역량을 5단계로 진단해 드립니다
        </p>
      </header>

      {/* ── 콘텐츠 ───────────────────────────── */}
      {state.step === 'intro' && (
        <IntroSection
          onStart={startTest}
          onLookup={() => setLookupOpen(true)}
        />
      )}

      {state.step === 'quiz' && (
        <QuizSection
          state={state}
          onSelect={selectOption}
          onNext={nextQuestion}
          onPrev={prevQuestion}
        />
      )}

      {state.step === 'result' && (
        <ResultSection
          state={state}
          onRestart={restart}
          onSetDoc={setDoc}
          onMarkSaved={markSaved}
        />
      )}

      {/* ── 결과 조회 모달 ─────────────────────── */}
      {lookupOpen && (
        <LookupModal
          onSelect={handleLoadExisting}
          onClose={() => setLookupOpen(false)}
        />
      )}
    </>
  )
}
