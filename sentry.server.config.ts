// ═══════════════════════════════════════════════════
//  Sentry 서버 설정 (Node.js Runtime)
// ═══════════════════════════════════════════════════
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // API Route, Server Actions 오류 추적
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  debug: process.env.NODE_ENV === 'development',
})
