// ═══════════════════════════════════════════════════
//  PATCH /api/admin/results/status
//  단건 인증 상태 업데이트 (service_role — RLS 우회)
//
//  ⚠️ buf_admin_session 쿠키 검증 필수
//  ⚠️ 클라이언트에서 supabase anon 키로 직접 update 금지
// ═══════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/shared/lib/supabaseAdmin'
import { calcCertExpiry } from '@/shared/lib/dateUtils'
import type { TestResult } from '@/shared/types'

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('buf_admin_session')?.value === 'granted'
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  let body: { result: TestResult; status: string; memo: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { result, status, memo } = body
  if (!result?.meta?.test_id || !status) {
    return NextResponse.json({ error: 'test_id, status 는 필수입니다.' }, { status: 400 })
  }

  const isCertified = status === '인증완료'
  const certifiedAt = isCertified ? new Date().toISOString() : null
  const certExpiry  = isCertified ? calcCertExpiry() : null

  const updated: TestResult = {
    ...result,
    meta: {
      ...result.meta,
      ...(isCertified ? { expires_at: certExpiry! } : {}),
    },
    certification: {
      ...result.certification,
      status:       status as TestResult['certification']['status'],
      admin_memo:   memo,
      certified_at: certifiedAt,
    },
  }

  const { error } = await supabaseAdmin
    .from('test_results')
    .update({
      cert_status : status,
      admin_memo  : memo,
      cert_issued : certifiedAt,
      cert_expiry : certExpiry,
      raw_data    : updated,
    })
    .eq('test_id', result.meta.test_id)

  if (error) {
    console.error('[BUF] results/status update 실패:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, name: result.tester?.name || '', status })
}
