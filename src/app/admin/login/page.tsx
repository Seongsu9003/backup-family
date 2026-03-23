import type { Metadata } from 'next'
import { LoginScreen } from '@/features/admin/ui/LoginScreen'

export const metadata: Metadata = {
  title: 'backup-family 관리자 로그인',
}

export default function LoginPage() {
  return <LoginScreen />
}
