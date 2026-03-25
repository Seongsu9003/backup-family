// ═══════════════════════════════════════════════════
//  대문 페이지 (서버 컴포넌트) — Supanova Warm Editorial
//  ─ §1 Editorial Split 히어로
//  ─ §2 Section divider
//  ─ §3 Bento Grid (보호자 피처드 2:3 / 돌봄이·장소 1:3)
//  ─ §4 Dark CTA Trust Strip
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

// ── Double-Bezel Stat 카드 ────────────────────────
// 바깥 border + 안쪽 inset ring = Supanova Double-Bezel 패턴
function StatCard({
  icon,
  iconBg,
  value,
  valueColor,
  label,
}: {
  icon: string
  iconBg: string
  value: string
  valueColor: string
  label: string
}) {
  return (
    <div className="relative bg-white rounded-[20px] border border-[#E8E4DF] px-5 py-4 flex items-center gap-4 transition-[transform,box-shadow] duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,.09)]">
      {/* Double-Bezel inner ring */}
      <div className="absolute inset-[5px] rounded-[15px] border border-black/[0.04] pointer-events-none" />
      {/* 아이콘 */}
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center text-[22px] shrink-0`}>
        {icon}
      </div>
      {/* 수치 */}
      <div>
        <p className={`text-[22px] font-black leading-none tracking-[-0.04em] ${valueColor}`}>
          {value}
        </p>
        <p className="text-[12px] text-[#9C9890] mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────
export async function HomePage() {
  const { certifiedCount, placesCount } = await fetchStats()

  return (
    <div className="w-full">

      {/* ──────────────────────────────────────────── */}
      {/*  §1  HERO — Editorial Split                 */}
      {/* ──────────────────────────────────────────── */}
      <section className="max-w-[1040px] mx-auto px-5 lg:px-10 pt-14 pb-14 lg:pt-[72px] lg:pb-[72px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] items-center gap-10 lg:gap-0">

          {/* ── Left: 헤드라인 카피 ── */}
          <div className="lg:pr-12">

            {/* Eyebrow pill */}
            <span className="inline-flex items-center gap-2 bg-[#FDF2EE] border border-[#D85A3A]/20 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[.04em] text-[#D85A3A] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D85A3A]" />
              믿을 수 있는 돌봄 서비스
            </span>

            <h1
              className="text-[clamp(32px,4.5vw,48px)] font-black leading-[1.2] tracking-[-0.04em] text-[#1A1714] mb-5"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              돌봄이 찾기부터{' '}
              {/* 언더라인 강조 — 인라인 span으로 after pseudo 대체 */}
              <span className="relative inline-block text-[#D85A3A]">
                자격 인증
                <span
                  className="absolute left-0 right-0 bottom-0.5 h-[3px] rounded-full bg-[#D85A3A]/25"
                  aria-hidden="true"
                />
              </span>
              , 함께할{' '}
              <br className="hidden sm:block" />
              공간까지
            </h1>

            <p
              className="text-[15.5px] text-[#5C5852] leading-[1.75] max-w-[400px] mb-8"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              backup-family는 검증된 돌봄이와 보호자를 연결합니다.
              레벨 테스트로 실력을 증명하고, 아이와 함께 갈 장소도 찾아보세요.
            </p>

            <div className="flex items-center gap-3.5 flex-wrap">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-[#1A1714] text-white rounded-xl px-6 py-3.5 text-[14px] font-bold transition-[transform,box-shadow] duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.18)]"
              >
                돌봄이 찾아보기 →
              </Link>
              <Link
                href="/test"
                className="inline-flex items-center bg-transparent text-[#5C5852] border border-[#E8E4DF] rounded-xl px-5 py-3.5 text-[14px] font-semibold transition-[border-color,color] duration-200 hover:border-[#9C9890] hover:text-[#1A1714]"
              >
                레벨 테스트 시작
              </Link>
            </div>
          </div>

          {/* ── Right: 신뢰 지표 스탯 카드 ── */}
          <div className="flex flex-col gap-3.5">
            <StatCard
              icon="🏅"
              iconBg="bg-[#EBF2FC]"
              value={`${certifiedCount.toLocaleString()}명`}
              valueColor="text-[#1565C0]"
              label="인증된 돌봄이"
            />
            <StatCard
              icon="📍"
              iconBg="bg-[#EEF6EF]"
              value={`${placesCount.toLocaleString()}곳`}
              valueColor="text-[#2E7D32]"
              label="등록된 추천 장소"
            />
            <StatCard
              icon="✨"
              iconBg="bg-[#FDF2EE]"
              value="무료"
              valueColor="text-[#D85A3A]"
              label="레벨 테스트"
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────── */}
      {/*  §2  Section divider                        */}
      {/* ──────────────────────────────────────────── */}
      <div className="max-w-[1040px] mx-auto px-5 lg:px-10 pb-5">
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-bold tracking-[.12em] uppercase text-[#9C9890] shrink-0">
            서비스 안내
          </span>
          <div className="flex-1 h-px bg-[#E8E4DF]" />
        </div>
      </div>

      {/* ──────────────────────────────────────────── */}
      {/*  §3  BENTO GRID                             */}
      {/*  보호자(피처드, 2행) + 돌봄이 + 장소         */}
      {/* ──────────────────────────────────────────── */}
      <div className="max-w-[1040px] mx-auto px-5 lg:px-10 pb-20 grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-3.5">

        {/* ── CARD A: 보호자 — featured, lg:2행 ── */}
        <Link
          href="/search"
          className="group relative rounded-3xl border border-[#C8DDEF] bg-gradient-to-br from-[#EBF2FC] via-[#DCE9F9] to-[#C8E2F8] p-8 lg:row-span-2 flex flex-col justify-between min-h-[340px] lg:min-h-[400px] overflow-hidden transition-[transform,box-shadow] duration-[450ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:scale-[1.005] hover:shadow-[0_16px_48px_rgba(0,0,0,.10)]"
        >
          {/* Double-Bezel inner ring */}
          <div
            className="absolute inset-[6px] rounded-[18px] border border-[#1565C0]/[0.08] pointer-events-none"
            style={{ zIndex: 1 }}
            aria-hidden="true"
          />
          {/* 장식 서클 */}
          <div
            className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-[#1565C0] opacity-[0.08] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative" style={{ zIndex: 2 }}>
            <span className="inline-flex items-center gap-1.5 bg-[#1565C0]/[0.12] text-[#1565C0] rounded-full px-3 py-1 text-[11px] font-bold tracking-[.04em] mb-5">
              👨‍👩‍👧 보호자
            </span>
            <span className="block text-[52px] leading-none mb-4" aria-hidden="true">🔍</span>
            <h2
              className="text-[26px] lg:text-[28px] font-black leading-[1.25] tracking-[-0.03em] text-[#1A1714] mb-3"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              가족 같은<br />돌봄이 찾기
            </h2>
            <p
              className="text-[14.5px] lg:text-[15px] text-[#5C5852] leading-[1.7] max-w-[300px]"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              돌봄 공백을 채워줄 믿을 수 있는 돌봄이를 찾아보세요.
              레벨·인증 여부·지역별로 필터링할 수 있어요.
            </p>
          </div>

          <div className="relative mt-8" style={{ zIndex: 2 }}>
            <span className="inline-flex items-center gap-2 bg-[#1565C0] text-white rounded-xl px-5 py-3 text-[13px] font-bold transition-transform duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
              돌봄이 찾아보기 →
            </span>
          </div>
        </Link>

        {/* ── CARD B: 돌봄이 ── */}
        <Link
          href="/test"
          className="group relative rounded-3xl border border-[#EDCFC7] bg-gradient-to-br from-[#FDF2EE] to-[#FAE8E3] p-7 flex flex-col overflow-hidden transition-[transform,box-shadow] duration-[450ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:scale-[1.005] hover:shadow-[0_16px_48px_rgba(0,0,0,.10)]"
        >
          <div
            className="absolute inset-[6px] rounded-[18px] border border-[#D85A3A]/[0.08] pointer-events-none"
            style={{ zIndex: 1 }}
            aria-hidden="true"
          />
          <div
            className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#D85A3A] opacity-[0.08] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative" style={{ zIndex: 2 }}>
            <span className="inline-flex items-center gap-1.5 bg-[#D85A3A]/[0.12] text-[#D85A3A] rounded-full px-3 py-1 text-[11px] font-bold tracking-[.04em] mb-4">
              📋 돌봄이
            </span>
            <span className="block text-[40px] leading-none mb-3" aria-hidden="true">📋</span>
            <h2
              className="text-[21px] font-black leading-[1.25] tracking-[-0.03em] text-[#1A1714] mb-2"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              내 돌봄 스타일<br />프로필 만들기
            </h2>
            <p
              className="text-[13.5px] text-[#5C5852] leading-[1.7] mb-6"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              무료 레벨 테스트로 나의 돌봄 자격을 증명해 보세요.
            </p>
          </div>
          <div className="relative" style={{ zIndex: 2 }}>
            <span className="inline-flex items-center gap-2 bg-[#D85A3A] text-white rounded-xl px-5 py-3 text-[13px] font-bold transition-transform duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
              무료 레벨 테스트 →
            </span>
          </div>
        </Link>

        {/* ── CARD C: 장소 ── */}
        <Link
          href="/places"
          className="group relative rounded-3xl border border-[#B8D9BB] bg-gradient-to-br from-[#EEF6EF] to-[#DFF0E0] p-7 flex flex-col overflow-hidden transition-[transform,box-shadow] duration-[450ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:scale-[1.005] hover:shadow-[0_16px_48px_rgba(0,0,0,.10)]"
        >
          <div
            className="absolute inset-[6px] rounded-[18px] border border-[#2E7D32]/[0.08] pointer-events-none"
            style={{ zIndex: 1 }}
            aria-hidden="true"
          />
          <div
            className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#2E7D32] opacity-[0.08] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative" style={{ zIndex: 2 }}>
            <span className="inline-flex items-center gap-1.5 bg-[#2E7D32]/[0.12] text-[#2E7D32] rounded-full px-3 py-1 text-[11px] font-bold tracking-[.04em] mb-4">
              📍 모두
            </span>
            <span className="block text-[40px] leading-none mb-3" aria-hidden="true">🌿</span>
            <h2
              className="text-[21px] font-black leading-[1.25] tracking-[-0.03em] text-[#1A1714] mb-2"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              아이와 함께<br />가기 좋은 곳
            </h2>
            <p
              className="text-[13.5px] text-[#5C5852] leading-[1.7] mb-6"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              직접 돌보는 날, 우리 아이와 무얼 할지 함께 나눠요.
            </p>
          </div>
          <div className="relative" style={{ zIndex: 2 }}>
            <span className="inline-flex items-center gap-2 bg-[#2E7D32] text-white rounded-xl px-5 py-3 text-[13px] font-bold transition-transform duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
              장소 둘러보기 →
            </span>
          </div>
        </Link>

      </div>

      {/* ──────────────────────────────────────────── */}
      {/*  §4  TRUST STRIP — Dark CTA                 */}
      {/* ──────────────────────────────────────────── */}
      <div className="max-w-[1040px] mx-auto px-5 lg:px-10 pb-24">
        <div className="bg-[#1A1714] rounded-3xl px-8 lg:px-12 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h3
              className="text-[20px] font-black text-white tracking-[-0.03em] mb-1.5"
              style={{ wordBreak: 'keep-all' } as React.CSSProperties}
            >
              돌봄이라면 지금 바로 시작하세요
            </h3>
            <p className="text-[14px] text-white/55 leading-relaxed">
              무료 레벨 테스트로 나만의 프로필을 만들고 보호자와 연결되세요.
            </p>
          </div>
          <Link
            href="/test"
            className="shrink-0 bg-[#D85A3A] text-white rounded-xl px-6 py-3.5 text-[14px] font-bold whitespace-nowrap transition-transform duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]"
          >
            무료 레벨 테스트 시작 →
          </Link>
        </div>
      </div>

    </div>
  )
}
