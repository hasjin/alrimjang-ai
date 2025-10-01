'use client'

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
      <div className="text-right">
        <div className="text-sm text-gray-600 mb-1">하트 사용량</div>
        <div className="text-xs text-gray-500">생성: 10❤️ | 수정: 3❤️ | RAG: 30❤️</div>
      </div>
    </div>
  )
}
