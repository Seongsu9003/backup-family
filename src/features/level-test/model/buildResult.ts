// ═══════════════════════════════════════════════════
//  결과 payload 빌더 (순수 함수 — Supabase 의존 없음)
//  useSaveResult.ts 에서 분리하여 단위 테스트 가능하게 함
// ═══════════════════════════════════════════════════
import { getLevel } from './constants'
import { calcCertExpiry } from '@/shared/lib/dateUtils'
import type { QuizState } from './types'
import type { Question } from './constants'

export interface SavePayload {
  quizState: QuizState
  questions: Question[]
  name: string
  contact: string
  jobSeeking: string
  selectedRegions: string[]
  privacyAgreedAt?: string  // 개인정보 수집·이용 동의 일시 (ISO string)
}

export function buildResult(payload: SavePayload) {
  const { quizState, questions, name, contact, jobSeeking, selectedRegions, privacyAgreedAt } = payload
  const attachedDocs = Object.values(quizState.certDocs).filter(Boolean) as string[]
  const certStatus = attachedDocs.length > 0 ? '검토중' : '미인증'

  const now = new Date()

  return {
    meta: {
      test_id: quizState.testId!,
      created_at: now.toISOString(),
      expires_at: calcCertExpiry(now),
      version: '1.3',
      privacy_agreed_at: privacyAgreedAt ?? null,  // 개인정보 동의 일시 (raw_data에 보관)
    },
    tester: {
      name,
      contact,
      preferred_region: selectedRegions.length > 0 ? selectedRegions : [],
    },
    score: {
      total: quizState.totalScore,
      survey: quizState.surveyNorm,
      scenario: quizState.scenarioNorm,
      max: 100,
    },
    level: (() => {
      // level이 null일 경우(기존 결과 불러오기 시) 점수로 복원
      const lv = quizState.level ?? getLevel(quizState.totalScore)
      return { num: lv.num, label: `${lv.label} ${lv.title}` }
    })(),
    care_type: quizState.careType
      ? {
          code: quizState.careType.code,
          label: quizState.careType.label,
          fullLabel: quizState.careType.fullLabel,
          color: quizState.careType.color,
        }
      : null,
    job_seeking: jobSeeking,
    certification: {
      status: certStatus,
      docs_attached: attachedDocs,
      admin_memo: '',
      certified_at: null,
    },
    scenario_ids: questions.filter((q) => q.type === 'scenario').map((q) => q.id),
    question_log: questions.map((q, i) => ({
      q_id: q.id,
      type: q.type,
      category: q.category,
      chosen_idx: quizState.answers[i],
      correct_idx: q.correctIdx !== undefined ? q.correctIdx : null,
      score: q.options[quizState.answers[i] as number]?.score ?? 0,
      max_score: q.maxScore,
    })),
  }
}
