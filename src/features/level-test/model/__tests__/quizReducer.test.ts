// ═══════════════════════════════════════════════════
//  quizReducer 단위 테스트
//  상태 전이의 핵심 케이스 검증
// ═══════════════════════════════════════════════════
import { describe, it, expect } from 'vitest'
import { quizReducer, initialState } from '../types'
import type { QuizState, QuizAction } from '../types'
import { SURVEY_QUESTIONS, LEVELS, CARE_TYPES } from '../constants'

// ── 픽스처 ─────────────────────────────────────────

const mockQuestions = SURVEY_QUESTIONS.slice(0, 2)
const mockTestId = 'test-uuid-1234'

function stateAfter(state: QuizState, action: QuizAction): QuizState {
  return quizReducer(state, action)
}

// ────────────────────────────────────────────────────
// START
// ────────────────────────────────────────────────────
describe('START', () => {
  it('초기 상태에서 START → step=quiz, questions 설정, answers 빈 배열', () => {
    const next = stateAfter(initialState, {
      type: 'START',
      questions: mockQuestions,
      testId: mockTestId,
    })
    expect(next.step).toBe('quiz')
    expect(next.questions).toHaveLength(mockQuestions.length)
    expect(next.answers).toHaveLength(mockQuestions.length)
    expect(next.answers.every((a) => a === null)).toBe(true)
    expect(next.testId).toBe(mockTestId)
  })

  it('START 시 이전 결과(saved=true)가 초기화된다', () => {
    const prevSaved: QuizState = { ...initialState, saved: true, totalScore: 99 }
    const next = stateAfter(prevSaved, {
      type: 'START',
      questions: mockQuestions,
      testId: mockTestId,
    })
    expect(next.saved).toBe(false)
    expect(next.totalScore).toBe(0)
  })
})

// ────────────────────────────────────────────────────
// SELECT_OPTION
// ────────────────────────────────────────────────────
describe('SELECT_OPTION', () => {
  function quizState(): QuizState {
    return stateAfter(initialState, {
      type: 'START',
      questions: mockQuestions,
      testId: mockTestId,
    })
  }

  it('설문 문항은 옵션 재선택이 가능하다', () => {
    const s1 = stateAfter(quizState(), { type: 'SELECT_OPTION', optionIdx: 1 })
    const s2 = stateAfter(s1, { type: 'SELECT_OPTION', optionIdx: 2 })
    expect(s2.answers[0]).toBe(2)
  })

  it('아직 답하지 않은 문항에 SELECT_OPTION → 해당 인덱스 저장', () => {
    const next = stateAfter(quizState(), { type: 'SELECT_OPTION', optionIdx: 3 })
    expect(next.answers[0]).toBe(3)
  })
})

// ────────────────────────────────────────────────────
// NEXT / PREV
// ────────────────────────────────────────────────────
describe('NEXT / PREV', () => {
  function answeredState(): QuizState {
    let s = stateAfter(initialState, {
      type: 'START',
      questions: mockQuestions,
      testId: mockTestId,
    })
    s = stateAfter(s, { type: 'SELECT_OPTION', optionIdx: 0 })
    return s
  }

  it('답변 선택 후 NEXT → current + 1', () => {
    const next = stateAfter(answeredState(), { type: 'NEXT' })
    expect(next.current).toBe(1)
  })

  it('답변 없이 NEXT → current 변하지 않음', () => {
    const s = stateAfter(initialState, {
      type: 'START',
      questions: mockQuestions,
      testId: mockTestId,
    })
    const next = stateAfter(s, { type: 'NEXT' })
    expect(next.current).toBe(0)
  })

  it('PREV는 current > 0 일 때만 감소', () => {
    let s = answeredState()
    s = stateAfter(s, { type: 'NEXT' })
    expect(s.current).toBe(1)
    const back = stateAfter(s, { type: 'PREV' })
    expect(back.current).toBe(0)
  })

  it('첫 번째 문항에서 PREV → current 그대로 0', () => {
    const s = answeredState()
    const back = stateAfter(s, { type: 'PREV' })
    expect(back.current).toBe(0)
  })
})

