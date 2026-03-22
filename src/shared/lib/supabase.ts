import { createClient } from '@supabase/supabase-js'

// 환경변수에서 주입 — .env.local 파일에서 관리
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 싱글턴 클라이언트 (클라이언트 컴포넌트에서 사용)
export const supabase = createClient(supabaseUrl, supabaseKey)
