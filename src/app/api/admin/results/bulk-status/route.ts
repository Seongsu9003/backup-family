// ═══════════════════════════════════════════════════
//  POST /api/admin/results/bulk-status
//  일괄 인증완료 처리 (service_role — RLS 우회)
//
//  ⚠️ buf_admin_session 쿠키 검증 필수
// ═══════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/shared/lib/supabaseAdmin'
import { calcCertExpiry } from '@/shared/lib/dateUtils'
import type { TestResult } from '@/shared/types'

const TARGET_STATUS = '인증완료'

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('buf_admin_session')?.value === 'granted'
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  let results: TestResult[]
  try {
    results = await request.json()
    if (!Array.isArray(results)) throw new Error('배열이 아닙니다.')
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const now        = new Date().toISOString()
  const certExpiry = calcCertExpiry()

  const tasks = results.map(async (result) => {
    const updated: TestResult = {
      ...result,
      meta:          { ...result.meta, expires_at: certExpiry },
      certification: { ...result.certification, status: TARGET_STATUS, certified_at: now },
    }

    const { error } = await supabaseAdmin
      .from('test_results')
      .update({
        cert_status: TARGET_STATUS,
        cert_issued: now,
        cert_expiry: certExpiry,
        raw_data:    updated,
      })
      .eq('test_id', result.meta.test_id)

    if (error) throw new Error(error.message)
  })

  const settled   = await Promise.allSettled(tasks)
  const succeeded = settled.filter((r) => r.status === 'fulfilled').length
  const failed    = settled.filter((r) => r.status === 'rejected').length

  return NextResponse.json({ ok: true, succeeded, failed })
}
