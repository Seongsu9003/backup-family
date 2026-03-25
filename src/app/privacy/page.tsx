// ═══════════════════════════════════════════════════
//  개인정보 처리방침 페이지
//  원본 문서: buf-app/docs/privacy-policy.md
// ═══════════════════════════════════════════════════
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: '백업패밀리(backup-family) 개인정보 처리방침입니다.',
}

/** 목차 항목 */
const TOC = [
  { id: 'article-1', label: '제1조 처리 목적' },
  { id: 'article-2', label: '제2조 처리 항목' },
  { id: 'article-3', label: '제3조 보유 기간' },
  { id: 'article-4', label: '제4조 제3자 제공' },
  { id: 'article-5', label: '제5조 처리 위탁' },
  { id: 'article-6', label: '제6조 정보주체 권리' },
  { id: 'article-7', label: '제7조 파기' },
  { id: 'article-8', label: '제8조 안전성 확보' },
  { id: 'article-9', label: '제9조 쿠키' },
  { id: 'article-10', label: '제10조 보호책임자' },
  { id: 'article-11', label: '제11조 권익침해 구제' },
  { id: 'article-12', label: '제12조 방침 변경' },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 bg-[#F7F5F2]/95 backdrop-blur-sm border-b border-[#E8E4DF] px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-[14px] font-bold text-[#D85A3A] tracking-[-0.02em]">
          backup-family
        </Link>
        <span className="text-[12px] text-[#9C9890]">개인정보 처리방침</span>
      </header>

      <div className="max-w-[820px] mx-auto px-5 py-10 sm:px-8">
        {/* 타이틀 */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#9C9890] mb-2">
            Privacy Policy
          </p>
          <h1
            className="font-black text-[#1A1714] mb-3"
            style={{ fontSize: 'clamp(24px, 3vw, 34px)', letterSpacing: '-0.04em', wordBreak: 'keep-all' } as React.CSSProperties}
          >
            개인정보 처리방침
          </h1>
          <div className="flex flex-wrap gap-3 text-[13px] text-[#5C5852]">
            <span>시행일: 2026년 3월 26일</span>
            <span className="text-[#E8E4DF]">|</span>
            <span className="font-semibold text-[#D85A3A]">버전 v1.0</span>
          </div>
        </div>

        {/* 목차 */}
        <nav className="bg-white border border-[#E8E4DF] rounded-2xl p-5 mb-8 relative overflow-hidden">
          <div className="absolute inset-[5px] rounded-[14px] border border-black/[0.04] pointer-events-none" />
          <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#9C9890] mb-3 relative" style={{ zIndex: 1 }}>
            목차
          </p>
          <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-1.5" style={{ zIndex: 1 }}>
            {TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-[12px] text-[#5C5852] hover:text-[#D85A3A] transition-colors py-0.5"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* 본문 */}
        <div className="space-y-10 text-[15px] leading-[1.8] text-[#1A1714]">

          {/* 도입 */}
          <p
            className="bg-[#FDF2EE] border border-[#F0C8BC] rounded-xl px-5 py-4 text-[13px] text-[#5C5852]"
            style={{ wordBreak: 'keep-all' } as React.CSSProperties}
          >
            <strong className="text-[#C04828]">백업패밀리(backup-family)</strong>는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          {/* 제1조 */}
          <section id="article-1">
            <ArticleTitle num={1} title="개인정보의 처리 목적" />
            <p className="mb-4" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
              백업패밀리는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <PolicyTable
              headers={['구분', '처리 목적']}
              rows={[
                ['돌봄이(구직자)', '돌봄 역량 레벨 테스트 결과 관리, 구인·구직 연결(직업소개) 서비스 제공, 인증 자격 관리'],
                ['보호자(구인자)', '돌봄이 문의 접수 및 연결, 구인·구직 매칭 서비스 제공'],
                ['공통', '서비스 이용 통계 분석, 법령상 의무 이행'],
              ]}
            />
          </section>

          {/* 제2조 */}
          <section id="article-2">
            <ArticleTitle num={2} title="처리하는 개인정보 항목" />
            <SubTitle>돌봄이(구직자)</SubTitle>
            <PolicyTable
              headers={['구분', '수집 항목']}
              rows={[
                ['필수', '성명, 연락처(전화번호 또는 이메일), 선호 활동 지역, 레벨 테스트 응시 결과(점수·레벨·돌봄 유형), 구직 활동 상태'],
                ['선택', '닉네임, 한 줄 자기소개(bio), 캐릭터 아바타'],
                ['자동 수집', '서비스 이용 일시(테스트 응시일 등)'],
              ]}
            />
            <SubTitle>보호자(구인자)</SubTitle>
            <PolicyTable
              headers={['구분', '수집 항목']}
              rows={[
                ['필수 (문의 시)', '성명, 연락처(전화번호 또는 이메일), 문의 내용'],
              ]}
            />
          </section>

          {/* 제3조 */}
          <section id="article-3">
            <ArticleTitle num={3} title="개인정보의 처리 및 보유 기간" />
            <p className="mb-4" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
              백업패밀리는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <PolicyTable
              headers={['구분', '보유 기간', '근거']}
              rows={[
                ['돌봄이 레벨 테스트 결과', '동의 철회 또는 서비스 탈퇴 시까지', '정보주체 동의'],
                ['보호자 문의 기록', '문의 접수일로부터 3년', '정보주체 동의'],
                ['서비스 이용 로그', '3개월', '통신비밀보호법'],
              ]}
            />
          </section>

          {/* 제4조 */}
          <section id="article-4">
            <ArticleTitle num={4} title="개인정보의 제3자 제공" />
            <ol className="list-decimal list-outside ml-5 space-y-2 text-[14px]" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
              <li>백업패밀리는 정보주체의 개인정보를 제1조에서 명시한 목적 범위 내에서만 처리하며, 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 제3자에게 제공합니다.</li>
              <li><strong>구직·구인 연결 목적의 제공:</strong> 돌봄이와 보호자 간 매칭이 성사되는 경우, 상호 동의 하에 연락처 등 필요한 정보를 제공할 수 있습니다.</li>
              <li>현재 백업패밀리는 정보주체의 별도 동의 없이 개인정보를 제3자에게 제공하고 있지 않습니다.</li>
            </ol>
          </section>

          {/* 제5조 */}
          <section id="article-5">
            <ArticleTitle num={5} title="개인정보 처리업무의 위탁" />
            <p className="mb-4" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
              백업패밀리는 원활한 개인정보 업무 처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
            </p>
            <PolicyTable
              headers={['수탁업체', '위탁 업무 내용', '보유·이용 기간']}
              rows={[
                ['Supabase, Inc.', '데이터베이스 저장 및 관리', '위탁 계약 종료 시까지'],
                ['Vercel Inc.', '웹 서비스 호스팅 및 배포', '위탁 계약 종료 시까지'],
              ]}
            />
          </section>

          {/* 제6조 */}
          <section id="article-6">
            <ArticleTitle num={6} title="정보주체의 권리·의무 및 행사 방법" />
            <p className="mb-3" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
              정보주체는 백업패밀리에 대해 언제든지 다음의 개인정보 보호 관련 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc list-outside ml-5 space-y-1 text-[14px] mb-4">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="text-[14px]" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
              권리 행사는 서면, 전자우편 등을 통하여 하실 수 있으며 백업패밀리는 이에 대해 지체 없이(10일 이내) 조치하겠습니다.
            </p>
          </section>

          {/* 제7조 */}
          <section id="article-7">
            <ArticleTitle num={7} title="개인정보의 파기" />
            <p className="mb-3" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
              백업패밀리는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
            </p>
            <PolicyTable
              headers={['파기 대상', '파기 방법']}
              rows={[
                ['전자적 파일 형태', '기록을 재생할 수 없는 기술적 방법(데이터베이스 영구 삭제)'],
                ['종이 출력물', '분쇄기로 분쇄하거나 소각'],
              ]}
            />
          </section>

          {/* 제8조 */}
          <section id="article-8">
            <ArticleTitle num={8} title="개인정보의 안전성 확보조치" />
            <PolicyTable
              headers={['조치 유형', '세부 내용']}
              rows={[
                ['관리적 조치', '개인정보 처리 담당자 최소화, 내부 접근 권한 관리'],
                ['기술적 조치', '개인정보 접근 권한 관리(Supabase RLS), HTTPS 암호화 전송, 식별자 마스킹 처리(화면 노출 시 성OO 형태로 익명화)'],
                ['물리적 조치', '클라우드 인프라 내 데이터 센터 접근 제한(Supabase 위탁)'],
              ]}
            />
          </section>

          {/* 제9조 */}
          <section id="article-9">
            <ArticleTitle num={9} title="개인정보 자동 수집 장치의 설치·운영 및 거부" />
            <ol className="list-decimal list-outside ml-5 space-y-2 text-[14px]" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
              <li>백업패밀리는 이용자에게 개별화된 서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 쿠키(cookie)를 사용할 수 있습니다.</li>
              <li>이용자는 웹브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 일부 제한이 있을 수 있습니다.</li>
            </ol>
          </section>

          {/* 제10조 */}
          <section id="article-10">
            <ArticleTitle num={10} title="개인정보 보호책임자" />
            <div className="bg-[#F7F5F2] border border-[#E8E4DF] rounded-xl px-5 py-4 inline-block">
              <p className="text-[13px] space-y-1">
                <span className="block"><strong>성명:</strong> 이성수</span>
                <span className="block"><strong>직책:</strong> 대표</span>
                <span className="block"><strong>연락처:</strong>{' '}
                  <a href="mailto:seongsu9003@gmail.com" className="text-[#D85A3A] hover:underline">
                    seongsu9003@gmail.com
                  </a>
                </span>
              </p>
            </div>
          </section>

          {/* 제11조 */}
          <section id="article-11">
            <ArticleTitle num={11} title="권익침해 구제 방법" />
            <p className="mb-3 text-[14px]" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
              개인정보침해로 인한 구제를 받기 위하여 아래 기관에 분쟁 해결이나 상담 등을 신청할 수 있습니다.
            </p>
            <PolicyTable
              headers={['기관', '연락처', '웹사이트']}
              rows={[
                ['개인정보분쟁조정위원회', '1833-6972', 'www.kopico.go.kr'],
                ['개인정보침해신고센터(KISA)', '118', 'privacy.kisa.or.kr'],
                ['대검찰청 사이버수사과', '1301', 'www.spo.go.kr'],
                ['경찰청 사이버수사국', '182', 'ecrm.cyber.go.kr'],
              ]}
            />
          </section>

          {/* 제12조 */}
          <section id="article-12">
            <ArticleTitle num={12} title="처리방침 변경" />
            <ol className="list-decimal list-outside ml-5 space-y-2 text-[14px]" style={{ wordBreak: 'keep-all' } as React.CSSProperties}>
              <li>이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가·삭제 및 정정이 있는 경우에는 변경 시행 7일 전부터 홈페이지를 통하여 고지합니다.</li>
              <li>이전 개인정보 처리방침은 아래 버전 이력에서 확인하실 수 있습니다.</li>
            </ol>
          </section>

          {/* 버전 이력 */}
          <section>
            <div className="border-t border-[#E8E4DF] pt-8">
              <p className="text-[11px] font-bold uppercase tracking-[.08em] text-[#9C9890] mb-4">
                Version History
              </p>
              <PolicyTable
                headers={['버전', '시행일', '변경 내용', '작성자']}
                rows={[
                  ['v1.0', '2026-03-26', '최초 작성 — 돌봄이·보호자 수집 항목, 위탁업체(Supabase·Vercel) 명시', '이성수'],
                ]}
              />
            </div>
          </section>
        </div>

        {/* 홈으로 */}
        <div className="mt-12 pt-8 border-t border-[#E8E4DF] flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] text-[#5C5852] hover:text-[#D85A3A] transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── 내부 컴포넌트 ────────────────────────────────────── */

function ArticleTitle({ num, title }: { num: number; title: string }) {
  return (
    <h2
      className="font-black text-[#1A1714] mb-4 flex items-baseline gap-2"
      style={{ fontSize: 'clamp(16px, 2vw, 19px)', letterSpacing: '-0.02em' }}
    >
      <span className="text-[#D85A3A] font-bold text-[14px]">제{num}조</span>
      {title}
    </h2>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-bold uppercase tracking-[.06em] text-[#9C9890] mt-5 mb-2">
      {children}
    </p>
  )
}

function PolicyTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-[#F7F5F2]">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left px-3 py-2 border border-[#E8E4DF] font-bold text-[#1A1714] whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2 border border-[#E8E4DF] text-[#5C5852] align-top"
                  style={{ wordBreak: 'keep-all' } as React.CSSProperties}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
