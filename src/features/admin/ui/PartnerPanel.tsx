'use client'

// ═══════════════════════════════════════════════════
//  파트너 관리 패널 (BIZ)
//  - 파트너 목록 + 신청자 수 조회
//  - 신규 파트너 코드 생성 (업체명·구분·메모만 입력)
//  - 행 클릭 → 유입 링크·신청자 수·활성토글 슬라이드 패널
//  ※ 사업자 정보(biz_no, phone, website, address)는
//    DB에서 직접 관리하며 UI에는 노출하지 않습니다.
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import {
  usePartners, usePartnerStats,
  useCreatePartner, useTogglePartnerActive,
} from '../model/usePartners'
import type { Partner } from '@/shared/types'

const TYPE_LABELS: Record<Partner['type'], string> = {
  agency:    '제휴업체',
  franchise: '가맹점',
  direct:    '직접영업',
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://backup-family.vercel.app'

// ── 상세 슬라이드 패널 ──────────────────────────
interface DetailPanelProps {
  partner:    Partner
  stats:      number
  onClose:    () => void
  onToggle:   () => void
  isToggling: boolean
}
function DetailPanel({ partner, stats, onClose, onToggle, isToggling }: DetailPanelProps) {
  const partnerUrl = `${BASE_URL}/?partner=${partner.code}`

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[340px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-[#E4E0DC] flex items-start justify-between">
          <div>
            <code className="text-[.8rem] font-bold text-[#D85A3A] bg-[#FFF4F2] px-2 py-0.5 rounded">
              {partner.code}
            </code>
            <h3 className="text-[1rem] font-extrabold text-[#1A1A1A] mt-1.5">{partner.name}</h3>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[.72rem] font-semibold
              ${partner.is_active
                ? 'bg-[#D5F5E3] text-[#1A7A45]'
                : 'bg-[#F7F5F3] text-[#8A8A8A] border border-[#E4E0DC]'}`}>
              {partner.is_active ? '활성' : '비활성'}
            </span>
          </div>
          <button onClick={onClose} className="text-[#8A8A8A] hover:text-[#1A1A1A] text-xl leading-none mt-0.5">×</button>
        </div>

        {/* KPI */}
        <div className="px-6 py-4 bg-[#F7F5F3] border-b border-[#E4E0DC] flex gap-6">
          <div>
            <p className="text-[.72rem] text-[#8A8A8A] font-bold uppercase tracking-wide">누적 신청자</p>
            <p className="text-[1.5rem] font-extrabold text-[#D85A3A]">
              {stats}<span className="text-[.85rem] font-semibold text-[#8A8A8A] ml-1">명</span>
            </p>
          </div>
          <div>
            <p className="text-[.72rem] text-[#8A8A8A] font-bold uppercase tracking-wide">구분</p>
            <p className="text-[.88rem] font-semibold text-[#1A1A1A] mt-1">{TYPE_LABELS[partner.type]}</p>
          </div>
          <div>
            <p className="text-[.72rem] text-[#8A8A8A] font-bold uppercase tracking-wide">등록일</p>
            <p className="text-[.88rem] font-semibold text-[#1A1A1A] mt-1">
              {new Date(partner.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>

        {/* 메모 */}
        {partner.memo && (
          <div className="px-6 py-4 border-b border-[#E4E0DC]">
            <p className="text-[.72rem] text-[#AAAAAA] mb-1">메모</p>
            <p className="text-[.85rem] text-[#4A4A4A] whitespace-pre-wrap">{partner.memo}</p>
          </div>
        )}

        {/* 유입 링크 */}
        <div className="px-6 py-4 border-b border-[#E4E0DC]">
          <p className="text-[.72rem] text-[#AAAAAA] mb-1.5">유입 링크</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[.72rem] bg-[#F7F5F3] px-2 py-1.5 rounded border border-[#E4E0DC] text-[#4A4A4A] break-all">
              {partnerUrl}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(partnerUrl)}
              className="shrink-0 px-3 py-1.5 text-[.75rem] font-semibold bg-[#1A1A1A] text-white rounded-lg hover:bg-[#333] transition-colors"
            >
              복사
            </button>
          </div>
        </div>

        {/* 액션 */}
        <div className="px-6 py-4 mt-auto">
          <button
            onClick={onToggle}
            disabled={isToggling}
            className={`w-full py-2.5 text-[.85rem] font-bold rounded-lg border transition-colors disabled:opacity-50
              ${partner.is_active
                ? 'border-[#E4E0DC] text-[#8A8A8A] hover:border-red-300 hover:text-red-500'
                : 'border-[#D85A3A] text-[#D85A3A] hover:bg-[#D85A3A] hover:text-white'}`}
          >
            {isToggling ? '처리 중…' : partner.is_active ? '비활성화' : '활성화'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── PartnerPanel 메인 ────────────────────────────
export function PartnerPanel() {
  const { data: partners = [], isLoading } = usePartners()
  const { data: stats    = {}            } = usePartnerStats()
  const createPartner                       = useCreatePartner()
  const toggleActive                        = useTogglePartnerActive()

  const [detailPartner, setDetailPartner] = useState<Partner | null>(null)
  const [formOpen, setFormOpen]           = useState(false)
  const [name,     setName]               = useState('')
  const [type,     setType]               = useState<Partner['type']>('agency')
  const [memo,     setMemo]               = useState('')
  const [formErr,  setFormErr]            = useState<string | null>(null)

  const resetForm = () => {
    setName(''); setType('agency'); setMemo(''); setFormErr(null)
  }

  const handleCreate = async () => {
    if (!name.trim()) { setFormErr('업체명을 입력해주세요.'); return }
    setFormErr(null)
    try {
      await createPartner.mutateAsync({ name: name.trim(), type, memo: memo.trim() })
      resetForm()
      setFormOpen(false)
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : '생성 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <div className="bg-white border border-[#E4E0DC] rounded-2xl overflow-hidden mb-6">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-[#E4E0DC] flex items-center justify-between">
          <div>
            <h2 className="text-[.95rem] font-bold text-[#1A1A1A]">파트너 관리</h2>
            <p className="text-[.75rem] text-[#8A8A8A] mt-0.5">
              유입 링크: <code className="bg-[#F7F5F3] px-1.5 py-0.5 rounded text-[#D85A3A]">/?partner=BUF00001</code>
            </p>
          </div>
          <button
            onClick={() => { setFormOpen((v) => !v); resetForm() }}
            className="px-4 py-1.5 bg-[#D85A3A] text-white text-[.8rem] font-bold rounded-lg hover:bg-[#C04830] transition-colors"
          >
            + 파트너 추가
          </button>
        </div>

        {/* 생성 폼 */}
        {formOpen && (
          <div className="px-6 py-4 bg-[#FFF8F6] border-b border-[#F5D5CC]">
            <div className="flex flex-wrap gap-3 items-end">
              {/* 업체명 */}
              <div className="flex flex-col gap-1">
                <label className="text-[.72rem] font-bold text-[#8A8A8A] uppercase tracking-wide">
                  업체명 <span className="text-red-400">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFormErr(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="예) 선한복지관"
                  className="w-52 px-3 py-2 border border-[#E4E0DC] rounded-lg text-[.83rem] outline-none focus:border-[#D85A3A]"
                />
              </div>
              {/* 구분 */}
              <div className="flex flex-col gap-1">
                <label className="text-[.72rem] font-bold text-[#8A8A8A] uppercase tracking-wide">구분</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Partner['type'])}
                  className="px-3 py-2 border border-[#E4E0DC] rounded-lg text-[.83rem] outline-none focus:border-[#D85A3A] bg-white h-[38px]"
                >
                  <option value="agency">제휴업체</option>
                  <option value="franchise">가맹점</option>
                  <option value="direct">직접영업</option>
                </select>
              </div>
              {/* 메모 */}
              <div className="flex flex-col gap-1">
                <label className="text-[.72rem] font-bold text-[#8A8A8A] uppercase tracking-wide">메모</label>
                <input
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="선택사항"
                  className="w-40 px-3 py-2 border border-[#E4E0DC] rounded-lg text-[.83rem] outline-none focus:border-[#D85A3A]"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={createPartner.isPending}
                className="px-5 py-2 bg-[#1A1A1A] text-white text-[.83rem] font-bold rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
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
                  {['코드', '업체명', '구분', '신청자', '상태', '등록일'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setDetailPartner(p)}
                    className="border-t border-[#F0EDE9] hover:bg-[#FAFAF9] cursor-pointer transition-colors"
                  >
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 상세 슬라이드 패널 */}
      {detailPartner && (
        <DetailPanel
          partner={detailPartner}
          stats={stats[detailPartner.code] ?? 0}
          onClose={() => setDetailPartner(null)}
          onToggle={() =>
            toggleActive.mutate(
              { id: detailPartner.id, is_active: !detailPartner.is_active },
              { onSuccess: () => setDetailPartner(null) },
            )
          }
          isToggling={toggleActive.isPending}
        />
      )}
    </>
  )
}
