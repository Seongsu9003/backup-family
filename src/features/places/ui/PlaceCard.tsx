'use client'

// ═══════════════════════════════════════════════════
//  장소 카드 컴포넌트
//  "지도 보기" → 카카오맵 검색 딥링크 (API 키 불필요)
// ═══════════════════════════════════════════════════
import type { Place } from '@/shared/types'

const CATEGORY_COLORS: Record<string, string> = {
  '도서관':   'bg-[#E8F4FD] text-[#1565C0]',
  '공원':     'bg-[#E8F5E9] text-[#2E7D32]',
  '문화센터': 'bg-[#FFF3E0] text-[#E65100]',
  '기타':     'bg-[#F3E5F5] text-[#6A1B9A]',
}

interface Props {
  place: Place
}

export function PlaceCard({ place }: Props) {
  const categoryColor = CATEGORY_COLORS[place.category] ?? CATEGORY_COLORS['기타']

  // 카카오맵 검색 딥링크 — API 키 불필요
  const mapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(place.name + ' ' + place.address)}`

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* 이미지 영역 */}
      {place.image_url ? (
        <img
          src={place.image_url}
          alt={place.name}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-[#F7F5F3] to-[#EDE9E4] flex items-center justify-center">
          <span className="text-4xl opacity-30">📍</span>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* 카테고리 + 무료 뱃지 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[.7rem] font-semibold px-2 py-0.5 rounded-full ${categoryColor}`}>
            {place.category}
          </span>
          {place.is_free && (
            <span className="text-[.7rem] font-semibold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
              무료
            </span>
          )}
        </div>

        {/* 장소명 */}
        <h3 className="text-[.95rem] font-bold text-[#1A1A1A] leading-snug">
          {place.name}
        </h3>

        {/* 설명 */}
        {place.description && (
          <p className="text-[.8rem] text-[#666] leading-relaxed line-clamp-2">
            {place.description}
          </p>
        )}

        {/* 상세 정보 */}
        <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-[#F0F0F0]">
          {/* 지역 */}
          {(place.region_1 || place.region_2) && (
            <div className="flex items-center gap-1.5 text-[.78rem] text-[#555]">
              <span className="shrink-0">🗺️</span>
              <span>{[place.region_1, place.region_2].filter(Boolean).join(' ')}</span>
            </div>
          )}
          {place.address && (
            <div className="flex items-start gap-1.5 text-[.78rem] text-[#555]">
              <span className="mt-[1px] shrink-0">📍</span>
              <span className="leading-snug">{place.address}</span>
            </div>
          )}
          {place.hours && (
            <div className="flex items-center gap-1.5 text-[.78rem] text-[#555]">
              <span className="shrink-0">🕐</span>
              <span>{place.hours}</span>
            </div>
          )}
          {place.closed_days && (
            <div className="flex items-center gap-1.5 text-[.78rem] text-[#888]">
              <span className="shrink-0">🚫</span>
              <span>{place.closed_days} 휴관</span>
            </div>
          )}
          {place.parking && (
            <div className="flex items-center gap-1.5 text-[.78rem] text-[#555]">
              <span className="shrink-0">🅿️</span>
              <span>{place.parking}</span>
            </div>
          )}
          {place.phone && (
            <div className="flex items-center gap-1.5 text-[.78rem] text-[#555]">
              <span className="shrink-0">📞</span>
              <a href={`tel:${place.phone}`} className="hover:underline">{place.phone}</a>
            </div>
          )}
          {place.website && (
            <div className="flex items-center gap-1.5 text-[.78rem] text-[#555]">
              <span className="shrink-0">🌐</span>
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:underline text-[#1565C0]"
              >
                홈페이지
              </a>
            </div>
          )}
          {place.facilities && (
            <div className="flex items-start gap-1.5 text-[.78rem] text-[#555]">
              <span className="mt-[1px] shrink-0">🏢</span>
              <span className="leading-snug line-clamp-1">{place.facilities}</span>
            </div>
          )}
        </div>

        {/* 태그 */}
        {place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="text-[.68rem] px-2 py-0.5 rounded-full bg-[#F5F5F5] text-[#666]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 지도 보기 */}
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-center text-[.8rem] font-semibold text-[#D85A3A] border border-[#D85A3A] rounded-lg py-2 hover:bg-[#FFF1ED] transition-colors"
        >
          지도 보기 →
        </a>
      </div>
    </div>
  )
}
