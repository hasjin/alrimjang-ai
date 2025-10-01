'use client'

import { useEffect, useState } from 'react'

interface UsageData {
  remaining: number
  resetAt: string | null
}

export default function UsageIndicator() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/usage')
        if (response.ok) {
          const data = await response.json()
          setUsage(data)
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      }
    }

    fetchUsage()
    const interval = setInterval(fetchUsage, 60000) // Refresh every minute

    // Listen for usage updates from generate page
    const handleUsageUpdate = () => {
      fetchUsage()
    }
    window.addEventListener('usage-updated', handleUsageUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('usage-updated', handleUsageUpdate)
    }
  }, [])

  useEffect(() => {
    if (!usage?.resetAt) return

    const updateTimeLeft = () => {
      const now = new Date().getTime()
      const resetTime = new Date(usage.resetAt!).getTime()
      const diff = resetTime - now

      if (diff <= 0) {
        setTimeLeft('곧 초기화됩니다')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeLeft(`${hours}시간 ${minutes}분 후 초기화`)
      } else {
        setTimeLeft(`${minutes}분 후 초기화`)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [usage?.resetAt])

  if (!usage) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
        <div className="animate-pulse h-4 w-20 bg-gray-300 rounded"></div>
      </div>
    )
  }

  const isLow = usage.remaining <= 2
  const isEmpty = usage.remaining === 0

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
          isEmpty
            ? 'bg-red-100 text-red-700'
            : isLow
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        <span className="text-lg">
          {isEmpty ? '🚫' : isLow ? '⚠️' : '✅'}
        </span>
        <span className="text-sm">
          오늘 남은 생성: <strong>{usage.remaining}/5</strong>
        </span>
      </div>
      {usage.remaining < 5 && usage.resetAt && (
        <span className="text-xs text-gray-600">
          {timeLeft}
        </span>
      )}
    </div>
  )
}
