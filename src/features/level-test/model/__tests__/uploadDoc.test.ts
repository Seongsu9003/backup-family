// ═══════════════════════════════════════════════════
//  uploadDoc 단위 테스트
//  Supabase Storage를 vi.mock으로 격리하여 검증
// ═══════════════════════════════════════════════════
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── vi.hoisted: Storage mock ──────────────────────
const { mockUpload, mockGetPublicUrl } = vi.hoisted(() => ({
  mockUpload:       vi.fn(),
  mockGetPublicUrl: vi.fn(),
}))

vi.mock('@/shared/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload:       mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  },
}))

import { uploadDoc } from '../uploadDoc'

// ── 헬퍼: 테스트용 File 객체 ─────────────────────
function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type })
  return new File([blob], name, { type })
}

// ────────────────────────────────────────────────────
// 업로드 성공
// ────────────────────────────────────────────────────
describe('uploadDoc — 성공', () => {
  beforeEach(() => vi.clearAllMocks())

  it('업로드 성공 → publicUrl 반환', async () => {
    mockUpload.mockResolvedValue({ error: null })
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/cert-docs/uuid/cert.pdf' } })

    const file = makeFile('cert.pdf', 'application/pdf', 100)
    const url  = await uploadDoc({ testId: 'test-uuid', docKey: 'cert', file })

    expect(mockUpload).toHaveBeenCalledTimes(1)
    expect(url).toBe('https://cdn.example.com/cert-docs/uuid/cert.pdf')
  })

  it('스토리지 경로가 {testId}/{docKey}_{filename} 형식으로 생성됨', async () => {
    mockUpload.mockResolvedValue({ error: null })
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/any' } })

    const file = makeFile('license.jpg', 'image/jpeg', 100)
    await uploadDoc({ testId: 'abc-123', docKey: 'edu', file })

    const [path] = mockUpload.mock.calls[0]
    expect(path).toMatch(/^abc-123\/edu_/)
    expect(path).toMatch(/license\.jpg$/)
  })
})

// ────────────────────────────────────────────────────
// 클라이언트 유효성 검사
// ────────────────────────────────────────────────────
describe('uploadDoc — 클라이언트 검증', () => {
  beforeEach(() => vi.clearAllMocks())

  it('5MB 초과 파일 → supabase 호출 없이 Error throw', async () => {
    const file = makeFile('big.pdf', 'application/pdf', 5 * 1024 * 1024 + 1)

    await expect(uploadDoc({ testId: 'test-uuid', docKey: 'cert', file }))
      .rejects.toThrow()

    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('허용되지 않는 파일 타입 → supabase 호출 없이 Error throw', async () => {
    const file = makeFile('virus.exe', 'application/exe', 100)

    await expect(uploadDoc({ testId: 'test-uuid', docKey: 'cert', file }))
      .rejects.toThrow()

    expect(mockUpload).not.toHaveBeenCalled()
  })
})

// ────────────────────────────────────────────────────
// 스토리지 오류
// ────────────────────────────────────────────────────
describe('uploadDoc — 스토리지 오류', () => {
  beforeEach(() => vi.clearAllMocks())

  it('Supabase upload 오류 → Error throw', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'Bucket not found' } })

    const file = makeFile('cert.pdf', 'application/pdf', 100)

    await expect(uploadDoc({ testId: 'test-uuid', docKey: 'cert', file }))
      .rejects.toThrow('Bucket not found')
  })
})
