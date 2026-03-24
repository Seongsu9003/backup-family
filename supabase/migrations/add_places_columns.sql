-- =============================================
-- places 테이블 컬럼 추가
-- 사용자 CSV 형식에 맞춰 region_1, region_2,
-- facilities, parking, phone, website 추가
-- 작성일: 2026-03-24
-- =============================================

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS region_1  text NOT NULL DEFAULT '',  -- 시/도 (예: 서울특별시)
  ADD COLUMN IF NOT EXISTS region_2  text NOT NULL DEFAULT '',  -- 구/군 (예: 종로구)
  ADD COLUMN IF NOT EXISTS facilities text NOT NULL DEFAULT '', -- 시설 정보
  ADD COLUMN IF NOT EXISTS parking   text NOT NULL DEFAULT '',  -- 주차 정보 (가능/불가/유료 등)
  ADD COLUMN IF NOT EXISTS phone     text NOT NULL DEFAULT '',  -- 전화번호
  ADD COLUMN IF NOT EXISTS website   text NOT NULL DEFAULT '';  -- 홈페이지 URL

-- 지역 필터 인덱스
CREATE INDEX IF NOT EXISTS idx_places_region_1 ON places (region_1);
CREATE INDEX IF NOT EXISTS idx_places_region_2 ON places (region_2);
