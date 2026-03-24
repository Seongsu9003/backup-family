-- ═══════════════════════════════════════════════════
--  [BIZ] 파트너 유입 채널 추적 마이그레이션
--  실행 위치: Supabase 대시보드 → SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. partners 테이블 생성
--    기본 정보 + 사업자 정보 컬럼 포함
CREATE TABLE IF NOT EXISTS partners (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  seq          int         UNIQUE NOT NULL,           -- 순번 (코드 생성 기준)
  code         text        UNIQUE NOT NULL,           -- BUF00001
  name         text        NOT NULL,                  -- 업체명

  -- 사업자 정보 (선택)
  biz_no       text        NOT NULL DEFAULT '',       -- 사업자등록번호 (000-00-00000)
  phone        text        NOT NULL DEFAULT '',       -- 대표 전화번호
  website      text        NOT NULL DEFAULT '',       -- 홈페이지 URL
  address      text        NOT NULL DEFAULT '',       -- 사업장 주소

  type         text        NOT NULL DEFAULT 'agency', -- agency | franchise | direct
  is_active    boolean     NOT NULL DEFAULT true,
  memo         text        NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 2. test_results 에 partner_code 컬럼 추가
ALTER TABLE test_results
  ADD COLUMN IF NOT EXISTS partner_code text;

-- 3. 인덱스 (파트너별 신청자 집계 조회용)
CREATE INDEX IF NOT EXISTS idx_test_results_partner_code
  ON test_results (partner_code);
