// ═══════════════════════════════════════════════════
//  /profile/[testId] — 공개 돌봄이 프로필 페이지
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

  return {
    title: '돌봄이 인증 프로필',
    description: 'backup-family에서 인증받은 아이돌봄이의 레벨·역량 프로필입니다.',
    openGraph: {
      type: 'profile',
      url: profileUrl,
      title: '아이돌봄이 인증 프로필 | backup-family',
      description: 'backup-family 레벨 테스트로 검증된 돌봄이 프로필입니다.',
    },
    twitter: {
      card: 'summary',
      title: '아이돌봄이 인증 프로필 | backup-family',
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
