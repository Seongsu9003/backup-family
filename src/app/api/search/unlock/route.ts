// ═══════════════════════════════════════════════════
//  POST /api/search/unlock (SEC-03)
//  액세스 코드를 서버에서 검증하고 httpOnly 쿠키를 발급합니다.
//  SEARCH_ACCESS_CODE 는 서버 전용 환경변수 (NEXT_PUBLIC_ 아님)
// ═══════════════════════════════════════════════════
import { NextResponse } from 'next/server'
import { isValidAccessCode } from '@/shared/lib/accessCode'

const COOKIE_NAME    = 'buf_search_access'
const COOKIE_EXPIRES = 60 * 60 * 24 * 7 // 7일 (초)

export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as { code: string }
    const secret   = process.env.SEARCH_ACCESS_CODE

    if (!isValidAccessCode(code, secret)) {
      return NextResponse.json(
        { error: '액세스 코드가 올바르지 않습니다.' },
        { status: 401 },
      )
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, 'granted', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   COOKIE_EXPIRES,
      path:     '/',
    })
    return response

  } catch {
    return NextResponse.json(
      { error: '요청을 처리할 수 없습니다.' },
      { status: 400 },
    )
  }
}
