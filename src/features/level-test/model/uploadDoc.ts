// ═══════════════════════════════════════════════════
//  서류 업로드 유틸 (BUG-02)
//  Supabase Storage 'cert-docs' 버킷에 파일 업로드
//  경로: {testId}/{docKey}_{originalFilename}
// ═══════════════════════════════════════════════════
import { supabase } from '@/shared/lib/supabase'
import type { CertDocs } from './types'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const BUCKET = 'cert-docs'

export interface UploadDocParams {
  testId: string
  docKey: keyof CertDocs
  file:   File
}

/**
 * 서류 파일을 Supabase Storage에 업로드하고 publicUrl을 반환합니다.
 * - 허용 타입: PDF, JPG, PNG
 * - 최대 크기: 5MB
 * - 경로: {testId}/{docKey}_{originalFilename}
 */
export async function uploadDoc({ testId, docKey, file }: UploadDocParams): Promise<string> {
  // ── 클라이언트 유효성 검사 ────────────────────────
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`허용되지 않는 파일 형식입니다. (PDF, JPG, PNG만 가능)`)
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`파일 크기는 5MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
  }

  // ── 업로드 ────────────────────────────────────────
  const path = `${testId}/${docKey}_${file.name}`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true })

  if (error) throw new Error(error.message)

  // ── publicUrl 반환 ────────────────────────────────
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
