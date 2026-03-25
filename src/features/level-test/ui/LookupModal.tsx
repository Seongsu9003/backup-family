'use client'

// ═══════════════════════════════════════════════════
//  내 결과 이어보기 모달
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { useLookupResult } from '../model/useLookupResult'
import type { ExistingResult } from '../model/types'

interface Props {
  onSelect: (result: ExistingResult) => void
  onClose: () => void
}

export function LookupModal({ onSelect, onClose }: Props) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const { lookupState, search, reset } = useLookupResult()

  const handleSearch = () => search(name, contact)
  const handleClose = () => { reset(); onClose() }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-5"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-[460px] shadow-2xl animate-[fadeUp_.2s_ease] max-h-[92svh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3.5 border-b border-[#E4E0DC] shrink-0">
          <h3 className="text-base font-bold text-[#1A1A1A]">내 결과 이어보기</h3>
          {/* 터치타겟 44px 확보 */}
          <button
            onClick={handleClose}
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#8A8A8A] hover:bg-[#E4E0DC] hover:text-[#1A1A1A] transition-colors text-base -mr-2"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 바디 — 스크롤 가능 */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1 pb-[env(safe-area-inset-bottom,20px)]">
          <p className="text-[.86rem] text-[#8A8A8A] mb-3.5 leading-[1.55]">
            이름과 휴대폰 번호를 함께 입력하면 저장된 결과를 불러옵니다.<br />
            서류 첨부나 결과 확인을 이어서 진행할 수 있습니다.
          </p>

          <div className="flex flex-col gap-2 mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              placeholder="이름 입력 (예: 홍길동)"
              className="w-full px-3 py-2.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.9rem] outline-none focus:border-[#D85A3A] transition-colors bg-[#FAFAFA]"
            />
            <div className="flex gap-2">
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                placeholder="휴대폰 번호 (예: 010-1234-5678)"
                className="flex-1 min-w-0 px-3 py-2.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.9rem] outline-none focus:border-[#D85A3A] transition-colors bg-[#FAFAFA]"
              />
              <button
                onClick={handleSearch}
                disabled={lookupState.isLoading}
                className="shrink-0 w-16 py-2.5 bg-[#D85A3A] text-white text-[.86rem] font-bold rounded-lg hover:bg-[#C04830] disabled:opacity-50 transition-colors"
              >
                {lookupState.isLoading ? '…' : '검색'}
              </button>
            </div>
          </div>

          {/* 결과 목록 */}
          <div>
            {lookupState.isLoading && (
              <div className="text-center py-7 text-[#8A8A8A] text-[.88rem]">조회 중…</div>
            )}
            {lookupState.error && (
              <div className="text-center py-7 text-[#8A8A8A] text-[.88rem]">{lookupState.error}</div>
            )}
            {lookupState.searched && !lookupState.isLoading && !lookupState.error && lookupState.results.length === 0 && (
              <div className="text-center py-7 text-[#8A8A8A] text-[.88rem]">
                이름과 휴대폰 번호가 일치하는 결과가 없습니다.
              </div>
            )}
            {lookupState.results.map((r, i) => {
              const exp = new Date(r.meta.expires_at)
              const expired = exp < new Date()
              const expStr = exp.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
              return (
                <div
                  key={i}
                  onClick={() => { onSelect(r); handleClose() }}
                  className="flex items-center justify-between px-3.5 py-3 border-[1.5px] border-[#E4E0DC] rounded-xl mb-2 cursor-pointer hover:border-[#F0A090] hover:bg-[#FAE8E3] transition-all"
                >
                  <div>
                    <div className="font-bold text-[.92rem] text-[#1A1A1A]">
                      {r.tester?.name} · {r.level?.label || '-'}
                    </div>
                    <div className="text-[.76rem] text-[#8A8A8A] mt-0.5">
                      {r.certification?.status} · {r.score?.total || 0}점
                    </div>
                  </div>
                  <div className="text-[.76rem] text-[#8A8A8A] text-right">
                    {expired
                      ? <span className="text-[#C04848]">만료됨</span>
                      : <>{expStr}까지</>
                    }<br />
                    <span className="text-[.72rem]">
                      {new Date(r.meta.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
