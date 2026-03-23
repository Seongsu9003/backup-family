'use client'

// ═══════════════════════════════════════════════════
//  레벨 테스트 페이지 오케스트레이터
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { useLevelTest } from '../model/useLevelTest'
import { useRetestPrefill } from '../model/useRetestPrefill'
import { IntroSection } from './IntroSection'
import { QuizSection } from './QuizSection'
import { ResultSection } from './ResultSection'
import { LookupModal } from './LookupModal'
import type { ExistingResult } from '../model/types'

interface Props {
  retestId?: string
}

export function LevelTestPage({ retestId }: Props) {
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
    setRetestPrefill,
  } = useLevelTest()

  const [lookupOpen, setLookupOpen] = useState(false)

  // 재테스트 prefill — 만료 검증 + 이전 정보 자동 채우기 (BIZ-02)
  useRetestPrefill({ retestId, setRetestPrefill })

  // 기존 결과 불러오기 → 결과 화면으로 바로 이동
  const handleLoadExisting = (result: ExistingResult) => {
    // 레벨 / 케어타입 복원 (raw_data에서 읽음)
    loadExistingResult(result)
    setLookupOpen(false)
  }

  return (
    <>
      {/* ── 헤더 ─────────────────────────────── */}
      <header className="w-full max-w-[640px] mb-9">
        {/* 보호자 링크 — 우상단 */}
        <div className="flex justify-end mb-3">
          <a
            href="/search"
            className="inline-flex items-center gap-1.5 text-[.78rem] font-semibold text-[#4A9FCC] hover:text-[#2A7FAC] hover:underline transition-colors"
          >
            <span>🔍</span>
            돌봄이 찾기 (보호자)
          </a>
        </div>
        <div className="text-center">
          <div className="inline-block text-[.72rem] font-bold tracking-[.12em] uppercase text-[#D85A3A] border-[1.5px] border-[#D85A3A] px-3 py-1 rounded-full mb-3.5">
            돌봄이 · Level Test
          </div>
          <h1 className="text-[1.55rem] font-extrabold text-[#1A1A1A] tracking-[-0.02em] leading-[1.3]">
            아이돌봄이 레벨 테스트
          </h1>
          <p className="text-[.88rem] text-[#8A8A8A] mt-1.5">
            나의 돌봄 역량을 5단계로 진단해 드립니다
          </p>
        </div>
      </header>

      {/* ── 재테스트 배너 (BIZ-02) ───────────── */}
      {state.retestPrevLevel && state.step === 'intro' && (
        <div className="w-full max-w-[640px] mb-5 px-4 py-3 bg-[#FFF4E6] border border-[#F5A623] rounded-xl flex items-center gap-2.5">
          <span className="text-lg">🔄</span>
          <div>
            <p className="text-[.83rem] font-bold text-[#B8740A]">재테스트 모드</p>
            <p className="text-[.78rem] text-[#8A6020]">
              이전 인증이 만료되었습니다. 이름·연락처·지역이 자동으로 채워집니다.
              <span className="ml-1 font-semibold">이전 레벨: {state.retestPrevLevel}</span>
            </p>
          </div>
        </div>
      )}

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
