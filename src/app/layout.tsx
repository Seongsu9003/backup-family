import type { Metadata } from 'next'
import { Providers } from './providers'
// @fontsource-variable: 빌드 타임에 폰트를 자체 호스팅 → 외부 CDN 요청 제거, CLS 방지
import '@fontsource-variable/noto-sans-kr'
import './globals.css'
import { BASE_URL } from '@/shared/lib/constants'

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
      <body className="min-h-full flex flex-col bg-[#F7F5F3]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
