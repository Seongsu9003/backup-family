// ═══════════════════════════════════════════════════
//  레벨 테스트 핵심 유틸 함수 단위 테스트
//  대상: calcScores · getLevel · calcCareType
// ═══════════════════════════════════════════════════
import { describe, it, expect } from 'vitest'
import {
  calcScores,
  getLevel,
  calcCareType,
  SURVEY_QUESTIONS,
  LEVELS,
  CARE_TYPES,
} from '../constants'
import type { Question } from '../constants'

// ── 공통 픽스처 헬퍼 ────────────────────────────────

/** 최소한의 설문 문항 mock 생성 */
function makeSurveyQ(id: string, maxScore: number, scores: number[]): Question {
  return {
    id,
    type: 'survey',
    category: '설문',
    text: `설문 ${id}`,
    hint: null,
    options: scores.map((score, i) => ({ label: `옵션${i}`, desc: '', score })),
    maxScore,
    certifiable: false,
  }
}

/** 최소한의 시나리오 문항 mock 생성 */
function makeScenarioQ(id: string, scores: number[]): Question {
  return {
    id,
    type: 'scenario',
    category: '시나리오',
    text: `시나리오 ${id}`,
    hint: null,
    options: scores.map((score, i) => ({ label: `옵션${i}`, desc: '', score })),
    maxScore: 10,
    correctIdx: 0,
  }
}

/** isType 타입진단 문항 mock 생성 */
function makeTypeQ(id: string, tags: string[]): Question {
  return {
    id,
    type: 'survey',
    category: '타입진단',
    isType: true,
    text: `타입진단 ${id}`,
    hint: null,
    options: tags.map((typeTag, i) => ({ label: `옵션${i}`, desc: '', score: 0, typeTag })),
    maxScore: 0,
    certifiable: false,
  }
}

// ────────────────────────────────────────────────────
// calcScores
// ────────────────────────────────────────────────────
describe('calcScores', () => {
  // maxSurvey = SURVEY_QUESTIONS 전체 maxScore 합산 = 60
  const MAX_SURVEY = SURVEY_QUESTIONS.reduce((acc, q) => acc + q.maxScore, 0) // 60

  it('모든 응답이 null 이면 0·0·0 반환', () => {
    const qs = [makeSurveyQ('S1', 10, [0, 5, 10]), makeScenarioQ('SC1', [0, 5, 10])]
    const answers = [null, null]
    expect(calcScores(qs, answers)).toEqual({ surveyNorm: 0, scenarioNorm: 0, total: 0 })
  })

  it('설문 만점(60점) + 시나리오 0점 → surveyNorm=50, scenarioNorm=0, total=50', () => {
    // SURVEY_QUESTIONS 전체를 사용하고 각 문항의 마지막(최고) 옵션 선택
    const allSurveyAnswers = SURVEY_QUESTIONS.map((q) => q.options.length - 1)
    const result = calcScores(SURVEY_QUESTIONS, allSurveyAnswers)
    expect(result.surveyNorm).toBe(50)
    expect(result.scenarioNorm).toBe(0)
    expect(result.total).toBe(50)
  })

  it('설문 0점 + 시나리오 만점(50점) → surveyNorm=0, scenarioNorm=50, total=100', () => {
    const scenarios = Array.from({ length: 5 }, (_, i) =>
      makeScenarioQ(`SC${i}`, [10, 5, 0]) // 옵션0이 최고점
    )
    const answers = Array(5).fill(0) // 모두 옵션0(10점) 선택
    const result = calcScores(scenarios, answers)
    expect(result.surveyNorm).toBe(0)
    expect(result.scenarioNorm).toBe(50) // Math.round((50/50)*50) = 50
    expect(result.total).toBe(50)
  })

  it('설문·시나리오 동시 만점 → total=100', () => {
    const surveyAnswers = SURVEY_QUESTIONS.map((q) => q.options.length - 1)
    const scenarios = Array.from({ length: 5 }, (_, i) =>
      makeScenarioQ(`SC${i}`, [10])
    )
    const allAnswers = [...surveyAnswers, ...Array(5).fill(0)]
    const result = calcScores([...SURVEY_QUESTIONS, ...scenarios], allAnswers)
    expect(result.surveyNorm).toBe(50)
    expect(result.scenarioNorm).toBe(50)
    expect(result.total).toBe(100)
  })

  it('설문 절반(30/60) 획득 → surveyNorm=25', () => {
    // 단순 설문 문항 1개 maxScore=60, rawSurvey=30
    const qs = [makeSurveyQ('S1', 60, [0, 30, 60])]
    const result = calcScores(qs, [1]) // 30점 옵션 선택
    // surveyNorm = Math.round((30/60)*50) = 25
    expect(result.surveyNorm).toBe(25)
  })

  it('반올림 처리: rawSurvey=45 → surveyNorm=38 (Math.round 37.5)', () => {
    // maxSurvey=60, rawSurvey=45 → (45/60)*50 = 37.5 → Math.round → 38
    const qs = [makeSurveyQ('S1', 60, [0, 45, 60])]
    const result = calcScores(qs, [1])
    expect(result.surveyNorm).toBe(38)
  })

  it('isType 문항은 점수 계산에 영향을 주지 않는다', () => {
    const typeQ = makeTypeQ('T1', ['ACT', 'CAL', 'EDU', 'CRE'])
    const surveyQ = makeSurveyQ('S1', 60, [0, 30, 60])
    // isType 문항에 답변 추가해도 설문 점수에 영향 없음
    const result = calcScores([surveyQ, typeQ], [1, 2])
    expect(result.surveyNorm).toBe(25) // 30/60*50 = 25, typeQ 무관
  })

  it('total 은 surveyNorm + scenarioNorm 의 합산이다', () => {
    const qs = [makeSurveyQ('S1', 60, [0, 30, 60])]
    const result = calcScores(qs, [1])
    expect(result.total).toBe(result.surveyNorm + result.scenarioNorm)
  })
})

