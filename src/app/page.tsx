import { LevelTestPage } from '@/features/level-test'

interface PageProps {
  searchParams: Promise<{ retest?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { retest } = await searchParams
  return (
    <main className="flex flex-col items-center bg-[#F7F5F3] min-h-screen px-4 pt-8 pb-20">
      <LevelTestPage retestId={retest} />
    </main>
  )
}
