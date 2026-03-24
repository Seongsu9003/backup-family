// ═══════════════════════════════════════════════════
//  서버 전용 Supabase 클라이언트 (service_role 키)
//
//  ⚠️  클라이언트 컴포넌트('use client')에서 절대 import 금지
//  ⚠️  API Route / Server Component 에서만 사용
//
//  service_role 키는 RLS를 완전히 우회합니다.
//  어드민 쓰기 작업(insert/update/delete)에만 사용하고
//  쿠키 기반 어드민 인증을 반드시 먼저 검증하세요.
// ═══════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    '[BUF] SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.\n' +
    '.env.local 과 Vercel 환경변수에 SUPABASE_SERVICE_ROLE_KEY 를 추가하세요.'
  )
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})