// ────────────────────────────────────────────────────
// getLevel
// ────────────────────────────────────────────────────
describe('getLevel', () => {
  it('점수 0 → Lv.1 (최저 레벨)', () => {
    const lv = getLevel(0)
    expect(lv.num).toBe(1)
    expect(lv.label).toBe('Lv.1')
  })

  it('Lv.1 최대 경계값 29 → Lv.1', () => {
    expect(getLevel(29).num).toBe(1)
  })

  it('Lv.2 최소 경계값 30 → Lv.2', () => {
    expect(getLevel(30).num).toBe(2)
  })

  it('Lv.2 최대 경계값 49 → Lv.2', () => {
    expect(getLevel(49).num).toBe(2)
  })

  it('Lv.3 최소 경계값 50 → Lv.3', () => {
    expect(getLevel(50).num).toBe(3)
  })

  it('Lv.3 최대 경계값 69 → Lv.3', () => {
    expect(getLevel(69).num).toBe(3)
  })

  it('Lv.4 최소 경계값 70 → Lv.4', () => {
    expect(getLevel(70).num).toBe(4)
  })

  it('Lv.4 최대 경계값 84 → Lv.4', () => {
    expect(getLevel(84).num).toBe(4)
  })

  it('Lv.5 최소 경계값 85 → Lv.5', () => {
    expect(getLevel(85).num).toBe(5)
  })

  it('점수 100 → Lv.5 (최고 레벨)', () => {
    const lv = getLevel(100)
    expect(lv.num).toBe(5)
    expect(lv.label).toBe('Lv.5')
  })

  it('반환된 레벨 객체는 LEVELS 배열의 원소와 동일한 shape를 갖는다', () => {
    const lv = getLevel(55)
    expect(lv).toHaveProperty('min')
    expect(lv).toHaveProperty('max')
    expect(lv).toHaveProperty('title')
    expect(lv).toHaveProperty('descText')
    expect(lv).toHaveProperty('next')
    expect(Array.isArray(lv.next)).toBe(true)
  })

  it('모든 레벨 범위가 0~100을 빈틈없이 커버한다', () => {
    for (let score = 0; score <= 100; score++) {
      const lv = getLevel(score)
      expect(score).toBeGreaterThanOrEqual(lv.min)
      expect(score).toBeLessThanOrEqual(lv.max)
    }
  })
})

