-- ================================================================
--  backup-family (BUF) — Supabase RLS 정책
--  Supabase Dashboard → SQL Editor 에 붙여넣고 실행하세요.
--
--  적용 순서:
--  1. 이 파일 전체 실행 (기존 정책 DROP 후 재생성)
--  2. Storage → cert-docs 버킷 정책 별도 설정 (하단 가이드 참고)
--
--  버전 이력:
--  v1.0  2026-03-26  최초 작성 (보안 강화 — anon 키 쓰기 차단)
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- 1. test_results 테이블
--    - SELECT : anon 허용 (구직 중인 돌봄이 조회, 프로필 공개)
--    - INSERT : anon 허용 (레벨테스트 결과 저장)
--    - UPDATE : 서비스 역할(service_role)만 허용 ← 핵심 보안
--    - DELETE : 차단 (데이터 보존 원칙)
-- ────────────────────────────────────────────────────────────────
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (재적용 시 오류 방지)
DROP POLICY IF EXISTS "test_results_select_anon"  ON test_results;
DROP POLICY IF EXISTS "test_results_insert_anon"  ON test_results;
DROP POLICY IF EXISTS "test_results_update_service" ON test_results;

-- SELECT: 모든 사용자 허용 (익명화는 앱 레이어에서 처리)
CREATE POLICY "test_results_select_anon"
  ON test_results FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: anon 허용 (레벨테스트 결과 저장)
CREATE POLICY "test_results_insert_anon"
  ON test_results FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- UPDATE: service_role 전용 (어드민 인증 처리, API Route 경유)
-- anon 키로 직접 update 차단 → useSetStatus / useBulkSetStatus 는 API Route 사용
CREATE POLICY "test_results_update_service"
  ON test_results FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────
-- 2. places 테이블
--    - SELECT : anon 허용 (is_active=true 인 장소만)
--    - INSERT/UPDATE/DELETE : service_role 전용
-- ────────────────────────────────────────────────────────────────
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "places_select_anon"    ON places;
DROP POLICY IF EXISTS "places_write_service"  ON places;

CREATE POLICY "places_select_anon"
  ON places FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- 어드민 CRUD는 /api/admin/places (service_role) 경유
CREATE POLICY "places_write_service"
  ON places FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────
-- 3. partners 테이블
--    - SELECT : anon 허용 (파트너 코드 유효성 검사 등)
--    - INSERT/UPDATE : service_role 전용
-- ────────────────────────────────────────────────────────────────
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partners_select_anon"  ON partners;
DROP POLICY IF EXISTS "partners_write_service" ON partners;

CREATE POLICY "partners_select_anon"
  ON partners FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "partners_write_service"
  ON partners FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────
-- 4. parent_visitors 테이블
--    - INSERT : anon 허용 (/api/search/register 에서 저장)
--    - SELECT/UPDATE/DELETE : service_role 전용
-- ────────────────────────────────────────────────────────────────
ALTER TABLE parent_visitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_visitors_insert_anon"    ON parent_visitors;
DROP POLICY IF EXISTS "parent_visitors_read_service"   ON parent_visitors;

-- /api/search/register 는 anon 키로 insert (이메일 저장)
CREATE POLICY "parent_visitors_insert_anon"
  ON parent_visitors FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "parent_visitors_read_service"
  ON parent_visitors FOR SELECT
  TO service_role
  USING (true);


-- ================================================================
--  Storage: cert-docs 버킷 설정 가이드
--  (SQL Editor가 아닌 Supabase Dashboard UI에서 설정)
--
--  1. Storage → Buckets → cert-docs
--  2. [Public bucket] 체크 해제 → Private 버킷으로 변경
--  3. Policies 탭에서 아래 정책 추가:
--
--     [INSERT] anon 허용
--       - bucket_id = 'cert-docs'
--       - 경로: (storage.foldername(name))[1] = auth.uid()
--         ※ 현재 인증 없는 구조이므로 임시로 TRUE 허용 후
--            추후 사용자 인증 도입 시 제한
--
--     [SELECT] service_role 전용 (어드민만 서류 열람)
--
--  ⚠️ 현재 uploadDoc.ts 에서 getPublicUrl() 사용 중
--     버킷을 private으로 전환하면 createSignedUrl() 로 변경 필요:
--
--     const { data } = await supabase.storage
--       .from('cert-docs')
--       .createSignedUrl(path, 60 * 60) // 1시간 유효
--     return data.signedUrl
--
-- ================================================================


-- ================================================================
--  적용 확인 쿼리 (실행 후 정책 목록 확인)
-- ================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
