// ═══════════════════════════════════════════════════
//  POST /api/notify/contact
//  보호자가 연결 요청 시 텔레그램 알림 발송
// ═══════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server'
import { notifyContactRequest } from '@/shared/lib/telegramNotify'

export async function POST(request: NextRequest) {
  try {
    const { caregiverName, profileUrl, parentName, parentContact } = await request.json() as {
      caregiverName: string
      profileUrl: string
      parentName: string
      parentContact: string
    }

    if (!caregiverName || !profileUrl || !parentContact) {
      return NextResponse.json({ error: '필수 필드 누락' }, { status: 400 })
    }

    await notifyContactRequest({ caregiverName, profileUrl, parentName, parentContact })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/notify/contact]', err)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
