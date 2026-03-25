// ═══════════════════════════════════════════════════
//  GET /api/admin/cert-docs/signed-url?path=...
//  인증 서류 열람용 서명 URL 발급 (어드민 전용)
//
//  - cert-docs 버킷은 private → public URL 없음
//  - 어드민 쿠키 검증 후 1시간 유효 서명 URL 발급
//  - 서명 URL 만료 후 재요청 필요 (보안 원칙)
//
//  ⚠️ buf_admin_session 쿠키 검증 필수
//  ⚠️ service_role 키로만 private 버킷 서명 URL 생성 가능
// ═══════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/shared/lib/supabaseAdmin'

const BUCKET      = 'cert-docs'
const EXPIRES_IN  = 60 * 60 // 1시간 (초)

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('buf_admin_session')?.value === 'granted'
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path')
  if (!path || path.trim() === '') {
    return NextResponse.json({ error: 'path 파라미터가 필요합니다.' }, { status: 400 })
  }

  // path traversal 방어: '..' 포함 거부
  if (path.includes('..')) {
    return NextResponse.json({ error: '유효하지 않은 경로입니다.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, EXPIRES_IN)

  if (error || !data?.signedUrl) {
    console.error('[BUF] signed-url 생성 실패:', error?.message)
    return NextResponse.json({ error: '서명 URL 생성에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: data.signedUrl, expiresIn: EXPIRES_IN })
}
