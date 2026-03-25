'use client'

// ═══════════════════════════════════════════════════
//  /places 공개 페이지 — Supanova Warm Editorial
//  - sticky 헤더 (warm bg)
//  - Editorial 히어로
//  - 카테고리 pill 필터
//  - PlaceCard 그리드
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import Link from 'next/link'
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

  const activeCats = PLACE_CATEGORIES.filter((c) =>
    places.some((p) => p.category === c)
  )

  return (
    <div className="min-h-screen bg-[#F7F5F2]">

      {/* ── HEADER — warm sticky nav ── */}
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

      {/* ── HERO — Editorial ── */}
      <section className="bg-[#F7F5F2] px-6 pt-12 pb-10 border-b border-[#E8E4DF]">
        <div className="max-w-[960px] mx-auto">
          <span className="inline-flex items-center gap-2 bg-[#EEF6EF] border border-[#2E7D32]/20 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[.04em] text-[#2E7D32] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
            추천 장소
          </span>
          <h1
            className="text-[clamp(26px,3.5vw,38px)] font-black leading-[1.2] tracking-[-0.04em] text-[#1A1714] mb-3"
            style={{ wordBreak: 'keep-all' } as React.CSSProperties}
          >
            아이와 함께하는<br />추천 장소
          </h1>
          <p
            className="text-[15px] text-[#5C5852] leading-[1.7] max-w-[480px] mb-6"
            style={{ wordBreak: 'keep-all' } as React.CSSProperties}
          >
            돌봄 공백 시간에 아이와 함께 방문하기 좋은 장소를 소개합니다.
          </p>

          {/* 카테고리 필터 pills */}
          {activeCats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(['전체', ...activeCats] as Filter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-[transform,background-color,color,border-color] duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03]"
                  style={
                    filter === cat
                      ? { background: '#2E7D32', color: '#fff', borderColor: '#2E7D32' }
                      : { background: '#fff', color: '#5C5852', borderColor: '#E8E4DF' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 콘텐츠 ── */}
      <div className="max-w-[960px] mx-auto px-5 lg:px-6 pt-7 pb-20">
        {isLoading ? (
          <div className="py-20 text-center text-[#9C9890] text-[14px]">
            불러오는 중…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[2rem] mb-3">🗺️</p>
            <p
              className="text-[14px] text-[#9C9890]"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              {filter === '전체'
                ? '등록된 장소가 없습니다.'
                : `'${filter}' 카테고리에 등록된 장소가 없습니다.`}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[13px] text-[#9C9890] mb-5 font-medium">
              총 <strong className="text-[#2E7D32] font-black">{filtered.length}</strong>개 장소
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  )
}
