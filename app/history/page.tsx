'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import UsageIndicator from '../components/UsageIndicator'

interface HistoryItem {
  id: number
  child_name: string
  category: string
  memo: string
  style: string
  target_type: string
  generated_content: string
  created_at: string
}

export default function History() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchHistory()
    }
  }, [status, router])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history')
      const data = await response.json()
      setHistory(data.history || [])
      if (data.history && data.history.length > 0) {
        setSelectedItem(data.history[0])
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setHistory(history.filter((h) => h.id !== id))
        if (selectedItem?.id === id) {
          setSelectedItem(history.length > 1 ? history.find(h => h.id !== id) || null : null)
        }
      }
    } catch (error) {
      alert('삭제에 실패했습니다.')
    }
  }

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      alert('복사에 실패했습니다.')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">로딩 중...</p>
        </div>
      </div>
    )
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
            <UsageIndicator />
            <button
              onClick={() => router.push('/generate')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition"
            >
              알림장 생성
            </button>
            <button
              onClick={() => router.push('/history')}
              className="px-4 py-2 text-purple-600 font-semibold transition"
            >
              생성 이력
            </button>
            <button
              onClick={() => router.push('/templates')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600 font-semibold transition"
            >
              내 템플릿
            </button>
            <div className="flex items-center gap-3">
              {session?.user?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-purple-300 object-cover"
                  referrerPolicy="no-referrer"
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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">생성 이력</h1>
          <p className="text-lg text-gray-700 font-medium">
            생성한 알림장을 확인하고 다시 사용하세요 (최근 50개)
          </p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">생성 이력이 없습니다.</p>
            <button
              onClick={() => router.push('/generate')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
            >
              알림장 생성하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 이력 목록 */}
            <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-white rounded-xl shadow-md p-5 cursor-pointer transition hover:shadow-lg ${
                    selectedItem?.id === item.id
                      ? 'border-2 border-purple-500'
                      : 'border-2 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{item.child_name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(item.generated_content)
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded transition"
                    >
                      복사
                    </button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {item.target_type}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      {item.category}
                    </span>
                    <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-semibold">
                      {item.style}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.memo}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(item.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>

            {/* 이력 상세 */}
            <div className="lg:col-span-2">
              {selectedItem ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedItem.child_name}
                      </h2>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {selectedItem.target_type}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                          {selectedItem.category}
                        </span>
                        <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-semibold">
                          {selectedItem.style}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(selectedItem.generated_content)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
                      >
                        복사
                      </button>
                      <button
                        onClick={() => handleDelete(selectedItem.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">메모</label>
                      <p className="text-gray-800 text-base">{selectedItem.memo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">
                        생성 일시
                      </label>
                      <p className="text-gray-800 text-base">
                        {new Date(selectedItem.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">생성된 알림장</h3>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-lg font-medium">
                      {selectedItem.generated_content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <p className="text-xl text-gray-600">이력을 선택해주세요</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in text-base font-semibold">
          ✓ 복사되었습니다!
        </div>
      )}
    </div>
  )
}
