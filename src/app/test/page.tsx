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
    <main className="flex flex-col items-center bg-[#F7F5F3] min-h-screen px-4 pt-8 pb-20">
      <LevelTestPage retestId={retest} partnerCode={partner} />
    </main>
  )
}
