'use client'

// ═══════════════════════════════════════════════════
//  장소 관리 패널 (어드민)
//  - 장소 목록 (활성/비활성 토글, 삭제)
//  - 단건 등록 폼
//  - CSV 대량 가져오기 (파싱 → 미리보기 → 등록)
//
//  CSV 형식 (쉼표 구분, 태그는 파이프(|)로 구분):
//  name,category,description,address,hours,closed_days,is_free,tags,image_url
// ═══════════════════════════════════════════════════
import { useState, useRef, useCallback } from 'react'
import {
  usePlacesAll,
  useCreatePlace,
  useBulkCreatePlaces,
  useTogglePlaceActive,
  useDeletePlace,
} from '../model/usePlacesAdmin'
import { PLACE_CATEGORIES } from '@/shared/types'
import type { PlaceInput, PlaceCategory } from '@/shared/types'

// ── CSV 파서 (외부 라이브러리 없음) ─────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseCSV(text: string): PlaceInput[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  // 헤더 제거 후 데이터 파싱
  return lines.slice(1).map((line) => {
    const [name, category, description, address, hours, closed_days, is_free_str, tags_str, image_url] =
      parseCSVLine(line)
    return {
      name:        name        ?? '',
      category:    (PLACE_CATEGORIES.includes(category as PlaceCategory)
                    ? category
                    : '기타') as PlaceCategory,
      description: description ?? '',
      address:     address     ?? '',
      hours:       hours       ?? '',
      closed_days: closed_days ?? '',
      is_free:     is_free_str?.toLowerCase() === 'true',
      tags:        tags_str ? tags_str.split('|').map((t) => t.trim()).filter(Boolean) : [],
      image_url:   image_url   ?? '',
      is_active:   true,
    }
  }).filter((p) => p.name.length > 0)
}

// ── CSV 템플릿 다운로드 ──────────────────────────────
function downloadTemplate() {
  const bom = '\uFEFF'
  const header = 'name,category,description,address,hours,closed_days,is_free,tags,image_url'
  const sample = '화정 어린이 도서관,도서관,어린이를 위한 전문 도서관입니다.,경기도 고양시 덕양구 화정로 30,09:00~18:00,월요일,true,영유아|무료|평일추천,'
  const csv = bom + [header, sample].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  a.download = 'places_template.csv'
  a.click()
}

// ── 기본 입력값 ──────────────────────────────────────
const EMPTY_FORM: PlaceInput = {
  name: '', category: '도서관', description: '',
  address: '', hours: '', closed_days: '',
  is_free: true, tags: [], image_url: '', is_active: true,
}

