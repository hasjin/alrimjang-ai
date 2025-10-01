'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Document {
  id: number
  document_type: string
  child_id: number | null
  child_name: string
  input_data: any
  generated_content: string
  created_at: string
}

interface Child {
  id: number
  name: string
  class_name: string | null
}

function DocumentsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const childIdParam = searchParams.get('childId')

  const [documents, setDocuments] = useState<Document[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<number | null>(
    childIdParam ? parseInt(childIdParam) : null
  )
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  const documentTypes = ['all', '알림장', '보육일지', '관찰기록', '발달평가', '부모면담']

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchChildren()
      fetchDocuments()
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDocuments()
    }
  }, [selectedChild, selectedType, status])

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/children')
      if (response.ok) {
        const data = await response.json()
        setChildren(data.children)
      }
    } catch (error) {
      console.error('Failed to fetch children:', error)
    }
  }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      let url = '/api/documents'
      const params = new URLSearchParams()

      if (selectedChild) {
        params.append('childId', selectedChild.toString())
      }
      if (selectedType !== 'all') {
        params.append('type', selectedType)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
        if (data.documents.length > 0 && !selectedDoc) {
          setSelectedDoc(data.documents[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('복사되었습니다!')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchDocuments()
        if (selectedDoc?.id === id) {
          setSelectedDoc(null)
        }
      } else {
        alert('삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-280px)]">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📚</span>
            <h1 className="text-4xl font-bold text-gray-900">문서 기록</h1>
          </div>
          <p className="text-gray-600 ml-16">생성된 모든 문서를 확인하고 관리하세요</p>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">원아 선택</label>
              <select
                value={selectedChild || ''}
                onChange={(e) => setSelectedChild(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900 font-medium"
              >
                <option value="">전체 원아</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name} {child.class_name && `(${child.class_name})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">문서 타입</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900 font-medium"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? '전체 문서' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">생성된 문서가 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 문서를 생성해보세요</p>
            <button
              onClick={() => router.push('/generate')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
            >
              문서 생성하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 문서 목록 */}
            <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    selectedDoc?.id === doc.id
                      ? 'bg-blue-50 border-blue-400 shadow-md'
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {doc.document_type}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="text-base font-bold text-gray-900 mb-2">{doc.child_name}</div>
                  <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {doc.generated_content}
                  </div>
                </button>
              ))}
            </div>

          {/* 문서 상세 */}
          {selectedDoc && (
            <div className="lg:col-span-2 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-t-xl border-b-2 border-blue-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-base font-bold shadow-sm">
                        {selectedDoc.document_type}
                      </span>
                      <span className="text-gray-700 text-sm font-medium bg-white px-3 py-1 rounded-full">
                        {new Date(selectedDoc.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedDoc.child_name}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(selectedDoc.generated_content)}
                      className="bg-white text-gray-800 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition shadow-sm border-2 border-gray-200"
                    >
                      📋 복사
                    </button>
                    <button
                      onClick={() => handleDelete(selectedDoc.id)}
                      className="bg-red-50 text-red-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-red-100 transition border-2 border-red-200"
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              </div>

              {/* 입력 정보 */}
              <div className="p-6 border-b-2 border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">📝</span> 입력 정보
                </h3>
                <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
                  {selectedDoc.document_type === '알림장' && (
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[80px]">카테고리:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.categories?.join(', ')}</span>
                      </div>
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[80px]">메모:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.memo}</span>
                      </div>
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[80px]">톤:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.tone}</span>
                      </div>
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[80px]">대상:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.targetType}</span>
                      </div>
                    </div>
                  )}
                  {selectedDoc.document_type === '보육일지' && (
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[90px]">놀이 내용:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.playContent}</span>
                      </div>
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[90px]">교사 지원:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.teacherSupport}</span>
                      </div>
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[90px]">평가:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.evaluation}</span>
                      </div>
                    </div>
                  )}
                  {selectedDoc.document_type === '관찰기록' && (
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[80px]">상황:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.context}</span>
                      </div>
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[80px]">관찰 내용:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.observation}</span>
                      </div>
                    </div>
                  )}
                  {selectedDoc.document_type === '발달평가' && (
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[60px]">기간:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.period}</span>
                      </div>
                      {Object.entries(selectedDoc.input_data.areas || {}).map(([area, content]) => (
                        <div key={area} className="flex gap-2">
                          <strong className="text-gray-900 min-w-[60px]">{area}:</strong>
                          <span className="text-gray-700">{content as string}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedDoc.document_type === '부모면담' && (
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[90px]">방법:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.method}</span>
                      </div>
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[90px]">교사 의견:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.teacherOpinion}</span>
                      </div>
                      <div className="flex gap-2">
                        <strong className="text-gray-900 min-w-[90px]">학부모 의견:</strong>
                        <span className="text-gray-700">{selectedDoc.input_data.parentOpinion}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 생성된 문서 */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-green-600">✨</span> 생성된 문서
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200 whitespace-pre-wrap text-base leading-relaxed text-gray-900">
                  {selectedDoc.generated_content}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    }>
      <DocumentsContent />
    </Suspense>
  )
}
