-- =============================================
-- places 테이블 생성 — 부모 동반 추천 장소 콘텐츠
-- 실행: Supabase Dashboard → SQL Editor
-- 작성일: 2026-03-24
-- =============================================

CREATE TABLE IF NOT EXISTS places (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  address     text        NOT NULL DEFAULT '',
  category    text        NOT NULL DEFAULT '기타',   -- 도서관 | 공원 | 문화센터 | 기타
  tags        text[]      NOT NULL DEFAULT '{}',    -- ['영유아','무료','평일추천']
  hours       text        NOT NULL DEFAULT '',       -- 운영시간
  closed_days text        NOT NULL DEFAULT '',       -- 휴관일
  is_free     boolean     NOT NULL DEFAULT true,
  image_url   text        NOT NULL DEFAULT '',
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 카테고리·활성 여부 필터 성능용 인덱스
CREATE INDEX IF NOT EXISTS idx_places_category  ON places (category);
CREATE INDEX IF NOT EXISTS idx_places_is_active ON places (is_active);

-- ── RLS ──────────────────────────────────────
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- anon: 활성화된 장소만 조회 가능
CREATE POLICY "anon_select_places"
  ON places FOR SELECT TO anon
  USING (is_active = true);

-- authenticated(관리자): 전체 권한
CREATE POLICY "authenticated_all_places"
  ON places FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
