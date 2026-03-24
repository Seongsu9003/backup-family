'use client'

// ═══════════════════════════════════════════════════
//  장소 관리 패널 (어드민)
//  - 장소 목록 (활성/비활성 토글, 삭제)
//  - 단건 등록 폼
//  - CSV 대량 가져오기 (파싱 → 미리보기 → 등록)
//
//  CSV 컬럼 순서 (사용자 데이터 형식 기준):
//  place_name, region_1, region_2, address, specialty,
//  facilities, opening_hours, closed_days, parking_available,
//  phone_number, website_url [, category, is_free, tags, image_url]
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

  return lines.slice(1).map((line) => {
    const cols = parseCSVLine(line)
    // 순서: place_name, region_1, region_2, address, specialty,
    //       facilities, opening_hours, closed_days, parking_available,
    //       phone_number, website_url [, category, is_free, tags, image_url]
    const [
      place_name   = '',
      region_1     = '',
      region_2     = '',
      address      = '',
      specialty    = '',
      facilities   = '',
      opening_hours = '',
      closed_days  = '',
      parking      = '',
      phone        = '',
      website      = '',
      category_raw = '',
      is_free_raw  = 'true',
      tags_raw     = '',
      image_url    = '',
    ] = cols

    return {
      name:        place_name,
      region_1,
      region_2,
      address,
      description: specialty,
      facilities,
      hours:       opening_hours,
      closed_days,
      parking,
      phone,
      website,
      category:    (PLACE_CATEGORIES.includes(category_raw as PlaceCategory)
                    ? category_raw
                    : '도서관') as PlaceCategory,
      is_free:     is_free_raw.toLowerCase() !== 'false',
      tags:        tags_raw ? tags_raw.split('|').map((t) => t.trim()).filter(Boolean) : [],
      image_url,
      is_active:   true,
    }
  }).filter((p) => p.name.length > 0)
}

// ── CSV 템플릿 다운로드 ──────────────────────────────
function downloadTemplate() {
  const bom = '\uFEFF'
  const header = 'place_name,region_1,region_2,address,specialty,facilities,opening_hours,closed_days,parking_available,phone_number,website_url,category,is_free,tags,image_url'
  const sample = '화정 어린이 도서관,경기도,고양시 덕양구,경기도 고양시 덕양구 화정로 30,영유아 전용 프로그램,수유실·유아놀이터,09:00~18:00,월요일·공휴일,가능 (무료),031-000-0000,https://example.com,도서관,true,영유아|평일추천,'
  const csv = bom + [header, sample].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  a.download = 'places_template.csv'
  a.click()
}

