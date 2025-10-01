'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/generate')
    }
  }, [status, router])

  const handleLogin = () => {
    signIn('google', { callbackUrl: '/generate' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-pink-50">
      {/* 네비게이션 */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm fixed w-full z-10 border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌼</span>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800">알도AI</h2>
              <span className="text-xs text-orange-600 font-semibold">BETA</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-full transition shadow-md"
            >
              시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-block bg-orange-100 text-orange-700 px-5 py-2 rounded-full text-sm font-semibold mb-6">
              ✨ 베타 서비스 · 어린이집 선생님을 위한 특별한 동반자
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              오늘도 고생하신<br />
              선생님의 <span className="text-orange-500">마음</span>을 전해드려요
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              아이들의 작은 성장도 놓치지 않는 선생님의 따뜻한 시선을<br />
              <span className="font-semibold text-gray-700">감성적·균형·정보형</span> 톤으로 완벽하게 담아드립니다 💝
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-block px-10 py-4 bg-orange-400 hover:bg-orange-500 text-white text-lg font-bold rounded-full transition shadow-lg hover:shadow-xl"
            >
              무료로 시작하기 →
            </button>
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

      {/* 고급 생성 기능 강조 - NEW */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block bg-purple-100 text-purple-700 px-5 py-2 rounded-full text-sm font-semibold mb-4">
              🆕 NEW FEATURE
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              <span className="text-purple-600">전문가급 고급 생성</span> 기능
            </h2>
            <p className="text-xl text-gray-600">
              제4차 표준보육과정 & 2019 누리과정을 완벽히 준수하는 전문 문서
            </p>
          </div>

          {/* 커리큘럼 기반 생성 */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-purple-200 mb-8">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">🎓</span>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">커리큘럼 기반 전문 문서</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                연령과 발달 영역에 맞춘 정확한 교육과정 준수 문서 생성
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl p-6 border-2 border-pink-300">
                <h4 className="text-xl font-bold text-gray-900 mb-3">👶 영아 (0-2세)</h4>
                <p className="text-gray-800 mb-3 font-semibold text-base">제4차 표준보육과정</p>
                <ul className="text-base text-gray-800 space-y-1.5 font-medium">
                  <li>✓ 기본생활</li>
                  <li>✓ 신체운동</li>
                  <li>✓ 의사소통</li>
                  <li>✓ 사회관계</li>
                  <li>✓ 예술경험</li>
                  <li>✓ 자연탐구</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-blue-300">
                <h4 className="text-xl font-bold text-gray-900 mb-3">🧒 유아 (3-5세)</h4>
                <p className="text-gray-800 mb-3 font-semibold text-base">2019 개정 누리과정</p>
                <ul className="text-base text-gray-800 space-y-1.5 font-medium">
                  <li>✓ 신체운동·건강</li>
                  <li>✓ 의사소통</li>
                  <li>✓ 사회관계</li>
                  <li>✓ 예술경험</li>
                  <li>✓ 자연탐구</li>
                </ul>
              </div>
            </div>

            {/* 출력 유형 */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border-2 border-green-300">
                <div className="text-3xl mb-2">📝</div>
                <h5 className="text-lg font-bold text-gray-900 mb-2">알림장</h5>
                <p className="text-base text-gray-800 font-medium">
                  교육과정 기반 부모 소통
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-5 border-2 border-yellow-300">
                <div className="text-3xl mb-2">🔍</div>
                <h5 className="text-lg font-bold text-gray-900 mb-2">배움읽기</h5>
                <p className="text-base text-gray-800 font-medium">
                  관찰 → 해석 → 교육과정 연결
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-5 border-2 border-purple-300">
                <div className="text-3xl mb-2">🎯</div>
                <h5 className="text-lg font-bold text-gray-900 mb-2">배움지원</h5>
                <p className="text-base text-gray-800 font-medium">
                  확장/심화 활동 2단계 제안
                </p>
              </div>
            </div>

            {/* 커리큘럼 적용 예시 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-300">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">💡 커리큘럼 적용 예시</h4>
                <p className="text-base text-gray-700 font-medium">만 3세 | 신체운동·건강 | 배움읽기</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-5 border-2 border-indigo-300">
                  <p className="text-sm text-gray-700 font-bold mb-2">📋 입력 내용</p>
                  <p className="text-base text-gray-900 font-medium">
                    지민이가 오늘 친구들과 술래잡기를 하며 빠르게 뛰어다녔습니다. 넘어지지 않고 방향을 바꾸며 잘 달렸어요.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border-2 border-indigo-400">
                  <p className="text-sm text-purple-800 font-bold mb-4">✨ 커리큘럼 기반 생성 결과 (배움읽기)</p>

                  <div className="space-y-3 text-base text-gray-900">
                    <div>
                      <p className="font-bold text-indigo-800 mb-2">🔍 관찰</p>
                      <p className="leading-relaxed font-medium">
                        지민이는 술래잡기 놀이에서 빠르게 달리며 친구들을 쫓거나 피하는 모습을 보였습니다.
                        방향을 바꿀 때도 균형을 잃지 않고 안정적으로 움직였습니다.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-indigo-800 mb-2">💭 해석</p>
                      <p className="leading-relaxed font-medium">
                        이는 대근육 조절 능력과 공간 지각 능력이 발달하고 있음을 보여줍니다.
                        또한 또래와의 놀이를 통해 신체 활동에 대한 즐거움과 자신감을 형성하고 있습니다.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-indigo-800 mb-2">🎓 교육과정 연결</p>
                      <p className="leading-relaxed bg-white p-4 rounded-lg border-2 border-indigo-300 font-medium">
                        <span className="font-bold text-indigo-900">2019 개정 누리과정 - 신체운동·건강</span><br/>
                        • 신체활동에 자발적으로 참여한다<br/>
                        • 신체 균형과 조절 능력을 기른다
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RAG 전문가 모드 */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-10 text-white">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">🧠</span>
              <h3 className="text-3xl font-bold mb-4">RAG 전문가 모드</h3>
              <p className="text-lg opacity-90 leading-relaxed">
                보육과정 전문 자료 기반 최고 수준의 문서 생성
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
                <h4 className="text-xl font-bold mb-4 text-white">📚 전문 지식베이스</h4>
                <ul className="space-y-2.5 text-base font-medium text-white">
                  <li>✓ 발달 이론 및 연구 기반</li>
                  <li>✓ 관찰 기록 모범 사례</li>
                  <li>✓ 연령별 발달 단계 상세 자료</li>
                  <li>✓ 커리큘럼 목표 정확 연결</li>
                </ul>
              </div>

              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30">
                <h4 className="text-xl font-bold mb-4 text-white">⚡ 강력한 효과</h4>
                <ul className="space-y-2.5 text-base font-medium text-white">
                  <li>✓ 전문적이고 교육적인 내용</li>
                  <li>✓ 발달 단계별 맞춤 활동</li>
                  <li>✓ 이론적 근거 기반 해석</li>
                  <li>✓ 교육기관 평가 대비 완벽</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center border-2 border-white/30">
              <p className="text-base font-semibold text-white">
                💡 <strong>사용량 안내:</strong> RAG 전문가 모드는 30❤️를 사용합니다 (일반 생성 10❤️ × 3배)
              </p>
            </div>
          </div>

          {/* RAG ON/OFF 비교 예시 */}
          <div className="mt-8 bg-white rounded-3xl shadow-2xl p-10 border-2 border-purple-200">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                🔄 RAG 전문가 모드 비교
              </h3>
              <p className="text-gray-600">같은 입력, 놀라운 차이</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* RAG OFF */}
              <div className="flex flex-col">
                <div className="bg-gray-100 rounded-xl p-5 border-2 border-gray-300 flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📝</span>
                    <h4 className="text-lg font-bold text-gray-900">일반 생성 (10❤️)</h4>
                  </div>
                  <div className="bg-white rounded-lg p-5 leading-relaxed">
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      📋 입력: 만 1세 서연이가 블록을 쌓다가 무너뜨리고 다시 쌓기를 반복했어요
                    </p>
                    <hr className="my-4 border-gray-300"/>
                    <p className="text-base text-gray-900 font-medium">
                      오늘 서연이는 블록 놀이를 즐겼습니다. 블록을 쌓다가 무너지면 다시 쌓기를 반복하며
                      끈기 있게 놀이했어요. 블록을 쌓고 무너뜨리는 과정을 여러 번 반복하며
                      즐거워하는 모습이 보였답니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-sm text-gray-700 font-medium">
                  <span>✓ 빠른 생성</span>
                  <span className="text-gray-400">•</span>
                  <span>✓ 기본적인 내용</span>
                </div>
              </div>

              {/* RAG ON */}
              <div className="flex flex-col">
                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-5 border-2 border-purple-400 flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🧠</span>
                    <h4 className="text-lg font-bold text-purple-900">RAG 전문가 모드 (30❤️)</h4>
                  </div>
                  <div className="bg-white rounded-lg p-5 leading-relaxed">
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      📋 입력: 만 1세 서연이가 블록을 쌓다가 무너뜨리고 다시 쌓기를 반복했어요
                    </p>
                    <hr className="my-4 border-gray-300"/>
                    <p className="text-base text-gray-900 font-medium mb-3">
                      <strong className="text-purple-700">🔍 관찰:</strong> 서연이는 블록 2-3개를 수직으로 쌓다가 무너지는 것을 관찰하고,
                      다시 쌓기를 5회 이상 반복했습니다.
                    </p>
                    <p className="text-base text-gray-900 font-medium mb-3">
                      <strong className="text-purple-700">💭 해석:</strong> 이는 만 1세 영아의 전형적인 '순환 반응' 행동으로,
                      자신의 행동이 결과에 미치는 영향을 탐색하는 과정입니다.
                      블록이 무너지는 인과관계를 이해하고, 손과 눈의 협응력을 발달시키고 있습니다.
                    </p>
                    <p className="text-base text-gray-900 font-medium bg-purple-50 p-3 rounded border border-purple-200">
                      <strong className="text-purple-900">🎓 제4차 표준보육과정 - 자연탐구:</strong><br/>
                      • 주변 환경과 자연에 관심을 가진다 (탐구과정 즐기기)<br/>
                      • 물체의 특성과 변화를 여러 감각으로 탐색한다
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-sm text-purple-800 font-semibold">
                  <span>✓ 발달 이론 기반</span>
                  <span className="text-purple-400">•</span>
                  <span>✓ 교육과정 연결</span>
                  <span className="text-purple-400">•</span>
                  <span>✓ 전문적 해석</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-300">
              <div className="text-center">
                <p className="text-base text-gray-800 mb-3 font-semibold">
                  💡 RAG 전문가 모드가 적합한 경우:
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  <span className="bg-white px-4 py-2 rounded-full border-2 border-purple-300 text-gray-800 font-medium">평가인증 대비</span>
                  <span className="bg-white px-4 py-2 rounded-full border-2 border-purple-300 text-gray-800 font-medium">관찰일지 작성</span>
                  <span className="bg-white px-4 py-2 rounded-full border-2 border-purple-300 text-gray-800 font-medium">발달평가 보고서</span>
                  <span className="bg-white px-4 py-2 rounded-full border-2 border-purple-300 text-gray-800 font-medium">전문적인 부모 상담</span>
                  <span className="bg-white px-4 py-2 rounded-full border-2 border-purple-300 text-gray-800 font-medium">교사 연수 자료</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 톤 선택 기능 강조 */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              선생님만의 <span className="text-orange-500">특별한 톤</span>으로
            </h2>
            <p className="text-xl text-gray-600">
              상황과 감정에 맞는 3가지 톤을 선택할 수 있어요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* 감성적 톤 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-3xl shadow-xl p-8 border-2 border-pink-200 transform hover:scale-105 transition">
              <div className="text-5xl mb-4 text-center">💕</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">감성적</h3>
              <p className="text-gray-700 leading-relaxed mb-6 text-center">
                따뜻하고 애정 어린 표현으로<br />
                부모님의 마음을 울려요
              </p>
              <div className="bg-white/80 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed">
                "오늘 민수가 친구와 함께 블록을 쌓으며 활짝 웃는 모습이 정말 사랑스러웠어요 💖
                서로 도와가며 높은 탑을 완성하는 모습에서 민수의 따뜻한 마음씨가 느껴졌답니다"
              </div>
            </div>

            {/* 균형 톤 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-xl p-8 border-2 border-blue-200 transform hover:scale-105 transition">
              <div className="text-5xl mb-4 text-center">⚖️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">균형</h3>
              <p className="text-gray-700 leading-relaxed mb-6 text-center">
                정보와 감성의 조화로<br />
                전문적이면서도 따뜻하게
              </p>
              <div className="bg-white/80 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed">
                "오늘 민수는 친구와 협동하며 블록 놀이를 즐겼습니다.
                함께 탑을 쌓으며 의견을 조율하고 역할을 나누는 모습에서 사회성 발달을 확인할 수 있었어요"
              </div>
            </div>

            {/* 정보형 톤 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl shadow-xl p-8 border-2 border-green-200 transform hover:scale-105 transition">
              <div className="text-5xl mb-4 text-center">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">정보형</h3>
              <p className="text-gray-700 leading-relaxed mb-6 text-center">
                명확하고 간결한 전달로<br />
                필요한 정보만 정확하게
              </p>
              <div className="bg-white/80 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed">
                "오늘 민수는 친구와 블록 놀이를 진행했습니다.
                약 30분간 협동하여 탑을 쌓았으며, 놀이 중 긍정적인 상호작용이 관찰되었습니다"
              </div>
            </div>
          </div>

          {/* 사용 방법 */}
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-orange-100">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">간단한 3단계</h3>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">1️⃣</span>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">간단히 입력</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  아이 이름과 오늘의<br />간단한 메모만 적으세요
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">2️⃣</span>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">톤 & 옵션 선택</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  감성적/균형/정보형 톤 선택<br />
                  <span className="text-purple-600 font-semibold">+ 고급 옵션 (커리큘럼 준수)</span>
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">3️⃣</span>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">바로 완성</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  클릭 한 번으로<br />완성된 문서를 받아보세요
                </p>
              </div>
            </div>

            {/* 고급 옵션 안내 */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-300">
              <div className="flex items-start gap-4">
                <span className="text-3xl">⚙️</span>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">고급 옵션으로 더 전문적으로!</h4>
                  <ul className="text-base text-gray-800 space-y-2 font-medium">
                    <li>✓ 만 나이 선택 → 자동 커리큘럼 적용 (표준보육과정 / 누리과정)</li>
                    <li>✓ 발달 영역 선택 → 정확한 교육 목표 연결</li>
                    <li>✓ 출력 유형 선택 → 알림장 / 배움읽기 / 배움지원</li>
                    <li>✓ <span className="text-purple-700 font-bold">RAG 전문가 모드 → 최고 수준의 전문 문서</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 따뜻한 CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-100 via-yellow-100 to-pink-100">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl">
            <span className="text-5xl mb-6 block">💐</span>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              하루 종일 아이들과 함께하느라<br />
              지친 <span className="text-orange-500">선생님을 위한 선물</span>
            </h2>
            <p className="text-xl text-gray-600 mb-4 leading-relaxed">
              더 이상 알림장 작성에 시간을 쏟지 마세요
            </p>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed">
              알도AI가 선생님의 따뜻한 마음을<br />
              <span className="font-semibold text-orange-600">감성적·균형·정보형</span> 3가지 톤으로 완벽하게 전달해드려요
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-block px-12 py-5 bg-orange-400 hover:bg-orange-500 text-white text-xl font-bold rounded-full transition shadow-lg hover:shadow-xl mb-4"
            >
              오늘부터 편하게 시작하기 ✨
            </button>
            <p className="text-sm text-gray-500 mb-2">
              구글 계정으로 간편하게 시작 · 하루 40❤️ 무료
            </p>
            <p className="text-xs text-gray-600 font-medium mb-2">
              💡 생성 10❤️ | 수정 3❤️ | RAG 30❤️
            </p>
            <p className="text-xs text-purple-600 font-semibold mb-2">
              🎓 고급 생성 & 🧠 RAG 전문가 모드 지원
            </p>
            <p className="text-xs text-orange-600 font-semibold">
              현재 베타 서비스 운영 중입니다
            </p>
          </div>
        </div>
      </section>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>

            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🌼</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">알도AI 시작하기</h2>
              <p className="text-gray-600">구글 계정으로 간편하게 로그인하세요</p>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-semibold py-4 px-6 rounded-lg transition flex items-center justify-center gap-3 mb-4"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 계속하기
            </button>

            <p className="text-xs text-gray-500 text-center">
              로그인 시 <Link href="/terms" className="text-blue-600 hover:underline">이용약관</Link> 및{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</Link>에 동의하게 됩니다.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
