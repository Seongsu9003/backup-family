// ═══════════════════════════════════════════════════
//  /places — 부모 동반 추천 장소 공개 페이지
// ═══════════════════════════════════════════════════
import type { Metadata } from 'next'
import { PlacesPage } from '@/features/places'

export const metadata: Metadata = {
  title: '아이와 함께하는 추천 장소 | backup-family',
  description: '돌봄 공백 시간에 아이와 함께 방문하기 좋은 도서관, 공원, 문화센터를 소개합니다.',
  openGraph: {
    title: '아이와 함께하는 추천 장소 | backup-family',
    description: '돌봄 공백 시간에 아이와 함께 방문하기 좋은 장소를 소개합니다.',
    type: 'website',
  },
}

export default function Page() {
  return <PlacesPage />
}
