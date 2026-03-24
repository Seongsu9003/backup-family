'use client'

// ═══════════════════════════════════════════════════
//  /places 공개 페이지 — 부모 동반 추천 장소
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { usePlaces } from '../model/usePlaces'
import { PlaceCard } from './PlaceCard'
import { PLACE_CATEGORIES } from '@/shared/types'

type Filter = '전체' | typeof PLACE_CATEGORIES[number]

export function PlacesPage() {
  const { data: places = [], isLoading } = usePlaces()
  const [filter, setFilter] = useState<Filter>('전체')

  const filtered = filter === '전체'
    ? places
    : places.filter((p) => p.category === filter)

  // 데이터에 실제로 존재하는 카테고리만 필터 탭에 표시
  const activeCats = PLACE_CATEGORIES.filter((c) =>
    places.some((p) => p.category === c)
  )

  return (
    <main className="min-h-screen bg-[#F7F5F3] pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#EBEBEB] px-4 pt-10 pb-6">
        <div className="max-w-[900px] mx-auto">
          <a href="/" className="text-[#D85A3A] text-[.85rem] font-semibold hover:underline">
            ← backup-family
          </a>
          <h1 className="mt-3 text-[1.4rem] font-bold text-[#1A1A1A]">
            📍 아이와 함께하는 추천 장소
          </h1>
          <p className="mt-1 text-[.88rem] text-[#666]">
            돌봄 공백 시간에 아이와 함께 방문하기 좋은 장소를 소개합니다.
          </p>

          {/* 카테고리 필터 */}
          {activeCats.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(['전체', ...activeCats] as Filter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-[.82rem] font-medium transition-colors ${
                    filter === cat
                      ? 'bg-[#D85A3A] text-white'
                      : 'bg-white border border-[#DDD] text-[#555] hover:border-[#D85A3A] hover:text-[#D85A3A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-[900px] mx-auto px-4 pt-6">
        {isLoading ? (
          <div className="py-20 text-center text-[#8A8A8A] text-[.9rem]">
            불러오는 중…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[2rem] mb-3">🗺️</p>
            <p className="text-[.9rem] text-[#8A8A8A]">
              {filter === '전체'
                ? '등록된 장소가 없습니다.'
                : `'${filter}' 카테고리에 등록된 장소가 없습니다.`}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[.8rem] text-[#8A8A8A] mb-4">
              총 {filtered.length}개 장소
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
