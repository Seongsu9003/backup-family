// ═══════════════════════════════════════════════════
//  useAdminAuth 단위 테스트
//  Supabase Auth를 vi.mock + vi.hoisted로 격리하여 검증
// ═══════════════════════════════════════════════════
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── vi.hoisted: mock 함수를 호이스팅 전에 선언 ───────
const {
  mockSignInWithPassword,
  mockSignOut,
  mockGetSession,
} = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignOut:            vi.fn(),
  mockGetSession:         vi.fn(),
}))

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut:            mockSignOut,
      getSession:         mockGetSession,
      onAuthStateChange:  vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}))

import { signIn, signOut, getSession } from '../useAdminAuth'

// ────────────────────────────────────────────────────
// signIn
// ────────────────────────────────────────────────────
describe('signIn', () => {
  beforeEach(() => vi.clearAllMocks())

  it('올바른 자격증명 → error 없이 session 반환', async () => {
    const fakeSession = { user: { id: 'uid-1', email: 'admin@buf.com' } }
    mockSignInWithPassword.mockResolvedValue({ data: { session: fakeSession }, error: null })

    const result = await signIn('admin@buf.com', 'correct-pw')

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email:    'admin@buf.com',
      password: 'correct-pw',
    })
    expect(result.session).toEqual(fakeSession)
    expect(result.error).toBeNull()
  })

  it('잘못된 비밀번호 → error 반환, session null', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data:  { session: null },
      error: { message: 'Invalid login credentials' },
    })

    const result = await signIn('admin@buf.com', 'wrong-pw')

    expect(result.session).toBeNull()
    expect(result.error).toBe('Invalid login credentials')
  })

  it('네트워크 오류 → error 반환', async () => {
    mockSignInWithPassword.mockRejectedValue(new Error('Network error'))

    const result = await signIn('admin@buf.com', 'any-pw')

    expect(result.session).toBeNull()
    expect(result.error).toContain('Network error')
  })

  it('빈 이메일 → supabase 호출 없이 validation error 반환', async () => {
    const result = await signIn('', 'some-pw')

    expect(mockSignInWithPassword).not.toHaveBeenCalled()
    expect(result.error).toBeTruthy()
  })

  it('빈 비밀번호 → supabase 호출 없이 validation error 반환', async () => {
    const result = await signIn('admin@buf.com', '')

    expect(mockSignInWithPassword).not.toHaveBeenCalled()
    expect(result.error).toBeTruthy()
  })
})

// ────────────────────────────────────────────────────
// signOut
// ────────────────────────────────────────────────────
describe('signOut', () => {
  beforeEach(() => vi.clearAllMocks())

  it('supabase.auth.signOut 호출됨', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    await signOut()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('signOut 오류가 발생해도 throw하지 않음', async () => {
    mockSignOut.mockResolvedValue({ error: { message: 'SignOut failed' } })

    await expect(signOut()).resolves.not.toThrow()
  })
})

// ────────────────────────────────────────────────────
// getSession (세션 복원)
// ────────────────────────────────────────────────────
describe('getSession', () => {
  beforeEach(() => vi.clearAllMocks())

  it('유효한 세션이 있으면 session 반환', async () => {
    const fakeSession = { user: { id: 'uid-1', email: 'admin@buf.com' } }
    mockGetSession.mockResolvedValue({ data: { session: fakeSession }, error: null })

    const result = await getSession()

    expect(result).toEqual(fakeSession)
  })

  it('세션이 없으면 null 반환', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })

    const result = await getSession()

    expect(result).toBeNull()
  })

  it('getSession 오류 시 null 반환 (throw 없음)', async () => {
    mockGetSession.mockResolvedValue({
      data:  { session: null },
      error: { message: 'Session error' },
    })

    const result = await getSession()

    expect(result).toBeNull()
  })
})
