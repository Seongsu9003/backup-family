// ═══════════════════════════════════════════════════
//  이름 마스킹 유틸리티 (서버 · 클라이언트 공용)
//  홍길동 → 홍*동 / 홍길 → 홍*
// ═══════════════════════════════════════════════════

/** 이름 마스킹: 홍길동 → 홍*동, 홍길 → 홍* */
export function maskName(name: string): string {
  if (name.length <= 1) return name
  if (name.length === 2) return name[0] + '*'
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
}
