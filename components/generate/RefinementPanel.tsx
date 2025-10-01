'use client'

import { useState } from 'react'

type RefinementType = 'shorten' | 'lengthen' | 'adjust_tone' | 'remove_fluff' | 'add_emoji' | 'formal' | 'casual' | 'polite' | 'friendly' | 'custom'

interface RefinementPanelProps {
  refinementCount: number
  maxRefinements: number
  onRefine: (type: RefinementType, customRequest?: string) => void
  isRefining: boolean
}

export default function RefinementPanel({
  refinementCount,
  maxRefinements,
  onRefine,
  isRefining
}: RefinementPanelProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [customRequest, setCustomRequest] = useState('')

  const handleCustomRefine = () => {
    if (customRequest.trim()) {
      onRefine('custom', customRequest)
      setCustomRequest('')
    }
  }

  return (
    <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">내용 수정하기</h3>
          <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-300">
            {refinementCount}/{maxRefinements} 사용 (3❤️/회)
          </span>
        </div>
        {refinementCount < maxRefinements && (
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showOptions ? '접기 ▲' : '더보기 ▼'}
          </button>
        )}
      </div>

      {refinementCount >= maxRefinements && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          ⚠️ 최대 수정 횟수에 도달했습니다. 새 글 작성을 이용해주세요.
        </p>
      )}

      {refinementCount < maxRefinements && (
        <>
          {/* 기본 수정 옵션 */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button
              onClick={() => onRefine('shorten')}
              disabled={isRefining || refinementCount >= maxRefinements}
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📉 더 짧게
            </button>
            <button
              onClick={() => onRefine('lengthen')}
              disabled={isRefining || refinementCount >= maxRefinements}
              className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📈 더 길게
            </button>
            <button
              onClick={() => onRefine('remove_fluff')}
              disabled={isRefining || refinementCount >= maxRefinements}
              className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✂️ 미사여구 줄이기
            </button>
          </div>

          {/* 어조 조정 옵션 */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => onRefine('friendly')}
              disabled={isRefining || refinementCount >= maxRefinements}
              className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💕 부드럽게
            </button>
            <button
              onClick={() => onRefine('formal')}
              disabled={isRefining || refinementCount >= maxRefinements}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📋 격식있게
            </button>
            <button
              onClick={() => onRefine('add_emoji')}
              disabled={isRefining || refinementCount >= maxRefinements}
              className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              😊 이모지 추가
            </button>
          </div>

          {showOptions && (
            <div className="mt-3 p-4 bg-white rounded-lg border border-gray-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직접 요청하기
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  placeholder="예: 더 따뜻한 느낌으로, 존댓말로, 이모지 추가 등"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isRefining}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomRefine()}
                />
                <button
                  onClick={handleCustomRefine}
                  disabled={isRefining || !customRequest.trim() || refinementCount >= maxRefinements}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  수정하기
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
