// ═══════════════════════════════════════════════════
//  POST /api/search/register (SEC-03)
//  이메일 형식 검증 → parent_visitors 저장 → httpOnly 쿠키 발급
// ═══════════════════════════════════════════════════
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isValidEmail } from '@/shared/lib/emailUtils'

const COOKIE_NAME    = 'buf_search_access'
const COOKIE_EXPIRES = 60 * 60 * 24 * 7 // 7일 (초)

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email: string }

    // ── 이메일 형식 검증 ──────────────────────────
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 },
      )
    }

    // ── Supabase에 방문 이메일 저장 ───────────────
    // 서버 전용 클라이언트 (service role 없이 anon key로 충분 — RLS public insert 허용)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error: dbError } = await supabase
      .from('parent_visitors')
      .insert({ email: email.toLowerCase().trim() })

    // DB 저장 실패는 쿠키 발급을 막지 않음 (로깅만)
    if (dbError) {
      console.error('[BUF] parent_visitors insert 실패:', dbError.message)
    }

    // ── httpOnly 쿠키 발급 ────────────────────────
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
