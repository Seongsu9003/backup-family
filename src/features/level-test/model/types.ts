// ═══════════════════════════════════════════════════
//  레벨 테스트 상태 타입 정의
// ═══════════════════════════════════════════════════
import type { Question, LevelDef, CareTypeDef } from './constants'
import type { TestResult } from '@/shared/types'

// shared TestResult를 재사용 — 별도 ExistingResult 중복 제거
export type ExistingResult = TestResult

export type QuizStep = 'intro' | 'quiz' | 'result'

export interface CertDocs {
  cert: string | null
  edu: string | null
  emergency: string | null
}

export interface QuizState {
  step: QuizStep
  questions: Question[]
  current: number
  answers: (number | null)[]
  testId: string | null
  // 결과
  surveyNorm: number
  scenarioNorm: number
  totalScore: number
  level: LevelDef | null
  careType: CareTypeDef | null
  // 저장 상태
  saved: boolean
  isUpdate: boolean         // 기존 결과 불러온 경우 재저장 허용
  certDocs: CertDocs
}

export type QuizAction =
  | { type: 'START'; questions: Question[]; testId: string }
  | { type: 'SELECT_OPTION'; optionIdx: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SHOW_RESULT'; surveyNorm: number; scenarioNorm: number; totalScore: number; level: LevelDef; careType: CareTypeDef }
  | { type: 'MARK_SAVED' }
  | { type: 'LOAD_EXISTING'; result: ExistingResult }
  | { type: 'SET_DOC'; key: keyof CertDocs; value: string | null }
  | { type: 'RESTART' }

// ── Reducer ──────────────────────────────────────
export const initialState: QuizState = {
  step: 'intro',
  questions: [],
  current: 0,
  answers: [],
  testId: null,
  surveyNorm: 0,
  scenarioNorm: 0,
  totalScore: 0,
  level: null,
  careType: null,
  saved: false,
  isUpdate: false,
  certDocs: { cert: null, edu: null, emergency: null },
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START':
      return {
        ...initialState,
        step: 'quiz',
        questions: action.questions,
        answers: new Array(action.questions.length).fill(null),
        testId: action.testId,
      }

    case 'SELECT_OPTION': {
      // 시나리오 문항은 한 번 답하면 재선택 불가
      const q = state.questions[state.current]
      if (state.answers[state.current] !== null && q.type === 'scenario') return state
      const newAnswers = [...state.answers]
      newAnswers[state.current] = action.optionIdx
      return { ...state, answers: newAnswers }
    }

    case 'NEXT': {
      if (state.answers[state.current] === null) return state
      if (state.current < state.questions.length - 1) {
        return { ...state, current: state.current + 1 }
      }
      return state // showResult는 외부에서 처리
    }

    case 'PREV':
      if (state.current > 0) return { ...state, current: state.current - 1 }
      return state

    case 'SHOW_RESULT':
      return {
        ...state,
        step: 'result',
        surveyNorm: action.surveyNorm,
        scenarioNorm: action.scenarioNorm,
        totalScore: action.totalScore,
        level: action.level,
        careType: action.careType,
      }

    case 'MARK_SAVED':
      return { ...state, saved: true, isUpdate: false }

    case 'LOAD_EXISTING': {
      const r = action.result
      return {
        ...initialState,
        step: 'result',
        testId: r.meta.test_id,
        saved: true,
        isUpdate: true,
        totalScore: r.score.total,
        surveyNorm: r.score.survey,
        scenarioNorm: r.score.scenario,
        questions: [],
        answers: (r.question_log || []).map((l) => l.chosen_idx),
      }
    }

    case 'SET_DOC':
      return {
        ...state,
        certDocs: { ...state.certDocs, [action.key]: action.value },
      }

    case 'RESTART':
      return { ...initialState }

    default:
      return state
  }
}
