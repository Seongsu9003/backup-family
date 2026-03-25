// ═══════════════════════════════════════════════════
//  어드민 파트너 API Route
//  POST  → 파트너 생성 (service_role)
//  PATCH → is_active 토글 (service_role)
//
//  ⚠️ buf_admin_session 쿠키 검증 필수
//  ⚠️ 클라이언트에서 anon 키로 직접 insert/update 금지
// ═══════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/shared/lib/supabaseAdmin'
import type { Partner } from '@/shared/types'

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('buf_admin_session')?.value === 'granted'
}

/** BUF + 5자리 순번 코드 생성 */
function buildCode(seq: number): string {
  return `BUF${String(seq).padStart(5, '0')}`
}

// ── POST: 파트너 생성 ────────────────────────────
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  let body: {
    name: string; type: Partner['type']; memo: string
    biz_no?: string; phone?: string; website?: string; address?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { name, type, memo, biz_no = '', phone = '', website = '', address = '' } = body
  if (!name || !type) {
    return NextResponse.json({ error: 'name, type 은 필수입니다.' }, { status: 400 })
  }

  // 현재 최대 seq 조회
  const { data: maxRow, error: seqErr } = await supabaseAdmin
    .from('partners')
    .select('seq')
    .order('seq', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (seqErr) {
    return NextResponse.json({ error: seqErr.message }, { status: 500 })
  }

  const nextSeq = ((maxRow?.seq as number | null) ?? 0) + 1
  const code    = buildCode(nextSeq)

  const { data, error } = await supabaseAdmin
    .from('partners')
    .insert({ seq: nextSeq, code, name, biz_no, phone, website, address, type, memo })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// ── PATCH: is_active 토글 ────────────────────────
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  let body: { id: string; is_active: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { id, is_active } = body
  if (!id || typeof is_active !== 'boolean') {
    return NextResponse.json({ error: 'id, is_active 는 필수입니다.' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('partners')
    .update({ is_active })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
