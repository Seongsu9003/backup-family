'use client'

import { useState } from 'react'

// 환경변수 미설정 시 로그인 불가 (fallback 하드코딩 제거)
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? ''

interface Props {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: Props) {
  const [pw, setPw]       = useState('')
  const [error, setError] = useState(false)

  const submit = () => {
    if (pw === ADMIN_PASSWORD) {
      onLogin()
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <h1 className="text-xl font-extrabold text-[#D85A3A] mb-1">backup-family</h1>
        <p className="text-sm text-[#8A8A8A] mb-8">관리자 전용 페이지입니다</p>

        <label className="block text-xs font-bold text-[#8A8A8A] uppercase tracking-wide mb-1.5">
          관리자 비밀번호
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false) }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="비밀번호 입력"
          className="w-full px-4 py-3 border-[1.5px] border-[#E4E0DC] rounded-lg text-sm outline-none focus:border-[#D85A3A] transition-colors mb-2"
        />
        {error && (
          <p className="text-xs text-red-500 mb-3">비밀번호가 올바르지 않습니다.</p>
        )}
        <button
          onClick={submit}
          className="w-full py-3 bg-[#D85A3A] text-white font-bold rounded-lg hover:bg-[#C04830] transition-colors mt-2"
        >
          로그인
        </button>
      </div>
    </div>
  )
}
