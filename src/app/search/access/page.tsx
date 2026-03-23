'use client'

// ═══════════════════════════════════════════════════
//  /search/access — 보호자 이메일 인증 페이지 (SEC-03)
//  이메일을 입력하면 /search 로 진입합니다.
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchAccessPage() {
  const router = useRouter()

  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const trimmed = email.trim()
    if (!trimmed) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/search/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: trimmed }),
      })

      if (res.ok) {
        router.push('/search')
        router.refresh()
      } else {
        const { error: msg } = await res.json() as { error: string }
        setError(msg ?? '이메일을 확인해주세요.')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">

        {/* 헤더 */}
        <h1 className="text-xl font-extrabold text-[#D85A3A] mb-1">backup-family</h1>
        <p className="text-sm text-[#8A8A8A] mb-1">보호자 전용 돌봄이 검색</p>
        <p className="text-[.82rem] text-[#8A8A8A] mb-8 leading-relaxed">
          이메일을 입력하시면 역량이 확인된 돌봄이를 조회하실 수 있습니다.
        </p>

        {/* 이메일 입력 */}
        <label className="block text-xs font-bold text-[#8A8A8A] uppercase tracking-wide mb-1.5">
          이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null) }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="이메일 주소를 입력해주세요"
          className="w-full px-4 py-3 border-[1.5px] border-[#E4E0DC] rounded-lg text-sm outline-none focus:border-[#D85A3A] transition-colors mb-2"
          autoComplete="email"
        />

        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email.trim()}
          className="w-full py-3 bg-[#D85A3A] text-white font-bold rounded-lg hover:bg-[#C04830] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '확인 중…' : '돌봄이 검색하기'}
        </button>

        <p className="text-center text-[.76rem] text-[#8A8A8A] mt-5 leading-relaxed">
          입력하신 이메일은 서비스 운영 목적으로만 사용되며,<br />
          외부에 제공되지 않습니다.
        </p>
      </div>
    </div>
  )
}
