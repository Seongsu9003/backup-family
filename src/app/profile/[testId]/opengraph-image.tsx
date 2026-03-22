// ═══════════════════════════════════════════════════
//  동적 OG 이미지 — /profile/[testId]
//  카카오톡·슬랙·링크 미리보기에 실제 돌봄이 정보 표시
// ═══════════════════════════════════════════════════
import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import type { TestResult } from '@/shared/types'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// ── 레벨 색상 맵 ──────────────────────────────────
const LV_COLORS: Record<number, string> = {
  1: '#909090',
  2: '#4A9FCC',
  3: '#3A9E94',
  4: '#D85A3A',
  5: '#8B4EAB',
}

// ── 인증 상태 뱃지 ────────────────────────────────
const CERT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  '인증완료': { bg: '#DDF0EE', color: '#1A5F58', label: '✓ 인증 완료' },
  '검토중':  { bg: '#FEFAED', color: '#9A6B00', label: '⏳ 인증 검토 중' },
  '반려':   { bg: '#FFF0EE', color: '#8A2020', label: '✗ 인증 반려' },
  '미인증':  { bg: '#F5F5F4', color: '#888888', label: '미인증' },
}

// ── 이름 마스킹 (홍길동 → 홍*동) ──────────────────
function maskName(name: string): string {
  if (!name || name.length <= 1) return name
  if (name.length === 2) return name[0] + '*'
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
}

// ── Supabase 직접 조회 (서버사이드 / edge 환경) ───
async function fetchTestResult(testId: string): Promise<TestResult | null> {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  try {
    const supabase = createClient(url, key)
    const { data, error } = await supabase
      .from('test_results')
      .select('raw_data')
      .eq('test_id', testId)
      .maybeSingle()

    if (error || !data) return null
    return data.raw_data as TestResult
  } catch {
    return null
  }
}

