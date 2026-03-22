import type { Metadata } from 'next'
import { AdminPage } from '@/features/admin'

export const metadata: Metadata = {
  title: 'backup-family 관리자',
}

export default function Page() {
  return <AdminPage />
}
