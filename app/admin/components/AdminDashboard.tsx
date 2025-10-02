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
  documentTypes: Array<{
    document_type: string
    count: number
  }>
  growth: {
    users: Array<{
      date: string
      count: number
    }>
  }
  insights: {
    dailyPatterns: Array<{
      date: string
      total_count: number
      active_users: number
      document_type: string
      with_curriculum: number
      rag_usage_rate: number
    }>
    hourlyPattern: Array<{
      hour: number
      count: number
    }>
    userBehavior: {
      total_users: number
      avg_docs_per_user: number
      max_docs_per_user: number
      median_docs_per_user: number
    }
    retention: {
      retention_rate_7days: number
    }
    featureUsage: {
      curriculum_usage: number
      rag_usage: number
      curriculum_users: number
      rag_users: number
      total: number
    }
    heartUsagePattern: Array<{
      date: string
      generates: number
      refines: number
      rag_uses: number
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

  const { insights } = stats

  // 계산된 인사이트
  const curriculumAdoptionRate = insights.featureUsage.total > 0
    ? (insights.featureUsage.curriculum_usage / insights.featureUsage.total * 100).toFixed(1)
    : '0.0'

  const ragAdoptionRate = insights.featureUsage.total > 0
    ? (insights.featureUsage.rag_usage / insights.featureUsage.total * 100).toFixed(1)
    : '0.0'

  const activeUserRate = stats.overview.totalUsers > 0
    ? (stats.overview.activeUsers / stats.overview.totalUsers * 100).toFixed(1)
    : '0.0'

  // 시간대별 피크 타임
  const peakHour = insights.hourlyPattern.length > 0
    ? insights.hourlyPattern.reduce((max, curr) => curr.count > max.count ? curr : max, insights.hourlyPattern[0])
    : null

  // 빠른 개선 방향 분석
  const getActionItems = () => {
    const items: Array<{ priority: 'high' | 'medium' | 'low'; title: string; description: string }> = []

    // 활성 사용자율 체크
    const activeRate = parseFloat(activeUserRate)
    if (activeRate < 30) {
      items.push({
        priority: 'high',
        title: '활성 사용자율 낮음 (30% 미만)',
        description: '이메일 리마인더, 푸시 알림, 신규 기능 안내 등으로 재방문 유도 필요'
      })
    }

    // 재방문율 체크
    const retention = insights.retention.retention_rate_7days || 0
    if (retention < 40) {
      items.push({
        priority: 'high',
        title: '재방문율 낮음 (40% 미만)',
        description: '온보딩 개선, 첫 사용 경험 최적화, 가치 제안 강화 필요'
      })
    }

    // 커리큘럼 채택률 체크
    if (parseFloat(curriculumAdoptionRate) < 30) {
      items.push({
        priority: 'medium',
        title: '커리큘럼 모드 채택률 낮음',
        description: '고급 기능의 가치를 강조하는 튜토리얼, 프로모션 배너 추가'
      })
    }

    // RAG 채택률 체크
    if (parseFloat(ragAdoptionRate) < 5) {
      items.push({
        priority: 'medium',
        title: 'RAG 모드 인지도 낮음',
        description: '전문 지식 모드의 차별성을 부각하는 사례 연구, 비교 콘텐츠 제작'
      })
    } else if (parseFloat(ragAdoptionRate) > 20) {
      items.push({
        priority: 'high',
        title: 'RAG 사용량 급증 - 비용 모니터링 필요',
        description: 'API 비용 추적 강화, 필요시 RAG 하트 비용 조정 고려'
      })
    }

    // 사용자 분포 체크
    if (insights.userBehavior.avg_docs_per_user > insights.userBehavior.median_docs_per_user * 2) {
      items.push({
        priority: 'medium',
        title: '파워 유저 집중 현상',
        description: '일반 사용자 활성화를 위한 맞춤 콘텐츠, 사용 케이스 제공'
      })
    }

    // 시간대 체크 (새벽 시간대 사용)
    const nightUsage = insights.hourlyPattern.filter(h => Number(h.hour) >= 22 || Number(h.hour) <= 6)
      .reduce((sum, h) => sum + h.count, 0)
    const totalUsage = insights.hourlyPattern.reduce((sum, h) => sum + h.count, 0)
    if (totalUsage > 0 && (nightUsage / totalUsage) > 0.3) {
      items.push({
        priority: 'low',
        title: '야간 사용 비중 높음 (30% 이상)',
        description: '야간 작업 선생님들을 위한 모바일 최적화, 다크 모드 고려'
      })
    }

    // 우선순위 정렬
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }

  const actionItems = getActionItems()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 인사이트 대시보드</h1>
          <p className="mt-2 text-gray-600">서비스 현황 및 개선 방향 분석</p>
        </div>

        {/* 빠른 개선 방향 요약 */}
        {actionItems.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-lg p-6 mb-8 border-2 border-orange-300">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">즉시 실행 가능한 개선 방향</h2>
                <p className="text-sm text-gray-600 mt-1">데이터 기반 액션 아이템 - 우선순위순</p>
              </div>
            </div>
            <div className="space-y-3">
              {actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    item.priority === 'high'
                      ? 'bg-red-50 border-red-500'
                      : item.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : item.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.priority === 'high' ? '높음' : item.priority === 'medium' ? '중간' : '낮음'}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                      <p className="text-sm text-gray-700">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 핵심 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">전체 사용자</p>
            <p className="text-3xl font-bold text-gray-900">{stats.overview.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-2">오늘 +{stats.overview.todayUsers}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">활성 사용자율</p>
            <p className="text-3xl font-bold text-gray-900">{activeUserRate}%</p>
            <p className="text-xs text-gray-500 mt-2">7일 내 활동 기준</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">생성된 문서</p>
            <p className="text-3xl font-bold text-gray-900">{stats.overview.totalDocuments}</p>
            <p className="text-xs text-gray-500 mt-2">오늘 +{stats.overview.todayDocuments}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">재방문율</p>
            <p className="text-3xl font-bold text-gray-900">{insights.retention.retention_rate_7days?.toFixed(1) || '0.0'}%</p>
            <p className="text-xs text-gray-500 mt-2">7일 내 재사용</p>
          </div>
        </div>

        {/* 사용자 행동 인사이트 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👥 사용자 행동 패턴</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">평균 문서 생성 수 (30일)</p>
              <p className="text-2xl font-bold text-blue-600">{insights.userBehavior.avg_docs_per_user?.toFixed(1) || '0.0'}개</p>
              <p className="text-xs text-gray-500 mt-1">사용자당</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">중앙값</p>
              <p className="text-2xl font-bold text-green-600">{insights.userBehavior.median_docs_per_user?.toFixed(1) || '0.0'}개</p>
              <p className="text-xs text-gray-500 mt-1">절반의 사용자가 이 이하</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">최대 사용량</p>
              <p className="text-2xl font-bold text-purple-600">{insights.userBehavior.max_docs_per_user || 0}개</p>
              <p className="text-xs text-gray-500 mt-1">가장 활발한 사용자</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">💡 인사이트</p>
            <p className="text-sm text-gray-700">
              {insights.userBehavior.avg_docs_per_user > insights.userBehavior.median_docs_per_user * 1.5
                ? '일부 파워 유저가 평균을 끌어올리고 있습니다. 일반 사용자 활성화 전략이 필요합니다.'
                : '사용자들이 고르게 서비스를 이용하고 있습니다. 균형잡힌 성장세를 보이고 있습니다.'}
            </p>
          </div>
        </div>

        {/* 기능 사용률 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ 기능 채택률</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">커리큘럼 모드</p>
                <p className="text-lg font-bold text-blue-600">{curriculumAdoptionRate}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${curriculumAdoptionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {insights.featureUsage.curriculum_users}명의 사용자 ·{' '}
                {insights.featureUsage.curriculum_usage}회 사용
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">전문 지식 모드 (RAG)</p>
                <p className="text-lg font-bold text-purple-600">{ragAdoptionRate}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${ragAdoptionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {insights.featureUsage.rag_users}명의 사용자 ·{' '}
                {insights.featureUsage.rag_usage}회 사용
              </p>
            </div>
          </div>

          <div className="mt-6 bg-purple-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">💡 개선 방향</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {parseFloat(curriculumAdoptionRate) < 30 && (
                <li>• 커리큘럼 모드의 가치를 더 강조하는 온보딩 필요</li>
              )}
              {parseFloat(ragAdoptionRate) < 10 && (
                <li>• RAG 모드의 전문성을 부각하는 마케팅 강화 필요</li>
              )}
              {parseFloat(ragAdoptionRate) > 15 && (
                <li>• RAG 사용이 증가 중입니다. 비용 모니터링 강화 필요</li>
              )}
            </ul>
          </div>
        </div>

        {/* 시간대별 사용 패턴 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⏰ 시간대별 사용 패턴</h2>
          <div className="grid grid-cols-12 gap-2 mb-4">
            {Array.from({ length: 24 }, (_, i) => {
              const hourData = insights.hourlyPattern.find(h => Number(h.hour) === i)
              const count = hourData?.count || 0
              const maxCount = Math.max(...insights.hourlyPattern.map(h => h.count), 1)
              const height = (count / maxCount) * 100
              const isPeak = peakHour && Number(peakHour.hour) === i

              return (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isPeak ? 'bg-orange-500' : count > 0 ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                    style={{ height: `${Math.max(height, 10)}px`, minHeight: '10px' }}
                    title={`${i}시: ${count}회`}
                  ></div>
                  <p className="text-xs text-gray-600 mt-1">{i}</p>
                </div>
              )
            })}
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">📊 피크 타임</p>
            <p className="text-sm text-gray-700">
              {peakHour
                ? `${peakHour.hour}시에 가장 많이 사용됩니다 (${peakHour.count}회). 이 시간대에 서버 성능을 최적화하세요.`
                : '데이터가 충분하지 않습니다.'}
            </p>
          </div>
        </div>

        {/* 일별 문서 타입 분포 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📅 최근 7일 문서 타입 분포</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">문서 타입</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">생성 수</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">활성 사용자</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">커리큘럼</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">RAG 사용률</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insights.dailyPatterns.slice(0, 21).map((pattern, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(pattern.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{pattern.document_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{pattern.total_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{pattern.active_users}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{pattern.with_curriculum}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pattern.rag_usage_rate > 15 ? 'bg-purple-100 text-purple-800' :
                        pattern.rag_usage_rate > 5 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pattern.rag_usage_rate?.toFixed(1) || '0.0'}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 문서 타입 분포 */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📄 문서 타입 분포</h2>
          <div className="space-y-4">
            {stats.documentTypes.map((type, idx) => {
              const percentage = stats.overview.totalDocuments > 0
                ? (type.count / stats.overview.totalDocuments * 100).toFixed(1)
                : '0.0'

              return (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">{type.document_type}</p>
                    <p className="text-sm text-gray-900">
                      {type.count}회 <span className="text-gray-500">({percentage}%)</span>
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
