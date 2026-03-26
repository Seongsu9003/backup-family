// ═══════════════════════════════════════════════════
//  GET /api/admin/visitors
//  보호자 조회 신청 내역 — service_role로 parent_visitors 조회
//  RLS: parent_visitors SELECT는 service_role 전용
// ═══════════════════════════════════════════════════
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/shared/lib/supabaseAdmin'

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

  const { data, error } = await supabaseAdmin
    .from('parent_visitors')
    .select('*')
    .limit(500)

  if (error) {
    console.error('[BUF] parent_visitors fetch 실패:', error.message, error.code)
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
  }

  return NextResponse.json({ visitors: data ?? [] })
}
