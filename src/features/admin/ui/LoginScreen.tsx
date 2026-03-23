'use client'

import { useState } from 'react'
import { signIn } from '../model/useAdminAuth'
import type { Session } from '@supabase/supabase-js'

interface Props {
  onLogin: (session: Session) => void
}

export function LoginScreen({ onLogin }: Props) {
  const [email,     setEmail]     = useState('')
  const [pw,        setPw]        = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)

  const submit = async () => {
    setError(null)
    setLoading(true)

    const { session, error: authError } = await signIn(email, pw)

    setLoading(false)

    if (authError || !session) {
      setError(authError ?? '로그인에 실패했습니다.')
      return
    }

    onLogin(session)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <h1 className="text-xl font-extrabold text-[#D85A3A] mb-1">backup-family</h1>
        <p className="text-sm text-[#8A8A8A] mb-8">관리자 전용 페이지입니다</p>

        {/* 이메일 */}
        <label className="block text-xs font-bold text-[#8A8A8A] uppercase tracking-wide mb-1.5">
          이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null) }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="관리자 이메일"
          className="w-full px-4 py-3 border-[1.5px] border-[#E4E0DC] rounded-lg text-sm outline-none focus:border-[#D85A3A] transition-colors mb-4"
        />

        {/* 비밀번호 */}
        <label className="block text-xs font-bold text-[#8A8A8A] uppercase tracking-wide mb-1.5">
          비밀번호
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(null) }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="비밀번호 입력"
          className="w-full px-4 py-3 border-[1.5px] border-[#E4E0DC] rounded-lg text-sm outline-none focus:border-[#D85A3A] transition-colors mb-2"
        />

        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 bg-[#D85A3A] text-white font-bold rounded-lg hover:bg-[#C04830] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </div>
    </div>
  )
}
