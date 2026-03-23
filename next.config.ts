// ═══════════════════════════════════════════════════
//  Next.js 설정 + Sentry 래핑 (MON-01)
// ═══════════════════════════════════════════════════
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  /* config options here */
}

export default withSentryConfig(nextConfig, {
  org:     'backup-family',
  project: 'javascript-nextjs',

  // 소스맵을 Sentry에 업로드하여 스택트레이스 디버깅 가능
  silent: true,

  // 빌드 시 Sentry CLI 자동 릴리즈 생성
  autoInstrumentServerFunctions: true,
  hideSourceMaps: true,

  // 번들 크기 최적화 — 사용하지 않는 Sentry 기능 tree-shake
  disableLogger: true,
  widenClientFileUpload: true,
})
