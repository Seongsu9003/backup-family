// ═══════════════════════════════════════════════════
//  관리자 인증 유틸 (SEC-01)
//  Supabase Auth 기반 — signIn / signOut / getSession
// ═══════════════════════════════════════════════════
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/shared/lib/supabase'

export interface AuthResult {
  session: Session | null
  error:   string | null
}

/**
 * 관리자 로그인
 * - 이메일·비밀번호 빈 값 검증 후 supabase.auth.signInWithPassword 호출
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  // 클라이언트 유효성 검사 (supabase 호출 절약)
  if (!email.trim()) return { session: null, error: '이메일을 입력해주세요.' }
  if (!password)     return { session: null, error: '비밀번호를 입력해주세요.' }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { session: null, error: error.message }
    return { session: data.session, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
    return { session: null, error: message }
  }
}

/**
 * 관리자 로그아웃
 * - 오류가 발생해도 throw하지 않음 (UI는 항상 로그아웃 처리)
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/**
 * 현재 세션 조회 (페이지 마운트 시 복원용)
 * - 세션 없음 또는 오류 시 null 반환
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) return null
  return data.session
}
