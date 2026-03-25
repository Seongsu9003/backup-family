// ═══════════════════════════════════════════════════
//  Next.js 설정 + Sentry 래핑 (MON-01)
// ═══════════════════════════════════════════════════
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/9.x/**',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org:     'backup-family',
  project: 'javascript-nextjs',

  // 소스맵을 Sentry에 업로드 후 번들에서 제거 (hideSourceMaps 대체)
  silent: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  widenClientFileUpload: true,

  // @sentry/nextjs v9 — deprecated 옵션을 webpack 하위로 이동
  webpack: {
    autoInstrumentServerFunctions: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
})