// ────────────────────────────────────────────────────
// calcCareType
// ────────────────────────────────────────────────────
describe('calcCareType', () => {
  it('isType 문항이 없으면 기본값 CAL 반환', () => {
    const qs = [makeSurveyQ('S1', 10, [0, 5, 10])]
    const result = calcCareType(qs, [2])
    expect(result.code).toBe('CAL')
    expect(result.compound).toBe(false)
  })

  it('모든 응답이 null 이면 기본값 CAL 반환', () => {
    const qs = [makeTypeQ('T1', ['ACT', 'CAL', 'EDU', 'CRE'])]
    const result = calcCareType(qs, [null])
    expect(result.code).toBe('CAL')
  })

  it('ACT 만 선택하면 ACT 타입 반환', () => {
    const qs = [
      makeTypeQ('T1', ['ACT', 'CAL', 'EDU', 'CRE']),
      makeTypeQ('T2', ['ACT', 'CAL', 'EDU', 'CRE']),
      makeTypeQ('T3', ['ACT', 'CAL', 'EDU', 'CRE']),
    ]
    const result = calcCareType(qs, [0, 0, 0]) // 모두 ACT(옵션0) 선택
    expect(result.code).toBe('ACT')
    expect(result.compound).toBe(false)
    expect(result.label).toBe(CARE_TYPES['ACT'].label)
  })

  it('EDU 만 선택하면 EDU 타입 반환', () => {
    const qs = [makeTypeQ('T1', ['ACT', 'EDU', 'CAL', 'CRE'])]
    const result = calcCareType(qs, [1]) // 옵션1 = EDU
    expect(result.code).toBe('EDU')
  })

  it('CRE 만 선택하면 CRE 타입 반환', () => {
    const qs = [makeTypeQ('T1', ['CRE', 'ACT', 'CAL', 'EDU'])]
    const result = calcCareType(qs, [0])
    expect(result.code).toBe('CRE')
  })

  it('ACT·CAL 동점 시 compound=true 복합 타입 반환', () => {
    const qs = [
      makeTypeQ('T1', ['ACT', 'CAL', 'EDU', 'CRE']),
      makeTypeQ('T2', ['ACT', 'CAL', 'EDU', 'CRE']),
    ]
    const result = calcCareType(qs, [0, 1]) // T1→ACT, T2→CAL (각 1표)
    expect(result.compound).toBe(true)
    expect(result.label).toContain('형')
  })

  it('isType 이 아닌 문항의 응답은 타입 집계에 영향을 주지 않는다', () => {
    const normalQ = makeSurveyQ('S1', 10, [0, 5, 10])
    const typeQ = makeTypeQ('T1', ['EDU', 'ACT', 'CAL', 'CRE'])
    const result = calcCareType([normalQ, typeQ], [2, 0]) // normalQ 응답은 무관
    expect(result.code).toBe('EDU')
  })

  it('복합 타입의 strengths 는 양쪽 타입에서 가져온다', () => {
    const qs = [
      makeTypeQ('T1', ['ACT', 'CRE', 'CAL', 'EDU']),
      makeTypeQ('T2', ['ACT', 'CRE', 'CAL', 'EDU']),
    ]
    const result = calcCareType(qs, [0, 1]) // ACT=1, CRE=1 동점
    expect(result.compound).toBe(true)
    expect(result.strengths.length).toBeGreaterThanOrEqual(2)
  })

  it('반환된 CareTypeDef 는 필수 필드를 모두 가진다', () => {
    const qs = [makeTypeQ('T1', ['ACT', 'CAL', 'EDU', 'CRE'])]
    const result = calcCareType(qs, [0])
    expect(result).toHaveProperty('code')
    expect(result).toHaveProperty('label')
    expect(result).toHaveProperty('fullLabel')
    expect(result).toHaveProperty('color')
    expect(result).toHaveProperty('summary')
    expect(Array.isArray(result.strengths)).toBe(true)
    expect(result).toHaveProperty('matchDesc')
  })
})
