// ═══════════════════════════════════════════════════
//  Next.js Instrumentation Hook
//  Sentry 서버/엣지 초기화 진입점 (App Router)
// ═══════════════════════════════════════════════════
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}