// ── ImageResponse ─────────────────────────────────
export default async function Image({
  params,
}: {
  params: Promise<{ testId: string }>
}) {
  const { testId } = await params
  const result = await fetchTestResult(testId)

  // ── 데이터 추출 ───────────────────────────────────
  // tester.name: 실제 이름, level.label: "Lv.3 중급 돌봄이" 형식으로 저장됨
  const name        = result ? maskName(result.tester?.name ?? '돌봄이') : '돌봄이'
  const total       = result?.score?.total        ?? 0
  const survey      = result?.score?.survey       ?? 0
  const scenario    = result?.score?.scenario     ?? 0
  const lvNum       = result?.level?.num          ?? 1
  const lvFullLabel = result?.level?.label        ?? 'Lv.1 입문 돌봄이'
  const certStatus  = result?.certification?.status ?? '미인증'
  const careLabel   = result?.care_type?.label    ?? null
  const lvColor     = LV_COLORS[lvNum] || '#D85A3A'
  const cert        = CERT_BADGE[certStatus] || CERT_BADGE['미인증']

  const PRIMARY     = '#D85A3A'
  const BG          = '#F7F5F3'
  const CARD        = '#FFFFFF'
  const BORDER      = '#E4E0DC'
  const TEXT_MAIN   = '#1A1A1A'
  const TEXT_SUB    = '#8A8A8A'

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: BG,
          display: 'flex',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── 왼쪽 사이드바 (브랜드 컬러 세로 스트라이프) ── */}
        <div
          style={{
            width: 14,
            height: '100%',
            background: PRIMARY,
            flexShrink: 0,
          }}
        />

        {/* ── 메인 콘텐츠 영역 ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '52px 64px 52px 56px',
            gap: 0,
          }}
        >
          {/* 상단 브랜드 + 태그라인 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: PRIMARY, letterSpacing: '-0.5px' }}>
                backup-family
              </span>
              <span style={{ fontSize: 15, color: TEXT_SUB }}>
                아이돌봄이 레벨 인증 플랫폼
              </span>
            </div>

            {/* 인증 상태 배지 */}
            <div
              style={{
                background: cert.bg,
                color: cert.color,
                border: `1.5px solid ${cert.color}44`,
                borderRadius: 24,
                padding: '8px 22px',
                fontSize: 17,
                fontWeight: 700,
                display: 'flex',
              }}
            >
              {cert.label}
            </div>
          </div>

          {/* 이름 + 레벨 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 28 }}>
            <span style={{ fontSize: 58, fontWeight: 800, color: TEXT_MAIN, letterSpacing: '-1px', lineHeight: 1 }}>
              {name}
            </span>
            <span style={{ fontSize: 26, color: TEXT_SUB, marginBottom: 6 }}>
              님의 인증카드
            </span>
          </div>

          {/* 레벨 + 케어 타입 배지 행 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
            <div
              style={{
                background: lvColor,
                color: '#fff',
                borderRadius: 32,
                padding: '10px 28px',
                fontSize: 20,
                fontWeight: 700,
                display: 'flex',
              }}
            >
              {lvFullLabel}
            </div>
            {careLabel && (
              <div
                style={{
                  background: CARD,
                  color: TEXT_MAIN,
                  border: `1.5px solid ${BORDER}`,
                  borderRadius: 32,
                  padding: '10px 24px',
                  fontSize: 19,
                  fontWeight: 600,
                  display: 'flex',
                }}
              >
                {careLabel}형 돌봄이
              </div>
            )}
          </div>

          {/* 점수 카드 3개 */}
          <div style={{ display: 'flex', gap: 16 }}>
            {/* 총점 */}
            <div
              style={{
                flex: 1,
                background: CARD,
                border: `1.5px solid ${BORDER}`,
                borderRadius: 16,
                padding: '22px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                borderTop: `4px solid ${lvColor}`,
              }}
            >
              <span style={{ fontSize: 14, color: TEXT_SUB, fontWeight: 600 }}>총점</span>
              <span style={{ fontSize: 52, fontWeight: 800, color: lvColor, lineHeight: 1 }}>
                {total}
              </span>
              <span style={{ fontSize: 14, color: TEXT_SUB }}>/ 100점</span>
            </div>

            {/* 설문 */}
            <div
              style={{
                flex: 1,
                background: CARD,
                border: `1.5px solid ${BORDER}`,
                borderRadius: 16,
                padding: '22px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 14, color: TEXT_SUB, fontWeight: 600 }}>설문 점수</span>
              <span style={{ fontSize: 52, fontWeight: 800, color: TEXT_MAIN, lineHeight: 1 }}>
                {survey}
              </span>
              <span style={{ fontSize: 14, color: TEXT_SUB }}>/ 50점</span>
            </div>

            {/* 시나리오 */}
            <div
              style={{
                flex: 1,
                background: CARD,
                border: `1.5px solid ${BORDER}`,
                borderRadius: 16,
                padding: '22px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 14, color: TEXT_SUB, fontWeight: 600 }}>시나리오 점수</span>
              <span style={{ fontSize: 52, fontWeight: 800, color: TEXT_MAIN, lineHeight: 1 }}>
                {scenario}
              </span>
              <span style={{ fontSize: 14, color: TEXT_SUB }}>/ 50점</span>
            </div>
          </div>
        </div>

        {/* ── 오른쪽 장식 패널 ── */}
        <div
          style={{
            width: 220,
            height: '100%',
            background: PRIMARY,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 배경 원형 장식 */}
          <div
            style={{
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              top: -60,
              right: -60,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              bottom: -40,
              left: -40,
            }}
          />

          {/* 점수 링 (SVG) */}
          <div style={{ display: 'flex', position: 'relative' }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="10" />
              <circle
                cx="65" cy="65" r="52"
                fill="none"
                stroke="rgba(255,255,255,0.90)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52 * (total / 100)} ${2 * Math.PI * 52}`}
                strokeDashoffset={2 * Math.PI * 52 * 0.25}
                transform="rotate(-90 65 65)"
              />
              <text x="65" y="60" textAnchor="middle" fontSize="30" fontWeight="800" fill="white">
                {total}
              </text>
              <text x="65" y="80" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.75)">
                / 100
              </text>
            </svg>
          </div>

          {/* 레벨 번호 */}
          <div
            style={{
              background: 'rgba(255,255,255,0.16)',
              borderRadius: 12,
              padding: '10px 22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.70)', fontWeight: 600 }}>
              LEVEL
            </span>
            <span style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
              {lvNum}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
