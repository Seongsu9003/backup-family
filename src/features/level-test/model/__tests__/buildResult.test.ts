// ═══════════════════════════════════════════════════
//  buildResult 단위 테스트
//  Supabase 저장 payload 구성 로직 검증
// ═══════════════════════════════════════════════════
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildResult } from '../buildResult'
import { initialState } from '../types'
import type { QuizState } from '../types'
import { SURVEY_QUESTIONS, LEVELS, CARE_TYPES } from '../constants'
import type { Question } from '../constants'

// ── 픽스처 ─────────────────────────────────────────

function makeState(overrides: Partial<QuizState> = {}): QuizState {
  return {
    ...initialState,
    step: 'result',
    testId: 'test-uuid-abc123',
    totalScore: 72,
    surveyNorm: 40,
    scenarioNorm: 32,
    level: LEVELS.find((l) => l.num === 4) ?? LEVELS[3],
    careType: CARE_TYPES['EDU'],
    saved: false,
    certDocs: { cert: null, edu: null, emergency: null },
    ...overrides,
  }
}

const mockQuestions: Question[] = SURVEY_QUESTIONS.slice(0, 2)

const basePayload = {
  quizState: makeState(),
  questions: mockQuestions,
  name: '홍길동',
  contact: '01012345678',
  jobSeeking: '적극적으로 구직 중',
  selectedRegions: ['서울', '경기'],
}

// ────────────────────────────────────────────────────
// 메타 정보
// ────────────────────────────────────────────────────
describe('buildResult — meta', () => {
  it('test_id는 quizState.testId를 그대로 사용한다', () => {
    const result = buildResult(basePayload)
    expect(result.meta.test_id).toBe('test-uuid-abc123')
  })

  it('version은 항상 1.3', () => {
    const result = buildResult(basePayload)
    expect(result.meta.version).toBe('1.3')
  })

  it('expires_at은 created_at 기준 +1개월', () => {
    const result = buildResult(basePayload)
    const created = new Date(result.meta.created_at)
    const expires = new Date(result.meta.expires_at)
    // 월 차이가 1개월 (날짜에 따라 ±1일 허용)
    const diffMs = expires.getTime() - created.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThanOrEqual(28)
    expect(diffDays).toBeLessThanOrEqual(32)
  })
})

// ────────────────────────────────────────────────────
// 응시자 정보
// ────────────────────────────────────────────────────
describe('buildResult — tester', () => {
  it('이름·연락처·선호지역이 올바르게 저장된다', () => {
    const result = buildResult(basePayload)
    expect(result.tester.name).toBe('홍길동')
    expect(result.tester.contact).toBe('01012345678')
    expect(result.tester.preferred_region).toEqual(['서울', '경기'])
  })

  it('selectedRegions가 빈 배열이면 preferred_region도 빈 배열', () => {
    const result = buildResult({ ...basePayload, selectedRegions: [] })
    expect(result.tester.preferred_region).toEqual([])
  })
})

// ────────────────────────────────────────────────────
// 점수
// ────────────────────────────────────────────────────
describe('buildResult — score', () => {
  it('surveyNorm, scenarioNorm, totalScore가 올바르게 매핑된다', () => {
    const result = buildResult(basePayload)
    expect(result.score.total).toBe(72)
    expect(result.score.survey).toBe(40)
    expect(result.score.scenario).toBe(32)
    expect(result.score.max).toBe(100)
  })
})

// ────────────────────────────────────────────────────
// 레벨
// ────────────────────────────────────────────────────
describe('buildResult — level', () => {
  it('level.label은 "Lv.N 타이틀" 형식', () => {
    const result = buildResult(basePayload)
    expect(result.level.label).toMatch(/^Lv\.\d/)
  })

  it('quizState.level이 null이면 totalScore로 복원한다', () => {
    const payload = {
      ...basePayload,
      quizState: makeState({ level: null, totalScore: 85 }),
    }
    const result = buildResult(payload)
    // 85점 → Lv.5
    expect(result.level.num).toBe(5)
  })
})

// ────────────────────────────────────────────────────
// 돌봄 타입
// ────────────────────────────────────────────────────
describe('buildResult — care_type', () => {
  it('careType이 있으면 code·label·fullLabel·color 포함', () => {
    const result = buildResult(basePayload)
    expect(result.care_type).not.toBeNull()
    expect(result.care_type?.code).toBe('EDU')
    expect(result.care_type?.label).toBeTruthy()
    expect(result.care_type?.color).toBeTruthy()
  })

  it('careType이 null이면 care_type도 null', () => {
    const payload = { ...basePayload, quizState: makeState({ careType: null }) }
    const result = buildResult(payload)
    expect(result.care_type).toBeNull()
  })
})

// ────────────────────────────────────────────────────
// 인증 상태
// ────────────────────────────────────────────────────
describe('buildResult — certification', () => {
  it('서류 미첨부 → status=미인증', () => {
    const result = buildResult(basePayload)
    expect(result.certification.status).toBe('미인증')
    expect(result.certification.docs_attached).toHaveLength(0)
  })

  it('서류 1개 이상 첨부 → status=검토중', () => {
    const payload = {
      ...basePayload,
      quizState: makeState({ certDocs: { cert: 'https://example.com/cert.pdf', edu: null, emergency: null } }),
    }
    const result = buildResult(payload)
    expect(result.certification.status).toBe('검토중')
    expect(result.certification.docs_attached).toContain('https://example.com/cert.pdf')
  })

  it('여러 서류 첨부 시 모두 docs_attached에 포함', () => {
    const payload = {
      ...basePayload,
      quizState: makeState({
        certDocs: { cert: 'cert-url', edu: 'edu-url', emergency: null },
      }),
    }
    const result = buildResult(payload)
    expect(result.certification.docs_attached).toHaveLength(2)
  })
})

// ────────────────────────────────────────────────────
// question_log
// ────────────────────────────────────────────────────
describe('buildResult — question_log', () => {
  it('question_log 길이는 questions 배열과 동일', () => {
    const result = buildResult(basePayload)
    expect(result.question_log).toHaveLength(mockQuestions.length)
  })

  it('각 로그 항목은 q_id, type, chosen_idx, max_score를 포함', () => {
    const payload = {
      ...basePayload,
      quizState: makeState({ answers: [2, 1] }),
    }
    const result = buildResult(payload)
    const log = result.question_log[0]
    expect(log).toHaveProperty('q_id')
    expect(log).toHaveProperty('type')
    expect(log).toHaveProperty('chosen_idx')
    expect(log).toHaveProperty('max_score')
  })
})
