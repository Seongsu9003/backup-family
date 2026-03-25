import type { Metadata } from 'next'
import { Providers } from './providers'
// Pretendard Variable: 자체 호스팅 → 외부 CDN 요청 제거, CLS 방지
// Dynamic subset: 사용된 글자만 로드 → 성능 최적화
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './globals.css'
import { BASE_URL } from '@/shared/lib/constants'

export const metadata: Metadata = {
  title: {
    default: 'backup-family | 믿을 수 있는 돌봄 서비스',
    template: '%s | backup-family',
  },
  description: '돌봄이 찾기부터 레벨 인증, 아이와 함께할 공간까지. backup-family는 돌봄이와 보호자를 연결하는 신뢰 기반의 돌봄 서비스입니다.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'backup-family',
    title: 'backup-family | 믿을 수 있는 돌봄 서비스',
    description: '돌봄이 찾기부터 레벨 인증, 아이와 함께할 공간까지.',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary',
    title: 'backup-family | 믿을 수 있는 돌봄 서비스',
    description: '돌봄이 찾기부터 레벨 인증, 아이와 함께할 공간까지.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F7F5F3]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