// ────────────────────────────────────────────────────
// SHOW_RESULT
// ────────────────────────────────────────────────────
describe('SHOW_RESULT', () => {
  it('SHOW_RESULT → step=result, 점수·레벨·타입 저장', () => {
    const level = LEVELS[2] // Lv.3
    const careType = CARE_TYPES['CAL']
    const next = stateAfter(initialState, {
      type: 'SHOW_RESULT',
      surveyNorm: 30,
      scenarioNorm: 20,
      totalScore: 50,
      level,
      careType,
    })
    expect(next.step).toBe('result')
    expect(next.totalScore).toBe(50)
    expect(next.surveyNorm).toBe(30)
    expect(next.scenarioNorm).toBe(20)
    expect(next.level?.num).toBe(level.num)
    expect(next.careType?.code).toBe('CAL')
  })
})

// ────────────────────────────────────────────────────
// MARK_SAVED
// ────────────────────────────────────────────────────
describe('MARK_SAVED', () => {
  it('MARK_SAVED → saved=true, isUpdate=false', () => {
    const s: QuizState = { ...initialState, isUpdate: true }
    const next = stateAfter(s, { type: 'MARK_SAVED' })
    expect(next.saved).toBe(true)
    expect(next.isUpdate).toBe(false)
  })
})

// ────────────────────────────────────────────────────
// LOAD_EXISTING
// ────────────────────────────────────────────────────
describe('LOAD_EXISTING', () => {
  const mockResult = {
    meta: { test_id: 'existing-id', created_at: '2025-01-01T00:00:00Z', expires_at: '2025-02-01T00:00:00Z', version: '1.3' },
    tester: { name: '홍길동', contact: '01012345678', preferred_region: ['서울', '경기'] },
    score: { total: 65, survey: 35, scenario: 30, max: 100 },
    level: { num: 3, label: 'Lv.3 중급' },
    care_type: { code: 'EDU', label: '교육형', fullLabel: '학습놀이 교육형', color: '#4A9FCC' },
    job_seeking: '적극적으로 구직 중',
    certification: { status: '미인증' as const, docs_attached: [], admin_memo: '', certified_at: null },
    scenario_ids: [],
    question_log: [],
  }

  it('LOAD_EXISTING → step=result, isUpdate=true, saved=true', () => {
    const next = stateAfter(initialState, { type: 'LOAD_EXISTING', result: mockResult })
    expect(next.step).toBe('result')
    expect(next.isUpdate).toBe(true)
    expect(next.saved).toBe(true)
  })

  it('testerName, testerContact 복원', () => {
    const next = stateAfter(initialState, { type: 'LOAD_EXISTING', result: mockResult })
    expect(next.testerName).toBe('홍길동')
    expect(next.testerContact).toBe('01012345678')
  })

  it('testerJobSeeking, testerPreferredRegion 복원 (BUG-01)', () => {
    const next = stateAfter(initialState, { type: 'LOAD_EXISTING', result: mockResult })
    expect(next.testerJobSeeking).toBe('적극적으로 구직 중')
    expect(next.testerPreferredRegion).toEqual(['서울', '경기'])
  })

  it('care_type이 null이어도 오류 없이 처리', () => {
    const nullCareType = { ...mockResult, care_type: null }
    const next = stateAfter(initialState, { type: 'LOAD_EXISTING', result: nullCareType })
    expect(next.careType).toBeNull()
  })

  it('level은 점수로 복원된다 (score.total 기준)', () => {
    const next = stateAfter(initialState, { type: 'LOAD_EXISTING', result: mockResult })
    // score.total=65 → Lv.3
    expect(next.level?.num).toBe(3)
  })
})

// ────────────────────────────────────────────────────
// SET_DOC
// ────────────────────────────────────────────────────
describe('SET_DOC', () => {
  it('SET_DOC → certDocs의 해당 키만 업데이트', () => {
    const next = stateAfter(initialState, { type: 'SET_DOC', key: 'cert', value: 'cert-url' })
    expect(next.certDocs.cert).toBe('cert-url')
    expect(next.certDocs.edu).toBeNull()
    expect(next.certDocs.emergency).toBeNull()
  })

  it('SET_DOC null → 해당 키 제거', () => {
    const s: QuizState = { ...initialState, certDocs: { cert: 'url', edu: null, emergency: null } }
    const next = stateAfter(s, { type: 'SET_DOC', key: 'cert', value: null })
    expect(next.certDocs.cert).toBeNull()
  })
})

// ────────────────────────────────────────────────────
// RESTART
// ────────────────────────────────────────────────────
describe('RESTART', () => {
  it('RESTART → 완전히 initialState로 초기화', () => {
    const dirty: QuizState = {
      ...initialState,
      step: 'result',
      totalScore: 88,
      saved: true,
      testerName: '홍길동',
    }
    const next = stateAfter(dirty, { type: 'RESTART' })
    expect(next).toEqual(initialState)
  })
})
