'use client'

// 전역 푸터 — /admin 하위 경로에서는 렌더링하지 않습니다.
// 어드민은 자체 사이드바 레이아웃을 사용합니다.
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function GlobalFooter() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="border-t border-[#E8E4DF] bg-[#F7F5F2] px-6 py-4">
      <div className="max-w-[960px] mx-auto flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-[#9C9890]">
          © 2026 backup-family. All rights reserved.
        </span>
        <Link
          href="/privacy"
          className="text-[12px] text-[#9C9890] hover:text-[#D85A3A] transition-colors underline underline-offset-2"
        >
          개인정보 처리방침
        </Link>
      </div>
    </footer>
  )
}
