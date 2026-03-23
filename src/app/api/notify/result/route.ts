// ═══════════════════════════════════════════════════
//  POST /api/notify/result
//  새 레벨 테스트 저장 후 텔레그램 알림 발송
// ═══════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { notifyNewResult, type NotifyNewResultParams } from '@/shared/lib/telegramNotify'

export async function POST(request: NextRequest) {
  try {
    const body: NotifyNewResultParams = await request.json()

    const { testId, name, level, careType, certStatus, score, preferredRegion, jobSeeking } = body

    // 필수 필드 검증
    if (!testId || !name || !level) {
      return NextResponse.json({ error: '필수 필드 누락' }, { status: 400 })
    }

    await notifyNewResult({
      testId,
      name,
      level,
      careType: careType ?? null,
      certStatus,
      score,
      preferredRegion: Array.isArray(preferredRegion) ? preferredRegion : [],
      jobSeeking,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    // 알림 실패가 클라이언트 오류로 이어지지 않도록 200 반환
    console.error('[/api/notify/result]', err)
    return NextResponse.json({ ok: false, error: '알림 전송 실패' }, { status: 200 })
  }
}
