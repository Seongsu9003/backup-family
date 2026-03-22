'use client'

// ═══════════════════════════════════════════════════
//  전역 Error Boundary — Supabase/렌더링 오류 시 화면 크래시 방지
// ═══════════════════════════════════════════════════
import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 추후 Sentry 등 외부 로깅으로 교체 가능
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">
            일시적인 오류가 발생했습니다
          </h2>
          <p className="text-sm text-[#8A8A8A] mb-6 leading-relaxed">
            {this.state.message || '잠시 후 다시 시도해 주세요.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="px-6 py-2.5 bg-[#D85A3A] text-white text-sm font-semibold rounded-lg hover:bg-[#C04830] transition-colors"
          >
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
