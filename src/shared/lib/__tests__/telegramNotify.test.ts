// ═══════════════════════════════════════════════════
//  telegramNotify 단위 테스트
// ═══════════════════════════════════════════════════
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFetch = vi.hoisted(() => vi.fn())
vi.stubGlobal('fetch', mockFetch)

import { sendTelegramMessage, notifyNewResult } from '../telegramNotify'

describe('sendTelegramMessage', () => {
  beforeEach(() => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'test-token')
    vi.stubEnv('TELEGRAM_CHAT_ID', '123456789')
    mockFetch.mockResolvedValue({ ok: true, text: async () => '' })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    mockFetch.mockReset()
  })

  it('올바른 텔레그램 API URL로 POST 요청을 보낸다', async () => {
    await sendTelegramMessage('테스트 메시지')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottest-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })

  it('메시지 본문에 chat_id와 text가 포함된다', async () => {
    await sendTelegramMessage('안녕하세요')

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(options.body as string)

    expect(body.chat_id).toBe('123456789')
    expect(body.text).toBe('안녕하세요')
    expect(body.parse_mode).toBe('HTML')
  })

  it('환경변수가 없으면 fetch를 호출하지 않는다', async () => {
    vi.unstubAllEnvs()

    await sendTelegramMessage('테스트')

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetch 실패 시 예외를 던지지 않는다', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(sendTelegramMessage('테스트')).resolves.not.toThrow()
  })

  it('응답이 ok:false여도 예외를 던지지 않는다', async () => {
    mockFetch.mockResolvedValue({ ok: false, text: async () => 'Bad Request' })

    await expect(sendTelegramMessage('테스트')).resolves.not.toThrow()
  })
})

describe('notifyNewResult', () => {
  beforeEach(() => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'test-token')
    vi.stubEnv('TELEGRAM_CHAT_ID', '123456789')
    mockFetch.mockResolvedValue({ ok: true, text: async () => '' })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    mockFetch.mockReset()
  })

  it('이름, 레벨, 프로필 링크가 메시지에 포함된다', async () => {
    await notifyNewResult({
      testId: 'abc-123',
      name: '홍길동',
      level: 'Lv.2 중급',
      careType: '노인 돌봄',
      certStatus: '검토중',
      score: 78,
      preferredRegion: ['서울', '경기'],
      jobSeeking: '구직중',
    })

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(options.body as string)

    expect(body.text).toContain('홍길동')
    expect(body.text).toContain('Lv.2 중급')
    expect(body.text).toContain('abc-123')
    expect(body.text).toContain('서울, 경기')
  })

  it('희망 지역이 없으면 "미입력"으로 표시된다', async () => {
    await notifyNewResult({
      testId: 'xyz-456',
      name: '김철수',
      level: 'Lv.1 초급',
      careType: null,
      certStatus: '미인증',
      score: 45,
      preferredRegion: [],
      jobSeeking: '구직중 아님',
    })

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(options.body as string)

    expect(body.text).toContain('미입력')
    expect(body.text).toContain('미선택')
  })
})
