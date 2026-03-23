'use client'

// ═══════════════════════════════════════════════════
//  인증 서류 첨부 섹션 (BUG-02: 실제 Storage 업로드)
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import type { CertDocs } from '../model/types'
import type { Question } from '../model/constants'
import { uploadDoc } from '../model/uploadDoc'

interface CertifiableItem {
  q: Question
  answerIdx: number | null
}

interface Props {
  testId:           string
  certifiableItems: CertifiableItem[]
  certDocs:         CertDocs
  onSetDoc: (key: keyof CertDocs, value: string | null) => void
}

export function DocAttach({ testId, certifiableItems, certDocs, onSetDoc }: Props) {
  // 업로드 진행 중인 키를 추적
  const [uploading, setUploading] = useState<Partial<Record<keyof CertDocs, boolean>>>({})
  const [errors,    setErrors]    = useState<Partial<Record<keyof CertDocs, string>>>({})

  if (certifiableItems.length === 0) return null

  const handleFileChange = async (key: keyof CertDocs, file: File) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setUploading((prev) => ({ ...prev, [key]: true }))

    try {
      const publicUrl = await uploadDoc({ testId, docKey: key, file })
      onSetDoc(key, publicUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.'
      setErrors((prev) => ({ ...prev, [key]: message }))
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }))
    }
  }

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
        const key         = q.docKey as keyof CertDocs
        const attached    = certDocs[key]
        const isUploading = uploading[key] ?? false
        const errorMsg    = errors[key]

        return (
          <div key={key} className="mb-2">
            <div
              className={`flex items-center gap-3 px-3.5 py-2.5 border-[1.5px] rounded-lg transition-all ${
                isUploading
                  ? 'border-[#F0C080] bg-[#FFF8ED] border-solid'
                  : attached
                    ? 'border-[#3A9E94] bg-[#DDF0EE] border-solid'
                    : 'border-dashed border-[#E4E0DC]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[.86rem] font-semibold text-[#1A1A1A]">{q.docLabel}</div>
                <div className={`text-[.76rem] mt-0.5 truncate ${
                  isUploading ? 'text-[#C08030]' :
                  attached    ? 'text-[#3A9E94]' : 'text-[#8A8A8A]'
                }`}>
                  {isUploading
                    ? '업로드 중…'
                    : attached
                      ? '✓ 첨부 완료'
                      : '미첨부'}
                </div>
              </div>

              {!attached && !isUploading ? (
                <label className="px-3 py-1.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.8rem] font-semibold cursor-pointer hover:border-[#D85A3A] hover:text-[#D85A3A] transition-all text-[#4A4A4A] shrink-0">
                  첨부
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileChange(key, file)
                      // 같은 파일 재선택 허용을 위해 초기화
                      e.target.value = ''
                    }}
                  />
                </label>
              ) : isUploading ? (
                <span className="text-[.76rem] text-[#C08030] shrink-0">처리 중</span>
              ) : (
                <button
                  onClick={() => onSetDoc(key, null)}
                  className="text-[#C04848] text-[.78rem] px-2 py-1 rounded border-none bg-transparent cursor-pointer shrink-0"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 업로드 오류 메시지 */}
            {errorMsg && (
              <p className="text-[.76rem] text-red-500 mt-1 px-1">{errorMsg}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