// ── 기본 입력값 ──────────────────────────────────────
const EMPTY_FORM: PlaceInput = {
  name: '', region_1: '', region_2: '', address: '',
  category: '도서관', description: '', facilities: '',
  hours: '', closed_days: '', parking: '', phone: '',
  website: '', tags: [], is_free: true, image_url: '', is_active: true,
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
  const createPlace  = useCreatePlace()
  const bulkCreate   = useBulkCreatePlaces()
  const toggleActive = useTogglePlaceActive()
  const deletePlace  = useDeletePlace()

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
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`등록 중 오류가 발생했습니다.\n\n${msg}`)
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
    e.target.value = ''
  }, [])

  // ── CSV 일괄 등록 ──────────────────────────────────
  const handleBulkCreate = async () => {
    if (csvRows.length === 0) return
    try {
      const count = await bulkCreate.mutateAsync(csvRows)
      alert(`${count}건 등록 완료!`)
      setCsvRows([])
      setActiveView('list')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`일괄 등록 중 오류가 발생했습니다.\n\n${msg}`)
    }
  }

  const field = (label: string, el: React.ReactNode, span2 = false) => (
    <div className={`flex flex-col gap-1 ${span2 ? 'sm:col-span-2' : ''}`}>
      <label className="text-[.78rem] text-[#555] font-medium">{label}</label>
      {el}
    </div>
  )
  const input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className="border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A]"
    />
  )

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

          {/* ── 목록 뷰 ── */}
          {activeView === 'list' && (
            <div className="p-5">
              {isLoading ? (
                <p className="text-[.85rem] text-[#8A8A8A] py-8 text-center">불러오는 중…</p>
              ) : places.length === 0 ? (
                <p className="text-[.85rem] text-[#8A8A8A] py-8 text-center">등록된 장소가 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[.8rem]">
                    <thead>
                      <tr className="border-b border-[#F0F0F0] text-[#8A8A8A]">
                        {['장소명', '지역', '카테고리', '주소', '전화', '활성', '삭제'].map((h) => (
                          <th key={h} className="text-left px-2 py-2 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {places.map((place) => (
                        <tr key={place.id} className="border-b border-[#F7F7F7] hover:bg-[#FAFAFA]">
                          <td className="px-2 py-2.5 font-medium text-[#1A1A1A] max-w-[150px] truncate">{place.name}</td>
                          <td className="px-2 py-2.5 text-[#555] whitespace-nowrap">
                            {[place.region_1, place.region_2].filter(Boolean).join(' ')}
                          </td>
                          <td className="px-2 py-2.5 text-[#555] whitespace-nowrap">{place.category}</td>
                          <td className="px-2 py-2.5 text-[#555] max-w-[180px] truncate">{place.address}</td>
                          <td className="px-2 py-2.5 text-[#555] whitespace-nowrap">{place.phone || '–'}</td>
                          <td className="px-2 py-2.5">
                            <button
                              onClick={() => toggleActive.mutate({ id: place.id, is_active: !place.is_active })}
                              className={`w-9 h-5 rounded-full transition-colors ${place.is_active ? 'bg-[#4CAF50]' : 'bg-[#CCC]'}`}
                            >
                              <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${place.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
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

          {/* ── 단건 등록 폼 ── */}
          {activeView === 'add' && (
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('장소명 *', input({ value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })), placeholder: '예: 화정 어린이 도서관', required: true }))}
                {field('카테고리', (
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as PlaceCategory }))} className="border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A]">
                    {PLACE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ))}
                {field('시/도', input({ value: form.region_1, onChange: (e) => setForm((f) => ({ ...f, region_1: e.target.value })), placeholder: '예: 서울특별시' }))}
                {field('구/군', input({ value: form.region_2, onChange: (e) => setForm((f) => ({ ...f, region_2: e.target.value })), placeholder: '예: 종로구' }))}
                {field('주소 *', input({ value: form.address, onChange: (e) => setForm((f) => ({ ...f, address: e.target.value })), placeholder: '상세 주소', required: true }), true)}
                {field('특화 분야 (specialty)', input({ value: form.description, onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })), placeholder: '예: 영유아 전용 프로그램, 수유실' }), true)}
                {field('시설 정보', input({ value: form.facilities, onChange: (e) => setForm((f) => ({ ...f, facilities: e.target.value })), placeholder: '예: 수유실·유아놀이터·독서실' }), true)}
                {field('운영시간', input({ value: form.hours, onChange: (e) => setForm((f) => ({ ...f, hours: e.target.value })), placeholder: '예: 평일 09:00~18:00' }))}
                {field('휴관일', input({ value: form.closed_days, onChange: (e) => setForm((f) => ({ ...f, closed_days: e.target.value })), placeholder: '예: 매주 월요일, 공휴일' }))}
                {field('주차', input({ value: form.parking, onChange: (e) => setForm((f) => ({ ...f, parking: e.target.value })), placeholder: '예: 가능 (유료)' }))}
                {field('전화번호', input({ value: form.phone, onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value })), placeholder: '예: 02-000-0000' }))}
                {field('홈페이지 URL', input({ value: form.website, onChange: (e) => setForm((f) => ({ ...f, website: e.target.value })), placeholder: 'https://...' }))}
                {field('이미지 URL', input({ value: form.image_url, onChange: (e) => setForm((f) => ({ ...f, image_url: e.target.value })), placeholder: 'https://...' }), true)}
                <div className="flex items-center gap-2 sm:col-span-2">
                  <input type="checkbox" id="is_free" checked={form.is_free} onChange={(e) => setForm((f) => ({ ...f, is_free: e.target.checked }))} className="w-4 h-4 accent-[#D85A3A]" />
                  <label htmlFor="is_free" className="text-[.85rem] text-[#555]">무료 입장</label>
                </div>
                {field('태그', (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} placeholder="태그 입력 후 엔터 (예: 영유아)" className="flex-1 border border-[#DDD] rounded-lg px-3 py-2 text-[.85rem] focus:outline-none focus:border-[#D85A3A]" />
                      <button type="button" onClick={addTag} className="px-3 py-2 bg-[#F5F5F5] text-[#555] rounded-lg text-[.82rem] hover:bg-[#EBEBEB]">추가</button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {form.tags.map((tag) => (
                          <span key={tag} className="text-[.72rem] px-2 py-0.5 bg-[#F5F5F5] rounded-full text-[#555] flex items-center gap-1">
                            #{tag}
                            <button type="button" onClick={() => removeTag(tag)} className="text-[#AAA] hover:text-[#555]">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ), true)}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={createPlace.isPending} className="px-5 py-2 bg-[#D85A3A] text-white rounded-lg text-[.85rem] font-semibold hover:bg-[#C04828] disabled:opacity-50">
                  {createPlace.isPending ? '등록 중…' : '장소 등록'}
                </button>
                <button type="button" onClick={() => { setForm(EMPTY_FORM); setActiveView('list') }} className="px-5 py-2 bg-[#F5F5F5] text-[#555] rounded-lg text-[.85rem] hover:bg-[#EBEBEB]">취소</button>
              </div>
            </form>
          )}

          {/* ── CSV 가져오기 ── */}
          {activeView === 'csv' && (
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-[#F7F5F3] rounded-xl p-4 text-[.8rem] text-[#555] flex flex-col gap-1">
                <p className="font-semibold text-[#333]">CSV 컬럼 순서</p>
                <p className="font-mono text-[.72rem] bg-white rounded px-2 py-1 leading-relaxed">
                  place_name, region_1, region_2, address, specialty, facilities,<br/>
                  opening_hours, closed_days, parking_available, phone_number, website_url<br/>
                  <span className="text-[#8A8A8A]">[선택: category, is_free, tags(파이프구분), image_url]</span>
                </p>
                <p className="mt-1">· category 미입력 시 <strong>도서관</strong>으로 자동 설정</p>
                <p>· is_free 미입력 시 <strong>true</strong>로 자동 설정</p>
                <button onClick={downloadTemplate} className="mt-2 self-start px-3 py-1.5 border border-[#DDD] rounded-lg text-[.78rem] bg-white hover:bg-[#FAFAFA] text-[#555]">
                  📥 템플릿 다운로드
                </button>
              </div>

              <div>
                <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="px-4 py-2.5 border-2 border-dashed border-[#DDD] rounded-xl text-[.85rem] text-[#666] hover:border-[#D85A3A] hover:text-[#D85A3A] w-full transition-colors">
                  📂 CSV 파일 선택
                </button>
                {csvError && <p className="mt-2 text-[.78rem] text-[#C04848]">{csvError}</p>}
              </div>

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
                          {['장소명', '지역', '주소', '운영시간', '전화', '무료'].map((h) => (
                            <th key={h} className="px-2 py-2 text-left font-medium text-[#555] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t border-[#F0F0F0]">
                            <td className="px-2 py-2 max-w-[130px] truncate">{row.name}</td>
                            <td className="px-2 py-2 whitespace-nowrap">{[row.region_1, row.region_2].filter(Boolean).join(' ')}</td>
                            <td className="px-2 py-2 max-w-[150px] truncate">{row.address}</td>
                            <td className="px-2 py-2 whitespace-nowrap">{row.hours}</td>
                            <td className="px-2 py-2 whitespace-nowrap">{row.phone}</td>
                            <td className="px-2 py-2 text-center">{row.is_free ? '✓' : '–'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleBulkCreate} disabled={bulkCreate.isPending} className="px-5 py-2 bg-[#D85A3A] text-white rounded-lg text-[.85rem] font-semibold hover:bg-[#C04828] disabled:opacity-50">
                      {bulkCreate.isPending ? '등록 중…' : `${csvRows.length}건 일괄 등록`}
                    </button>
                    <button onClick={() => setCsvRows([])} className="px-4 py-2 bg-[#F5F5F5] text-[#555] rounded-lg text-[.85rem] hover:bg-[#EBEBEB]">취소</button>
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
