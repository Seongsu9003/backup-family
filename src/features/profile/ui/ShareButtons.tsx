'use client'

// ═══════════════════════════════════════════════════
//  공유 버튼 — 카카오톡 공유 + 링크 복사
//  카카오 앱키: NEXT_PUBLIC_KAKAO_APP_KEY 환경변수 필요
// ═══════════════════════════════════════════════════
import { useState, useEffect } from 'react'

interface Props {
  profileUrl: string
  title: string        // 예: "홍*동 님의 Lv.3 중급 돌봄이 인증카드"
  description: string  // 예: "backup-family 레벨 테스트 결과"
}

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean
      init: (key: string) => void
      Share: {
        sendDefault: (options: KakaoShareOptions) => void
      }
    }
  }
}

interface KakaoShareOptions {
  objectType: string
  content: {
    title: string
    description: string
    imageUrl: string
    link: { mobileWebUrl: string; webUrl: string }
  }
  buttons: Array<{ title: string; link: { mobileWebUrl: string; webUrl: string } }>
}

export function ShareButtons({ profileUrl, title, description }: Props) {
  const [copied, setCopied] = useState(false)
  const [kakaoReady, setKakaoReady] = useState(false)

  // 카카오 SDK 동적 로드
  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY
    if (!appKey) return

    if (window.Kakao?.isInitialized()) {
      setKakaoReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
    script.async = true
    script.onload = () => {
      window.Kakao?.init(appKey)
      setKakaoReady(true)
    }
    document.head.appendChild(script)
  }, [])

  const handleKakaoShare = () => {
    if (!window.Kakao?.isInitialized()) return
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: `${window.location.origin}/og-default.png`,
        link: { mobileWebUrl: profileUrl, webUrl: profileUrl },
      },
      buttons: [
        {
          title: '프로필 보기',
          link: { mobileWebUrl: profileUrl, webUrl: profileUrl },
        },
      ],
    })
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API 미지원 환경 폴백
      const input = document.createElement('input')
      input.value = profileUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      {/* 카카오톡 공유 */}
      {kakaoReady && (
        <button
          onClick={handleKakaoShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[.88rem] font-bold bg-[#FEE500] text-[#191919] hover:bg-[#F0D800] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M9 1.5C4.86 1.5 1.5 4.19 1.5 7.5c0 2.1 1.26 3.95 3.18 5.08l-.81 2.97a.3.3 0 00.44.33l3.6-2.38c.35.04.7.07 1.09.07 4.14 0 7.5-2.69 7.5-6s-3.36-6-7.5-6z" fill="#191919"/>
          </svg>
          카카오톡 공유
        </button>
      )}

      {/* 링크 복사 */}
      <button
        onClick={handleCopyLink}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[.88rem] font-bold border-[1.5px] transition-all ${
          copied
            ? 'border-[#3A9E94] bg-[#DDF0EE] text-[#1A5F58]'
            : 'border-[#E4E0DC] text-[#4A4A4A] hover:border-[#D85A3A] hover:text-[#D85A3A]'
        }`}
      >
        {copied ? '✓ 복사됨' : '🔗 링크 복사'}
      </button>
    </div>
  )
}
