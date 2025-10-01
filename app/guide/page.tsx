'use client'

import Link from 'next/link'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">알도AI 사용 가이드</h1>
          <p className="text-xl text-gray-600">
            어린이집 문서를 쉽고 빠르게 작성하는 방법
          </p>
        </div>

        {/* 빠른 시작 가이드 */}
        <div className="bg-white rounded-3xl shadow-xl p-10 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span>🚀</span>
            빠른 시작 가이드
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">문서 종류 선택</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  알림장, 보육일지, 관찰기록, 발달평가, 부모면담 중 원하는 문서를 선택하세요.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    💡 <strong>추천:</strong> 처음 사용하시는 분은 <strong>알림장</strong>부터 시작해보세요!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">아이 선택 또는 입력</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  등록된 아이를 선택하거나, 직접 이름을 입력할 수 있어요.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>등록된 아이 선택:</strong> 이전 설정과 문서를 불러올 수 있어요</li>
                  <li><strong>직접 입력:</strong> 빠르게 작성하고 싶을 때 사용하세요</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">내용 입력</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  오늘 있었던 일을 간단히 메모해주세요. 자세할수록 좋아요!
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <p className="text-sm font-bold text-blue-900 mb-2">✏️ 좋은 입력 예시:</p>
                  <p className="text-sm text-gray-800">
                    "지민이가 오전 10시쯤 스스로 '쉬 마려워요'라고 말하고 화장실에 가서 성공했어요.
                    그 후 혼자 손을 씻고 돌아왔습니다."
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">스타일 선택</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  문서의 톤과 길이를 선택하세요.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-pink-50 rounded-lg p-3 border-2 border-pink-200">
                    <p className="font-bold text-pink-900 mb-1">💕 감성적</p>
                    <p className="text-xs text-gray-700">따뜻하고 애정 어린 표현</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                    <p className="font-bold text-blue-900 mb-1">⚖️ 균형</p>
                    <p className="text-xs text-gray-700">정보와 감성의 조화</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                    <p className="font-bold text-green-900 mb-1">📋 정보형</p>
                    <p className="text-xs text-gray-700">명확하고 간결한 전달</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">생성하기</h3>
                <p className="text-gray-700 leading-relaxed">
                  버튼을 클릭하면 몇 초 안에 완성된 문서를 받아볼 수 있어요!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 고급 기능 */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-10 mb-8 border-2 border-purple-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span>⚙️</span>
            고급 기능
          </h2>

          <div className="space-y-6">
            {/* 커리큘럼 모드 */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🎓</span>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">커리큘럼 모드</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    아이의 나이에 따라 <strong>제4차 표준보육과정</strong>(0-2세) 또는
                    <strong>2019 개정 누리과정</strong>(3-5세)을 자동으로 적용합니다.
                  </p>

                  <div className="bg-blue-50 rounded-lg p-4 mb-4 border-2 border-blue-200">
                    <p className="text-sm font-bold text-blue-900 mb-2">📚 커리큘럼 모드에서는:</p>
                    <ul className="text-sm text-gray-800 space-y-1.5 ml-5 list-disc">
                      <li>발달 영역에 맞는 교육 목표가 자동으로 연결됩니다</li>
                      <li>연령별 발달 특성을 고려한 문서가 생성됩니다</li>
                      <li>평가인증 준비에 도움이 됩니다</li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-pink-50 rounded-lg p-4 border-2 border-pink-200">
                      <p className="font-bold text-pink-900 mb-2">👶 영아 (0-2세)</p>
                      <p className="text-sm text-gray-700 mb-2">제4차 표준보육과정</p>
                      <ul className="text-xs text-gray-700 space-y-0.5">
                        <li>• 기본생활</li>
                        <li>• 신체운동</li>
                        <li>• 의사소통</li>
                        <li>• 사회관계</li>
                        <li>• 예술경험</li>
                        <li>• 자연탐구</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                      <p className="font-bold text-blue-900 mb-2">🧒 유아 (3-5세)</p>
                      <p className="text-sm text-gray-700 mb-2">2019 개정 누리과정</p>
                      <ul className="text-xs text-gray-700 space-y-0.5">
                        <li>• 신체운동·건강</li>
                        <li>• 의사소통</li>
                        <li>• 사회관계</li>
                        <li>• 예술경험</li>
                        <li>• 자연탐구</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 전문 지식 모드 */}
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-6 shadow-md border-2 border-purple-300">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🧠</span>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    전문 지식 모드
                    <span className="ml-2 px-3 py-1 bg-purple-200 text-purple-900 text-sm rounded-full">30❤️</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    보육과정 전문 자료를 바탕으로 최고 수준의 전문 문서를 생성합니다.
                  </p>

                  <div className="bg-white rounded-lg p-4 mb-4 border-2 border-purple-300">
                    <p className="text-sm font-bold text-purple-900 mb-2">🔍 전문 지식 모드의 특징:</p>
                    <ul className="text-sm text-gray-800 space-y-1.5 ml-5 list-disc">
                      <li><strong>발달 이론 기반:</strong> 피아제, 비고츠키 등 발달 이론을 반영합니다</li>
                      <li><strong>교육과정 연결:</strong> 관찰 내용을 교육과정 목표와 정확히 연결합니다</li>
                      <li><strong>전문적 해석:</strong> 아이의 행동을 전문적 관점에서 해석합니다</li>
                      <li><strong>배움읽기/배움지원:</strong> 관찰-해석-교육과정 연결 구조를 제공합니다</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                    <p className="text-sm font-bold text-purple-900 mb-2">💡 이런 경우에 사용하세요:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-300">평가인증 대비</span>
                      <span className="bg-white px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-300">관찰일지 작성</span>
                      <span className="bg-white px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-300">발달평가 보고서</span>
                      <span className="bg-white px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-300">전문적 부모 상담</span>
                      <span className="bg-white px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-300">교사 연수 자료</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 전문 지식의 출처 */}
        <div className="bg-white rounded-3xl shadow-xl p-10 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span>📚</span>
            전문 지식의 출처
          </h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            알도AI의 전문 지식 모드는 다음과 같은 공식 자료와 전문 이론을 바탕으로 작동합니다:
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-3">🏛️ 공식 보육과정</h3>
              <ul className="text-gray-800 space-y-2 ml-5 list-disc">
                <li>
                  <strong>제4차 표준보육과정</strong> (2020.9.25 고시)
                  <p className="text-sm text-gray-600 mt-1">
                    보건복지부 고시 제2020-75호, 0-2세 영아 보육과정
                  </p>
                </li>
                <li>
                  <strong>2019 개정 누리과정</strong> (2019.7.24 고시)
                  <p className="text-sm text-gray-600 mt-1">
                    교육부 고시 제2019-189호, 3-5세 유아 교육과정
                  </p>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-5 border-2 border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-3">🧪 발달 이론 및 연구</h3>
              <ul className="text-gray-800 space-y-2 ml-5 list-disc">
                <li><strong>피아제(Piaget) 인지발달이론:</strong> 감각운동기, 전조작기 발달 단계</li>
                <li><strong>비고츠키(Vygotsky) 사회문화이론:</strong> 근접발달영역, 비계설정</li>
                <li><strong>에릭슨(Erikson) 심리사회발달이론:</strong> 신뢰감 형성, 자율성 발달</li>
                <li><strong>애착 이론:</strong> 안정 애착 형성과 사회정서 발달</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-5 border-2 border-purple-200">
              <h3 className="text-lg font-bold text-purple-900 mb-3">📖 관찰 및 기록 방법론</h3>
              <ul className="text-gray-800 space-y-2 ml-5 list-disc">
                <li><strong>일화기록법:</strong> 객관적 사실 중심 기록</li>
                <li><strong>배움읽기(Learning Story):</strong> 관찰-해석-교육과정 연결</li>
                <li><strong>포트폴리오 평가:</strong> 발달 과정 중심 평가</li>
              </ul>
            </div>

            <div className="bg-amber-50 rounded-lg p-5 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-amber-900 mb-3">🎯 연령별 발달 마일스톤</h3>
              <p className="text-gray-800 mb-2">
                각 연령별 발달 특성과 기대되는 발달 수준을 포함합니다:
              </p>
              <ul className="text-gray-800 space-y-1 ml-5 list-disc">
                <li>신체운동 발달 (대근육, 소근육)</li>
                <li>언어 및 의사소통 발달</li>
                <li>인지 및 사고 발달</li>
                <li>사회정서 발달</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-5 border border-gray-300">
            <p className="text-sm text-gray-700 leading-relaxed">
              💡 <strong>참고:</strong> 전문 지식 모드는 위의 공식 자료와 이론을 기반으로 하지만,
              AI가 생성한 내용이므로 최종적으로는 담당 교사의 전문적 판단을 통해 검토하시기 바랍니다.
            </p>
          </div>
        </div>

        {/* 하트 시스템 */}
        <div className="bg-white rounded-3xl shadow-xl p-10 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span>❤️</span>
            하트 시스템
          </h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            알도AI는 하루 40개의 하트를 무료로 제공합니다. 매일 자정에 자동으로 재충전됩니다.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-200 text-center">
              <p className="text-3xl mb-2">📝</p>
              <p className="text-2xl font-bold text-blue-900 mb-1">10❤️</p>
              <p className="text-sm text-gray-700">문서 생성</p>
            </div>
            <div className="bg-green-50 rounded-lg p-5 border-2 border-green-200 text-center">
              <p className="text-3xl mb-2">✏️</p>
              <p className="text-2xl font-bold text-green-900 mb-1">3❤️</p>
              <p className="text-sm text-gray-700">문서 수정</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-5 border-2 border-purple-200 text-center">
              <p className="text-3xl mb-2">🧠</p>
              <p className="text-2xl font-bold text-purple-900 mb-1">30❤️</p>
              <p className="text-sm text-gray-700">전문 지식 모드</p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-5 border-2 border-amber-200">
            <p className="text-sm font-bold text-amber-900 mb-2">💡 하트 절약 팁:</p>
            <ul className="text-sm text-gray-800 space-y-1.5 ml-5 list-disc">
              <li><strong>일반 생성으로 먼저 확인:</strong> 일반 모드(10❤️)로 먼저 생성해보고, 필요할 때만 전문 지식 모드(30❤️)를 사용하세요</li>
              <li><strong>수정 기능 활용:</strong> 재생성(10❤️)보다 수정 기능(3❤️)을 사용하면 하트를 절약할 수 있어요</li>
              <li><strong>이전 설정 불러오기:</strong> 같은 아이의 문서를 작성할 때 이전 설정을 불러오면 시간을 절약할 수 있어요</li>
            </ul>
          </div>
        </div>

        {/* 유용한 팁 */}
        <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl shadow-xl p-10 mb-8 border-2 border-orange-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span>💡</span>
            유용한 팁
          </h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">✏️ 입력은 구체적으로</h3>
              <p className="text-gray-700 mb-3">
                시간, 장소, 구체적인 행동을 포함하면 더 자세한 문서가 생성됩니다.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-red-50 rounded p-3 border border-red-200">
                  <p className="text-xs font-bold text-red-700 mb-1">❌ 추상적인 입력</p>
                  <p className="text-sm text-gray-800">"지민이가 잘 놀았어요"</p>
                </div>
                <div className="bg-green-50 rounded p-3 border border-green-200">
                  <p className="text-xs font-bold text-green-700 mb-1">✅ 구체적인 입력</p>
                  <p className="text-sm text-gray-800">"오전 10시, 지민이가 블록 영역에서 친구들과 함께 높은 탑을 쌓았어요"</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🔄 수정 기능 활용</h3>
              <p className="text-gray-700">
                생성된 문서가 마음에 들지 않으면 수정 기능을 사용하세요. 길이 조절, 톤 변경, 맞춤 수정 등 다양한 옵션이 있습니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📋 이전 문서 보기</h3>
              <p className="text-gray-700">
                등록된 아이를 선택하면 '이전 문서 보기' 버튼이 나타납니다. 과거에 작성한 문서를 확인하고 복사할 수 있어요.
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">⚙️ 이전 설정 불러오기</h3>
              <p className="text-gray-700">
                같은 아이의 문서를 다시 작성할 때 '이전 설정 불러오기'를 클릭하면 톤, 스타일 등이 자동으로 설정됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/generate"
            className="inline-block px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-full transition shadow-lg"
          >
            지금 바로 시작하기 →
          </Link>
        </div>
      </main>
    </div>
  )
}
