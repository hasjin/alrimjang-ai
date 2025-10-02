'use client'

import Link from 'next/link'

interface HeartDisplayProps {
  remainingHearts: number
  heartsResetAt: Date | null
}

export default function HeartDisplay({ remainingHearts, heartsResetAt }: HeartDisplayProps) {
  const formatTimeRemaining = (date: Date | null) => {
    if (!date) return ''
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}시간 ${minutes}분`
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-3xl">❤️</span>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {remainingHearts} <span className="text-sm text-gray-600">/ 40</span>
          </div>
          <div className="text-xs text-gray-500">
            {heartsResetAt && `${formatTimeRemaining(heartsResetAt)} 후 재충전`}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">하트 사용량</div>
          <div className="text-xs text-gray-500">생성: 10❤️ | 수정: 3❤️ | 전문 지식: 30❤️</div>
        </div>
        <Link
          href="/hearts"
          className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 font-semibold rounded-lg transition text-sm"
        >
          사용 이력
        </Link>
      </div>
    </div>
  )
}
