'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import HeartDisplay from '@/components/generate/HeartDisplay'
import RefinementPanel from '@/components/generate/RefinementPanel'
import ResultDisplay from '@/components/generate/ResultDisplay'
import ToastNotification from '@/components/ToastNotification'

type DocumentType = '알림장' | '보육일지' | '관찰기록' | '발달평가' | '부모면담'

export default function GeneratePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Document type selection
  const [documentType, setDocumentType] = useState<DocumentType>('알림장')

  // Child selection - 직접 입력만 사용
  const [childName, setChildName] = useState('ㅇㅇ') // 기본값: 익명
  const [childAge, setChildAge] = useState<number | ''>('') // 필수

  // 알림장 fields
  const [memo, setMemo] = useState('')
  const [style, setStyle] = useState('간결형')
  const [tone, setTone] = useState('균형')
  const [targetType, setTargetType] = useState('개인')

  // 간소화된 옵션
  const [useCurriculum, setUseCurriculum] = useState(false) // 커리큘럼 모드 on/off
  const [useExpertMode, setUseExpertMode] = useState(false) // 전문 지식 모드 on/off
  const [manualAge, setManualAge] = useState<number | ''>('') // 직접 입력 시 나이

  // 생성 진행 상태
  const [generationStep, setGenerationStep] = useState('')

  // 보육일지 fields
  const [playContent, setPlayContent] = useState('')
  const [teacherSupport, setTeacherSupport] = useState('')
  const [evaluation, setEvaluation] = useState('')
  const [boyukDate, setBoyukDate] = useState('')

  // 관찰기록 fields
  const [observation, setObservation] = useState('')
  const [context, setContext] = useState('')
  const [gwanchalDate, setGwanchalDate] = useState('')

  // 발달평가 fields
  const [period, setPeriod] = useState('')
  const [areas, setAreas] = useState({
    기본생활: '',
    신체운동: '',
    의사소통: '',
    사회관계: '',
    예술경험: '',
    자연탐구: '',
  })

  // 부모면담 fields
  const [myeondamDate, setMyeondamDate] = useState('')
  const [method, setMethod] = useState('대면')
  const [teacherOpinion, setTeacherOpinion] = useState('')
  const [parentOpinion, setParentOpinion] = useState('')
  const [topics, setTopics] = useState('')

  // UI states
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 수정 관련 states
  const [refinementCount, setRefinementCount] = useState(0)
  const [refining, setRefining] = useState(false)

  // 버전 히스토리 states
  const [versionHistory, setVersionHistory] = useState<Array<{ text: string; timestamp: number; charCount: number }>>([])
  const [originalInput, setOriginalInput] = useState('') // 사용자 원본 입력
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success')
  const [regenerateCount, setRegenerateCount] = useState(0)
  const [showForm, setShowForm] = useState(true)

  // 하트 시스템
  const [remainingHearts, setRemainingHearts] = useState<number>(40)
  const [heartsResetAt, setHeartsResetAt] = useState<Date | null>(null)

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Fetch hearts only
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRemainingHearts()
    }
  }, [status])

  const fetchRemainingHearts = async () => {
    try {
      const response = await fetch('/api/hearts')
      if (response.ok) {
        const data = await response.json()
        setRemainingHearts(data.remaining)
        if (data.resetAt) {
          setHeartsResetAt(new Date(data.resetAt))
        }
      }
    } catch (error) {
      console.error('Failed to fetch hearts:', error)
    }
  }

  // 선택된 나이를 기반으로 커리큘럼 자동 결정
  const getCurriculumFromAge = (age: number | ''): string => {
    if (age === '') return ''
    return age <= 2 ? 'standard-v4' : 'nuri-2019'
  }

  const getInputData = (): Record<string, any> => {
    switch (documentType) {
      case '알림장':
        return { memo } // 카테고리 제거, AI가 자동 판단
      case '보육일지':
        return { playContent, teacherSupport, evaluation, date: boyukDate }
      case '관찰기록':
        return { observation, context, date: gwanchalDate }
      case '발달평가':
        return { period, areas }
      case '부모면담':
        return { date: myeondamDate, method, teacherOpinion, parentOpinion, topics }
      default:
        return {}
    }
  }

  const validateForm = (): string | null => {
    // 나이 필수
    if (childAge === '') {
      return '나이를 선택해주세요. (교육과정 적용을 위해 필요합니다)'
    }

    switch (documentType) {
      case '알림장':
        if (!memo) {
          return '내용을 입력해주세요.'
        }
        break
      case '보육일지':
        if (!playContent || !teacherSupport || !evaluation) {
          return '모든 필수 항목을 입력해주세요.'
        }
        break
      case '관찰기록':
        if (!observation || !context) {
          return '관찰 내용과 상황을 입력해주세요.'
        }
        break
      case '발달평가':
        if (!period) {
          return '평가 기간을 입력해주세요.'
        }
        const filledAreas = Object.values(areas).filter((v) => v.trim())
        if (filledAreas.length === 0) {
          return '최소 1개 이상의 발달 영역을 입력해주세요.'
        }
        break
      case '부모면담':
        if (!myeondamDate || !teacherOpinion || !parentOpinion) {
          return '면담 일자, 교사 의견, 학부모 의견을 입력해주세요.'
        }
        break
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent, isRegenerate = false) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    if (!isRegenerate) {
      setResult('')
      setRegenerateCount(0)
    }

    try {
      const inputData = getInputData()

      // 커리큘럼 자동 결정
      const determinedCurriculum = useCurriculum ? getCurriculumFromAge(childAge) : undefined

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          childName: childName || 'ㅇㅇ', // 기본값: 익명
          childAge: childAge,
          inputData,
          style,
          tone: documentType === '알림장' ? tone : undefined,
          targetType: documentType === '알림장' ? targetType : undefined,
          isRegenerate: isRegenerate && regenerateCount === 0,
          curriculum: determinedCurriculum,
          useRAG: useExpertMode || false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          // 사용량 초과 토스트 표시
          setToastType('error')
          setToastMessage(data.error || '일일 생성 횟수를 초과했습니다.')
          setShowToast(true)
          setTimeout(() => setShowToast(false), 5000)
          return
        }
        throw new Error(data.error || '문서 생성 실패')
      }

      setResult(data.message)
      setRemainingHearts(data.remaining) // Update hearts display

      // 원본 입력 저장 (첫 생성 시)
      if (!isRegenerate && !originalInput) {
        setOriginalInput(memo || JSON.stringify(inputData))
      }

      // 버전 히스토리에 추가
      setVersionHistory([{
        text: data.message,
        timestamp: Date.now(),
        charCount: data.message.length
      }])

      setShowForm(false) // 성공 시 폼 닫기
      if (isRegenerate) {
        setRegenerateCount((prev) => prev + 1)
      }
      // Refresh usage indicator
      if (!isRegenerate || regenerateCount > 0) {
        window.dispatchEvent(new Event('usage-updated'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewDocument = () => {
    setResult('')
    setError('')
    setShowForm(true)
    setRegenerateCount(0)
    setRefinementCount(0)
    setVersionHistory([])
    setOriginalInput('')
    setMemo('')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setToastType('success')
      setToastMessage('복사되었습니다!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      alert('복사에 실패했습니다.')
    }
  }

  const handleRestoreVersion = (index: number) => {
    if (index >= 0 && index < versionHistory.length) {
      const version = versionHistory[index]
      setResult(version.text)
      setToastType('success')
      setToastMessage('이전 버전으로 복원되었습니다.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handleRefine = async (type: 'shorten' | 'lengthen' | 'adjust_tone' | 'remove_fluff' | 'add_emoji' | 'formal' | 'casual' | 'polite' | 'friendly' | 'custom', customRequest?: string) => {
    if (refinementCount >= 5) {
      setToastType('warning')
      setToastMessage('최대 수정 횟수(5회)를 초과했습니다.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    setRefining(true)
    setError('')

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: result,
          refinementType: type,
          customRequest: customRequest || '',
          currentRefinementCount: refinementCount,
          originalInput: originalInput, // 원문 맥락 전달
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setToastType('error')
          setToastMessage(data.error)
          setShowToast(true)
          setTimeout(() => setShowToast(false), 5000)
          return
        }
        throw new Error(data.error || '수정 실패')
      }

      // 버전 히스토리에 추가 (최대 5개)
      setVersionHistory(prev => [
        {
          text: data.message,
          timestamp: Date.now(),
          charCount: data.message.length
        },
        ...prev
      ].slice(0, 5))

      setResult(data.message)
      setRemainingHearts(data.remaining)
      setRefinementCount(data.refinementCount)

      setToastType('success')
      setToastMessage('수정이 완료되었습니다!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setToastType('error')
      setToastMessage(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      setRefining(false)
    }
  }

  // 고급 모드 여부 확인
  const isAdvancedMode = useCurriculum && useExpertMode

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }


  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8">

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 하트 표시 */}
        <HeartDisplay
          remainingHearts={remainingHearts}
          heartsResetAt={heartsResetAt}
        />

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">문서 생성하기</h1>
          <p className="text-lg text-gray-700 font-medium">
            어린이집 문서를 AI가 작성해드려요
          </p>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type Selection */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-3">
                문서 종류 선택
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(['알림장', '보육일지', '관찰기록', '발달평가', '부모면담'] as DocumentType[]).map(
                  (type) => (
                    <label
                      key={type}
                      className={`flex items-center justify-center px-4 py-3 text-base rounded-lg border-2 cursor-pointer transition ${
                        documentType === type
                          ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                          : 'border-gray-300 hover:border-purple-400 text-gray-900 font-semibold'
                      }`}
                    >
                      <input
                        type="radio"
                        name="documentType"
                        value={type}
                        checked={documentType === type}
                        onChange={(e) => {
                          setDocumentType(e.target.value as DocumentType)
                          setResult('')
                          setError('')
                        }}
                        className="sr-only"
                      />
                      <span>{type}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Child Name & Age Input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">
                  아이 이름 (선택)
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                  placeholder="예: 민준 (빈칸시 'ㅇㅇ'으로 표시)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 입력하지 않으면 "ㅇㅇ"으로 표시됩니다
                </p>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">
                  나이 <span className="text-red-600">*</span>
                </label>
                <select
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                  required
                >
                  <option value="">나이 선택</option>
                  <option value="0">만 0세</option>
                  <option value="1">만 1세</option>
                  <option value="2">만 2세</option>
                  <option value="3">만 3세</option>
                  <option value="4">만 4세</option>
                  <option value="5">만 5세</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  📚 교육과정 적용을 위해 필수입니다
                </p>
              </div>
            </div>

            {/* 알림장 specific fields */}
            {documentType === '알림장' && (
              <>
                {/* Target Type */}
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-3">
                    대상 유형
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['개인', '반 전체'].map((type) => (
                      <label
                        key={type}
                        className={`flex items-center justify-center px-4 py-3 text-base rounded-lg border-2 cursor-pointer transition ${
                          targetType === type
                            ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                            : 'border-gray-300 hover:border-purple-400 text-gray-900 font-semibold'
                        }`}
                      >
                        <input
                          type="radio"
                          name="targetType"
                          value={type}
                          checked={targetType === type}
                          onChange={(e) => setTargetType(e.target.value)}
                          className="sr-only"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Memo - 메인 입력 */}
                <div>
                  <label htmlFor="memo" className="block text-base font-bold text-gray-900 mb-2">
                    내용 입력 <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                    placeholder="오늘 있었던 일을 자유롭게 작성하세요. AI가 자동으로 적절한 카테고리와 발달 영역을 판단합니다."
                    rows={6}
                    required
                  />
                </div>

                {/* 커리큘럼 모드 토글 */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useCurriculum}
                        onChange={(e) => setUseCurriculum(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-base font-bold text-gray-900">커리큘럼 모드</div>
                        <div className="text-sm text-gray-600">
                          보육과정 기반 전문 작성 (나이에 따라 자동 적용)
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 전문 지식 모드 토글 */}
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <div className="flex-1">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useExpertMode}
                        onChange={(e) => setUseExpertMode(e.target.checked)}
                        className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-base font-bold text-gray-900 flex items-center gap-2">
                          전문 지식 모드
                          <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-xs font-bold rounded">3배 차감</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          보육과정 전문 자료 기반 고급 작성
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-3">톤</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['감성적', '균형', '정보형'].map((t) => (
                      <label
                        key={t}
                        className={`flex items-center justify-center px-4 py-3 text-base rounded-lg border-2 cursor-pointer transition ${
                          tone === t
                            ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                            : 'border-gray-300 hover:border-purple-400 text-gray-900 font-semibold'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tone"
                          value={t}
                          checked={tone === t}
                          onChange={(e) => setTone(e.target.value)}
                          className="sr-only"
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </>
            )}

            {/* 보육일지 specific fields */}
            {documentType === '보육일지' && (
              <>
                <div>
                  <label htmlFor="boyukDate" className="block text-base font-bold text-gray-900 mb-2">
                    날짜
                  </label>
                  <input
                    type="date"
                    id="boyukDate"
                    value={boyukDate}
                    onChange={(e) => setBoyukDate(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                  />
                </div>
                <div>
                  <label
                    htmlFor="playContent"
                    className="block text-base font-bold text-gray-900 mb-2"
                  >
                    놀이 내용
                  </label>
                  <textarea
                    id="playContent"
                    value={playContent}
                    onChange={(e) => setPlayContent(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                    placeholder="예: 블록으로 성 만들기, 역할놀이 영역에서 병원놀이"
                    rows={4}
                  />
                </div>
                <div>
                  <label
                    htmlFor="teacherSupport"
                    className="block text-base font-bold text-gray-900 mb-2"
                  >
                    교사 지원
                  </label>
                  <textarea
                    id="teacherSupport"
                    value={teacherSupport}
                    onChange={(e) => setTeacherSupport(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                    placeholder="예: 블록 추가 제공, 상호작용 촉진, 안전 지도"
                    rows={4}
                  />
                </div>
                <div>
                  <label
                    htmlFor="evaluation"
                    className="block text-base font-bold text-gray-900 mb-2"
                  >
                    평가 및 지원 계획
                  </label>
                  <textarea
                    id="evaluation"
                    value={evaluation}
                    onChange={(e) => setEvaluation(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                    placeholder="예: 집중력이 향상됨. 내일은 더 다양한 재료 제공 예정"
                    rows={4}
                  />
                </div>
              </>
            )}

            {/* 관찰기록 specific fields */}
            {documentType === '관찰기록' && (
              <>
                <div>
                  <label
                    htmlFor="gwanchalDate"
                    className="block text-base font-bold text-gray-900 mb-2"
                  >
                    날짜
                  </label>
                  <input
                    type="date"
                    id="gwanchalDate"
                    value={gwanchalDate}
                    onChange={(e) => setGwanchalDate(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="context" className="block text-base font-bold text-gray-900 mb-2">
                    관찰 상황
                  </label>
                  <textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                    placeholder="예: 자유놀이 시간, 블록 영역에서"
                    rows={2}
                  />
                </div>
                <div>
                  <label
                    htmlFor="observation"
                    className="block text-base font-bold text-gray-900 mb-2"
                  >
                    관찰 내용
                  </label>
                  <textarea
                    id="observation"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                    placeholder="예: 친구에게 블록을 건네주며 '같이 하자'라고 말함"
                    rows={6}
                  />
                </div>
              </>
            )}

            {/* 발달평가 specific fields */}
            {documentType === '발달평가' && (
              <>
                <div>
                  <label htmlFor="period" className="block text-base font-bold text-gray-900 mb-2">
                    평가 기간
                  </label>
                  <input
                    type="text"
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                    placeholder="예: 2025년 3월 ~ 2025년 8월"
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-bold text-gray-700">
                    발달 영역별 평가 (작성하고 싶은 영역만 입력하세요)
                  </p>
                  {Object.keys(areas).map((area) => (
                    <div key={area}>
                      <label
                        htmlFor={`area-${area}`}
                        className="block text-sm font-semibold text-gray-700 mb-1"
                      >
                        {area}
                      </label>
                      <textarea
                        id={`area-${area}`}
                        value={areas[area as keyof typeof areas]}
                        onChange={(e) =>
                          setAreas({ ...areas, [area]: e.target.value })
                        }
                        className="w-full px-4 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                        placeholder={`${area} 영역 평가 내용을 간단히 입력하세요`}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 부모면담 specific fields */}
            {documentType === '부모면담' && (
              <>
                <div>
                  <label
                    htmlFor="myeondamDate"
                    className="block text-base font-bold text-gray-900 mb-2"
                  >
                    면담 일자
                  </label>
                  <input
                    type="date"
                    id="myeondamDate"
                    value={myeondamDate}
                    onChange={(e) => setMyeondamDate(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-3">
                    면담 방법
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['대면', '전화', '화상'].map((m) => (
                      <label
                        key={m}
                        className={`flex items-center justify-center px-4 py-3 text-base rounded-lg border-2 cursor-pointer transition ${
                          method === m
                            ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                            : 'border-gray-300 hover:border-purple-400 text-gray-900 font-semibold'
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={m}
                          checked={method === m}
                          onChange={(e) => setMethod(e.target.value)}
                          className="sr-only"
                        />
                        <span>{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="topics" className="block text-base font-bold text-gray-900 mb-2">
                    면담 주제 (선택)
                  </label>
                  <input
                    type="text"
                    id="topics"
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                    placeholder="예: 적응, 또래관계, 언어발달"
                  />
                </div>
                <div>
                  <label
                    htmlFor="teacherOpinion"
                    className="block text-base font-bold text-gray-900 mb-2"
                  >
                    교사 의견
                  </label>
                  <textarea
                    id="teacherOpinion"
                    value={teacherOpinion}
                    onChange={(e) => setTeacherOpinion(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                    placeholder="원에서의 적응, 놀이 특성, 또래관계 등"
                    rows={4}
                  />
                </div>
                <div>
                  <label
                    htmlFor="parentOpinion"
                    className="block text-base font-bold text-gray-900 mb-2"
                  >
                    학부모 의견
                  </label>
                  <textarea
                    id="parentOpinion"
                    value={parentOpinion}
                    onChange={(e) => setParentOpinion(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                    placeholder="가정에서의 모습, 걱정되는 부분, 궁금한 점 등"
                    rows={4}
                  />
                </div>
              </>
            )}

            {/* Style selection - common for all document types */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-3">길이</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '간결형', label: '간결형', desc: '핵심 위주' },
                  { value: '상세형', label: '상세형', desc: '구체적 상세' },
                ].map((st) => (
                  <label
                    key={st.value}
                    className={`flex flex-col items-center justify-center px-4 py-3 text-base rounded-lg border-2 cursor-pointer transition ${
                      style === st.value
                        ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                        : 'border-gray-300 hover:border-purple-400 text-gray-900 font-semibold'
                    }`}
                  >
                    <input
                      type="radio"
                      name="style"
                      value={st.value}
                      checked={style === st.value}
                      onChange={(e) => setStyle(e.target.value)}
                      className="sr-only"
                    />
                    <span>{st.label}</span>
                    <span className="text-xs text-gray-600 mt-1">{st.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="flex flex-col items-center gap-1">
                    <span className="text-base">
                      {useExpertMode ? '전문 지식 검색 및 생성 중...' : '문서 생성 중...'}
                    </span>
                    {useExpertMode && (
                      <span className="text-xs opacity-90">
                        보육과정 자료를 분석하고 있습니다
                      </span>
                    )}
                  </span>
                </>
              ) : (
                `${documentType} 생성하기`
              )}
            </button>
          </form>
        </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 font-semibold px-6 py-4 rounded-lg mb-6 text-base">
            {error}
          </div>
        )}

        {/* Result display */}
        {result && (
          <>
            <ResultDisplay
              result={result}
              versionHistory={versionHistory}
              onRestore={handleRestoreVersion}
              onCopy={handleCopy}
              onNewDocument={handleNewDocument}
              onRegenerate={(e) => handleSubmit(e, true)}
              isLoading={loading}
              regenerateCount={regenerateCount}
              isAdvancedMode={isAdvancedMode}
              documentType={documentType}
            />

            <RefinementPanel
              refinementCount={refinementCount}
              maxRefinements={5}
              onRefine={handleRefine}
              isRefining={refining}
            />
          </>
        )}
      </main>

      {/* Toast message */}
      <ToastNotification
        show={showToast}
        message={toastMessage}
        type={toastType}
      />
    </div>
  )
}
