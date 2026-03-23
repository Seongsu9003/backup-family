'use client'

// ═══════════════════════════════════════════════════
//  /search/access — 보호자 액세스 코드 입력 페이지 (SEC-03)
//  운영팀에서 발급받은 코드를 입력하면 /search로 이동합니다.
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchAccessPage() {
  const router = useRouter()

  const [code,    setCode]    = useState('')
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!code.trim()) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/search/unlock', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code }),
      })

      if (res.ok) {
        router.push('/search')
        router.refresh()
      } else {
        const { error: msg } = await res.json() as { error: string }
        setError(msg ?? '액세스 코드가 올바르지 않습니다.')
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
          서비스 이용을 위해 운영팀에서 발급받은 액세스 코드를 입력해 주세요.
        </p>

        {/* 코드 입력 */}
        <label className="block text-xs font-bold text-[#8A8A8A] uppercase tracking-wide mb-1.5">
          액세스 코드
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(null) }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="운영팀에서 발급받은 코드"
          className="w-full px-4 py-3 border-[1.5px] border-[#E4E0DC] rounded-lg text-sm outline-none focus:border-[#D85A3A] transition-colors mb-2"
          autoComplete="off"
        />

        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !code.trim()}
          className="w-full py-3 bg-[#D85A3A] text-white font-bold rounded-lg hover:bg-[#C04830] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '확인 중…' : '입장하기'}
        </button>

        {/* 문의 안내 */}
        <p className="text-center text-[.78rem] text-[#8A8A8A] mt-6">
          코드가 없으신가요?{' '}
          <a
            href="mailto:hello@backup-family.com"
            className="text-[#D85A3A] font-semibold hover:underline"
          >
            운영팀에 문의하기
          </a>
        </p>
      </div>
    </div>
  )
}
