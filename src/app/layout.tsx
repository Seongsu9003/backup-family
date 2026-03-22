import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

const BASE_URL = 'https://backup-family.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'backup-family | 아이돌봄이 레벨 테스트',
    template: '%s | backup-family',
  },
  description: '아이돌봄이 역량을 5단계로 진단하고 인증받으세요. 보호자는 검증된 돌봄이를 찾을 수 있습니다.',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'backup-family',
    title: 'backup-family | 아이돌봄이 레벨 테스트',
    description: '아이돌봄이 역량을 5단계로 진단하고 인증받으세요.',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary',
    title: 'backup-family | 아이돌봄이 레벨 테스트',
    description: '아이돌봄이 역량을 5단계로 진단하고 인증받으세요.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* Noto Sans KR — next/font/google 대신 직접 로드 (PROD 빌드 시 자동 최적화) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7F5F3]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
