'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HeartLog {
  action_type: string
  hearts_used: number
  hearts_remaining: number
  description: string
  created_at: string
}

interface HeartInfo {
  remaining: number
  resetAt: string | null
}

export default function HeartsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<HeartLog[]>([])
  const [heartInfo, setHeartInfo] = useState<HeartInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchHeartLogs()
      fetchHeartInfo()
    }
  }, [status, router])

  const fetchHeartLogs = async () => {
    try {
      const response = await fetch('/api/hearts/logs?limit=100')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch heart logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHeartInfo = async () => {
    try {
      const response = await fetch('/api/hearts')
      if (response.ok) {
        const data = await response.json()
        setHeartInfo(data)
      }
    } catch (error) {
      console.error('Failed to fetch heart info:', error)
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'generate':
        return '✍️'
      case 'refine':
        return '✨'
      case 'reset':
        return '🔄'
      case 'earn':
        return '🎁'
      default:
        return '💖'
    }
  }

  const getActionName = (actionType: string) => {
    switch (actionType) {
      case 'generate':
        return '문서 생성'
      case 'refine':
        return '문서 수정'
      case 'reset':
        return '하트 리셋'
      case 'earn':
        return '하트 획득'
      default:
        return '하트 사용'
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatResetTime = (resetAt: string | null) => {
    if (!resetAt) return '알 수 없음'
    const date = new Date(resetAt)
    return date.toLocaleString('ko-KR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-pink-50">
      {/* 네비게이션 */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <Link href="/generate" className="flex items-center gap-3 hover:opacity-80 transition">
            <span className="text-3xl">🌼</span>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-gray-800">알도AI</h2>
              <span className="text-xs text-orange-600 font-semibold">BETA</span>
            </div>
          </Link>
          <Link
            href="/generate"
            className="px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-full transition shadow-md"
          >
            생성하기
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💖 하트 관리</h1>
          <p className="text-gray-600">하트 사용 현황 및 이력을 확인하세요</p>
        </div>

        {/* 현재 하트 정보 */}
        <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl shadow-xl p-8 mb-8 border-2 border-pink-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-semibold mb-2">현재 보유 하트</p>
              <p className="text-5xl font-bold text-pink-600">{heartInfo?.remaining || 0}❤️</p>
            </div>
            <div className="text-right">
              <p className="text-gray-700 font-semibold mb-2">다음 리셋</p>
              <p className="text-xl font-bold text-gray-800">
                {formatResetTime(heartInfo?.resetAt || null)}
              </p>
              <p className="text-sm text-gray-600 mt-1">매일 오전 6시에 40❤️로 리셋</p>
            </div>
          </div>

          <div className="mt-6 bg-white/60 rounded-2xl p-5">
            <p className="text-sm text-gray-700 mb-3 font-semibold">💡 하트 사용량</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">10❤️</p>
                <p className="text-xs text-gray-600 mt-1">일반 생성</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">3❤️</p>
                <p className="text-xs text-gray-600 mt-1">수정</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">30❤️</p>
                <p className="text-xs text-gray-600 mt-1">전문 지식 모드</p>
              </div>
            </div>
          </div>
        </div>

        {/* 사용 이력 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
          <div className="bg-gradient-to-r from-orange-400 to-pink-400 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">📋 사용 이력</h2>
            <p className="text-white/90 text-sm mt-1">최근 100개 이력</p>
          </div>

          <div className="p-6">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">아직 사용 이력이 없습니다.</p>
                <Link
                  href="/generate"
                  className="inline-block mt-4 px-6 py-3 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-full transition"
                >
                  첫 문서 생성하기
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{getActionIcon(log.action_type)}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{getActionName(log.action_type)}</p>
                        <p className="text-sm text-gray-600">{log.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(log.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${log.hearts_used < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {log.hearts_used > 0 ? '+' : ''}{log.hearts_used}❤️
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        잔액: {log.hearts_remaining}❤️
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">하트 시스템 안내</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• 매일 오전 6시(KST)에 하트가 40개로 리셋됩니다</li>
                <li>• 리셋 시간에 문서 생성 중이면 작업이 취소될 수 있습니다</li>
                <li>• 재생성 첫 회는 무료로 제공됩니다</li>
                <li>• 전문 지식 모드는 일반 생성의 3배(30❤️)를 사용합니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
