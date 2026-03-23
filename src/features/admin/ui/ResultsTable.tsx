'use client'

import type { TestResult } from '@/shared/types'
import {
  TabKey, TAB_LABELS, getTabResults,
  isExpired, isExpiringSoon, fmtDate,
} from '../model/types'

// ── 뱃지 헬퍼 ─────────────────────────────────
const CERT_STYLE: Record<string, string> = {
  '미인증': 'bg-[#F7F5F3] text-[#8A8A8A] border border-[#E4E0DC]',
  '검토중': 'bg-[#FFF8E1] text-[#B07D00]',
  '인증완료': 'bg-[#D5F5E3] text-[#1A7A45]',
  '반려':   'bg-[#FDECEA] text-[#C62828]',
}
function CertBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[.72rem] font-semibold ${CERT_STYLE[status] ?? CERT_STYLE['미인증']}`}>
      {status}
    </span>
  )
}

function JobTag({ val }: { val: string }) {
  if (val === '적극적으로 구직 중')   return <span className="px-2 py-0.5 rounded-full text-[.72rem] font-semibold bg-[#DDF0EE] text-[#1A7A72]">적극 구직</span>
  if (val === '관심은 있지만 탐색 중') return <span className="px-2 py-0.5 rounded-full text-[.72rem] font-semibold bg-[#FFF8E1] text-[#B07D00]">탐색 중</span>
  return <span className="px-2 py-0.5 rounded-full text-[.72rem] font-semibold bg-[#F7F5F3] text-[#8A8A8A]">의사 없음</span>
}

// ── 탭 버튼 ───────────────────────────────────
interface TabBtnProps {
  tabKey: TabKey
  label: string
  count: number
  active: boolean
  onClick: () => void
}
function TabBtn({ label, count, active, onClick }: TabBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-[.82rem] font-semibold whitespace-nowrap border-b-2 transition-colors
        ${active
          ? 'border-[#D85A3A] text-[#D85A3A]'
          : 'border-transparent text-[#8A8A8A] hover:text-[#4A4A4A]'}`}
    >
      {label} <span className={`ml-1 text-[.72rem] ${active ? 'text-[#D85A3A]' : 'text-[#AAAAAA]'}`}>{count}</span>
    </button>
  )
}

// ── ResultsTable ───────────────────────────────
interface Props {
  results:         TestResult[]
  activeTab:       TabKey
  onTabChange:     (tab: TabKey) => void
  onRowClick:      (r: TestResult) => void
  onExportCSV:     () => void
  // ── 일괄 처리 (OPS) ──
  selectedIds:     Set<string>
  onToggleSelect:  (testId: string) => void
  onToggleAll:     (ids: string[]) => void
  onBulkCertify:   () => void
  isBulkLoading:   boolean
}

const ALL_TABS: TabKey[] = ['all','pending','certified','uncertified','rejected','job_pool','expiring']

