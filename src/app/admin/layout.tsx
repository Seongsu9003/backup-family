// 어드민 전용 레이아웃
// - 전역 RootLayout의 푸터를 오버라이드하기 위해 별도 레이아웃 사용
// - AdminPage 자체가 min-h-screen 사이드바 구조를 가지므로
//   추가 wrapper 없이 children만 렌더링합니다.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
