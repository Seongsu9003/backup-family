import Link from 'next/link'
import { LevelTestPage } from '@/features/level-test'

export const metadata = {
  title: '돌봄이 레벨 테스트',
  description: '나의 돌봄 스타일과 자격을 5단계로 진단하고 인증 프로필을 만들어보세요.',
}

interface PageProps {
  searchParams: Promise<{ retest?: string; partner?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { retest, partner } = await searchParams
  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col">
      {/* ── 헤더 — Supanova warm sticky nav ── */}
      <header className="sticky top-0 z-20 bg-[#F7F5F2]/95 backdrop-blur-sm border-b border-[#E8E4DF] px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-[15px] font-black tracking-[-0.03em] text-[#1A1714]"
        >
          backup<span className="text-[#D85A3A]">-family</span>
        </Link>
        <Link
          href="/search"
          className="text-[13px] text-[#5C5852] px-3.5 py-1.5 border border-[#E8E4DF] rounded-lg font-semibold hover:border-[#9C9890] hover:text-[#1A1714] transition-[border-color,color] duration-200"
        >
          돌봄이 찾기
        </Link>
      </header>

      {/* ── 페이지 본문 ── */}
      <main className="flex flex-col items-center flex-1 px-5 pt-10 pb-20">
        <LevelTestPage retestId={retest} partnerCode={partner} />
      </main>
    </div>
  )
}
