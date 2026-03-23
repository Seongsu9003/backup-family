// ═══════════════════════════════════════════════════
//  관리자 세션 쿠키 API (SEC-03)
//  POST  → buf_admin_session 쿠키 설정 (로그인 성공 후 호출)
//  DELETE → buf_admin_session 쿠키 삭제 (로그아웃 시 호출)
//  proxy.ts가 이 쿠키를 읽어 /admin 접근을 서버사이드에서 제어합니다.
// ═══════════════════════════════════════════════════
import { NextResponse } from 'next/server'

const COOKIE_NAME  = 'buf_admin_session'
const COOKIE_VALUE = 'granted'
const MAX_AGE      = 60 * 60 * 24 // 24시간

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    maxAge:   MAX_AGE,
    secure:   process.env.NODE_ENV === 'production',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}
