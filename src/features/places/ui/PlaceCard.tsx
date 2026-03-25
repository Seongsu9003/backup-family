'use client'

// ═══════════════════════════════════════════════════
//  장소 카드 — Supanova Double-Bezel + Spring
//  "지도 보기" → 카카오맵 검색 딥링크 (API 키 불필요)
// ═══════════════════════════════════════════════════
import type { Place } from '@/shared/types'

const CATEGORY_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  '도서관':   { bg: '#EBF2FC', text: '#1565C0', accent: '#1565C0' },
  '공원':     { bg: '#EEF6EF', text: '#2E7D32', accent: '#2E7D32' },
  '문화센터': { bg: '#FDF2EE', text: '#D85A3A', accent: '#D85A3A' },
  '기타':     { bg: '#F5EEF8', text: '#6A1B9A', accent: '#6A1B9A' },
}

const DEFAULT_COLOR = { bg: '#F5EEF8', text: '#6A1B9A', accent: '#6A1B9A' }

interface Props {
  place: Place
}

export function PlaceCard({ place }: Props) {
  const color   = CATEGORY_COLORS[place.category] ?? DEFAULT_COLOR
  const mapUrl  = `https://map.kakao.com/link/search/${encodeURIComponent(place.name + ' ' + place.address)}`

  return (
    <div className="relative bg-white rounded-2xl border border-[#E8E4DF] overflow-hidden flex flex-col transition-[transform,box-shadow] duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,.10)]">
      {/* Double-Bezel inner ring — 이미지 없을 때만 적용되도록 하면 더 정확하지만 overflow-hidden으로 커버 */}

      {/* 이미지 영역 */}
      {place.image_url ? (
        <img
          src={place.image_url}
          alt={place.name}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div
          className="w-full h-36 flex items-center justify-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color.bg} 0%, #F0ECE8 100%)` }}
        >
          {/* 장식 서클 */}
          <div
            className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full opacity-[0.12]"
            style={{ background: color.accent }}
            aria-hidden="true"
          />
          <span className="text-4xl opacity-30 relative" aria-hidden="true">📍</span>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="relative flex flex-col gap-2 p-4 flex-1">
        {/* Double-Bezel inner ring (콘텐츠 영역) */}
        <div className="absolute inset-[5px] rounded-[10px] border border-black/[0.03] pointer-events-none top-0" />

        {/* 카테고리 + 무료 배지 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: color.bg, color: color.text }}
          >
            {place.category}
          </span>
          {place.is_free && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEF6EF] text-[#2E7D32]">
              무료
            </span>
          )}
        </div>

        {/* 장소명 */}
        <h3
          className="text-[15px] font-bold text-[#1A1714] leading-snug"
          style={{ wordBreak: 'keep-all' } as React.CSSProperties}
        >
          {place.name}
        </h3>

        {/* 설명 */}
        {place.description && (
          <p
            className="text-[13px] text-[#5C5852] leading-relaxed line-clamp-2"
            style={{ wordBreak: 'keep-all' } as React.CSSProperties}
          >
            {place.description}
          </p>
        )}

        {/* 상세 정보 */}
        <div className="flex flex-col gap-1 mt-auto pt-2.5 border-t border-[#E8E4DF]">
          {(place.region_1 || place.region_2) && (
            <InfoRow icon="🗺️">
              {[place.region_1, place.region_2].filter(Boolean).join(' ')}
            </InfoRow>
          )}
          {place.address && (
            <InfoRow icon="📍">{place.address}</InfoRow>
          )}
          {place.hours && (
            <InfoRow icon="🕐">{place.hours}</InfoRow>
          )}
          {place.closed_days && (
            <InfoRow icon="🚫" muted>{place.closed_days} 휴관</InfoRow>
          )}
          {place.parking && (
            <InfoRow icon="🅿️">{place.parking}</InfoRow>
          )}
          {place.phone && (
            <InfoRow icon="📞">
              <a href={`tel:${place.phone}`} className="hover:underline">{place.phone}</a>
            </InfoRow>
          )}
          {place.website && (
            <InfoRow icon="🌐">
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: color.accent }}
              >
                홈페이지 →
              </a>
            </InfoRow>
          )}
          {place.facilities && (
            <InfoRow icon="🏢">
              <span className="line-clamp-1">{place.facilities}</span>
            </InfoRow>
          )}
        </div>

        {/* 태그 */}
        {place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-full bg-[#F7F5F3] text-[#9C9890]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 지도 보기 — Spring */}
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-center text-[13px] font-bold rounded-xl py-2 border transition-[transform,background-color] duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02]"
          style={{ color: color.accent, borderColor: color.accent }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = color.bg
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          지도 보기 →
        </a>
      </div>
    </div>
  )
}

// ── 상세 정보 행 helper ────────────────────────
function InfoRow({
  icon, muted = false, children,
}: {
  icon: string
  muted?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-1.5 text-[12.5px]">
      <span className="shrink-0 mt-[1px]" aria-hidden="true">{icon}</span>
      <span className={`leading-snug ${muted ? 'text-[#9C9890]' : 'text-[#5C5852]'}`}>
        {children}
      </span>
    </div>
  )
}
