// ═══════════════════════════════════════════════════
//  GET /api/admin/visitors
//  보호자 조회 신청 내역 — service_role로 parent_visitors 조회
//  RLS: parent_visitors SELECT는 service_role 전용
// ═══════════════════════════════════════════════════
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const ADMIN_COOKIE = 'buf_admin_session'

/** 관리자 쿠키 검증 */
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_COOKIE)?.value === 'granted'
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await supabase
    .from('parent_visitors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[BUF] parent_visitors fetch 실패:', error.message)
    return NextResponse.json({ error: '데이터를 불러올 수 없습니다.' }, { status: 500 })
  }

  return NextResponse.json({ visitors: data ?? [] })
}
