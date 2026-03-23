// ═══════════════════════════════════════
//  BUF 공유 타입 정의
// ═══════════════════════════════════════

export interface TesterInfo {
  name: string
  contact: string
  preferred_region: string[]
}

export interface ScoreInfo {
  total: number
  survey: number
  scenario: number
  max: number
}

export interface LevelInfo {
  num: number
  label: string
}

export interface CareType {
  code: string
  label: string
  fullLabel: string
  color: string
}

export interface Certification {
  status: '미인증' | '검토중' | '인증완료' | '반려'
  docs_attached: string[]
  admin_memo: string
  certified_at: string | null
}

export interface MetaInfo {
  test_id: string
  created_at: string
  expires_at: string
  version: string
}

/** partners 테이블 행 */
export interface Partner {
  id:         string
  seq:        number
  code:       string   // BUF00001
  name:       string
  type:       'agency' | 'franchise' | 'direct'
  is_active:  boolean
  memo:       string
  created_at: string
}

/** test_results 테이블의 raw_data 구조 */
export interface TestResult {
  meta: MetaInfo
  tester: TesterInfo
  score: ScoreInfo
  level: LevelInfo
  care_type: CareType | null
  job_seeking: string
  certification: Certification
  scenario_ids:  string[]
  question_log:  QuestionLog[]
  partner_code?: string   // 파트너 유입 코드 (BUF00001 등, 없으면 undefined)
}

export interface QuestionLog {
  q_id: string
  type: string
  category: string
  chosen_idx: number
  correct_idx: number | null
  score: number
  max_score: number
}
