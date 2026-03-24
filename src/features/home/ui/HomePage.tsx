// ═══════════════════════════════════════════════════
//  대문 페이지 (서버 컴포넌트)
//  - 3가지 서비스 가치 제안 카드
//  - 신뢰 지표 (인증 돌봄이 수 · 등록 장소 수) — Supabase 실시간
// ═══════════════════════════════════════════════════
import Link from 'next/link'
import { supabase } from '@/shared/lib/supabase'

// ── 신뢰 지표 서버 패치 ───────────────────────────
async function fetchStats() {
  const [certRes, placesRes] = await Promise.all([
    supabase
      .from('test_results')
      .select('id', { count: 'exact', head: true })
      .eq('cert_status', '인증완료'),
    supabase
      .from('places')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
  ])
  return {
    certifiedCount: certRes.count ?? 0,
    placesCount:    placesRes.count ?? 0,
  }
}

// ── 서비스 카드 정의 ──────────────────────────────
const SERVICES = [
  {
    icon: '👨‍👩‍👧',
    badge: '보호자',
    badgeColor: 'bg-[#E8F4FD] text-[#1565C0]',
    title: '가족 같은\n돌봄이 찾기',
    desc: '돌봄 공백을 채워줄 수 있는\n가족 같은 돌봄이를 찾을 수 있어요.',
    cta: '돌봄이 찾아보기',
    href: '/search',
    accent: '#1565C0',
    bg: 'hover:bg-[#F0F7FF]',
    border: 'hover:border-[#1565C0]',
    ctaStyle: 'bg-[#1565C0] hover:bg-[#0D47A1]',
  },
  {
    icon: '📋',
    badge: '돌봄이',
    badgeColor: 'bg-[#FFF3E0] text-[#E65100]',
    title: '내 돌봄 스타일\n프로필 만들기',
    desc: '돌봄이라면? 나의 돌봄 스타일과\n자격을 증명할 수 있는 프로필을 만들 수 있어요.',
    cta: '무료 레벨 테스트',
    href: '/test',
    accent: '#D85A3A',
    bg: 'hover:bg-[#FFF8F6]',
    border: 'hover:border-[#D85A3A]',
    ctaStyle: 'bg-[#D85A3A] hover:bg-[#C04828]',
  },
  {
    icon: '📍',
    badge: '모두',
    badgeColor: 'bg-[#E8F5E9] text-[#2E7D32]',
    title: '아이와 함께\n가기 좋은 곳',
    desc: '내가 직접 돌보는 날엔 우리 아이와\n무얼 하면 좋을지 함께 나누어요.',
    cta: '장소 둘러보기',
    href: '/places',
    accent: '#2E7D32',
    bg: 'hover:bg-[#F1F8F2]',
    border: 'hover:border-[#2E7D32]',
    ctaStyle: 'bg-[#2E7D32] hover:bg-[#1B5E20]',
  },
]

export async function HomePage() {
  const { certifiedCount, placesCount } = await fetchStats()

  return (
    <div className="flex flex-col items-center w-full max-w-[960px] mx-auto px-4 pt-12 pb-20">

      {/* ── 헤더 ── */}
      <div className="text-center mb-12">
        <span className="inline-block text-[.72rem] font-semibold tracking-widest text-[#D85A3A] uppercase mb-3">
          backup-family
        </span>
        <h1 className="text-[1.9rem] sm:text-[2.4rem] font-extrabold text-[#1A1A1A] leading-tight mb-4">
          돌봄이 찾기부터<br />
          <span className="text-[#D85A3A]">자격 인증</span>, 함께할 공간까지
        </h1>
        <p className="text-[.95rem] text-[#666] leading-relaxed max-w-[400px] mx-auto">
          backup-family는 돌봄이와 보호자를 연결하는<br className="hidden sm:block" />
          신뢰 기반의 돌봄 서비스입니다.
        </p>
      </div>

      {/* ── 서비스 카드 3종 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-12">
        {SERVICES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`group flex flex-col bg-white rounded-2xl border-2 border-[#EBEBEB] p-6 transition-all duration-200 ${s.bg} ${s.border} shadow-sm hover:shadow-md`}
          >
            {/* 아이콘 + 뱃지 */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{s.icon}</span>
              <span className={`text-[.68rem] font-semibold px-2.5 py-0.5 rounded-full ${s.badgeColor}`}>
                {s.badge}
              </span>
            </div>

            {/* 제목 */}
            <h2 className="text-[1.05rem] font-extrabold text-[#1A1A1A] leading-snug mb-2 whitespace-pre-line">
              {s.title}
            </h2>

            {/* 설명 */}
            <p className="text-[.82rem] text-[#666] leading-relaxed flex-1 whitespace-pre-line">
              {s.desc}
            </p>

            {/* CTA */}
            <div className={`mt-5 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[.82rem] font-bold text-white transition-colors ${s.ctaStyle}`}>
              {s.cta}
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── 신뢰 지표 ── */}
      <div className="flex items-center gap-6 sm:gap-10 bg-white rounded-2xl border border-[#EBEBEB] px-8 py-5 shadow-sm">
        <div className="text-center">
          <p className="text-[1.6rem] font-extrabold text-[#D85A3A] leading-none">
            {certifiedCount.toLocaleString()}
            <span className="text-[1rem] font-bold">명</span>
          </p>
          <p className="text-[.75rem] text-[#888] mt-1">인증된 돌봄이</p>
        </div>
        <div className="w-px h-10 bg-[#EBEBEB]" />
        <div className="text-center">
          <p className="text-[1.6rem] font-extrabold text-[#2E7D32] leading-none">
            {placesCount.toLocaleString()}
            <span className="text-[1rem] font-bold">곳</span>
          </p>
          <p className="text-[.75rem] text-[#888] mt-1">등록된 장소</p>
        </div>
        <div className="w-px h-10 bg-[#EBEBEB]" />
        <div className="text-center">
          <p className="text-[1.6rem] font-extrabold text-[#1565C0] leading-none">
            무료
          </p>
          <p className="text-[.75rem] text-[#888] mt-1">레벨 테스트</p>
        </div>
      </div>

    </div>
  )
}