export function PlacesPanel() {
  const [open,        setOpen]        = useState(false)
  const [activeView,  setActiveView]  = useState<'list' | 'add' | 'csv'>('list')
  const [form,        setForm]        = useState<PlaceInput>(EMPTY_FORM)
  const [tagInput,    setTagInput]    = useState('')
  const [csvRows,     setCsvRows]     = useState<PlaceInput[]>([])
  const [csvError,    setCsvError]    = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: places = [], isLoading } = usePlacesAll()
  const createPlace       = useCreatePlace()
  const bulkCreate        = useBulkCreatePlaces()
  const toggleActive      = useTogglePlaceActive()
  const deletePlace       = useDeletePlace()

  // ── 단건 등록 제출 ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.address.trim()) {
      alert('장소명과 주소는 필수입니다.')
      return
    }
    try {
      await createPlace.mutateAsync(form)
      setForm(EMPTY_FORM)
      setTagInput('')
      setActiveView('list')
    } catch {
      alert('등록 중 오류가 발생했습니다.')
    }
  }

  // ── 태그 추가/삭제 ─────────────────────────────────
  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }))
    }
    setTagInput('')
  }
  const removeTag = (tag: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))

  // ── CSV 파일 선택 ──────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const rows = parseCSV(text)
        if (rows.length === 0) {
          setCsvError('파싱된 데이터가 없습니다. 템플릿 형식을 확인해주세요.')
        } else {
          setCsvRows(rows)
        }
      } catch {
        setCsvError('파일 파싱 중 오류가 발생했습니다.')
      }
    }
    reader.readAsText(file, 'UTF-8')
    // input 초기화 (같은 파일 재선택 허용)
    e.target.value = ''
  }, [])

  // ── CSV 일괄 등록 확인 ─────────────────────────────
  const handleBulkCreate = async () => {
    if (csvRows.length === 0) return
    try {
      const count = await bulkCreate.mutateAsync(csvRows)
      alert(`${count}건 등록 완료!`)
      setCsvRows([])
      setActiveView('list')
    } catch {
      alert('일괄 등록 중 오류가 발생했습니다.')
    }
  }

  return (
    <section className="mb-6 bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-[.95rem] font-bold text-[#1A1A1A]">📍 장소 관리</span>
          <span className="text-[.75rem] text-[#8A8A8A]">총 {places.length}건</span>
        </div>
        <span className="text-[#8A8A8A] text-[.85rem]">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="border-t border-[#EBEBEB]">
          {/* 서브 탭 */}
          <div className="flex items-center gap-0 px-5 pt-4 pb-0 border-b border-[#EBEBEB]">
            {(['list', 'add', 'csv'] as const).map((view) => {
              const labels = { list: '목록', add: '+ 장소 추가', csv: '↑ CSV 가져오기' }
              return (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 text-[.82rem] font-medium border-b-2 transition-colors ${
                    activeView === view
                      ? 'border-[#D85A3A] text-[#D85A3A]'
                      : 'border-transparent text-[#666] hover:text-[#333]'
                  }`}
                >
                  {labels[view]}
                </button>
              )
            })}
          </div>

          {/* ── 목록 뷰 ────────────────────────────────── */}
          {activeView === 'list' && (
            <div className="p-5">
              {isLoading ? (
                <p className="text-[.85rem] text-[#8A8A8A] py-8 text-center">불러오는 중…</p>
              ) : places.length === 0 ? (
                <p className="text-[.85rem] text-[#8A8A8A] py-8 text-center">
                  등록된 장소가 없습니다.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[.8rem]">
                    <thead>
                      <tr className="border-b border-[#F0F0F0] text-[#8A8A8A]">
                        {['장소명', '카테고리', '주소', '무료', '활성', '삭제'].map((h) => (
                          <th key={h} className="text-left px-2 py-2 font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {places.map((place) => (
                        <tr key={place.id} className="border-b border-[#F7F7F7] hover:bg-[#FAFAFA]">
                          <td className="px-2 py-2.5 font-medium text-[#1A1A1A] max-w-[160px] truncate">
                            {place.name}
                          </td>
                          <td className="px-2 py-2.5 text-[#555] whitespace-nowrap">
                            {place.category}
                          </td>
                          <td className="px-2 py-2.5 text-[#555] max-w-[200px] truncate">
                            {place.address}
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            {place.is_free ? '✓' : '–'}
                          </td>
                          <td className="px-2 py-2.5">
                            <button
                              onClick={() => toggleActive.mutate({ id: place.id, is_active: !place.is_active })}
                              className={`w-9 h-5 rounded-full transition-colors ${
                                place.is_active ? 'bg-[#4CAF50]' : 'bg-[#CCC]'
                              }`}
                            >
                              <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${
                                place.is_active ? 'translate-x-4' : 'translate-x-0'
                              }`} />
                            </button>
                          </td>
                          <td className="px-2 py-2.5">
                            <button
                              onClick={() => {
                                if (window.confirm(`'${place.name}'을 삭제하시겠습니까?`)) {
                                  deletePlace.mutate(place.id)
                                }
                              }}
                              className="text-[#C04848] hover:text-[#8B0000] text-[.8rem]"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── 단건 등록 폼 ────────────────────────────── */}
          {activeView === 'add' && (
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 장소명 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[.78rem] text-[#555] font-medium">장소명 *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="예: 화정 어린이 도서관"
                    className="border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A]"
                    required
                  />
                </div>
                {/* 카테고리 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[.78rem] text-[#555] font-medium">카테고리</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as PlaceCategory }))}
                    className="border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A]"
                  >
                    {PLACE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {/* 주소 */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[.78rem] text-[#555] font-medium">주소 *</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="예: 경기도 고양시 덕양구 화정로 30"
                    className="border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A]"
                    required
                  />
                </div>
                {/* 설명 */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[.78rem] text-[#555] font-medium">소개</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="장소 소개글을 입력하세요."
                    rows={2}
                    className="border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A] resize-none"
                  />
                </div>
                {/* 운영시간 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[.78rem] text-[#555] font-medium">운영시간</label>
                  <input
                    value={form.hours}
                    onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                    placeholder="예: 평일 09:00~18:00"
                    className="border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A]"
                  />
                </div>
                {/* 휴관일 */}
                <div className="flex flex-col gap-1">
                  <label className="text-[.78rem] text-[#555] font-medium">휴관일</label>
                  <input
                    value={form.closed_days}
                    onChange={(e) => setForm((f) => ({ ...f, closed_days: e.target.value }))}
                    placeholder="예: 월요일, 공휴일"
                    className="border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A]"
                  />
                </div>
                {/* 이미지 URL */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[.78rem] text-[#555] font-medium">이미지 URL</label>
                  <input
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://..."
                    className="border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A]"
                  />
                </div>
                {/* 무료 여부 */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={form.is_free}
                    onChange={(e) => setForm((f) => ({ ...f, is_free: e.target.checked }))}
                    className="w-4 h-4 accent-[#D85A3A]"
                  />
                  <label htmlFor="is_free" className="text-[.85rem] text-[#555]">무료 입장</label>
                </div>
                {/* 태그 */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[.78rem] text-[#555] font-medium">태그</label>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      placeholder="태그 입력 후 엔터 (예: 영유아)"
                      className="flex-1 border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A]"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-[#F5F5F5] text-[#555] rounded-lg text-[.82rem] hover:bg-[#EBEBEB]"
                    >
                      추가
                    </button>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[.72rem] px-2 py-0.5 bg-[#F5F5F5] rounded-full text-[#555] flex items-center gap-1"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-[#AAA] hover:text-[#555]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={createPlace.isPending}
                  className="px-5 py-2 bg-[#D85A3A] text-white rounded-lg text-[.85rem] font-semibold hover:bg-[#C04828] disabled:opacity-50"
                >
                  {createPlace.isPending ? '등록 중…' : '장소 등록'}
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(EMPTY_FORM); setActiveView('list') }}
                  className="px-5 py-2 bg-[#F5F5F5] text-[#555] rounded-lg text-[.85rem] hover:bg-[#EBEBEB]"
                >
                  취소
                </button>
              </div>
            </form>
          )}

          {/* ── CSV 가져오기 ─────────────────────────────── */}
          {activeView === 'csv' && (
            <div className="p-5 flex flex-col gap-4">
              {/* 안내 + 템플릿 */}
              <div className="bg-[#F7F5F3] rounded-xl p-4 text-[.8rem] text-[#555] flex flex-col gap-1">
                <p className="font-semibold text-[#333]">CSV 형식 안내</p>
                <p>헤더: <code className="bg-white px-1 rounded text-[.75rem]">name, category, description, address, hours, closed_days, is_free, tags, image_url</code></p>
                <p>· <strong>category</strong>: 도서관 | 공원 | 문화센터 | 기타</p>
                <p>· <strong>is_free</strong>: true 또는 false</p>
                <p>· <strong>tags</strong>: 파이프(|)로 구분 — 예: 영유아|무료|평일추천</p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 self-start px-3 py-1.5 border border-[#DDD] rounded-lg text-[.78rem] bg-white hover:bg-[#FAFAFA] text-[#555]"
                >
                  📥 템플릿 다운로드
                </button>
              </div>

              {/* 파일 업로드 */}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2.5 border-2 border-dashed border-[#DDD] rounded-xl text-[.85rem] text-[#666] hover:border-[#D85A3A] hover:text-[#D85A3A] w-full transition-colors"
                >
                  📂 CSV 파일 선택
                </button>
                {csvError && (
                  <p className="mt-2 text-[.78rem] text-[#C04848]">{csvError}</p>
                )}
              </div>

              {/* 미리보기 */}
              {csvRows.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[.82rem] font-medium text-[#333]">
                    미리보기 — {csvRows.length}건 파싱됨
                    <span className="text-[#8A8A8A] font-normal ml-1">(처음 5건 표시)</span>
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[.75rem] border border-[#EBEBEB] rounded-lg overflow-hidden">
                      <thead className="bg-[#F7F7F7]">
                        <tr>
                          {['장소명', '카테고리', '주소', '운영시간', '무료', '태그'].map((h) => (
                            <th key={h} className="px-2 py-2 text-left font-medium text-[#555] whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t border-[#F0F0F0]">
                            <td className="px-2 py-2 max-w-[120px] truncate">{row.name}</td>
                            <td className="px-2 py-2 whitespace-nowrap">{row.category}</td>
                            <td className="px-2 py-2 max-w-[150px] truncate">{row.address}</td>
                            <td className="px-2 py-2 whitespace-nowrap">{row.hours}</td>
                            <td className="px-2 py-2 text-center">{row.is_free ? '✓' : '–'}</td>
                            <td className="px-2 py-2">{row.tags.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkCreate}
                      disabled={bulkCreate.isPending}
                      className="px-5 py-2 bg-[#D85A3A] text-white rounded-lg text-[.85rem] font-semibold hover:bg-[#C04828] disabled:opacity-50"
                    >
                      {bulkCreate.isPending ? '등록 중…' : `${csvRows.length}건 일괄 등록`}
                    </button>
                    <button
                      onClick={() => setCsvRows([])}
                      className="px-4 py-2 bg-[#F5F5F5] text-[#555] rounded-lg text-[.85rem] hover:bg-[#EBEBEB]"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
