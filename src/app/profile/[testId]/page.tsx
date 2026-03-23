// ═══════════════════════════════════════════════════
//  /profile/[testId] — 공개 돌봄이 프로필 페이지
// ═══════════════════════════════════════════════════
import type { Metadata } from 'next'
import { ProfilePageClient } from '@/features/profile'

const BASE_URL = 'https://backup-family.vercel.app'

interface Props {
  params: Promise<{ testId: string }>
}

const OG_TITLE = '백업패밀리 돌봄이의 프로필이에요.'
const OG_DESC  = '가족의 돌봄 공백을 채워드려요.'
const OG_IMAGE = `${BASE_URL}/og-kakao.png`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { testId } = await params
  const profileUrl = `${BASE_URL}/profile/${testId}`

  return {
    title: OG_TITLE,
    description: OG_DESC,
    openGraph: {
      type: 'website',
      url: profileUrl,
      title: OG_TITLE,
      description: OG_DESC,
      images: [{ url: OG_IMAGE, width: 1200, height: 600 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: OG_TITLE,
      description: OG_DESC,
      images: [OG_IMAGE],
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
