'use client'

import { useState } from 'react'

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
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleDownloadDocx = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: result,
          documentType,
        }),
      })

      if (!response.ok) {
        throw new Error('다운로드 실패')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${documentType}_${new Date().toISOString().split('T')[0]}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setShowExportModal(false)
    } catch (error) {
      alert('문서 다운로드 중 오류가 발생했습니다.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyWithFormat = () => {
    // 줄바꿈과 서식을 유지한 복사
    navigator.clipboard.writeText(result).then(() => {
      onCopy()
      setShowExportModal(false)
    })
  }

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
            onClick={() => setShowExportModal(true)}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-base"
          >
            📥 내보내기
          </button>
        </div>
      </div>

      {/* 내보내기 모달 */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">📥 문서 내보내기</h3>
            <p className="text-sm text-gray-600 mb-6">
              원하는 방식을 선택하세요
            </p>

            <div className="space-y-3">
              <button
                onClick={handleCopyWithFormat}
                className="w-full p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 rounded-lg transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  <div>
                    <div className="font-bold text-gray-900">클립보드에 복사</div>
                    <div className="text-sm text-gray-600">빠르게 복사하여 붙여넣기</div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleDownloadDocx}
                disabled={isExporting}
                className="w-full p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-lg transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  <div>
                    <div className="font-bold text-gray-900">
                      {isExporting ? '다운로드 중...' : 'Word 문서 다운로드'}
                    </div>
                    <div className="text-sm text-gray-600">
                      .docx 파일로 저장 (편집 가능)
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              disabled={isExporting}
              className="mt-6 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      )}

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
