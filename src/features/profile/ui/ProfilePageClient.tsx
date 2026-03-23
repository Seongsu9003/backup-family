'use client'

// ═══════════════════════════════════════════════════
//  프로필 페이지 클라이언트 컴포넌트 (데이터 페칭 + 상태 처리)
//  OPS-01: 만료된 프로필 접근 시 재테스트 유도 화면 표시
// ═══════════════════════════════════════════════════
import { useProfile } from '../model/useProfile'
import { ProfileCard } from './ProfileCard'
import { isExpired, fmtDate } from '@/shared/lib/dateUtils'

interface Props {
  testId:     string
  profileUrl: string
}

export function ProfilePageClient({ testId, profileUrl }: Props) {
  const { data: result, isPending, isError } = useProfile(testId)

  // ── 로딩 ─────────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#E4E0DC] border-t-[#D85A3A] rounded-full animate-spin" />
        <p className="text-[.88rem] text-[#8A8A8A]">프로필을 불러오는 중…</p>
      </div>
    )
  }

  // ── 존재하지 않는 프로필 ──────────────────────────
  if (isError || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <div className="text-4xl">🔍</div>
        <h2 className="text-[1.1rem] font-bold text-[#1A1A1A]">프로필을 찾을 수 없습니다</h2>
        <p className="text-[.84rem] text-[#8A8A8A]">
          링크가 잘못되었거나 존재하지 않는 프로필입니다.
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

  // ── 만료된 프로필 (OPS-01) ────────────────────────
  if (isExpired(result.meta.expires_at)) {
    const expiredAt = fmtDate(result.meta.expires_at)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4 w-full max-w-[520px]">
        <div className="text-4xl">📋</div>
        <div>
          <h2 className="text-[1.1rem] font-bold text-[#1A1A1A] mb-1">
            인증 기간이 만료되었습니다
          </h2>
          <p className="text-[.84rem] text-[#8A8A8A]">
            {result.tester?.name
              ? <><span className="font-semibold text-[#4A4A4A]">{result.tester.name}</span> 님의 인증이 </>
              : '이 인증이 '}
            <span className="font-semibold text-[#D85A3A]">{expiredAt}</span>에 만료되었습니다.
          </p>
        </div>

        <div className="w-full bg-[#F7F5F3] border border-[#E4E0DC] rounded-xl px-5 py-4 text-left">
          <p className="text-[.82rem] text-[#8A8A8A] mb-3">만료 전 인증 정보</p>
          <div className="flex justify-between text-[.88rem] mb-2">
            <span className="text-[#8A8A8A]">레벨</span>
            <span className="font-semibold text-[#1A1A1A]">{result.level?.label ?? '-'}</span>
          </div>
          <div className="flex justify-between text-[.88rem] mb-2">
            <span className="text-[#8A8A8A]">돌봄 타입</span>
            <span className="font-semibold text-[#1A1A1A]">{result.care_type?.label ?? '-'}</span>
          </div>
          <div className="flex justify-between text-[.88rem]">
            <span className="text-[#8A8A8A]">인증 상태</span>
            <span className="font-semibold text-[#1A1A1A]">{result.certification?.status ?? '-'}</span>
          </div>
        </div>

        <p className="text-[.82rem] text-[#8A8A8A] leading-relaxed">
          레벨 테스트를 다시 응시하면 새로운 인증 프로필을 받을 수 있습니다.
        </p>

        <a
          href="/"
          className="w-full py-3 bg-[#D85A3A] text-white text-[.92rem] font-bold rounded-xl hover:bg-[#C04830] transition-colors text-center"
        >
          재테스트 시작하기
        </a>
      </div>
    )
  }

  // ── 정상 프로필 ───────────────────────────────────
  return <ProfileCard result={result} profileUrl={profileUrl} />
}
