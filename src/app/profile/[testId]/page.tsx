// ═══════════════════════════════════════════════════
//  /profile/[testId] — 공개 돌봄이 프로필 페이지
//  generateMetadata: Supabase 미호출 (params만 await) → 크롤러 타이밍 안전
//  og:url을 각 프로필 URL로 명시 → Kakao 링크 클릭 정상 작동
// ═══════════════════════════════════════════════════
import type { Metadata } from 'next'
import { ProfilePageClient } from '@/features/profile'

const BASE_URL = 'https://backup-family.vercel.app'

interface Props {
  params: Promise<{ testId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { testId } = await params
  const profileUrl = `${BASE_URL}/profile/${testId}`
  const ogImage = `${BASE_URL}/og-kakao.png`

  return {
    title: '백업패밀리 돌봄이의 프로필이에요.',
    description: '가족의 돌봄 공백을 채워드려요.',
    openGraph: {
      type: 'website',
      siteName: 'backup-family',
      title: '백업패밀리 돌봄이의 프로필이에요.',
      description: '가족의 돌봄 공백을 채워드려요.',
      url: profileUrl,          // ← og:url = 각 프로필 고유 URL
      images: [
        {
          url: ogImage,
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
      images: [ogImage],
    },
  }
}

export default async function ProfilePage({ params }: Props) {
  const { testId } = await params
  const profileUrl = `${BASE_URL}/profile/${testId}`

  return (
    <main className="flex flex-col items-center bg-[#F7F5F3] min-h-screen px-4 pt-8 pb-20">
      {/* 헤더 */}
      <div className="w-full max-w-[520px] flex items-center justify-between mb-6">
        <a href="/" className="text-[#D85A3A] text-[.88rem] font-semibold hover:underline">
          ← backup-family
        </a>
        <span className="text-[.8rem] text-[#8A8A8A]">인증 프로필</span>
      </div>

      <ProfilePageClient testId={testId} profileUrl={profileUrl} />
    </main>
  )
}
