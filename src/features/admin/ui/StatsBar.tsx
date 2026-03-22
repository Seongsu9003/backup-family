'use client'

import type { TestResult } from '@/shared/types'
import { isExpiringSoon } from '../model/types'

interface Props {
  results: TestResult[]
}

export function StatsBar({ results }: Props) {
  const stats = [
    { label: '전체 신청자',    value: results.length,                                                            color: 'text-[#1A1A1A]' },
    { label: '검토 대기',      value: results.filter(r => r.certification.status === '검토중').length,          color: 'text-[#B07D00]' },
    { label: '인증 완료',      value: results.filter(r => r.certification.status === '인증완료').length,        color: 'text-[#1A7A45]' },
    { label: '구직 Pool',     value: results.filter(r => r.job_seeking !== '구직 의사 없음').length,           color: 'text-[#1A1A1A]' },
    { label: '만료 임박 (7일)', value: results.filter(r => isExpiringSoon(r)).length,                           color: 'text-[#E65100]' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
      {stats.map(({ label, value, color }) => (
        <div key={label} className="bg-white border border-[#E4E0DC] rounded-xl px-4 py-3 text-center">
          <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
          <div className="text-[.73rem] text-[#8A8A8A] mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  )
}
