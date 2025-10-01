'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [childName, setChildName] = useState('')
  const [category, setCategory] = useState('화장실')
  const [memo, setMemo] = useState('')
  const [style, setStyle] = useState('간결형')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  // 로그인 체크
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childName,
          category,
          memo,
          style,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '알림장 생성 실패')
      }

      setResult(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      alert('복사에 실패했습니다.')
    }
  }

  const handleSaveTemplate = async () => {
    if (!result) return

    setSaveLoading(true)
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${childName} - ${category}`,
          childName,
          category,
          memo,
          style,
          generatedContent: result,
        }),
      })

      if (!response.ok) {
        throw new Error('템플릿 저장 실패')
      }

      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      alert('템플릿 저장에 실패했습니다.')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* 네비게이션 바 */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <h2 className="text-2xl font-bold text-gray-900">알도AI ✨</h2>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/generate')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition"
            >
              알림장 생성
            </button>
            <button
              onClick={() => router.push('/templates')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition"
            >
              내 템플릿
            </button>
            <div className="flex items-center gap-3">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-purple-300"
                />
              )}
              <span className="text-gray-900 font-semibold">{session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            알림장 생성하기
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            따뜻하고 감성적인 알림장을 AI가 작성해드려요
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 아이 이름 */}
            <div>
              <label htmlFor="childName" className="block text-base font-bold text-gray-900 mb-2">
                아이 이름
              </label>
              <input
                type="text"
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="예: 지민"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-3">
                카테고리
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['화장실', '식사', '놀이활동', '현장학습'].map((cat) => (
                  <label
                    key={cat}
                    className={`flex items-center justify-center px-4 py-3 text-base rounded-lg border-2 cursor-pointer transition ${
                      category === cat
                        ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                        : 'border-gray-300 hover:border-purple-400 text-gray-900 font-semibold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={category === cat}
                      onChange={(e) => setCategory(e.target.value)}
                      className="sr-only"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 간단 메모 */}
            <div>
              <label htmlFor="memo" className="block text-base font-bold text-gray-900 mb-2">
                간단 메모
              </label>
              <textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                placeholder="예: 10시 쉬 성공, 스스로 말함"
                rows={4}
                required
              />
            </div>

            {/* 스타일 선택 */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-3">
                스타일
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['간결형', '상세형'].map((st) => (
                  <label
                    key={st}
                    className={`flex items-center justify-center px-4 py-3 text-base rounded-lg border-2 cursor-pointer transition ${
                      style === st
                        ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                        : 'border-gray-300 hover:border-purple-400 text-gray-900 font-semibold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="style"
                      value={st}
                      checked={style === st}
                      onChange={(e) => setStyle(e.target.value)}
                      className="sr-only"
                    />
                    <span>{st}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  생성 중...
                </>
              ) : '알림장 생성하기'}
            </button>
          </form>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 font-semibold px-6 py-4 rounded-lg mb-6 text-base">
            {error}
          </div>
        )}

        {/* 결과 표시 */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900">생성된 알림장</h2>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveTemplate}
                  disabled={saveLoading}
                  className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition text-base disabled:opacity-50"
                >
                  {saveLoading ? '저장 중...' : '저장하기'}
                </button>
                <button
                  onClick={handleCopy}
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-base"
                >
                  복사하기
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-lg font-medium">
                {result}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in text-base font-semibold">
          ✓ 알림장이 복사되었습니다!
        </div>
      )}

      <footer className="text-center py-8 text-gray-700 text-base font-medium">
        <p>Made by Nathan & Claude Code</p>
      </footer>
    </div>
  )
}
