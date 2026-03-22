import { createClient } from '@supabase/supabase-js'

// ── 환경변수 검증 (빌드/런타임 초기에 명확한 오류 발생) ──
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[BUF] Supabase 환경변수가 설정되지 않았습니다.\n' +
    '.env.local 에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 를 추가하세요.'
  )
}

// 싱글턴 클라이언트 (클라이언트 컴포넌트에서 사용)
export const supabase = createClient(supabaseUrl, supabaseKey)
