import type { Metadata } from 'next'
import { SearchPage } from '@/features/search'

export const metadata: Metadata = {
  title: 'backup-family · 돌봄이 찾기',
  description: '역량이 확인된 돌봄이를 조회하세요',
}

export default function Page() {
  return <SearchPage />
}
