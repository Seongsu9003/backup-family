// ═══════════════════════════════════════════════════
//  /profile/[testId] — 공개 돌봄이 프로필 페이지
//  OG 메타데이터: 상위 app/profile/layout.tsx 에서 정적 설정
// ═══════════════════════════════════════════════════
import { ProfilePageClient } from '@/features/profile'

const BASE_URL = 'https://backup-family.vercel.app'

interface Props {
  params: Promise<{ testId: string }>
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
