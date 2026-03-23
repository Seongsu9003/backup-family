// ═══════════════════════════════════════════════════
//  Next.js Proxy — Next.js 16에서 middleware → proxy로 변경
//
//  [보호 경로]
//  1. /search            → buf_search_access 쿠키 검증
//                          없으면 /search/access 리다이렉트
//
//  2. /admin/*           → buf_admin_session 쿠키 검증 (SEC-03)
//     (/admin/login 제외)  없으면 /admin/login 리다이렉트
// ═══════════════════════════════════════════════════
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SEARCH_COOKIE_NAME  = 'buf_search_access'
const SEARCH_COOKIE_VALUE = 'granted'

const ADMIN_COOKIE_NAME   = 'buf_admin_session'
const ADMIN_COOKIE_VALUE  = 'granted'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── /search 보호 ────────────────────────────────
  if (pathname === '/search') {
    const cookie = request.cookies.get(SEARCH_COOKIE_NAME)
    if (cookie?.value !== SEARCH_COOKIE_VALUE) {
      return NextResponse.redirect(new URL('/search/access', request.url))
    }
  }

  // ── /admin/* 보호 (/admin/login 제외) ───────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = request.cookies.get(ADMIN_COOKIE_NAME)
    if (cookie?.value !== ADMIN_COOKIE_VALUE) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/search',
    '/admin',
    '/admin/:path*',
  ],
}
