'use client'

// ═══════════════════════════════════════════════════
//  결과 화면 — 점수 · 레벨 · 돌봄 타입 · 저장 폼 · PNG 다운로드
// ═══════════════════════════════════════════════════
import { useState, useEffect, useRef } from 'react'
import { REGIONS } from '../model/constants'
import type { QuizState, CertDocs } from '../model/types'
import type { LevelDef, CareTypeDef } from '../model/constants'
import { useSaveResult } from '../model/useSaveResult'

const LV_COLORS: Record<number, string> = {
  1: '#909090', 2: '#4A9FCC', 3: '#3A9E94', 4: '#D85A3A', 5: '#8B4EAB',
}

interface Props {
  state: QuizState
  onRestart: () => void
  onSetDoc: (key: keyof CertDocs, value: string | null) => void
  onMarkSaved: () => void
}

// ── PNG 다운로드 (Canvas API) ───────────────────────
function downloadPNG(
  name: string,
  level: LevelDef,
  careType: CareTypeDef | null,
  totalScore: number,
  surveyNorm: number,
  scenarioNorm: number,
  certStatus: string,
  testId: string,
  expiresAt: string
) {
  const W = 780
  const H = careType ? 1300 : 1220
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  const lvColor = LV_COLORS[level.num] || '#D85A3A'
  const PRIMARY = '#D85A3A'

  function rr(x: number, y: number, w: number, h: number, rad: number) {
    ctx.beginPath()
    ctx.moveTo(x + rad, y)
    ctx.lineTo(x + w - rad, y); ctx.quadraticCurveTo(x + w, y, x + w, y + rad)
    ctx.lineTo(x + w, y + h - rad); ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h)
    ctx.lineTo(x + rad, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - rad)
    ctx.lineTo(x, y + rad); ctx.quadraticCurveTo(x, y, x + rad, y)
    ctx.closePath()
  }

  function fitText(text: string, maxW: number, weight: string, maxSize: number, minSize = 14): number {
    let sz = maxSize
    while (sz >= minSize) {
      ctx.font = `${weight} ${sz}px sans-serif`
      if (ctx.measureText(text).width <= maxW) return sz
      sz -= 2
    }
    return minSize
  }

  // 배경
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#E4E0DC'; ctx.lineWidth = 3
  rr(0, 0, W, H, 0); ctx.stroke()

  // 헤더
  ctx.fillStyle = PRIMARY; ctx.fillRect(0, 0, W, 190)
  ctx.save(); ctx.globalAlpha = 0.08; ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.arc(W - 60, 30, 120, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(60, 170, 80, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
  ctx.font = '500 22px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.80)'
  ctx.textAlign = 'center'; ctx.fillText('backup-family', W / 2, 58)
  ctx.font = 'bold 46px sans-serif'; ctx.fillStyle = '#FFFFFF'
  ctx.fillText('아이돌봄이 레벨', W / 2, 118)
  ctx.fillText('인 증 서', W / 2, 172)

  // 이름
  const nameSz = fitText(name, W - 120, 'bold', 62, 28)
  ctx.font = `bold ${nameSz}px sans-serif`
  ctx.fillStyle = '#1A1A1A'; ctx.textAlign = 'center'
  ctx.fillText(name, W / 2, 292)
  ctx.strokeStyle = '#E4E0DC'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(W / 2 - 80, 310); ctx.lineTo(W / 2 + 80, 310); ctx.stroke()
  ctx.font = '20px sans-serif'; ctx.fillStyle = '#8A8A8A'; ctx.textAlign = 'center'
  ctx.fillText('이 분의 역량 수준을 다음과 같이 인증합니다.', W / 2, 344)

  let nextY = 366

  // 레벨 배지
  const badgeW = 360, badgeH = 68
  const badgeText = `${level.label}  ·  ${level.title}`
  ctx.fillStyle = lvColor
  rr(W / 2 - badgeW / 2, nextY, badgeW, badgeH, 34); ctx.fill()
  const badgeSz = fitText(badgeText, badgeW - 52, 'bold', 32, 18)
  ctx.font = `bold ${badgeSz}px sans-serif`
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'
  ctx.fillText(badgeText, W / 2, nextY + 44)
  nextY += badgeH + 20

  // 타입 배지
  if (careType) {
    const typeText = `${careType.label}형 돌봄이`
    ctx.font = 'bold 24px sans-serif'
    const tbW = Math.max(220, ctx.measureText(typeText).width + 60)
    const tbH = 52
    ctx.fillStyle = careType.color || '#888888'
    rr(W / 2 - tbW / 2, nextY, tbW, tbH, 26); ctx.fill()
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'
    ctx.fillText(typeText, W / 2, nextY + 35)
    nextY += tbH + 24
  }

  // 점수 링
  const R = 96, CX = W / 2
  const CY = nextY + R + 22
  const ratio = totalScore / 100
  ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2)
  ctx.strokeStyle = '#F0EDE8'; ctx.lineWidth = 14; ctx.stroke()
  ctx.beginPath(); ctx.arc(CX, CY, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio)
  ctx.strokeStyle = lvColor; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke()
  ctx.font = 'bold 68px sans-serif'; ctx.fillStyle = lvColor
  ctx.textAlign = 'center'; ctx.fillText(String(totalScore), CX, CY + 22)
  ctx.font = '24px sans-serif'; ctx.fillStyle = '#8A8A8A'
  ctx.fillText('/ 100점', CX, CY + 58)
  nextY = CY + R + 26

  // 점수 분류 박스
  const bW = 270, bH = 96, bGap = 20
  const b1X = W / 2 - bW - bGap / 2, b2X = W / 2 + bGap / 2, bY = nextY
  ctx.fillStyle = '#F7F5F3'; rr(b1X, bY, bW, bH, 14); ctx.fill()
  ctx.strokeStyle = '#E4E0DC'; ctx.lineWidth = 1.5; rr(b1X, bY, bW, bH, 14); ctx.stroke()
  ctx.font = '22px sans-serif'; ctx.fillStyle = '#8A8A8A'; ctx.textAlign = 'center'
  ctx.fillText('설문 점수', b1X + bW / 2, bY + 34)
  ctx.font = 'bold 38px sans-serif'; ctx.fillStyle = '#1A1A1A'
  ctx.fillText(`${surveyNorm}점`, b1X + bW / 2, bY + 76)
  ctx.fillStyle = '#F7F5F3'; rr(b2X, bY, bW, bH, 14); ctx.fill()
  ctx.strokeStyle = '#E4E0DC'; ctx.lineWidth = 1.5; rr(b2X, bY, bW, bH, 14); ctx.stroke()
  ctx.font = '22px sans-serif'; ctx.fillStyle = '#8A8A8A'; ctx.textAlign = 'center'
  ctx.fillText('시나리오 점수', b2X + bW / 2, bY + 34)
  ctx.font = 'bold 38px sans-serif'; ctx.fillStyle = '#1A1A1A'
  ctx.fillText(`${scenarioNorm}점`, b2X + bW / 2, bY + 76)
  nextY = bY + bH + 28

  // 인증 상태 배지
  const certMap: Record<string, { bg: string; color: string; text: string }> = {
    '인증완료': { bg: '#DDF0EE', color: '#1A5F58', text: '인증 완료' },
    '검토중': { bg: '#FEFAED', color: '#9A6B00', text: '인증 검토 중' },
    '미인증': { bg: '#F5F5F4', color: '#888888', text: '미인증' },
    '반려': { bg: '#FFF0EE', color: '#8A2020', text: '인증 반려' },
  }
  const ci = certMap[certStatus] || certMap['미인증']
  const cBH = 66
  ctx.fillStyle = ci.bg; rr(80, nextY, W - 160, cBH, 12); ctx.fill()
  ctx.strokeStyle = ci.color + '55'; ctx.lineWidth = 1.5
  rr(80, nextY, W - 160, cBH, 12); ctx.stroke()
  const certTextStr = `인증 상태  ·  ${ci.text}`
  const certSz = fitText(certTextStr, W - 200, 'bold', 28, 16)
  ctx.font = `bold ${certSz}px sans-serif`
  ctx.fillStyle = ci.color; ctx.textAlign = 'center'
  ctx.fillText(certTextStr, W / 2, nextY + 43)
  nextY += cBH + 30

  // 구분선
  ctx.strokeStyle = '#EEEBE6'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(80, nextY); ctx.lineTo(W - 80, nextY); ctx.stroke()
  nextY += 44

  // 상세 정보 행
  const testDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const expDate = new Date(expiresAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const shortId = testId ? testId.replace(/-/g, '').substring(0, 8).toUpperCase() : '—'

  function detailRow(label: string, value: string, y: number) {
    ctx.font = '22px sans-serif'; ctx.fillStyle = '#8A8A8A'; ctx.textAlign = 'left'
    ctx.fillText(label, 100, y)
    const valSz = fitText(value, W - 230, '500', 22, 14)
    ctx.font = `500 ${valSz}px sans-serif`; ctx.fillStyle = '#1A1A1A'; ctx.textAlign = 'right'
    ctx.fillText(value, W - 100, y)
    ctx.setLineDash([4, 4]); ctx.strokeStyle = '#EEEBE6'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(100, y + 14); ctx.lineTo(W - 100, y + 14); ctx.stroke()
    ctx.setLineDash([])
  }
  detailRow('테스트 일자', testDate, nextY); nextY += 52
  detailRow('유효 기간', `${expDate}까지`, nextY); nextY += 52
  detailRow('인증 번호', shortId, nextY)

  // 푸터
  ctx.fillStyle = PRIMARY; ctx.fillRect(0, H - 88, W, 88)
  ctx.font = '600 24px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.90)'
  ctx.textAlign = 'center'; ctx.fillText('backup-family 레벨 테스트', W / 2, H - 52)
  ctx.font = '20px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillText('backup-family · buf', W / 2, H - 22)

  const link = document.createElement('a')
  link.download = `BUF_인증카드_${name}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// ── 메인 컴포넌트 ─────────────────────────────────
export function ResultSection({ state, onRestart, onSetDoc, onMarkSaved }: Props) {
  const { totalScore, surveyNorm, scenarioNorm, level, careType, certDocs, saved, isUpdate } = state
  const lvColor = LV_COLORS[level?.num ?? 1]

  // 점수 애니메이션
  const [displayScore, setDisplayScore] = useState(0)
  useEffect(() => {
    let n = 0
    const target = totalScore
    const timer = setInterval(() => {
      n = Math.min(n + 2, target)
      setDisplayScore(n)
      if (n >= target) clearInterval(timer)
    }, 20)
    return () => clearInterval(timer)
  }, [totalScore])

  // 저장 폼 상태
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [jobSeeking, setJobSeeking] = useState('')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [sido, setSido] = useState('')
  const [sigungu, setSigungu] = useState('')
  const [savedExpiresAt, setSavedExpiresAt] = useState('')

  const { mutate: saveResult, isPending: isSaving } = useSaveResult()

  const attachedCount = Object.values(certDocs).filter(Boolean).length
  const certStatus = attachedCount > 0 ? '검토중' : '미인증'

  const canSave =
    name.trim() !== '' &&
    contact.trim() !== '' &&
    jobSeeking !== '' &&
    (!saved || isUpdate)

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
          const exp = new Date(result.meta.expires_at)
          setSavedExpiresAt(exp.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }))
        },
        onError: (e) => alert('저장 중 오류가 발생했습니다: ' + e.message),
      }
    )
  }

  // 서류 첨부 항목 (정답 선택한 certifiable 문항만)
  const certifiableItems = state.questions
    .map((q, i) => ({ q, answerIdx: state.answers[i] }))
    .filter(({ q, answerIdx }) => q.certifiable && answerIdx !== null && answerIdx > 0)

  // 지역 추가
  const addRegion = () => {
    if (selectedRegions.length >= 3) { alert('최대 3개 지역까지 선택할 수 있습니다.'); return }
    if (!sido || !sigungu) return
    const label = `${sido} ${sigungu}`
    if (selectedRegions.includes(label)) { alert('이미 선택된 지역입니다.'); return }
    setSelectedRegions((prev) => [...prev, label])
    setSido(''); setSigungu('')
  }
  const removeRegion = (label: string) =>
    setSelectedRegions((prev) => prev.filter((r) => r !== label))

  const circumference = 326.73
  const ringOffset = circumference - (totalScore / 100) * circumference

  // 인증 배지 스타일
  const certBadgeClass = attachedCount > 0
    ? 'bg-[#FEFAED] text-[#9A6B00] border border-[#E8C96A]'
    : 'bg-[#F5F5F4] text-[#888] border border-dashed border-[#CCC]'

  return (
    <section className="w-full max-w-[640px]">
      <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,.08)] border border-[#E4E0DC] px-7 py-9 animate-[fadeUp_.4s_ease]">

        {/* ── 상단 레벨 표시 ── */}
        <div className="text-center mb-6">
          <div className="text-[1.9rem] font-extrabold mb-1.5 tracking-[-0.02em]">
            <span style={{ color: lvColor }}>
              {level?.label} {level?.title}
            </span>
          </div>
          <div className="text-[.92rem] text-[#8A8A8A] font-medium">
            총점 {totalScore}점 (설문 {surveyNorm} + 시나리오 {scenarioNorm})
          </div>
        </div>

        {/* ── 점수 링 ── */}
        <div className="relative w-[130px] h-[130px] mx-auto mb-6">
          <svg viewBox="0 0 130 130" width="130" height="130" className="-rotate-90">
            <circle className="fill-none stroke-[#E4E0DC]" strokeWidth="10" cx="65" cy="65" r="52" />
            <circle
              className="fill-none stroke-linecap-round transition-[stroke-dashoffset_1s_ease]"
              style={{ stroke: lvColor, strokeWidth: 10, strokeLinecap: 'round', strokeDasharray: circumference, strokeDashoffset: ringOffset }}
              cx="65" cy="65" r="52"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-[1.9rem] font-extrabold" style={{ color: lvColor }}>{displayScore}</div>
            <div className="text-[.75rem] text-[#8A8A8A]">/ 100점</div>
          </div>
        </div>

        {/* ── 인증 상태 배지 ── */}
        <div className={`flex items-center justify-center gap-2 mb-5 px-4 py-3 rounded-lg text-[.88rem] font-semibold ${certBadgeClass}`}>
          {attachedCount > 0
            ? `인증 신청 중 · 서류 ${attachedCount}건 첨부됨 (관리자 검토 후 인증 완료)`
            : '미인증 · 서류 제출 시 인증 가능'}
        </div>

        {/* ── 돌봄 타입 ── */}
        {careType && (
          <div className="bg-[#F7F5F3] border border-[#E4E0DC] rounded-xl px-5 py-5 mb-4">
            <div className="flex items-center gap-2.5 mb-3.5">
              <span
                className="px-3.5 py-[5px] rounded-full text-[.82rem] font-bold text-white"
                style={{ background: careType.color }}
              >
                {careType.label}
              </span>
              <span className="text-base font-bold text-[#1A1A1A]">{careType.fullLabel}</span>
            </div>
            <p className="text-[.86rem] text-[#4A4A4A] leading-[1.65] mb-3">{careType.summary}</p>
            <div className="flex flex-wrap gap-[7px] mb-2.5">
              {careType.strengths.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full text-[.78rem] font-semibold bg-white border border-[#E4E0DC] text-[#4A4A4A]">{s}</span>
              ))}
            </div>
            <div className="text-[.8rem] text-[#8A8A8A] leading-[1.5] pt-2 border-t border-[#E4E0DC]">
              매칭 추천: {careType.matchDesc}
            </div>
          </div>
        )}

        {/* ── 점수 분류 ── */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { label: '설문 점수', val: surveyNorm, unit: '/50' },
            { label: '시나리오 점수', val: scenarioNorm, unit: '/50' },
          ].map(({ label, val, unit }) => (
            <div key={label} className="bg-[#F7F5F3] rounded-lg px-4 py-4 text-center border border-[#E4E0DC]">
              <div className="text-[.76rem] text-[#8A8A8A] mb-1.5 font-medium">{label}</div>
              <div className="text-[1.35rem] font-extrabold text-[#1A1A1A]">
                {val}<span className="text-[.75rem] font-normal text-[#8A8A8A]">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── 레벨 설명 ── */}
        {level && (
          <>
            <div
              className="bg-[#F7F5F3] rounded-xl px-4 py-4 text-[.88rem] leading-[1.7] mb-4 border border-[#E4E0DC] [&_h4]:text-[.84rem] [&_h4]:font-bold [&_h4]:text-[#D85A3A] [&_h4]:mb-2"
              dangerouslySetInnerHTML={{ __html: level.desc }}
            />
            <div className="bg-[#F7F5F3] border border-[#E4E0DC] rounded-xl px-4 py-4 text-[.86rem] leading-[1.7] mb-7">
              <h4 className="text-[.84rem] font-bold text-[#4A4A4A] mb-2.5">추천 다음 단계</h4>
              <ul className="pl-4 list-disc">
                {level.next.map((s) => (
                  <li key={s} className="mb-1 text-[#4A4A4A]">{s}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        <hr className="border-[#E4E0DC] mb-7" />

        {/* ── 저장 폼 ── */}
        {!saved ? (
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A] mb-1.5">결과 저장 및 인증 신청</h3>
            <p className="text-[.84rem] text-[#8A8A8A] mb-5 leading-[1.6]">
              이름과 연락처를 입력하면 결과가 저장됩니다. 서류를 첨부하면 관리자 검토 후 인증 뱃지를 받을 수 있습니다.
            </p>

            <div className="flex flex-col gap-1 mb-3.5">
              <label className="text-[.83rem] font-semibold text-[#4A4A4A]">이름 <span className="text-[#D85A3A]">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="px-3 py-2.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.92rem] bg-[#FAFAFA] outline-none focus:border-[#D85A3A] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-[.83rem] font-semibold text-[#4A4A4A]">연락처 <span className="text-[#D85A3A]">*</span></label>
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

            {/* 선호 지역 (적극 구직 시) */}
            {jobSeeking === '적극적으로 구직 중' && (
              <div className="mb-4">
                <label className="text-[.83rem] font-semibold text-[#4A4A4A]">
                  선호 활동 지역 <span className="text-[.83rem] font-normal text-[#8A8A8A]">(선택 · 최대 3개)</span>
                </label>
                <div className="flex gap-2 mt-1.5 mb-2 flex-wrap">
                  <select
                    value={sido}
                    onChange={(e) => { setSido(e.target.value); setSigungu('') }}
                    className="flex-1 min-w-[120px] px-2.5 py-2 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.86rem] bg-[#FAFAFA] outline-none cursor-pointer focus:border-[#D85A3A] transition-colors"
                  >
                    <option value="">시 / 도 선택</option>
                    {Object.keys(REGIONS).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select
                    value={sigungu}
                    onChange={(e) => setSigungu(e.target.value)}
                    disabled={!sido}
                    className="flex-1 min-w-[120px] px-2.5 py-2 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.86rem] bg-[#FAFAFA] outline-none cursor-pointer focus:border-[#D85A3A] transition-colors disabled:opacity-50"
                  >
                    <option value="">시 / 군 / 구 선택</option>
                    {(REGIONS[sido] || []).map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <button
                    onClick={addRegion}
                    disabled={!sido || !sigungu}
                    className="px-3.5 py-2 bg-[#D85A3A] text-white text-[.84rem] font-bold rounded-lg hover:bg-[#C04830] disabled:opacity-40 whitespace-nowrap transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-[7px] min-h-0">
                  {selectedRegions.map((r) => (
                    <span key={r} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAE8E3] border border-[#F0A090] rounded-full text-[.8rem] font-semibold text-[#C04830]">
                      {r}
                      <button onClick={() => removeRegion(r)} className="text-[#D85A3A] text-[.82rem] leading-none">✕</button>
                    </span>
                  ))}
                </div>
                {selectedRegions.length < 3 && (
                  <span className="text-[.76rem] text-[#8A8A8A] mt-1.5 block">선택한 지역이 구직 Pool에서 매칭에 활용됩니다.</span>
                )}
              </div>
            )}

            {/* 서류 첨부 */}
            {certifiableItems.length > 0 && (
              <div className="mb-5">
                <h4 className="text-[.88rem] font-bold text-[#1A1A1A] mb-1">
                  인증 서류 첨부 <span className="text-[.8rem] font-normal text-[#8A8A8A]">(선택사항 · 첨부 시 인증 신청)</span>
                </h4>
                <p className="text-[.8rem] text-[#8A8A8A] mb-3 leading-[1.55]">
                  해당 자격/교육에 대한 서류를 첨부하면 관리자 검토 후 인증 뱃지를 받을 수 있습니다.
                </p>
                {certifiableItems.map(({ q }) => {
                  const key = q.docKey as keyof CertDocs
                  const attached = certDocs[key]
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 px-3.5 py-2.5 border-[1.5px] rounded-lg mb-2 transition-all ${
                        attached ? 'border-[#3A9E94] bg-[#DDF0EE] border-solid' : 'border-dashed border-[#E4E0DC]'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-[.86rem] font-semibold text-[#1A1A1A]">{q.docLabel}</div>
                        <div className={`text-[.76rem] mt-0.5 ${attached ? 'text-[#3A9E94]' : 'text-[#8A8A8A]'}`}>
                          {attached ? `✓ ${attached}` : '미첨부'}
                        </div>
                      </div>
                      {!attached ? (
                        <label className="px-3 py-1.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.8rem] font-semibold cursor-pointer hover:border-[#D85A3A] hover:text-[#D85A3A] transition-all text-[#4A4A4A]">
                          첨부
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) onSetDoc(key, file.name)
                            }}
                          />
                        </label>
                      ) : (
                        <button
                          onClick={() => onSetDoc(key, null)}
                          className="text-[#C04848] text-[.78rem] px-2 py-1 rounded border-none bg-transparent cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="w-full py-3 text-[.95rem] font-bold bg-[#D85A3A] text-white rounded-xl hover:bg-[#C04830] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-3"
            >
              {isSaving ? '저장 중…' : '저장하기'}
            </button>
          </div>
        ) : (
          /* ── 저장 완료 ── */
          <div className="animate-[fadeUp_.3s_ease]">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#DDF0EE] border border-[#3A9E94] rounded-lg text-[.88rem] font-semibold text-[#1A5F58] mb-3.5">
              결과가 저장되었습니다
            </div>
            {savedExpiresAt && (
              <p className="text-[.78rem] text-[#8A8A8A] text-center mb-3">
                재인증 유효기간: <span className="text-[#D85A3A] font-semibold">{savedExpiresAt}</span>까지
              </p>
            )}
            <button
              onClick={() => {
                if (!level || !name) return
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
              }}
              className="w-full py-2.5 border-[1.5px] border-[#E4E0DC] rounded-lg text-[.85rem] font-semibold text-[#4A4A4A] bg-white hover:border-[#D85A3A] hover:text-[#D85A3A] transition-all mb-3"
            >
              인증 카드 이미지 저장 (PNG)
            </button>
          </div>
        )}

        {/* 다시 테스트 */}
        <button
          onClick={onRestart}
          className="w-full py-3 mt-2 border-[1.5px] border-[#E4E0DC] rounded-xl bg-transparent text-[.88rem] font-semibold text-[#8A8A8A] hover:border-[#F0A090] hover:text-[#D85A3A] transition-all"
        >
          다시 테스트하기
        </button>
      </div>
    </section>
  )
}
