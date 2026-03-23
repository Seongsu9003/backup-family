// ═══════════════════════════════════════════════════
//  /profile/* 공통 레이아웃 — OG 메타데이터 정적 설정
//  generateMetadata(async) 대신 정적 metadata export 사용:
//  Kakao 크롤러가 HTML 파싱 전에 메타 읽어도 안정적으로 동작
// ═══════════════════════════════════════════════════
import type { Metadata } from 'next'

const BASE_URL = 'https://backup-family.vercel.app'

export const metadata: Metadata = {
  title: '백업패밀리 돌봄이의 프로필이에요.',
  description: '가족의 돌봄 공백을 채워드려요.',
  openGraph: {
    type: 'website',
    siteName: 'backup-family',
    title: '백업패밀리 돌봄이의 프로필이에요.',
    description: '가족의 돌봄 공백을 채워드려요.',
    images: [
      {
        url: `${BASE_URL}/og-kakao.png`,
        width: 1200,
        height: 600,
        alt: 'backup-family 돌봄이 인증 프로필',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '백업패밀리 돌봄이의 프로필이에요.',
    description: '가족의 돌봄 공백을 채워드려요.',
    images: [`${BASE_URL}/og-kakao.png`],
  },
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
