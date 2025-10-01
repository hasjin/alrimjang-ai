'use client'

interface Version {
  text: string
  timestamp: number
  charCount: number
}

interface ResultDisplayProps {
  result: string
  versionHistory: Version[]
  onRestore: (index: number) => void
  onCopy: () => void
  onNewDocument: () => void
  onRegenerate: (e: React.MouseEvent) => void
  isLoading: boolean
  regenerateCount: number
  isAdvancedMode: boolean
  documentType: string
}

export default function ResultDisplay({
  result,
  versionHistory,
  onRestore,
  onCopy,
  onNewDocument,
  onRegenerate,
  isLoading,
  regenerateCount,
  isAdvancedMode,
  documentType
}: ResultDisplayProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-900">생성된 {documentType}</h2>
        <div className="flex gap-3">
          <button
            onClick={onNewDocument}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition text-base"
          >
            ✏️ 새 글 작성
          </button>
          {!isAdvancedMode && (
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-base disabled:opacity-50 flex items-center gap-2"
            >
              다시 생성
              {regenerateCount === 0 && (
                <span className="text-xs bg-white text-blue-600 px-2 py-0.5 rounded-full">
                  무료
                </span>
              )}
            </button>
          )}
          <button
            onClick={onCopy}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-base"
          >
            복사하기
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            {result.length}자
            {versionHistory.length > 1 && versionHistory[1] && (
              <span className="ml-2 text-xs">
                ({result.length > versionHistory[1].charCount ? '+' : ''}{result.length - versionHistory[1].charCount}자)
              </span>
            )}
          </div>
          {versionHistory.length > 1 && (
            <button
              onClick={() => onRestore(1)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              ↶ 이전 버전으로
            </button>
          )}
        </div>
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-lg font-medium">
          {result}
        </p>
      </div>

      {!isAdvancedMode && regenerateCount > 0 && (
        <p className="text-sm text-gray-600 mt-3 text-center">
          추가 재생성 시 일일 생성 횟수가 차감됩니다.
        </p>
      )}
      {isAdvancedMode && (
        <p className="text-sm text-yellow-700 mt-3 text-center bg-yellow-50 border border-yellow-200 rounded px-4 py-2">
          💡 고급 옵션 사용 시에는 재생성이 제공되지 않습니다. 새 글 작성을 통해 다시 생성해주세요.
        </p>
      )}
    </div>
  )
}
