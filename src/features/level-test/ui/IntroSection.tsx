'use client'

// ═══════════════════════════════════════════════════
//  테스트 소개 화면
// ═══════════════════════════════════════════════════

interface Props {
  onStart: () => void
  onLookup: () => void
}

export function IntroSection({ onStart, onLookup }: Props) {
  return (
    <section className="w-full max-w-[640px]">
      <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,.08)] border border-[#E4E0DC] px-8 py-10 text-center">
        <h2 className="text-[1.4rem] font-extrabold text-[#1A1A1A] mb-3 tracking-[-0.02em]">
          테스트 안내
        </h2>
        <p className="text-[.9rem] text-[#4A4A4A] leading-[1.75] mb-8">
          아이돌봄 경력·자격 설문 <strong>5문항</strong>과<br />
          실제 돌봄 상황 대처 시나리오 <strong>5문항</strong>으로<br />
          총 <strong>10문항</strong>을 통해 나의 레벨을 진단합니다.<br /><br />
          시나리오 문항은 매 테스트마다 <strong>출제 은행에서 랜덤</strong>으로 출제됩니다.
        </p>

        {/* 메타 정보 그리드 */}
        <div className="grid grid-cols-4 border border-[#E4E0DC] rounded-xl overflow-hidden mb-8">
          {[
            { val: '10문항', label: '총 문항 수' },
            { val: '약 5분', label: '소요 시간' },
            { val: '5단계', label: '레벨 구분' },
            { val: '인증 가능', label: '서류 제출 시' },
          ].map(({ val, label }) => (
            <div key={label} className="py-4 px-2 text-center bg-[#F7F5F3] border-r border-[#E4E0DC] last:border-r-0">
              <span className="block text-[.95rem] font-bold text-[#1A1A1A]">{val}</span>
              <span className="block text-[.75rem] text-[#8A8A8A] mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="w-full py-[15px] text-base font-bold bg-[#D85A3A] text-white rounded-xl hover:bg-[#C04830] transition-colors"
        >
          테스트 시작하기
        </button>
        <button
          onClick={onLookup}
          className="w-full py-3 mt-2.5 text-[.9rem] font-semibold bg-transparent border-[1.5px] border-[#E4E0DC] text-[#4A4A4A] rounded-xl hover:border-[#F0A090] hover:text-[#D85A3A] hover:bg-[#FAE8E3] transition-all"
        >
          내 결과 이어보기
        </button>
      </div>

      {/* ── 보호자 진입점 배너 ── */}
      <a
        href="/search"
        className="mt-3 flex items-center justify-between px-5 py-4 bg-white border border-[#E4E0DC] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,.05)] hover:border-[#4A9FCC] hover:shadow-[0_4px_16px_rgba(74,159,204,.12)] transition-all group"
      >
        <div className="text-left">
          <p className="text-[.76rem] font-semibold text-[#4A9FCC] uppercase tracking-wide mb-0.5">
            보호자이신가요?
          </p>
          <p className="text-[.96rem] font-bold text-[#1A1A1A]">
            인증된 돌봄이 찾기
          </p>
          <p className="text-[.78rem] text-[#8A8A8A] mt-0.5">
            레벨·인증 여부·지역으로 필터해 검색하세요
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 ml-4">
          <span className="text-[2rem]">🔍</span>
          <span className="text-[.75rem] font-bold text-[#4A9FCC] group-hover:translate-x-0.5 transition-transform">
            검색하기 →
          </span>
        </div>
      </a>
    </section>
  )
}
