// ═══════════════════════════════════════════════════
//  Sentry 클라이언트 설정 (브라우저)
// ═══════════════════════════════════════════════════
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 트랜잭션 샘플링 (프로덕션 10%, 개발 0%)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // 에러 발생 시 세션 리플레이 100% 캡처
  replaysOnErrorSampleRate: 1.0,
  // 일반 세션 리플레이 1% 샘플링
  replaysSessionSampleRate: 0.01,

  // 개발 환경에서는 콘솔 출력으로 확인
  debug: process.env.NODE_ENV === 'development',
})
