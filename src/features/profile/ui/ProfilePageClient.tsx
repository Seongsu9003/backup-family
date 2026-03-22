'use client'

// ═══════════════════════════════════════════════════
//  프로필 페이지 클라이언트 컴포넌트 (데이터 페칭 + 상태 처리)
// ═══════════════════════════════════════════════════
import { useProfile } from '../model/useProfile'
import { ProfileCard } from './ProfileCard'

interface Props {
  testId: string
  profileUrl: string
}

export function ProfilePageClient({ testId, profileUrl }: Props) {
  const { data: result, isPending, isError } = useProfile(testId)

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#E4E0DC] border-t-[#D85A3A] rounded-full animate-spin" />
        <p className="text-[.88rem] text-[#8A8A8A]">프로필을 불러오는 중…</p>
      </div>
    )
  }

  if (isError || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <div className="text-4xl">🔍</div>
        <h2 className="text-[1.1rem] font-bold text-[#1A1A1A]">프로필을 찾을 수 없습니다</h2>
        <p className="text-[.84rem] text-[#8A8A8A]">
          링크가 만료되었거나 존재하지 않는 프로필입니다.
        </p>
        <a
          href="/"
          className="mt-2 px-5 py-2.5 bg-[#D85A3A] text-white text-[.88rem] font-bold rounded-xl hover:bg-[#C04830] transition-colors"
        >
          레벨 테스트 시작하기
        </a>
      </div>
    )
  }

  return <ProfileCard result={result} profileUrl={profileUrl} />
}
