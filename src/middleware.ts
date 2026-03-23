// ═══════════════════════════════════════════════════
//  Next.js Middleware (SEC-03)
//  /search 접근 시 buf_search_access 쿠키를 검증합니다.
//  쿠키가 없거나 유효하지 않으면 /search/access로 리다이렉트합니다.
// ═══════════════════════════════════════════════════
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME  = 'buf_search_access'
const COOKIE_VALUE = 'granted'

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)

  if (cookie?.value !== COOKIE_VALUE) {
    const accessUrl = new URL('/search/access', request.url)
    return NextResponse.redirect(accessUrl)
  }

  return NextResponse.next()
}

export const config = {
  // /search 경로만 보호 (/search/access, /api/search/* 는 제외)
  matcher: ['/search'],
}
