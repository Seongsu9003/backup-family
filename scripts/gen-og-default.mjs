// ═══════════════════════════════════════════════════
//  정적 기본 OG 이미지 생성 스크립트
//  출력: public/og-default.png (1200×630)
//  실행: node scripts/gen-og-default.mjs
// ═══════════════════════════════════════════════════
import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const W = 1200
const H = 630
const PRIMARY   = '#D85A3A'
const BG        = '#F7F5F3'
const CARD      = '#FFFFFF'
const BORDER    = '#E4E0DC'
const TEXT_MAIN = '#1A1A1A'
const TEXT_SUB  = '#8A8A8A'

// ── 헬퍼: 16진수 → hex ────────────────────────────
function hex(color) { return color }

const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

// ── 배경 ──────────────────────────────────────────
ctx.fillStyle = BG
ctx.fillRect(0, 0, W, H)

// ── 왼쪽 브랜드 스트라이프 ────────────────────────
ctx.fillStyle = PRIMARY
ctx.fillRect(0, 0, 14, H)

// ── 오른쪽 장식 패널 ──────────────────────────────
ctx.fillStyle = PRIMARY
ctx.fillRect(W - 220, 0, 220, H)

// 원형 장식 (반투명 흰색)
ctx.save()
ctx.globalAlpha = 0.06
ctx.fillStyle = '#FFFFFF'
ctx.beginPath(); ctx.arc(W - 40, 60, 180, 0, Math.PI * 2); ctx.fill()
ctx.beginPath(); ctx.arc(W - 180, H - 20, 120, 0, Math.PI * 2); ctx.fill()
ctx.restore()

// 오른쪽 패널 텍스트
ctx.textAlign = 'center'
ctx.fillStyle = 'rgba(255,255,255,0.90)'
ctx.font = 'bold 80px sans-serif'
ctx.fillText('BUF', W - 110, H / 2 - 24)
ctx.fillStyle = 'rgba(255,255,255,0.55)'
ctx.font = '20px sans-serif'
ctx.fillText('backup', W - 110, H / 2 + 14)
ctx.fillText('family', W - 110, H / 2 + 40)

// ── 상단 브랜드 텍스트 ────────────────────────────
ctx.textAlign = 'left'
ctx.fillStyle = PRIMARY
ctx.font = 'bold 36px sans-serif'
ctx.fillText('backup-family', 56, 86)
ctx.fillStyle = TEXT_SUB
ctx.font = '20px sans-serif'
ctx.fillText('아이돌봄이 레벨 인증 플랫폼', 58, 118)

// ── 구분선 ────────────────────────────────────────
ctx.strokeStyle = BORDER
ctx.lineWidth = 1.5
ctx.beginPath(); ctx.moveTo(56, 140); ctx.lineTo(930, 140); ctx.stroke()

// ── 메인 타이틀 ───────────────────────────────────
ctx.fillStyle = TEXT_MAIN
ctx.font = 'bold 72px sans-serif'
ctx.fillText('돌봄이 레벨', 56, 236)
ctx.fillStyle = PRIMARY
ctx.fillText('인증카드', 56, 322)

// ── 서브 텍스트 ───────────────────────────────────
ctx.fillStyle = TEXT_SUB
ctx.font = '24px sans-serif'
ctx.fillText('테스트를 통해 내 역량을 증명하고', 58, 376)
ctx.fillText('카카오톡으로 손쉽게 공유하세요', 58, 408)

// ── 레벨 배지 3개 ─────────────────────────────────
const LEVELS = [
  { label: 'Lv.3 중급', color: '#3A9E94' },
  { label: 'Lv.4 고급', color: '#D85A3A' },
  { label: 'Lv.5 전문', color: '#8B4EAB' },
]
const badgeY = 464
let badgeX = 56
for (const lv of LEVELS) {
  const bW = 166, bH = 48
  ctx.fillStyle = lv.color
  roundRect(ctx, badgeX, badgeY, bW, bH, 24)
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(lv.label, badgeX + bW / 2, badgeY + 31)
  badgeX += bW + 12
}

// ── 하단 URL 힌트 ─────────────────────────────────
ctx.textAlign = 'left'
ctx.fillStyle = TEXT_SUB
ctx.font = '18px sans-serif'
ctx.fillText('backup-family.vercel.app', 58, 572)

// ── PNG 저장 ──────────────────────────────────────
const outPath = resolve(__dirname, '../public/og-default.png')
writeFileSync(outPath, canvas.toBuffer('image/png'))
console.log(`✅  OG 이미지 저장 완료: ${outPath}`)

// ── 헬퍼: 둥근 사각형 ─────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
