'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface UsageInfo {
  remaining: number
  resetAt: string
}

interface Stats {
  totalDocuments: number
  totalChildren: number
}

export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated' && session?.user) {
      setName(session.user.name || '')
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      // 사용량 정보
      const usageRes = await fetch('/api/usage')
      if (usageRes.ok) {
        const usageData = await usageRes.json()
        setUsage(usageData)
      }

      // 통계 정보
      const [docsRes, childrenRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/children'),
      ])

      const docsData = await docsRes.json()
      const childrenData = await childrenRes.json()

      setStats({
        totalDocuments: docsData.documents?.length || 0,
        totalChildren: childrenData.children?.length || 0,
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNameUpdate = async () => {
    if (!name.trim()) {
      setToastMessage('이름을 입력해주세요.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        setToastMessage('이름이 변경되었습니다.')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        setIsEditingName(false)
        // 세션 갱신
        window.location.reload()
      } else {
        throw new Error('Failed to update name')
      }
    } catch (error) {
      setToastMessage('이름 변경에 실패했습니다.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '탈퇴하기') {
      setToastMessage('"탈퇴하기"를 정확히 입력해주세요.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      })

      if (response.ok) {
        setToastMessage('회원 탈퇴가 완료되었습니다.')
        setShowToast(true)
        setTimeout(() => {
          signOut({ callbackUrl: '/' })
        }, 2000)
      } else {
        throw new Error('Failed to delete account')
      }
    } catch (error) {
      setToastMessage('회원 탈퇴에 실패했습니다.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
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
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8">
      <main className="container mx-auto px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">👤</span>
            <h1 className="text-4xl font-bold text-gray-900">마이페이지</h1>
          </div>
          <p className="text-gray-600 ml-16">내 정보를 관리하세요</p>
        </div>

        {/* 프로필 정보 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">프로필 정보</h2>

          <div className="flex items-center gap-6 mb-8">
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">이메일</p>
              <p className="text-lg font-semibold text-gray-900">{session?.user?.email}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-900">이름</label>
              {!isEditingName && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  수정
                </button>
              )}
            </div>

            {isEditingName ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900"
                  placeholder="이름을 입력하세요"
                />
                <button
                  onClick={handleNameUpdate}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false)
                    setName(session?.user?.name || '')
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                  취소
                </button>
              </div>
            ) : (
              <p className="text-lg text-gray-800">{name || '이름 없음'}</p>
            )}
          </div>
        </div>

        {/* 사용 통계 */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-bold text-gray-600 mb-2">일일 사용량</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${
                usage?.remaining === 0 ? 'text-red-600' :
                usage && usage.remaining <= 2 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {usage?.remaining || 0}
              </span>
              <span className="text-xl text-gray-600">/ 5회</span>
            </div>
            {usage?.resetAt && (
              <p className="text-xs text-gray-500 mt-2">
                {new Date(usage.resetAt).toLocaleString('ko-KR')} 초기화
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-bold text-gray-600 mb-2">생성한 문서</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-600">
                {stats?.totalDocuments || 0}
              </span>
              <span className="text-xl text-gray-600">개</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-sm font-bold text-gray-600 mb-2">등록한 원아</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-purple-600">
                {stats?.totalChildren || 0}
              </span>
              <span className="text-xl text-gray-600">명</span>
            </div>
          </div>
        </div>

        {/* 위험 영역 */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">위험 영역</h2>
          <p className="text-gray-600 mb-6">
            회원 탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            회원 탈퇴
          </button>
        </div>
      </main>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">회원 탈퇴</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              정말로 탈퇴하시겠습니까?<br />
              <span className="font-semibold text-red-600">모든 데이터가 영구적으로 삭제</span>되며 복구할 수 없습니다.
            </p>

            <div className="mb-6">
              <p className="text-sm font-bold text-gray-700 mb-2">
                계속하려면 "<span className="text-red-600">탈퇴하기</span>"를 입력하세요
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition text-gray-900"
                placeholder="탈퇴하기"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== '탈퇴하기'}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                탈퇴하기
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast 알림 */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-xl z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
