'use client'

import { useState } from 'react'
import type { TestResult } from '@/shared/types'
import { useSetStatus } from '../model/useSetStatus'
import { fmtDate, isExpired, isExpiringSoon } from '../model/types'

// ── 서류 열기 버튼 ───────────────────────────────────
// cert-docs 버킷은 private → 서명 URL API 경유
// 하위 호환: 기존 데이터에 full URL이 저장된 경우 직접 열기
function isLegacyUrl(value: string) {
  return value.startsWith('https://')
}

function DocOpenButton({ docValue }: { docValue: string }) {
  const [loading, setLoading] = useState(false)

  const handleOpen = async () => {
    // 기존 public URL (레거시 데이터) — 직접 열기
    if (isLegacyUrl(docValue)) {
      window.open(docValue, '_blank', 'noopener,noreferrer')
      return
    }
    // 신규 storage path — 서명 URL 발급 후 열기
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/cert-docs/signed-url?path=${encodeURIComponent(docValue)}`)
      if (!res.ok) throw new Error('서명 URL 발급 실패')
      const { signedUrl } = await res.json()
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      alert('파일을 열 수 없습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleOpen}
      disabled={loading}
      className="shrink-0 px-2.5 py-1 rounded-lg text-[.74rem] font-semibold bg-[#EBF2FC] text-[#1565C0] hover:bg-[#1565C0] hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? '…' : '열기'}
    </button>
  )
}

/** storage path에서 파일명만 추출 */
function extractFilename(value: string): string {
  if (isLegacyUrl(value)) {
    // https://.../cert-docs/testId/cert_파일명.pdf → 파일명 추출
    return decodeURIComponent(value.split('/').pop() || value)
  }
  // testId/cert_파일명.pdf → cert_파일명.pdf
  const parts = value.split('/')
  return decodeURIComponent(parts[parts.length - 1] || value)
}

interface Props {
  result: TestResult
  onClose: () => void
}

export function ResultModal({ result: r, onClose }: Props) {
  const [memo, setMemo] = useState(r.certification?.admin_memo || '')
  const { mutate, isPending } = useSetStatus()

  const handleSetStatus = (status: string) => {
    mutate(
      { result: r, status, memo },
      {
        onSuccess: ({ name, status }) => {
          alert(`"${name}" — ${status}(으)로 처리되었습니다.`)
          onClose()
        },
        onError: (e) => alert('저장 오류: ' + e.message),
      }
    )
  }

  const regions  = r.tester?.preferred_region || []
  const docs     = r.certification?.docs_attached || []
  const expColor = isExpired(r) ? 'text-red-600' : isExpiringSoon(r) ? 'text-[#E65100]' : ''

  return (
    <div
      className="fixed inset-0 bg-black/40 overflow-y-auto z-50"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E0DC]">
          <h3 className="text-base font-bold">{r.tester?.name || '익명'} 상세 정보</h3>
          <button onClick={onClose} className="text-[#8A8A8A] hover:text-[#1A1A1A] text-xl font-light">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* 기본 정보 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['이름',        r.tester?.name || '-'],
              ['연락처',      r.tester?.contact || '-'],
              ['테스트 일자',  fmtDate(r.meta?.created_at)],
              ['재인증 만료일', fmtDate(r.meta?.expires_at)],
              ['구직 관심도',  r.job_seeking || '-'],
              ['인증 상태',   r.certification?.status || '-'],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#F7F5F3] rounded-lg px-3 py-2">
                <div className="text-[.7rem] text-[#8A8A8A] font-bold uppercase tracking-wide mb-0.5">{label}</div>
                <div className={`text-[.85rem] font-semibold ${label === '재인증 만료일' ? expColor : 'text-[#1A1A1A]'}`}>
                  {value}
                  {label === '재인증 만료일' && isExpired(r) && ' (만료)'}
                  {label === '재인증 만료일' && isExpiringSoon(r) && !isExpired(r) && ' ⚠️'}
                </div>
              </div>
            ))}
          </div>

          {/* 선호 지역 */}
          {regions.length > 0 && (
            <div>
              <div className="text-[.72rem] text-[#8A8A8A] font-bold uppercase tracking-wide mb-2">선호 활동 지역</div>
              <div className="flex flex-wrap gap-1.5">
                {regions.map(rg => (
                  <span key={rg} className="bg-[#DDF0EE] text-[#1A7A72] px-3 py-1 rounded-full text-[.78rem] font-semibold">{rg}</span>
                ))}
              </div>
            </div>
          )}

          {/* 돌봄 타입 */}
          {r.care_type && (
            <div className="flex items-center gap-3">
              <div className="text-[.72rem] text-[#8A8A8A] font-bold uppercase tracking-wide">돌봄 타입</div>
              <span
                className="px-3 py-1 rounded-full text-[.78rem] font-bold text-white"
                style={{ background: r.care_type.color || '#888' }}
              >
                {r.care_type.label}
              </span>
              <span className="text-[.83rem] text-[#4A4A4A]">{r.care_type.fullLabel}</span>
            </div>
          )}

          {/* 점수 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ['총점',        r.score?.total || 0, ''],
              ['설문 점수',    r.score?.survey || 0, '/50'],
              ['시나리오 점수', r.score?.scenario || 0, '/50'],
            ].map(([label, val, unit]) => (
              <div key={label as string} className="bg-[#F7F5F3] rounded-xl px-4 py-3 text-center">
                <div className="text-[.7rem] text-[#8A8A8A] mb-1">{label as string}</div>
                <div className="text-2xl font-extrabold text-[#D85A3A]">
                  {val}<span className="text-[.7rem] font-normal text-[#8A8A8A]">{unit as string}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 레벨 */}
          <div className="bg-[#F7F5F3] rounded-lg px-4 py-3">
            <div className="font-bold text-[.9rem]">{r.level?.label || '-'}</div>
            <div className="text-[.73rem] text-[#8A8A8A] mt-1">
              출제 시나리오: {(r.scenario_ids || []).join(', ') || '-'}
            </div>
          </div>

          {/* 첨부 서류 */}
          <div>
            <div className="text-[.83rem] font-bold mb-2">첨부 서류</div>
            {docs.length > 0 ? (
              <div className="space-y-1.5">
                {docs.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#F7F5F3] rounded-lg px-3 py-2 text-[.83rem]">
                    <span>📄</span>
                    <span className="flex-1 truncate text-[.82rem] text-[#4A4A4A]">
                      {extractFilename(d)}
                    </span>
                    <DocOpenButton docValue={d} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[.83rem] text-[#8A8A8A]">첨부된 서류가 없습니다.</p>
            )}
          </div>

          <hr className="border-[#E4E0DC]" />

          {/* 관리자 처리 */}
          <div>
            <div className="text-[.83rem] font-bold mb-2">관리자 처리</div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="검토 메모를 입력하세요 (선택사항)"
              rows={3}
              className="w-full px-3 py-2.5 border border-[#E4E0DC] rounded-lg text-[.84rem] resize-none outline-none focus:border-[#D85A3A] transition-colors mb-3"
            />
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSetStatus('인증완료')}
                disabled={isPending}
                className="py-2.5 rounded-lg bg-[#2ECC71] text-white font-bold text-[.84rem] hover:bg-[#27AE60] disabled:opacity-50 transition-colors"
              >
                인증 승인
              </button>
              <button
                onClick={() => handleSetStatus('반려')}
                disabled={isPending}
                className="py-2.5 rounded-lg bg-[#E74C3C] text-white font-bold text-[.84rem] hover:bg-[#C0392B] disabled:opacity-50 transition-colors"
              >
                서류 반려
              </button>
              <button
                onClick={() => handleSetStatus('미인증')}
                disabled={isPending}
                className="py-2.5 rounded-lg border border-[#E4E0DC] text-[#4A4A4A] font-bold text-[.84rem] hover:border-[#D85A3A] hover:text-[#D85A3A] disabled:opacity-50 transition-colors"
              >
                미인증 초기화
              </button>
            </div>
            {r.certification?.certified_at && (
              <p className="text-[.73rem] text-[#8A8A8A] mt-2">
                최종 처리일: {fmtDate(r.certification.certified_at)}
              </p>
            )}
          </div>

          {/* 문항별 답변 기록 */}
          {r.question_log && r.question_log.length > 0 && (
            <>
              <hr className="border-[#E4E0DC]" />
              <div>
                <div className="text-[.83rem] font-bold mb-2">문항별 답변 기록</div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {r.question_log.map((q, i) => {
                    const pct = q.max_score > 0 ? q.score / q.max_score : 0
                    const scoreColor = pct === 1 ? 'text-[#1A7A45]' : pct > 0 ? 'text-[#B07D00]' : 'text-red-600'
                    return (
                      <div key={i} className="flex items-center gap-2 text-[.78rem] bg-[#F7F5F3] rounded px-3 py-1.5">
                        <span className="bg-[#E4E0DC] text-[#4A4A4A] px-1.5 py-0.5 rounded text-[.68rem] font-bold shrink-0">
                          {q.type === 'survey' ? '설문' : q.category || '시나리오'}
                        </span>
                        <span className="text-[#8A8A8A] shrink-0">{q.q_id}</span>
                        <span className="flex-1 text-[#8A8A8A]">
                          선택 {q.chosen_idx + 1}
                          {q.correct_idx !== null && (q.correct_idx === q.chosen_idx ? ' ✓' : ' ✗')}
                        </span>
                        <span className={`font-bold shrink-0 ${scoreColor}`}>
                          {q.score}/{q.max_score}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
