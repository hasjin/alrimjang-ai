'use client'

import Link from 'next/link'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">서비스 이용약관</h1>

          <div className="space-y-8 text-gray-800 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
              <p className="text-base">
                본 약관은 알도AI(이하 "회사")가 제공하는 AI 알림장 생성 서비스(이하 "서비스")의 이용과 관련하여
                회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 (정의)</h2>
              <div className="space-y-3 text-base">
                <p>1. "서비스"란 회사가 제공하는 AI 기반 알림장 생성 및 관리 플랫폼을 의미합니다.</p>
                <p>2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</p>
                <p>3. "회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 말합니다.</p>
                <p>4. "콘텐츠"란 서비스를 통해 생성되는 알림장 텍스트 및 관련 자료를 의미합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
              <div className="space-y-3 text-base">
                <p>1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
                <p>2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</p>
                <p>3. 회사가 약관을 변경할 경우에는 적용일자 및 변경사유를 명시하여 현행약관과 함께
                   서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제4조 (회원가입)</h2>
              <div className="space-y-3 text-base">
                <p>1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</p>
                <p>2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.</p>
                <p className="ml-6">① 등록 내용에 허위, 기재누락, 오기가 있는 경우</p>
                <p className="ml-6">② 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 (서비스의 제공 및 변경)</h2>
              <div className="space-y-3 text-base">
                <p>1. 회사는 다음과 같은 업무를 수행합니다.</p>
                <p className="ml-6">① AI 기반 알림장 텍스트 생성</p>
                <p className="ml-6">② 생성된 알림장 저장 및 관리</p>
                <p className="ml-6">③ 기타 회사가 정하는 업무</p>
                <p>2. 회사는 서비스의 내용을 변경할 경우 그 내용 및 제공일자를 명시하여 현재의 서비스 내용을
                   게시한 곳에 그 제공일자 7일 이전부터 공지합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 (서비스의 중단)</h2>
              <div className="space-y-3 text-base">
                <p>1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는
                   서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
                <p>2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은
                   손해에 대하여는 배상하지 아니합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제7조 (이용자의 의무)</h2>
              <div className="space-y-3 text-base">
                <p>1. 이용자는 다음 행위를 하여서는 안 됩니다.</p>
                <p className="ml-6">① 신청 또는 변경 시 허위내용의 등록</p>
                <p className="ml-6">② 타인의 정보 도용</p>
                <p className="ml-6">③ 회사가 게시한 정보의 변경</p>
                <p className="ml-6">④ 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</p>
                <p className="ml-6">⑤ 회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</p>
                <p className="ml-6">⑥ 회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</p>
                <p className="ml-6">⑦ 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제8조 (저작권의 귀속 및 이용제한)</h2>
              <div className="space-y-3 text-base">
                <p>1. 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</p>
                <p>2. 이용자가 서비스를 통해 생성한 콘텐츠에 대한 저작권은 이용자에게 귀속됩니다.</p>
                <p>3. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를
                   회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나
                   제3자에게 이용하게 하여서는 안됩니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제9조 (분쟁해결)</h2>
              <div className="space-y-3 text-base">
                <p>1. 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여
                   피해보상처리기구를 설치·운영합니다.</p>
                <p>2. 회사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제10조 (재판권 및 준거법)</h2>
              <div className="space-y-3 text-base">
                <p>1. 회사와 이용자 간에 발생한 서비스 이용에 관한 분쟁에 대하여는 대한민국 법을 적용합니다.</p>
                <p>2. 서비스 이용으로 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제소합니다.</p>
              </div>
            </section>

            <section className="pt-8 border-t border-gray-300">
              <p className="text-base font-semibold text-gray-900">부칙</p>
              <p className="text-base text-gray-700 mt-2">본 약관은 2025년 1월 1일부터 시행됩니다.</p>
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
