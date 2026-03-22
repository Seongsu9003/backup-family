'use client'

// ═══════════════════════════════════════════════════
//  인증 서류 첨부 섹션
// ═══════════════════════════════════════════════════
import type { CertDocs } from '../model/types'
import type { Question } from '../model/constants'

interface CertifiableItem {
  q: Question
  answerIdx: number | null
}

interface Props {
  certifiableItems: CertifiableItem[]
  certDocs: CertDocs
  onSetDoc: (key: keyof CertDocs, value: string | null) => void
}

export function DocAttach({ certifiableItems, certDocs, onSetDoc }: Props) {
  if (certifiableItems.length === 0) return null

  return (
    <div className="mb-5">
      <h4 className="text-[.88rem] font-bold text-[#1A1A1A] mb-1">
        인증 서류 첨부{' '}
        <span className="text-[.8rem] font-normal text-[#8A8A8A]">(선택사항 · 첨부 시 인증 신청)</span>
      </h4>
      <p className="text-[.8rem] text-[#8A8A8A] mb-3 leading-[1.55]">
        해당 자격/교육에 대한 서류를 첨부하면 관리자 검토 후 인증 뱃지를 받을 수 있습니다.
      </p>

      {certifiableItems.map(({ q }) => {
        const key = q.docKey as keyof CertDocs
        const attached = certDocs[key]

        return (
          <div
            key={key}
            className={`flex items-center gap-3 px-3.5 py-2.5 border-[1.5px] rounded-lg mb-2 transition-all ${
              attached
                ? 'border-[#3A9E94] bg-[#DDF0EE] border-solid'
                : 'border-dashed border-[#E4E0DC]'
            }`}
          >
            <div className="flex-1">
              <div className="text-[.86rem] font-semibold text-[#1A1A1A]">{q.docLabel}</div>
              <div className={`text-[.76rem] mt-0.5 ${attached ? 'text-[#3A9E94]' : 'text-[#8A8A8A]'}`}>
                {attached ? `✓ ${attached}` : '미첨부'}
              </div>
            </div>

            {!attached ? (
              <label className="px-3 py-1.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.8rem] font-semibold cursor-pointer hover:border-[#D85A3A] hover:text-[#D85A3A] transition-all text-[#4A4A4A]">
                첨부
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onSetDoc(key, file.name)
                  }}
                />
              </label>
            ) : (
              <button
                onClick={() => onSetDoc(key, null)}
                className="text-[#C04848] text-[.78rem] px-2 py-1 rounded border-none bg-transparent cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
