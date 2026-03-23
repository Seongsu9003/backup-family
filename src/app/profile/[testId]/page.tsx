// ═══════════════════════════════════════════════════
//  /profile/[testId] — 공개 돌봄이 프로필 페이지
//  generateMetadata: Supabase 조회 → 동적 OG 태그 (GRW-03)
//  조회 실패 시 기본값 fallback → 크롤러/빌드에 영향 없음
// ═══════════════════════════════════════════════════
import type { Metadata } from 'next'
import { ProfilePageClient } from '@/features/profile'
import { BASE_URL } from '@/shared/lib/constants'
import { supabase } from '@/shared/lib/supabase'
import { maskName } from '@/shared/lib/maskName'
import type { TestResult } from '@/shared/types'

interface Props {
  params: Promise<{ testId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { testId } = await params
  const profileUrl = `${BASE_URL}/profile/${testId}`
  const ogImage = `${BASE_URL}/og-kakao.png`

  // 기본값 (조회 실패 시 fallback)
  let title = '백업패밀리 돌봄이의 프로필이에요.'
  let description = '가족의 돌봄 공백을 채워드려요.'

  try {
    const { data } = await supabase
      .from('test_results')
      .select('raw_data')
      .eq('test_id', testId)
      .maybeSingle()

    if (data?.raw_data) {
      const p = data.raw_data as TestResult
      const maskedName  = maskName(p.tester.name)
      const certLabel   = p.certification.status === '인증완료' ? '✓ 인증완료' : p.certification.status
      const careLabel   = p.care_type ? `${p.care_type.label}형` : null

      title       = `${maskedName}님의 backup-family 돌봄이 프로필`
      description = [
        p.level.label,
        careLabel,
        certLabel,
        `총점 ${p.score.total}점`,
        '가족의 돌봄 공백을 채워드려요.',
      ].filter(Boolean).join(' · ')
    }
  } catch {
    // 조회 실패 시 기본값 유지 — 크롤러 흐름에 영향 없음
  }

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName: 'backup-family',
      title,
      description,
      url: profileUrl,
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
      title,
      description,
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
