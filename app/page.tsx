'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/generate')
    }
  }, [status, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-pink-50">
      {/* 네비게이션 */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm fixed w-full z-10 border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌼</span>
            <h2 className="text-2xl font-bold text-gray-800">알도AI</h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-full transition shadow-md"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-block bg-orange-100 text-orange-700 px-5 py-2 rounded-full text-sm font-semibold mb-6">
              어린이집 선생님을 위한 따뜻한 도구
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              매일의 알림장,<br />
              <span className="text-orange-500">따뜻하게</span> 작성하세요
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              아이들의 하루를 부모님께 전하는 소중한 시간,<br />
              알도AI가 선생님의 마음을 담아 따뜻한 문장으로 완성해드립니다
            </p>
            <Link
              href="/auth/signin"
              className="inline-block px-10 py-4 bg-orange-400 hover:bg-orange-500 text-white text-lg font-bold rounded-full transition shadow-lg hover:shadow-xl"
            >
              무료로 시작하기 →
            </Link>
          </div>

          {/* 실제 사용 예시 미리보기 */}
          <div className="mt-16 bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl">📝</span>
              <div className="flex-1">
                <div className="bg-orange-50 rounded-2xl p-6 mb-4">
                  <p className="text-sm text-gray-500 font-semibold mb-2">입력 내용</p>
                  <p className="text-gray-700 text-base">
                    아이: 지민 | 카테고리: 화장실 | 메모: 10시 쉬 성공, 스스로 말함
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
                  <p className="text-sm text-gray-500 font-semibold mb-3">생성된 알림장 ✨</p>
                  <p className="text-gray-800 text-lg leading-relaxed">
                    오늘 지민이가 화장실에서 정말 대견한 모습을 보였어요! 🌟 오전 10시쯤 스스로 "쉬 마려워요"라고 말하고 화장실에 가서 성공했답니다.
                    자기 몸의 신호를 알아차리고 표현하는 것은 정말 중요한 발달 과정이에요. 지민이가 점점 더 의젓해지고 있어요 💖
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 선생님들의 고민 해결 */}
      <section className="py-20 px-4 bg-white/60">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              이런 고민, 있으셨나요?
            </h2>
            <p className="text-xl text-gray-600">
              알도AI가 선생님의 일상을 도와드립니다
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
              <div className="text-4xl mb-4">😰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">매일 비슷한 표현만 반복돼요</h3>
              <p className="text-gray-600 leading-relaxed">
                같은 내용이라도 다양하고 따뜻한 표현으로 매번 새롭게 작성해드려요
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">알림장 작성에 시간이 너무 오래 걸려요</h3>
              <p className="text-gray-600 leading-relaxed">
                간단한 메모만 입력하면 몇 초 만에 완성된 알림장을 받아보세요
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
              <div className="text-4xl mb-4">💭</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">어떻게 표현해야 할지 막막해요</h3>
              <p className="text-gray-600 leading-relaxed">
                발달 단계와 상황에 맞는 적절한 표현을 AI가 제안해드려요
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">예전에 쓴 표현을 찾기 어려워요</h3>
              <p className="text-gray-600 leading-relaxed">
                생성한 알림장을 저장하고 언제든지 다시 활용할 수 있어요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              이렇게 사용해보세요
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">👶</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">간단한 정보 입력</h3>
              <p className="text-gray-600 leading-relaxed">
                아이 이름, 카테고리(화장실/식사/놀이/현장학습), 간단한 메모만 입력하세요
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">AI가 자동 작성</h3>
              <p className="text-gray-600 leading-relaxed">
                간결형/상세형 중 선택하면 AI가 따뜻하고 감성적인 문장으로 완성해드려요
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💾</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">복사하고 저장</h3>
              <p className="text-gray-600 leading-relaxed">
                클릭 한 번으로 복사하거나 저장하여 나중에 다시 사용할 수 있어요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 따뜻한 CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-100 via-yellow-100 to-pink-100">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
            <span className="text-5xl mb-6 block">🌸</span>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              선생님의 마음을 전하는<br />
              따뜻한 알림장
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              오늘부터 알도AI와 함께<br />
              더 따뜻하고 의미있는 알림장을 작성해보세요
            </p>
            <Link
              href="/auth/signin"
              className="inline-block px-12 py-5 bg-orange-400 hover:bg-orange-500 text-white text-xl font-bold rounded-full transition shadow-lg hover:shadow-xl"
            >
              지금 무료로 시작하기
            </Link>
            <p className="text-sm text-gray-500 mt-6">
              회원가입 없이 구글 계정으로 간편하게 시작하세요
            </p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-50 text-gray-600 py-12 px-4 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌼</span>
                <h3 className="text-xl font-bold text-gray-800">알도AI</h3>
              </div>
              <p className="text-gray-500 leading-relaxed">
                어린이집 선생님을 위한<br />
                따뜻한 AI 알림장 도우미
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-800">서비스</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/signin" className="hover:text-orange-500 transition">
                    알림장 생성
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signin" className="hover:text-orange-500 transition">
                    템플릿 관리
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-800">정보</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="hover:text-orange-500 transition">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-orange-500 transition">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-500">
            <p>© 2025 알도AI. Made with 💛 by Nathan & Claude Code</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
