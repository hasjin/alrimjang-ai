'use client'

import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">개인정보 처리방침</h1>

          <div className="space-y-8 text-gray-800 leading-relaxed">
            <section>
              <p className="text-base mb-4">
                알도AI(이하 "회사")는 이용자의 개인정보를 중요시하며, "정보통신망 이용촉진 및 정보보호 등에 관한 법률",
                "개인정보보호법" 등 관련 법규를 준수하고 있습니다. 회사는 개인정보처리방침을 통하여 이용자가 제공하는
                개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지
                알려드립니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 개인정보의 수집 항목 및 수집 방법</h2>
              <div className="space-y-3 text-base">
                <p className="font-semibold">가. 수집하는 개인정보 항목</p>
                <p>회사는 회원가입, 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                <p className="ml-6">① 필수항목: 이메일 주소, 이름, 프로필 사진 (Google 로그인 시)</p>
                <p className="ml-6">② 선택항목: 없음</p>
                <p className="ml-6">③ 서비스 이용 과정에서 자동으로 생성되어 수집되는 정보: 서비스 이용기록, 접속 로그, 쿠키, IP주소</p>

                <p className="font-semibold mt-4">나. 개인정보 수집 방법</p>
                <p className="ml-6">① Google OAuth 소셜 로그인</p>
                <p className="ml-6">② 서비스 이용 과정에서 자동 수집</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 개인정보의 수집 및 이용 목적</h2>
              <div className="space-y-3 text-base">
                <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
                <p className="ml-6">① 회원관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지</p>
                <p className="ml-6">② 서비스 제공: AI 알림장 생성 및 저장, 템플릿 관리</p>
                <p className="ml-6">③ 서비스 개선: 신규 서비스 개발 및 맞춤 서비스 제공, 통계학적 특성에 따른 서비스 제공</p>
                <p className="ml-6">④ 고지사항 전달: 공지사항 전달, 불만처리 등을 위한 원활한 의사소통 경로의 확보</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
              <div className="space-y-3 text-base">
                <p>회사는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
                   단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안
                   회원정보를 보관합니다.</p>

                <p className="font-semibold mt-4">가. 회사 내부 방침에 의한 정보 보유</p>
                <p className="ml-6">① 회원 탈퇴 시: 탈퇴 즉시 삭제</p>

                <p className="font-semibold mt-4">나. 관련 법령에 의한 정보 보유</p>
                <p className="ml-6">① 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</p>
                <p className="ml-6">② 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</p>
                <p className="ml-6">③ 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</p>
                <p className="ml-6">④ 웹사이트 방문 기록: 3개월 (통신비밀보호법)</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 개인정보의 파기 절차 및 방법</h2>
              <div className="space-y-3 text-base">
                <p>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다.
                   파기절차 및 방법은 다음과 같습니다.</p>

                <p className="font-semibold mt-4">가. 파기절차</p>
                <p className="ml-6">이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져
                   내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.</p>

                <p className="font-semibold mt-4">나. 파기방법</p>
                <p className="ml-6">① 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</p>
                <p className="ml-6">② 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 개인정보의 제3자 제공</h2>
              <div className="space-y-3 text-base">
                <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
                <p className="ml-6">① 이용자가 사전에 동의한 경우</p>
                <p className="ml-6">② 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 개인정보 처리의 위탁</h2>
              <div className="space-y-3 text-base">
                <p>회사는 서비스 향상을 위해서 아래와 같이 개인정보를 위탁하고 있으며, 관계 법령에 따라 위탁계약 시
                   개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.</p>

                <p className="font-semibold mt-4">수탁업체 및 위탁업무 내용</p>
                <p className="ml-6">① Google: OAuth 소셜 로그인 서비스</p>
                <p className="ml-6">② Anthropic: AI 텍스트 생성 서비스</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 이용자 및 법정대리인의 권리와 행사 방법</h2>
              <div className="space-y-3 text-base">
                <p>① 이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며
                   가입 해지를 요청할 수도 있습니다.</p>
                <p>② 이용자의 개인정보 조회, 수정을 위해서는 '개인정보변경'(또는 '회원정보수정' 등)을,
                   가입 해지(동의철회)를 위해서는 "회원탈퇴"를 클릭하여 본인 확인 절차를 거치신 후 직접 열람, 정정 또는 탈퇴가 가능합니다.</p>
                <p>③ 혹은 개인정보관리책임자에게 서면, 전화 또는 이메일로 연락하시면 지체없이 조치하겠습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항</h2>
              <div className="space-y-3 text-base">
                <p>회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는
                   '쿠키(cookie)'를 사용합니다.</p>

                <p className="font-semibold mt-4">가. 쿠키의 사용 목적</p>
                <p className="ml-6">① 이용자의 접속 빈도나 방문 시간 등을 분석하여 서비스 개편 등의 척도로 활용</p>

                <p className="font-semibold mt-4">나. 쿠키의 설치·운영 및 거부</p>
                <p className="ml-6">이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 웹브라우저에서 옵션을 설정함으로써
                   모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 개인정보 보호책임자</h2>
              <div className="space-y-3 text-base">
                <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및
                   피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>

                <p className="font-semibold mt-4">개인정보 보호책임자</p>
                <p className="ml-6">이름: Nathan</p>
                <p className="ml-6">소속: 알도AI 운영팀</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 개인정보 처리방침 변경</h2>
              <div className="space-y-3 text-base">
                <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는
                   경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
              </div>
            </section>

            <section className="pt-8 border-t border-gray-300">
              <p className="text-base font-semibold text-gray-900">부칙</p>
              <p className="text-base text-gray-700 mt-2">본 방침은 2025년 1월 1일부터 시행됩니다.</p>
            </section>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
            >
              돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
