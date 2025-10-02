'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Stats {
  overview: {
    totalUsers: number
    todayUsers: number
    weekUsers: number
    activeUsers: number
    totalDocuments: number
    todayDocuments: number
  }
  hearts: {
    totalEarned: number
    totalRemaining: number
    totalUsed: number
  }
  documentTypes: Array<{
    document_type: string
    count: number
  }>
  growth: {
    users: Array<{
      date: string
      count: number
    }>
    documents: Array<{
      date: string
      count: number
    }>
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error('통계 조회 실패')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('통계를 불러올 수 없습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">접근 오류</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => router.push('/generate')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔧 관리자 대시보드</h1>
          <p className="mt-2 text-gray-600">알림장AI 서비스 관리 및 모니터링</p>
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="전체 사용자"
            value={stats.overview.totalUsers}
            subtitle={`오늘 +${stats.overview.todayUsers}`}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="활성 사용자"
            value={stats.overview.activeUsers}
            subtitle={`이번 주 +${stats.overview.weekUsers}`}
            icon="✨"
            color="green"
          />
          <StatCard
            title="생성 문서"
            value={stats.overview.totalDocuments}
            subtitle={`오늘 +${stats.overview.todayDocuments}`}
            icon="📄"
            color="purple"
          />
          <StatCard
            title="하트 사용률"
            value={`${stats.hearts.totalEarned > 0 ? Math.round((stats.hearts.totalUsed / stats.hearts.totalEarned) * 100) : 0}%`}
            subtitle={`사용: ${stats.hearts.totalUsed} / ${stats.hearts.totalEarned}`}
            icon="❤️"
            color="pink"
          />
        </div>

        {/* 문서 타입별 통계 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 문서 타입별 통계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.documentTypes.map((type) => (
              <div key={type.document_type} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{type.count}</div>
                <div className="text-sm text-gray-600 mt-1">{type.document_type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="사용자 관리"
            description="사용자 목록 조회 및 하트 지급/회수"
            icon="👤"
            onClick={() => router.push('/admin/users')}
          />
          <ActionCard
            title="문서 모니터링"
            description="생성된 문서 조회 및 관리"
            icon="📋"
            onClick={() => router.push('/admin/documents')}
          />
          <ActionCard
            title="활동 로그"
            description="관리자 활동 로그 조회"
            icon="📝"
            onClick={() => router.push('/admin/logs')}
          />
        </div>

        {/* 30일 성장 추이 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 30일 성장 추이</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신규 가입자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    문서 생성
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.growth.users.slice(0, 10).map((day, index) => {
                  const docDay = stats.growth.documents.find(d => d.date === day.date)
                  return (
                    <tr key={day.date}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(day.date).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        +{day.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {docDay?.count || 0}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: number | string
  subtitle: string
  icon: string
  color: 'blue' | 'green' | 'purple' | 'pink'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <p className={`text-sm ${colorClasses[color]} px-2 py-1 rounded inline-block`}>
        {subtitle}
      </p>
    </div>
  )
}

function ActionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string
  description: string
  icon: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition text-left"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  )
}
