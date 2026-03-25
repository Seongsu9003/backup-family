import type { Metadata } from 'next'
import { InquirePage } from '@/features/search/ui/InquirePage'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: '돌봄이 연결 요청 | backup-family',
}

export default async function SearchDetailPage({ params }: Props) {
  const { id } = await params
  return <InquirePage testId={id} />
}
