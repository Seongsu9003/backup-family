// ═══════════════════════════════════════
//  BUF 공유 타입 정의
// ═══════════════════════════════════════

export interface TesterInfo {
  name: string
  contact: string
  preferred_region: string[]
  nickname?:   string   // 돌봄이가 설정한 닉네임 (미설정 시 성OO 폴백)
  avatar_key?: string   // 캐릭터 풀 key (미설정 시 testId seed DiceBear 폴백)
  bio?:        string   // 한 줄 자기소개 (max 60자, 미설정 시 유형 설명 폴백)
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
  code:       string              // BUF00001
  name:       string              // 업체명
  // 사업자 정보 (선택)
  biz_no:     string              // 사업자등록번호 (000-00-00000)
  phone:      string              // 대표 전화번호
  website:    string              // 홈페이지 URL
  address:    string              // 사업장 주소
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

/** places 테이블 카테고리 */
export const PLACE_CATEGORIES = ['도서관', '공원', '문화센터', '기타'] as const
export type PlaceCategory = typeof PLACE_CATEGORIES[number]

/** places 테이블 행 */
export interface Place {
  id:          string
  name:        string
  region_1:    string         // 시/도 (예: 서울특별시)
  region_2:    string         // 구/군 (예: 종로구)
  address:     string
  category:    PlaceCategory
  description: string         // 특화 분야 (specialty)
  facilities:  string         // 시설 정보
  hours:       string         // 운영시간 (opening_hours)
  closed_days: string         // 휴관일
  parking:     string         // 주차 정보
  phone:       string         // 전화번호
  website:     string         // 홈페이지 URL
  tags:        string[]       // 수동 태그 ['영유아', '무료', ...]
  is_free:     boolean
  image_url:   string
  is_active:   boolean
  created_at:  string
}

/** 장소 등록 입력값 (id·created_at 제외) */
export type PlaceInput = Omit<Place, 'id' | 'created_at'>

export interface QuestionLog {
  q_id: string
  type: string
  category: string
  chosen_idx: number
  correct_idx: number | null
  score: number
  max_score: number
}
