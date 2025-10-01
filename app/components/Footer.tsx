export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* 서비스 정보 */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">알도AI</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              어린이집 선생님들을 위한<br />
              AI 문서 작성 도우미입니다.
            </p>
          </div>

          {/* 정책 및 약관 */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">정책 및 약관</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/terms" className="text-gray-600 hover:text-blue-600 hover:underline">
                  이용약관
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-blue-600 hover:underline">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            &copy; {new Date().getFullYear()} 알도AI. All rights reserved.
          </p>
          <p className="text-sm text-gray-600">
            Made by <span className="font-bold text-gray-900 text-base">Nathan</span> & Claude Code
          </p>
        </div>
      </div>
    </footer>
  )
}
