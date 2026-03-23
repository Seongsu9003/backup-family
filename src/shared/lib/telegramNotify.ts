// ═══════════════════════════════════════════════════
//  텔레그램 봇 알림 유틸리티 (서버 전용)
//  환경변수: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// ═══════════════════════════════════════════════════

export interface NotifyNewResultParams {
  testId: string
  name: string
  level: string
  careType: string | null
  certStatus: string
  score: number
  preferredRegion: string[]
  jobSeeking: string
}

/**
 * 텔레그램 메시지 전송
 * 실패해도 예외를 던지지 않음 (알림 실패가 저장 흐름에 영향 주지 않도록)
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[telegramNotify] 환경변수 누락: TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID')
    return
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[telegramNotify] 전송 실패:', body)
    }
  } catch (err) {
    console.error('[telegramNotify] 네트워크 오류:', err)
  }
}

/**
 * 보호자 연결 요청 알림 메시지 포맷 및 전송
 */
export async function notifyContactRequest(params: {
  caregiverName: string
  profileUrl: string
  parentName: string
  parentContact: string
}): Promise<void> {
  const { caregiverName, profileUrl, parentName, parentContact } = params

  const message = [
    `📩 <b>돌봄이 연결 요청이 접수되었습니다</b>`,
    ``,
    `👶 보호자 이름: <b>${parentName}</b>`,
    `📞 보호자 연락처: <b>${parentContact}</b>`,
    ``,
    `👤 요청 돌봄이: <b>${caregiverName}</b>`,
    `🔗 <a href="${profileUrl}">프로필 보기</a>`,
    ``,
    `✅ 돌봄이 스케줄 확인 후 보호자에게 연락해 주세요.`,
  ].join('\n')

  await sendTelegramMessage(message)
}

/**
 * 새 인증 신청 알림 메시지 포맷 및 전송
 */
export async function notifyNewResult(params: NotifyNewResultParams): Promise<void> {
  const { testId, name, level, careType, certStatus, score, preferredRegion, jobSeeking } = params

  const profileUrl = `https://backup-family.vercel.app/profile/${testId}`
  const regionText = preferredRegion.length > 0 ? preferredRegion.join(', ') : '미입력'
  const careTypeText = careType ?? '미선택'
  const jobSeekingEmoji = jobSeeking === '구직중' ? '✅' : '➖'

  const message = [
    `🔔 <b>새 인증 신청이 접수되었습니다</b>`,
    ``,
    `👤 이름: <b>${name}</b>`,
    `🏆 레벨: ${level}`,
    `💼 돌봄 유형: ${careTypeText}`,
    `📋 인증 상태: ${certStatus}`,
    `📊 점수: ${score}점`,
    `📍 희망 지역: ${regionText}`,
    `${jobSeekingEmoji} 구직 여부: ${jobSeeking}`,
    ``,
    `🔗 <a href="${profileUrl}">프로필 보기</a>`,
  ].join('\n')

  await sendTelegramMessage(message)
}
