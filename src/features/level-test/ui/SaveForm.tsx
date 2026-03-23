'use client'

// ═══════════════════════════════════════════════════
//  결과 저장 폼 + 저장 완료 뷰 (이름·연락처·구직·지역·서류)
// ═══════════════════════════════════════════════════
import { useState } from 'react'
import type { QuizState, CertDocs } from '../model/types'
import type { LevelDef, CareTypeDef } from '../model/constants'
import { useSaveResult } from '../model/useSaveResult'
import { downloadPNG } from '../model/downloadPng'
import { RegionSelector } from './RegionSelector'
import { DocAttach } from './DocAttach'
import { ShareButtons } from '@/features/profile'

const BASE_URL = 'https://backup-family.vercel.app'

interface Props {
  state: QuizState
  level: LevelDef | null
  careType: CareTypeDef | null
  certStatus: string
  onMarkSaved: () => void
  onSetDoc: (key: keyof CertDocs, value: string | null) => void
}

export function SaveForm({ state, level, careType, certStatus, onMarkSaved, onSetDoc }: Props) {
  const { certDocs, saved, isUpdate, totalScore, surveyNorm, scenarioNorm, testerName, testerContact } = state

  // isUpdate 시 기존 결과에서 복원된 이름·연락처로 초기화
  const [name, setName] = useState(testerName)
  const [contact, setContact] = useState(testerContact)
  const [jobSeeking, setJobSeeking] = useState('')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [savedExpiresAt, setSavedExpiresAt] = useState('')
  const [savedTestId, setSavedTestId] = useState<string | null>(null)
  // isUpdate 시 업데이트 폼은 기본 접힘 상태
  const [updateOpen, setUpdateOpen] = useState(false)

  const { mutate: saveResult, isPending: isSaving } = useSaveResult()

  const canSave =
    name.trim() !== '' &&
    contact.trim() !== '' &&
    jobSeeking !== '' &&
    (!saved || isUpdate)

  // 인증 서류 첨부 가능한 문항 (certifiable 이고 0 초과 응답)
  const certifiableItems = state.questions
    .map((q, i) => ({ q, answerIdx: state.answers[i] }))
    .filter(({ q, answerIdx }) => q.certifiable && answerIdx !== null && answerIdx > 0)

  const handleSave = () => {
    if (!canSave) return
    saveResult(
      {
        quizState: state,
        questions: state.questions,
        name: name.trim(),
        contact: contact.trim(),
        jobSeeking,
        selectedRegions,
      },
      {
        onSuccess: (result) => {
          onMarkSaved()
          setSavedTestId(result.meta.test_id)
          const exp = new Date(result.meta.expires_at)
          setSavedExpiresAt(
            exp.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
          )
        },
        onError: (e) => alert('저장 중 오류가 발생했습니다: ' + e.message),
      }
    )
  }

  const handleDownloadPng = () => {
    if (!level) return
    const expires = new Date()
    expires.setMonth(expires.getMonth() + 1)
    downloadPNG(
      name || '응시자',
      level,
      careType,
      totalScore,
      surveyNorm,
      scenarioNorm,
      certStatus,
      state.testId || '',
      expires.toISOString()
    )
  }

  // ── 프로필 공유 블록 (저장 완료 또는 기존 결과 조회 시 모두 표시) ──
  const activeTestId = savedTestId ?? state.testId
  const profileUrl = activeTestId ? `${BASE_URL}/profile/${activeTestId}` : null
  const shareTitle = level
    ? `${name || '응시자'} 님의 ${level.label} ${level.title} 인증카드`
    : 'backup-family 돌봄이 인증카드'

  // ── 저장 완료 뷰 ──────────────────────────────────
  if (saved && !isUpdate) {
    return (
      <div className="animate-[fadeUp_.3s_ease]">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#DDF0EE] border border-[#3A9E94] rounded-lg text-[.88rem] font-semibold text-[#1A5F58] mb-3.5">
          결과가 저장되었습니다
        </div>
        {savedExpiresAt && (
          <p className="text-[.78rem] text-[#8A8A8A] text-center mb-3">
            재인증 유효기간:{' '}
            <span className="text-[#D85A3A] font-semibold">{savedExpiresAt}</span>까지
          </p>
        )}

        {/* 프로필 링크 + 공유 버튼 */}
        {profileUrl && (
          <>
            <div className="px-3.5 py-2.5 bg-[#F7F5F3] border border-[#E4E0DC] rounded-lg mb-3">
              <p className="text-[.74rem] text-[#8A8A8A] mb-1">내 공개 프로필 링크</p>
              <p className="text-[.82rem] font-semibold text-[#D85A3A] truncate">{profileUrl}</p>
            </div>
            <ShareButtons profileUrl={profileUrl} title={shareTitle} description="backup-family 레벨 테스트 결과" />
          </>
        )}

        {/* PNG 다운로드 */}
        <button
          onClick={handleDownloadPng}
          className="w-full py-2.5 mt-2 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.85rem] font-semibold text-[#4A4A4A] bg-white hover:border-[#D85A3A] hover:text-[#D85A3A] transition-all"
        >
          인증 카드 이미지 저장 (PNG)
        </button>
      </div>
    )
  }

  // ── 저장 폼 뷰 ────────────────────────────────────
  // ── 저장 폼 뷰 (신규 저장 or 기존 결과 수정) ────────────────
  return (
    <div>
      {/* 기존 결과 조회 시: 프로필 링크 + 공유 버튼 상단 노출 */}
      {isUpdate && profileUrl && (
        <div className="mb-5">
          <div className="px-3.5 py-2.5 bg-[#F7F5F3] border border-[#E4E0DC] rounded-lg mb-2">
            <p className="text-[.74rem] text-[#8A8A8A] mb-1">내 공개 프로필 링크</p>
            <p className="text-[.82rem] font-semibold text-[#D85A3A] truncate">{profileUrl}</p>
          </div>
          <ShareButtons profileUrl={profileUrl} title={shareTitle} description="backup-family 레벨 테스트 결과" />
          <hr className="border-[#E4E0DC] mt-5 mb-5" />
        </div>
      )}

      {/* isUpdate 시 업데이트 폼 토글 헤더 */}
      {isUpdate ? (
        <button
          onClick={() => setUpdateOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-[1.5px] border-[#E4E0DC] bg-[#F7F5F3] hover:border-[#D85A3A] hover:bg-[#FAE8E3] transition-all mb-1"
        >
          <span className="text-[.88rem] font-semibold text-[#4A4A4A]">
            ✏️ 정보 수정 (이름·연락처·구직 관심 여부)
          </span>
          <span className="text-[#8A8A8A] text-[.82rem]">
            {updateOpen ? '접기 ▲' : '펼치기 ▼'}
          </span>
        </button>
      ) : (
        <>
          <h3 className="text-base font-bold text-[#1A1A1A] mb-1.5">결과 저장 및 인증 신청</h3>
          <p className="text-[.84rem] text-[#8A8A8A] mb-5 leading-[1.6]">
            이름과 연락처를 입력하면 결과가 저장됩니다. 서류를 첨부하면 관리자 검토 후 인증 뱃지를 받을 수 있습니다.
          </p>
        </>
      )}

      {/* isUpdate 시 폼은 updateOpen일 때만 렌더링 */}
      {isUpdate && !updateOpen ? null : (
      <div className={isUpdate ? 'mt-4' : ''}>

      {/* 이름 */}
      <div className="flex flex-col gap-1 mb-3.5">
        <label className="text-[.83rem] font-semibold text-[#4A4A4A]">
          이름 <span className="text-[#D85A3A]">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          className="px-3 py-2.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.92rem] bg-[#FAFAFA] outline-none focus:border-[#D85A3A] transition-colors"
        />
      </div>

      {/* 연락처 */}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-[.83rem] font-semibold text-[#4A4A4A]">
          연락처 <span className="text-[#D85A3A]">*</span>
        </label>
        <input
          type="tel"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="010-0000-0000"
          className="px-3 py-2.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.92rem] bg-[#FAFAFA] outline-none focus:border-[#D85A3A] transition-colors"
        />
        <span className="text-[.76rem] text-[#8A8A8A]">구직 활동 시 연락처로 사용됩니다.</span>
      </div>

      {/* 구직 관심도 */}
      <div className="mb-1 text-[.83rem] font-semibold text-[#4A4A4A]">
        구직 활동에 관심이 있으신가요? <span className="text-[#D85A3A]">*</span>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {[
          { val: '적극적으로 구직 중', label: '네, 적극적으로 구직 중입니다' },
          { val: '관심은 있지만 탐색 중', label: '관심은 있지만 아직 탐색 중입니다' },
          { val: '구직 의사 없음', label: '아니요, 현재 구직 의사 없습니다' },
        ].map(({ val, label }) => (
          <label
            key={val}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 border-[1.5px] rounded-lg cursor-pointer transition-all text-[.88rem] ${
              jobSeeking === val
                ? 'border-[#D85A3A] bg-[#FAE8E3] text-[#1A1A1A] font-semibold'
                : 'border-[#E4E0DC] text-[#4A4A4A] hover:border-[#F0A090] hover:bg-[#FAE8E3]'
            }`}
          >
            <input
              type="radio"
              name="job-seeking"
              value={val}
              checked={jobSeeking === val}
              onChange={() => {
                setJobSeeking(val)
                if (val !== '적극적으로 구직 중') setSelectedRegions([])
              }}
              className="accent-[#D85A3A] w-[15px] h-[15px]"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {/* 선호 지역 (적극 구직 시에만 표시) */}
      {jobSeeking === '적극적으로 구직 중' && (
        <RegionSelector
          selectedRegions={selectedRegions}
          onAddRegion={(label) => setSelectedRegions((prev) => [...prev, label])}
          onRemoveRegion={(label) => setSelectedRegions((prev) => prev.filter((r) => r !== label))}
        />
      )}

      {/* 서류 첨부 */}
      <DocAttach
        certifiableItems={certifiableItems}
        certDocs={certDocs}
        onSetDoc={onSetDoc}
      />

      <button
        onClick={handleSave}
        disabled={!canSave || isSaving}
        className="w-full py-3 text-[.95rem] font-bold bg-[#D85A3A] text-white rounded-xl hover:bg-[#C04830] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-3"
      >
        {isSaving ? '저장 중…' : isUpdate ? '정보 업데이트' : '저장하기'}
      </button>

      </div>
      )}
    </div>
  )
}
