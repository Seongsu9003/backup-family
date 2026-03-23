'use client'

// ═══════════════════════════════════════════════════
//  레벨 테스트 퀴즈 상태 관리 훅 (useReducer 기반)
// ═══════════════════════════════════════════════════
import { useReducer, useCallback } from 'react'
import { buildQuestionSet, calcCareType, calcScores, getLevel } from './constants'
import { quizReducer, initialState } from './types'
import type { ExistingResult } from './types'

// crypto.randomUUID() — 암호학적으로 안전한 UUID v4 (Math.random 대체)
function generateUUID(): string {
  return crypto.randomUUID()
}

export function useLevelTest() {
  const [state, dispatch] = useReducer(quizReducer, initialState)

  // ── 테스트 시작 ──────────────────────────────────
  const startTest = useCallback(() => {
    const questions = buildQuestionSet()
    const testId = generateUUID()
    dispatch({ type: 'START', questions, testId })
  }, [])

  // ── 옵션 선택 ────────────────────────────────────
  const selectOption = useCallback((optionIdx: number) => {
    dispatch({ type: 'SELECT_OPTION', optionIdx })
  }, [])

  // ── 다음 문항 / 결과 표시 ─────────────────────────
  const nextQuestion = useCallback(() => {
    const isLast = state.current === state.questions.length - 1
    if (!isLast) {
      dispatch({ type: 'NEXT' })
      return
    }
    // 마지막 문항 → 점수 계산 후 결과 화면
    const scores = calcScores(state.questions, state.answers)
    const level = getLevel(scores.total)
    const careType = calcCareType(state.questions, state.answers)
    dispatch({
      type: 'SHOW_RESULT',
      surveyNorm: scores.surveyNorm,
      scenarioNorm: scores.scenarioNorm,
      totalScore: scores.total,
      level,
      careType,
    })
  }, [state.current, state.questions, state.answers])

  // ── 이전 문항 ────────────────────────────────────
  const prevQuestion = useCallback(() => {
    dispatch({ type: 'PREV' })
  }, [])

  // ── 저장 완료 마킹 ───────────────────────────────
  const markSaved = useCallback(() => {
    dispatch({ type: 'MARK_SAVED' })
  }, [])

  // ── 기존 결과 불러오기 ───────────────────────────
  const loadExistingResult = useCallback((result: ExistingResult) => {
    dispatch({ type: 'LOAD_EXISTING', result })
  }, [])

  // ── 서류 상태 업데이트 ───────────────────────────
  const setDoc = useCallback(
    (key: 'cert' | 'edu' | 'emergency', value: string | null) => {
      dispatch({ type: 'SET_DOC', key, value })
    },
    []
  )

  // ── 재시작 ──────────────────────────────────────
  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' })
  }, [])

  return {
    state,
    startTest,
    selectOption,
    nextQuestion,
    prevQuestion,
    markSaved,
    loadExistingResult,
    setDoc,
    restart,
  }
}
