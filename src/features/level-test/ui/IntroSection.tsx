'use client'

// ═══════════════════════════════════════════════════
//  테스트 소개 화면 — Supanova Double-Bezel + Spring
// ═══════════════════════════════════════════════════

interface Props {
  onStart: () => void
  onLookup: () => void
}

const META_ITEMS = [
  { val: '10문항', label: '총 문항 수' },
  { val: '약 5분', label: '소요 시간' },
  { val: '5단계', label: '레벨 구분' },
  { val: '인증 가능', label: '서류 제출 시' },
]

export function IntroSection({ onStart, onLookup }: Props) {
  return (
    <section className="w-full max-w-[600px]">

      {/* ── 메인 카드 — Double-Bezel ── */}
      <div className="relative bg-white rounded-3xl border border-[#E8E4DF] px-8 py-10 text-center overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,.07)]">
        {/* Double-Bezel inner ring */}
        <div className="absolute inset-[6px] rounded-[18px] border border-black/[0.04] pointer-events-none" />
        {/* 장식 서클 */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#D85A3A] opacity-[0.06] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 bg-[#FDF2EE] border border-[#D85A3A]/20 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[.04em] text-[#D85A3A] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D85A3A]" />
            돌봄이 레벨 테스트
          </span>

          <h2
            className="text-[22px] font-black text-[#1A1714] mb-3 tracking-[-0.03em]"
            style={{ wordBreak: 'keep-all' } as React.CSSProperties}
          >
            테스트 안내
          </h2>
          <p
            className="text-[14.5px] text-[#5C5852] leading-[1.75] mb-8"
            style={{ wordBreak: 'keep-all' } as React.CSSProperties}
          >
            아이돌봄 경력·자격 설문 <strong className="text-[#1A1714]">5문항</strong>과<br />
            실제 돌봄 상황 대처 시나리오 <strong className="text-[#1A1714]">5문항</strong>으로<br />
            총 <strong className="text-[#1A1714]">10문항</strong>을 통해 나의 레벨을 진단합니다.<br /><br />
            시나리오 문항은 매 테스트마다{' '}
            <strong className="text-[#D85A3A]">출제 은행에서 랜덤</strong>으로 출제됩니다.
          </p>

          {/* 메타 정보 그리드 — Double-Bezel 처리 */}
          <div className="grid grid-cols-4 rounded-2xl border border-[#E8E4DF] overflow-hidden mb-8">
            {META_ITEMS.map(({ val, label }, i) => (
              <div
                key={label}
                className={`py-4 px-2 text-center bg-[#F7F5F2] ${
                  i < META_ITEMS.length - 1 ? 'border-r border-[#E8E4DF]' : ''
                }`}
              >
                <span className="block text-[14px] font-black text-[#1A1714] tracking-[-0.02em]">
                  {val}
                </span>
                <span className="block text-[11px] text-[#9C9890] mt-0.5 font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA 버튼 — Spring */}
          <button
            onClick={onStart}
            className="w-full py-[15px] text-[15px] font-bold bg-[#D85A3A] text-white rounded-xl transition-[transform,background-color,box-shadow] duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-[#C04828] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(216,90,58,.3)]"
          >
            테스트 시작하기 →
          </button>
          <button
            onClick={onLookup}
            className="w-full py-3 mt-2.5 text-[14px] font-semibold bg-transparent border border-[#E8E4DF] text-[#5C5852] rounded-xl transition-[border-color,color,background-color] duration-200 hover:border-[#D85A3A]/40 hover:text-[#D85A3A] hover:bg-[#FDF2EE]"
          >
            내 결과 이어보기
          </button>
        </div>
      </div>

      {/* ── 보호자 진입점 배너 — Double-Bezel ── */}
      <a
        href="/search"
        className="group relative mt-3 flex items-center justify-between px-6 py-4 bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden transition-[transform,box-shadow,border-color] duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.09)] hover:border-[#1565C0]/30"
      >
        <div className="absolute inset-[5px] rounded-[14px] border border-black/[0.04] pointer-events-none" />
        <div className="relative text-left" style={{ zIndex: 1 }}>
          <p className="text-[11px] font-bold text-[#1565C0] uppercase tracking-[.08em] mb-0.5">
            보호자이신가요?
          </p>
          <p
            className="text-[15px] font-black text-[#1A1714] tracking-[-0.02em]"
            style={{ wordBreak: 'keep-all' } as React.CSSProperties}
          >
            인증된 돌봄이 찾기
          </p>
          <p className="text-[12.5px] text-[#9C9890] mt-0.5">
            레벨·인증 여부·지역으로 필터해 검색하세요
          </p>
        </div>
        <div className="relative flex flex-col items-center gap-1 ml-4" style={{ zIndex: 1 }}>
          <span className="text-[2rem]" aria-hidden="true">🔍</span>
          <span className="text-[11.5px] font-bold text-[#1565C0] transition-transform duration-[300ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
            검색하기 →
          </span>
        </div>
      </a>

    </section>
  )
}
