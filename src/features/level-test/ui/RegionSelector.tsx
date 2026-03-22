'use client'

// ═══════════════════════════════════════════════════
//  시도 / 시군구 캐스케이딩 셀렉터 + 선택 지역 칩
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import { REGIONS } from '../model/constants'

interface Props {
  selectedRegions: string[]
  onAddRegion: (label: string) => void
  onRemoveRegion: (label: string) => void
}

export function RegionSelector({ selectedRegions, onAddRegion, onRemoveRegion }: Props) {
  const [sido, setSido] = useState('')
  const [sigungu, setSigungu] = useState('')

  const handleAdd = () => {
    if (selectedRegions.length >= 3) {
      alert('최대 3개 지역까지 선택할 수 있습니다.')
      return
    }
    if (!sido || !sigungu) return
    const label = `${sido} ${sigungu}`
    if (selectedRegions.includes(label)) {
      alert('이미 선택된 지역입니다.')
      return
    }
    onAddRegion(label)
    setSido('')
    setSigungu('')
  }

  return (
    <div className="mb-4">
      <label className="text-[.83rem] font-semibold text-[#4A4A4A]">
        선호 활동 지역{' '}
        <span className="text-[.83rem] font-normal text-[#8A8A8A]">(선택 · 최대 3개)</span>
      </label>

      {/* 셀렉터 행 */}
      <div className="flex gap-2 mt-1.5 mb-2 flex-wrap">
        <select
          value={sido}
          onChange={(e) => { setSido(e.target.value); setSigungu('') }}
          className="flex-1 min-w-[120px] px-2.5 py-2 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.86rem] bg-[#FAFAFA] outline-none cursor-pointer focus:border-[#D85A3A] transition-colors"
        >
          <option value="">시 / 도 선택</option>
          {Object.keys(REGIONS).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={sigungu}
          onChange={(e) => setSigungu(e.target.value)}
          disabled={!sido}
          className="flex-1 min-w-[120px] px-2.5 py-2 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.86rem] bg-[#FAFAFA] outline-none cursor-pointer focus:border-[#D85A3A] transition-colors disabled:opacity-50"
        >
          <option value="">시 / 군 / 구 선택</option>
          {(REGIONS[sido] || []).map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <button
          onClick={handleAdd}
          disabled={!sido || !sigungu}
          className="px-3.5 py-2 bg-[#D85A3A] text-white text-[.84rem] font-bold rounded-lg hover:bg-[#C04830] disabled:opacity-40 whitespace-nowrap transition-colors"
        >
          추가
        </button>
      </div>

      {/* 선택된 지역 칩 */}
      <div className="flex flex-wrap gap-[7px] min-h-0">
        {selectedRegions.map((r) => (
          <span
            key={r}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAE8E3] border border-[#F0A090] rounded-full text-[.8rem] font-semibold text-[#C04830]"
          >
            {r}
            <button
              onClick={() => onRemoveRegion(r)}
              className="text-[#D85A3A] text-[.82rem] leading-none"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {selectedRegions.length < 3 && (
        <span className="text-[.76rem] text-[#8A8A8A] mt-1.5 block">
          선택한 지역이 구직 Pool에서 매칭에 활용됩니다.
        </span>
      )}
    </div>
  )
}
