// ═══════════════════════════════════════════════════
//  PNG 인증카드 다운로드 유틸 (Canvas API)
// ═══════════════════════════════════════════════════
import type { LevelDef, CareTypeDef } from './constants'

export const LV_COLORS: Record<number, string> = {
  1: '#909090', 2: '#4A9FCC', 3: '#3A9E94', 4: '#D85A3A', 5: '#8B4EAB',
}

export function downloadPNG(
  name: string,
  level: LevelDef,
  careType: CareTypeDef | null,
  totalScore: number,
  surveyNorm: number,
  scenarioNorm: number,
  certStatus: string,
  testId: string,
  expiresAt: string
): void {
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
