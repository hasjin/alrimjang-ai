'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type DocumentType = '알림장' | '보육일지' | '관찰기록' | '발달평가' | '부모면담'

interface Child {
  id: number
  name: string
  birth_date: string | null
  class_name: string | null
}

interface Document {
  id: number
  document_type: string
  child_name: string
  generated_content: string
  created_at: string
  input_data: any
}

export default function GeneratePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Document type selection
  const [documentType, setDocumentType] = useState<DocumentType>('알림장')

  // Child selection
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null)
  const [manualChildName, setManualChildName] = useState('')
  const [useManualName, setUseManualName] = useState(false)

  // 알림장 fields
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [memo, setMemo] = useState('')
  const [style, setStyle] = useState('간결형')
  const [tone, setTone] = useState('균형')
  const [targetType, setTargetType] = useState('개인')

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
  const [regenerateCount, setRegenerateCount] = useState(0)
  const [showPreviousDocs, setShowPreviousDocs] = useState(false)
  const [previousDocs, setPreviousDocs] = useState<Document[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Fetch children
  useEffect(() => {
    if (status === 'authenticated') {
      fetchChildren()
    }
  }, [status])

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/children')
      if (response.ok) {
        const data = await response.json()
        setChildren(data.children || [])
      }
    } catch (error) {
      console.error('Failed to fetch children:', error)
    }
  }

  const loadPreviousSettings = async () => {
    if (!selectedChildId) return

    setLoadingDocs(true)
    try {
      const response = await fetch(
        `/api/children/${selectedChildId}/documents?type=${encodeURIComponent(documentType)}`
      )
      if (response.ok) {
        const data = await response.json()
        const docs = data.documents || []

        if (docs.length === 0) {
          setToastMessage('이전에 작성된 문서가 없습니다.')
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
        } else {
          // 가장 최근 문서의 설정 불러오기
          const lastDoc = docs[0]
          const inputData = lastDoc.input_data || {}

          // 알림장 설정 불러오기
          if (documentType === '알림장') {
            if (inputData.tone) setTone(inputData.tone)
            if (inputData.targetType) setTargetType(inputData.targetType)
            if (inputData.style) setStyle(inputData.style)
            if (inputData.categories) setSelectedCategories(inputData.categories)
            if (inputData.memo) setMemo(inputData.memo)
          }
          // 보육일지 설정 불러오기
          else if (documentType === '보육일지') {
            if (inputData.playContent) setPlayContent(inputData.playContent)
            if (inputData.teacherSupport) setTeacherSupport(inputData.teacherSupport)
            if (inputData.evaluation) setEvaluation(inputData.evaluation)
            if (inputData.date) setBoyukDate(inputData.date)
          }
          // 관찰기록 설정 불러오기
          else if (documentType === '관찰기록') {
            if (inputData.observation) setObservation(inputData.observation)
            if (inputData.context) setContext(inputData.context)
            if (inputData.date) setGwanchalDate(inputData.date)
          }
          // 발달평가 설정 불러오기
          else if (documentType === '발달평가') {
            if (inputData.period) setPeriod(inputData.period)
            if (inputData.areas) setAreas(inputData.areas)
          }
          // 부모면담 설정 불러오기
          else if (documentType === '부모면담') {
            if (inputData.date) setMyeondamDate(inputData.date)
            if (inputData.method) setMethod(inputData.method)
            if (inputData.teacherOpinion) setTeacherOpinion(inputData.teacherOpinion)
            if (inputData.parentOpinion) setParentOpinion(inputData.parentOpinion)
            if (inputData.topics) setTopics(inputData.topics)
          }

          setToastMessage('이전 설정을 불러왔습니다!')
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
        }
      }
    } catch (error) {
      console.error('Failed to load previous settings:', error)
      setToastMessage('이전 설정을 불러오는데 실패했습니다.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      setLoadingDocs(false)
    }
  }

  const fetchPreviousDocuments = async () => {
    if (!selectedChildId) return

    setLoadingDocs(true)
    try {
      const response = await fetch(
        `/api/children/${selectedChildId}/documents?type=${encodeURIComponent(documentType)}`
      )
      if (response.ok) {
        const data = await response.json()
        const docs = data.documents || []
        setPreviousDocs(docs)
        setShowPreviousDocs(true)

        if (docs.length === 0) {
          setToastMessage('이전에 작성된 문서가 없습니다.')
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
        }
      }
    } catch (error) {
      console.error('Failed to fetch previous documents:', error)
      setToastMessage('문서를 불러오는데 실패했습니다.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      setLoadingDocs(false)
    }
  }

  const categories = {
    '일상 생활': ['화장실 훈련', '식사', '낮잠', '등하원', '옷 갈아입기', '개인위생'],
    '건강 관리': ['투약', '병원/상처', '발열/몸살', '건강검진', '알레르기/특이사항'],
    '놀이/활동': ['실내 자유놀이', '실외 활동', '미술 활동', '음악/율동', '신체 활동', '요리 활동', '과학/탐구'],
    '특별 행사': ['현장학습', '운동회/발표회', '생일 파티', '절기/기념일', '졸업/입학식'],
    '교육/발달': ['언어/한글', '수학/인지', '영어', '특별활동'],
    '사회성/정서': ['친구 관계', '갈등/문제행동', '칭찬/성장'],
    '부모 소통': ['준비물 요청', '일정 안내', '상담 요청'],
  }

  const categoryIcons: Record<string, string> = {
    '일상 생활': '🏠',
    '건강 관리': '🏥',
    '놀이/활동': '🎨',
    '특별 행사': '🎉',
    '교육/발달': '📚',
    '사회성/정서': '🤝',
    '부모 소통': '📢',
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const getChildName = (): string => {
    if (useManualName) {
      return manualChildName
    }
    const child = children.find((c) => c.id === selectedChildId)
    return child?.name || ''
  }

  const getInputData = (): Record<string, any> => {
    switch (documentType) {
      case '알림장':
        return { categories: selectedCategories, memo }
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
    const childName = getChildName()
    if (!childName) {
      return '아이 이름을 선택하거나 입력해주세요.'
    }

    switch (documentType) {
      case '알림장':
        if (selectedCategories.length === 0) {
          return '카테고리를 최소 1개 이상 선택해주세요.'
        }
        if (!memo) {
          return '간단 메모를 입력해주세요.'
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
      const childName = getChildName()
      const inputData = getInputData()

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          childId: useManualName ? null : selectedChildId,
          childName,
          inputData,
          style,
          tone: documentType === '알림장' ? tone : undefined,
          targetType: documentType === '알림장' ? targetType : undefined,
          isRegenerate: isRegenerate && regenerateCount === 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          const resetDate = new Date(data.resetAt)
          const hours = Math.floor((resetDate.getTime() - Date.now()) / (1000 * 60 * 60))
          const minutes = Math.floor(
            ((resetDate.getTime() - Date.now()) % (1000 * 60 * 60)) / (1000 * 60)
          )
          throw new Error(
            `일일 생성 횟수(5개)를 초과했습니다. ${hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`} 후 다시 이용하실 수 있습니다.`
          )
        }
        throw new Error(data.error || '문서 생성 실패')
      }

      setResult(data.message)
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setToastMessage('복사되었습니다!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      alert('복사에 실패했습니다.')
    }
  }

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
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">문서 생성하기</h1>
          <p className="text-lg text-gray-700 font-medium">
            어린이집 문서를 AI가 작성해드려요
          </p>
        </div>

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

            {/* Child Selection */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-3">
                아이 선택
              </label>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="childInputType"
                      checked={!useManualName}
                      onChange={() => setUseManualName(false)}
                      className="mr-2"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      등록된 아이 선택
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="childInputType"
                      checked={useManualName}
                      onChange={() => setUseManualName(true)}
                      className="mr-2"
                    />
                    <span className="text-sm font-semibold text-gray-700">직접 입력</span>
                  </label>
                </div>

                {!useManualName ? (
                  <div className="flex gap-3">
                    <select
                      value={selectedChildId || ''}
                      onChange={(e) => setSelectedChildId(Number(e.target.value) || null)}
                      className="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                    >
                      <option value="">아이를 선택하세요</option>
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                          {child.class_name ? ` (${child.class_name})` : ''}
                        </option>
                      ))}
                    </select>
                    {selectedChildId && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={loadPreviousSettings}
                          disabled={loadingDocs}
                          className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition disabled:opacity-50"
                        >
                          {loadingDocs ? '로딩...' : '이전 설정 불러오기'}
                        </button>
                        <button
                          type="button"
                          onClick={fetchPreviousDocuments}
                          disabled={loadingDocs}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition disabled:opacity-50"
                        >
                          이전 문서 보기
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={manualChildName}
                    onChange={(e) => setManualChildName(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900"
                    placeholder="아이 이름을 입력하세요"
                  />
                )}
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

                {/* Categories */}
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    카테고리{' '}
                    <span className="text-sm text-red-600 font-normal">
                      (필수 - 최소 1개 이상)
                    </span>
                  </label>
                  <div className="space-y-4">
                    {Object.entries(categories).map(([group, items]) => (
                      <div key={group}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{categoryIcons[group]}</span>
                          <h3 className="text-sm font-bold text-gray-700">{group}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {items.map((cat) => (
                            <label
                              key={cat}
                              className={`flex items-center justify-center px-3 py-2 text-sm rounded-lg border-2 cursor-pointer transition ${
                                selectedCategories.includes(cat)
                                  ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                                  : 'border-gray-300 hover:border-purple-400 text-gray-700 font-semibold'
                              }`}
                            >
                              <input
                                type="checkbox"
                                value={cat}
                                checked={selectedCategories.includes(cat)}
                                onChange={() => toggleCategory(cat)}
                                className="sr-only"
                              />
                              <span>{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Memo */}
                <div>
                  <label htmlFor="memo" className="block text-base font-bold text-gray-900 mb-2">
                    간단 메모
                  </label>
                  <textarea
                    id="memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-900"
                    placeholder="예: 10시 쉬 성공, 스스로 말함"
                    rows={4}
                  />
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
                  생성 중...
                </>
              ) : (
                `${documentType} 생성하기`
              )}
            </button>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 font-semibold px-6 py-4 rounded-lg mb-6 text-base">
            {error}
          </div>
        )}

        {/* Previous documents modal */}
        {showPreviousDocs && previousDocs.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  이전 {documentType} ({previousDocs.length}개)
                </h2>
                <button
                  onClick={() => setShowPreviousDocs(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                {previousDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="border-2 border-gray-200 rounded-lg p-5 hover:border-purple-300 transition bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-700">
                          {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                        </span>
                        <div className="flex gap-2 text-xs">
                          {doc.input_data?.tone && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                              톤: {doc.input_data.tone}
                            </span>
                          )}
                          {doc.input_data?.targetType && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                              대상: {doc.input_data.targetType}
                            </span>
                          )}
                          {doc.input_data?.style && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                              {doc.input_data.style}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(doc.generated_content)
                          setToastMessage('이전 문서가 복사되었습니다!')
                          setShowToast(true)
                          setTimeout(() => setShowToast(false), 3000)
                        }}
                        className="text-sm px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
                      >
                        복사
                      </button>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {doc.generated_content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Result display */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900">생성된 {documentType}</h2>
              <div className="flex gap-3">
                <button
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-base disabled:opacity-50 flex items-center gap-2"
                >
                  다시 생성
                  {regenerateCount === 0 && (
                    <span className="text-xs bg-white text-blue-600 px-2 py-0.5 rounded-full">
                      무료
                    </span>
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-base"
                >
                  복사하기
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-lg font-medium">
                {result}
              </p>
            </div>
            {regenerateCount > 0 && (
              <p className="text-sm text-gray-600 mt-3 text-center">
                추가 재생성 시 일일 생성 횟수가 차감됩니다.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Toast message */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in text-base font-semibold">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
