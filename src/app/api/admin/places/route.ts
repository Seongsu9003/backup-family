// ═══════════════════════════════════════════════════
//  어드민 장소 API Route (SEC-05)
//
//  모든 엔드포인트는 buf_admin_session 쿠키를 검증합니다.
//  DB 작업은 service_role 키로 RLS를 우회합니다.
//
//  GET    → 전체 목록 (비활성 포함, 어드민용)
//  POST   → 단건 또는 대량 등록 (배열이면 대량)
//  PATCH  → is_active 토글
//  DELETE → 단건 삭제
// ═══════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/shared/lib/supabaseAdmin'
import type { PlaceInput } from '@/shared/types'

// ── 어드민 쿠키 검증 ───────────────────────────────
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('buf_admin_session')?.value === 'granted'
}

// ── GET: 전체 목록 (비활성 포함) ──────────────────
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('places')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// ── POST: 단건 또는 대량 등록 ─────────────────────
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const body = await req.json()
  const inputs: PlaceInput[] = Array.isArray(body) ? body : [body]

  const { error } = await supabaseAdmin.from('places').insert(inputs)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ count: inputs.length })
}

// ── PATCH: is_active 토글 ─────────────────────────
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const { id, is_active } = await req.json() as { id: string; is_active: boolean }

  const { error } = await supabaseAdmin
    .from('places')
    .update({ is_active })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// ── DELETE: 단건 삭제 ─────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const { id } = await req.json() as { id: string }

  const { error } = await supabaseAdmin
    .from('places')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
