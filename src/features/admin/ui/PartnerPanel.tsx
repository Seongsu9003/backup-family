'use client'

// ═══════════════════════════════════════════════════
//  파트너 관리 패널 (BIZ)
//  - 파트너 목록 + 신청자 수 조회
//  - 신규 파트너 코드 생성 폼
//  - 활성/비활성 토글
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { usePartners, usePartnerStats, useCreatePartner, useTogglePartnerActive } from '../model/usePartners'
import type { Partner } from '@/shared/types'

const TYPE_LABELS: Record<Partner['type'], string> = {
  agency:    '제휴업체',
  franchise: '가맹점',
  direct:    '직접영업',
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://backup-family.vercel.app'

export function PartnerPanel() {
  const { data: partners = [], isLoading } = usePartners()
  const { data: stats    = {}            } = usePartnerStats()
  const createPartner                       = useCreatePartner()
  const toggleActive                        = useTogglePartnerActive()

  // ── 생성 폼 상태 ──────────────────────────────
  const [formOpen, setFormOpen] = useState(false)
  const [name,     setName]     = useState('')
  const [type,     setType]     = useState<Partner['type']>('agency')
  const [memo,     setMemo]     = useState('')
  const [formErr,  setFormErr]  = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) { setFormErr('업체명을 입력해주세요.'); return }
    setFormErr(null)
    try {
      await createPartner.mutateAsync({ name: name.trim(), type, memo: memo.trim() })
      setName(''); setType('agency'); setMemo('')
      setFormOpen(false)
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : '생성 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="bg-white border border-[#E4E0DC] rounded-2xl overflow-hidden mb-6">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-[#E4E0DC] flex items-center justify-between">
        <div>
          <h2 className="text-[.95rem] font-bold text-[#1A1A1A]">파트너 관리</h2>
          <p className="text-[.75rem] text-[#8A8A8A] mt-0.5">
            제휴업체 링크: <code className="bg-[#F7F5F3] px-1.5 py-0.5 rounded text-[#D85A3A]">/?partner=BUF00001</code>
          </p>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="px-4 py-1.5 bg-[#D85A3A] text-white text-[.8rem] font-bold rounded-lg hover:bg-[#C04830] transition-colors"
        >
          + 파트너 추가
        </button>
      </div>

      {/* 생성 폼 */}
      {formOpen && (
        <div className="px-6 py-4 bg-[#FFF8F6] border-b border-[#F5D5CC]">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[.72rem] font-bold text-[#8A8A8A] uppercase tracking-wide">업체명 *</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setFormErr(null) }}
                placeholder="예) 선한복지관"
                className="px-3 py-2 border border-[#E4E0DC] rounded-lg text-[.83rem] outline-none focus:border-[#D85A3A] w-48"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[.72rem] font-bold text-[#8A8A8A] uppercase tracking-wide">구분</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Partner['type'])}
                className="px-3 py-2 border border-[#E4E0DC] rounded-lg text-[.83rem] outline-none focus:border-[#D85A3A] bg-white"
              >
                <option value="agency">제휴업체</option>
                <option value="franchise">가맹점</option>
                <option value="direct">직접영업</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[.72rem] font-bold text-[#8A8A8A] uppercase tracking-wide">메모</label>
              <input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="선택사항"
                className="px-3 py-2 border border-[#E4E0DC] rounded-lg text-[.83rem] outline-none focus:border-[#D85A3A] w-40"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={createPartner.isPending}
              className="px-4 py-2 bg-[#1A1A1A] text-white text-[.83rem] font-bold rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {createPartner.isPending ? '생성 중…' : '코드 생성'}
            </button>
          </div>
          {formErr && <p className="text-[.75rem] text-red-500 mt-2">{formErr}</p>}
        </div>
      )}

      {/* 파트너 목록 */}
      {isLoading ? (
        <div className="py-10 text-center text-[#8A8A8A] text-sm">불러오는 중…</div>
      ) : partners.length === 0 ? (
        <div className="py-10 text-center text-[#8A8A8A] text-sm">등록된 파트너가 없습니다.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[.83rem]">
            <thead>
              <tr className="bg-[#F7F5F3] text-[#8A8A8A] text-[.72rem] font-bold uppercase tracking-wide">
                {['코드', '업체명', '구분', '신청자', '유입 링크', '상태', '등록일', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-t border-[#F0EDE9] hover:bg-[#FAFAF9]">
                  <td className="px-4 py-3">
                    <code className="font-bold text-[#D85A3A] bg-[#FFF4F2] px-2 py-0.5 rounded">{p.code}</code>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[.72rem] font-semibold bg-[#F7F5F3] text-[#4A4A4A]">
                      {TYPE_LABELS[p.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-[#1A1A1A]">{stats[p.code] ?? 0}</span>
                    <span className="text-[#8A8A8A] ml-1 text-[.72rem]">명</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigator.clipboard.writeText(`${BASE_URL}/?partner=${p.code}`)}
                      className="text-[.75rem] text-[#4A9FCC] hover:underline"
                      title={`${BASE_URL}/?partner=${p.code}`}
                    >
                      링크 복사
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[.72rem] font-semibold
                      ${p.is_active
                        ? 'bg-[#D5F5E3] text-[#1A7A45]'
                        : 'bg-[#F7F5F3] text-[#8A8A8A] border border-[#E4E0DC]'}`}>
                      {p.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8A8A8A]">
                    {new Date(p.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive.mutate({ id: p.id, is_active: !p.is_active })}
                      className="text-[.75rem] text-[#8A8A8A] hover:text-[#4A4A4A] border border-[#E4E0DC] rounded px-2 py-0.5 hover:border-[#4A4A4A] transition-colors"
                    >
                      {p.is_active ? '비활성화' : '활성화'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