export function ResultsTable({
  results, activeTab, onTabChange, onRowClick, onExportCSV,
  selectedIds, onToggleSelect, onToggleAll, onBulkCertify, isBulkLoading,
}: Props) {
  const tabResults    = getTabResults(results, activeTab)
  const tabIds        = tabResults.map((r) => r.meta.test_id)
  const selectedCount = selectedIds.size
  // 현재 탭 기준 전체 선택 여부
  const allChecked    = tabIds.length > 0 && tabIds.every((id) => selectedIds.has(id))
  const someChecked   = !allChecked && tabIds.some((id) => selectedIds.has(id))

  return (
    <div className="bg-white border border-[#E4E0DC] rounded-2xl overflow-hidden">
      {/* 탭 바 */}
      <div className="flex overflow-x-auto border-b border-[#E4E0DC] px-2">
        {ALL_TABS.map((key) => (
          <TabBtn
            key={key}
            tabKey={key}
            label={TAB_LABELS[key]}
            count={getTabResults(results, key).length}
            active={activeTab === key}
            onClick={() => onTabChange(key)}
          />
        ))}
      </div>

      {/* 테이블 헤더 행 */}
      <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap border-b border-[#E4E0DC]">
        <h2 className="text-[.95rem] font-bold text-[#1A1A1A]">{TAB_LABELS[activeTab]}</h2>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onExportCSV}
            className="px-3 py-1.5 text-[.8rem] font-semibold border border-[#E4E0DC] rounded-lg text-[#4A4A4A] hover:border-[#D85A3A] hover:text-[#D85A3A] transition-colors"
          >
            CSV 내보내기
          </button>
        </div>
      </div>

      {/* ── 일괄 처리 액션 바 (선택 시 표시) ── */}
      {selectedCount > 0 && (
        <div className="px-6 py-3 bg-[#FFF8F6] border-b border-[#F5D5CC] flex items-center gap-3">
          <span className="text-[.83rem] font-semibold text-[#D85A3A]">
            {selectedCount}건 선택됨
          </span>
          <button
            onClick={onBulkCertify}
            disabled={isBulkLoading}
            className="px-4 py-1.5 bg-[#D85A3A] text-white text-[.8rem] font-bold rounded-lg hover:bg-[#C04830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBulkLoading ? '처리 중…' : '일괄 인증완료'}
          </button>
          <button
            onClick={() => onToggleAll([])}
            className="px-3 py-1.5 text-[.8rem] font-semibold border border-[#E4E0DC] rounded-lg text-[#8A8A8A] hover:text-[#4A4A4A] transition-colors"
          >
            선택 해제
          </button>
        </div>
      )}

      {/* 테이블 */}
      {tabResults.length === 0 ? (
        <div className="py-16 text-center text-[#8A8A8A] text-sm">해당하는 데이터가 없습니다.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[.83rem]">
            <thead>
              <tr className="bg-[#F7F5F3] text-[#8A8A8A] text-[.72rem] font-bold uppercase tracking-wide">
                {/* 전체 선택 체크박스 */}
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked }}
                    onChange={() => onToggleAll(allChecked ? [] : tabIds)}
                    className="w-4 h-4 accent-[#D85A3A] cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
                {['이름','레벨','총점','인증 상태','구직 여부','돌봄 타입','선호 지역','서류','테스트 일자','만료일'].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabResults.map((r) => {
                const expired   = isExpired(r)
                const expiring  = isExpiringSoon(r)
                const expColor  = expired ? 'text-red-600' : expiring ? 'text-[#E65100]' : 'text-[#4A4A4A]'
                const regions   = r.tester?.preferred_region || []
                const docsLen   = r.certification?.docs_attached?.length || 0
                const isChecked = selectedIds.has(r.meta.test_id)

                return (
                  <tr
                    key={r.meta.test_id}
                    onClick={() => onRowClick(r)}
                    className={`border-t border-[#F0EDE9] cursor-pointer transition-colors
                      ${isChecked ? 'bg-[#FFF8F6]' : 'hover:bg-[#FAFAF9]'}`}
                  >
                    {/* 행 체크박스 */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelect(r.meta.test_id)}
                        className="w-4 h-4 accent-[#D85A3A] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#1A1A1A]">{r.tester?.name || '익명'}</div>
                      <div className="text-[.72rem] text-[#8A8A8A]">{r.tester?.contact || ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[.78rem] font-semibold">{r.level?.label || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <strong>{r.score?.total || 0}</strong>
                      <span className="text-[#8A8A8A]">/100</span>
                    </td>
                    <td className="px-4 py-3"><CertBadge status={r.certification?.status} /></td>
                    <td className="px-4 py-3"><JobTag val={r.job_seeking} /></td>
                    <td className="px-4 py-3">
                      {r.care_type ? (
                        <span
                          className="px-2 py-0.5 rounded-full text-[.72rem] font-bold text-white"
                          style={{ background: r.care_type.color || '#888' }}
                        >
                          {r.care_type.label}
                        </span>
                      ) : <span className="text-[#AAAAAA] text-[.72rem]">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {regions.length > 0
                          ? regions.map(rg => (
                              <span key={rg} className="bg-[#F7F5F3] border border-[#E4E0DC] rounded px-1.5 py-0.5 text-[.7rem]">{rg}</span>
                            ))
                          : <span className="text-[#AAAAAA] text-[.72rem]">미입력</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {docsLen > 0
                        ? <span className="text-[#3A9E94] font-semibold">{docsLen}건</span>
                        : <span className="text-[#AAAAAA]">없음</span>}
                    </td>
                    <td className="px-4 py-3 text-[#8A8A8A]">{fmtDate(r.meta?.created_at)}</td>
                    <td className={`px-4 py-3 font-semibold ${expColor}`}>
                      {fmtDate(r.meta?.expires_at)}
                      {expired && <div className="text-[.68rem]">만료됨</div>}
                      {!expired && expiring && <div className="text-[.68rem]">7일 이내 만료</div>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
