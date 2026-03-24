-- =============================================
-- RLS (Row Level Security) 정책 설정
-- 대상: test_results, partners
-- 실행: Supabase Dashboard → SQL Editor 에서 실행
-- 작성일: 2026-03-24
-- =============================================

-- ═══════════════════════════════════════════
--  1. test_results
-- ═══════════════════════════════════════════

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- ── 익명(anon) 정책 ──────────────────────────
-- 공개 프로필(/profile/[testId]), 돌봄이 검색(/search),
-- 내 결과 조회(이름+연락처 필터) 모두 anon 키로 동작하므로
-- SELECT는 전체 허용. 단 DELETE는 차단.
CREATE POLICY "anon_select_test_results"
  ON test_results
  FOR SELECT
  TO anon
  USING (true);

-- 레벨 테스트 최초 제출 및 재응시(upsert) 허용
CREATE POLICY "anon_insert_test_results"
  ON test_results
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- upsert(재응시)는 INSERT + UPDATE 권한이 모두 필요
-- test_id(UUID)를 알아야만 UPDATE 가능하므로 실질적 보호
CREATE POLICY "anon_update_test_results"
  ON test_results
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ── 인증된 사용자(관리자) 정책 ───────────────
-- Supabase Auth 로그인 후 JWT role = 'authenticated'
-- 관리자 인증·일괄 인증·메모 등 모든 쓰기 작업 허용
CREATE POLICY "authenticated_all_test_results"
  ON test_results
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ═══════════════════════════════════════════
--  2. partners
-- ═══════════════════════════════════════════

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- 파트너 테이블은 관리자 전용 — anon 접근 전면 차단
-- (파트너 유입 링크 생성·통계·활성토글 모두 /admin 에서만 사용)
CREATE POLICY "authenticated_all_partners"
  ON partners
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
