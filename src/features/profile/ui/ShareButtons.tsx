'use client'

// ═══════════════════════════════════════════════════
//  공유 버튼 — Web Share API (네이티브) + 링크 복사
//
//  [기술 부채] Kakao SDK sendDefault는 imageUrl 필수 필드 문제로
//  일시 제거. 향후 og-default.png 안정화 후 SDK 복원 예정.
//  Web Share API는 iOS/Android 네이티브 공유 시트를 통해
//  KakaoTalk·Instagram·SMS 등 모든 앱에 공유 가능.
// ═══════════════════════════════════════════════════
import { useState } from 'react'

interface Props {
  profileUrl: string
  title: string
  description: string
}

export function ShareButtons({ profileUrl, title, description }: Props) {
  const [copied, setCopied] = useState(false)
  // Web Share API 지원 여부 (SSR 안전하게 처리)
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text: description, url: profileUrl })
    } catch {
      // 사용자가 공유 취소한 경우 등 — 무시
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API 미지원 폴백
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
      {/* 네이티브 공유 (모바일: KakaoTalk 등 앱 선택 가능) */}
      {canNativeShare && (
        <button
          onClick={handleNativeShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[.88rem] font-bold bg-[#1A1A1A] text-white hover:bg-[#333] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          공유하기
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
