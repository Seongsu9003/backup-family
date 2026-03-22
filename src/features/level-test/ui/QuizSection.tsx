'use client'

// ═══════════════════════════════════════════════════
//  퀴즈 문항 화면
// ═══════════════════════════════════════════════════
import type { QuizState } from '../model/types'

interface Props {
  state: QuizState
  onSelect: (idx: number) => void
  onNext: () => void
  onPrev: () => void
}

export function QuizSection({ state, onSelect, onNext, onPrev }: Props) {
  const { questions, current, answers } = state
  const q = questions[current]
  const total = questions.length
  const pct = Math.round(((current + 1) / total) * 100)
  const selected = answers[current]
  const isLast = current === total - 1

  return (
    <section className="w-full max-w-[640px]">
      {/* 진행바 */}
      <div className="mb-5">
        <div className="flex justify-between text-[.8rem] text-[#8A8A8A] font-medium mb-2">
          <span>{current + 1} / {total}</span>
          <span>{pct}%</span>
        </div>
        <div className="bg-[#E4E0DC] rounded-full h-1 overflow-hidden">
          <div
            className="h-full bg-[#D85A3A] rounded-full transition-[width_.4s_ease]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* 문항 카드 */}
      <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,.08)] border border-[#E4E0DC] px-7 py-8 animate-[fadeUp_.3s_ease]">
        {/* 배지 */}
        <span
          className={`inline-block text-[.72rem] font-bold tracking-[.08em] px-2.5 py-[3px] rounded-full mb-4 ${
            q.type === 'survey'
              ? 'bg-[#FAE8E3] text-[#C04830]'
              : 'bg-[#DDF0EE] text-[#3A9E94]'
          }`}
        >
          {q.type === 'survey' ? '설문' : `시나리오 · ${q.category}`}
        </span>

        <div className="text-[.8rem] text-[#8A8A8A] mb-1 font-medium">
          문항 {current + 1} / {total}
        </div>
        <div className="text-[1.1rem] font-bold leading-[1.6] mb-2.5 text-[#1A1A1A]">
          {q.text}
        </div>

        {q.hint && (
          <div className="text-[.84rem] text-[#4A4A4A] mb-6 leading-[1.55] bg-[#FAE8E3] border-l-[3px] border-[#D85A3A] pl-3.5 pr-3 py-2.5 rounded-r-lg">
            {q.hint}
          </div>
        )}

        {/* 선택지 */}
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <div
              key={i}
              onClick={() => onSelect(i)}
              className={`flex items-start gap-3.5 px-4 py-3.5 border-[1.5px] rounded-xl cursor-pointer transition-all ${
                selected === i
                  ? 'border-[#D85A3A] bg-[#FAE8E3]'
                  : 'border-[#E4E0DC] bg-white hover:border-[#F0A090] hover:bg-[#FAE8E3]'
              }`}
            >
              {/* 라디오 원 */}
              <div
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  selected === i
                    ? 'border-[#D85A3A] bg-[#D85A3A] shadow-[0_0_0_3px_#FAE8E3]'
                    : 'border-[#E4E0DC]'
                }`}
              />
              <div className="flex-1">
                <div className="text-[.92rem] font-semibold leading-[1.45] text-[#1A1A1A]">
                  {opt.label}
                </div>
                {opt.desc && (
                  <div className="text-[.8rem] text-[#8A8A8A] mt-0.5">{opt.desc}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-end gap-2.5 mt-7">
          {current > 0 && (
            <button
              onClick={onPrev}
              className="px-6 py-[11px] rounded-lg border-[1.5px] border-[#E4E0DC] text-[.9rem] font-semibold text-[#8A8A8A] bg-transparent hover:border-[#F0A090] hover:text-[#D85A3A] transition-all"
            >
              이전
            </button>
          )}
          <button
            onClick={onNext}
            disabled={selected === null}
            className="px-6 py-[11px] rounded-lg bg-[#D85A3A] text-white text-[.9rem] font-semibold hover:bg-[#C04830] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isLast ? '결과 보기' : '다음'}
          </button>
        </div>
      </div>
    </section>
  )
}
