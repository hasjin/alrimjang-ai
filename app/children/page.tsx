'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Child {
  id: number
  name: string
  birth_date: string | null
  class_name: string | null
  notes: string | null
  created_at: string
}

export default function ChildrenPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [className, setClassName] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchChildren()
    }
  }, [status, router])

  const fetchChildren = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/children')
      if (response.ok) {
        const data = await response.json()
        setChildren(data.children)
      }
    } catch (error) {
      console.error('Failed to fetch children:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setBirthDate('')
    setClassName('')
    setNotes('')
    setEditingChild(null)
    setShowForm(false)
  }

  const handleEdit = (child: Child) => {
    setEditingChild(child)
    setName(child.name)
    setBirthDate(child.birth_date || '')
    setClassName(child.class_name || '')
    setNotes(child.notes || '')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      alert('이름을 입력해주세요.')
      return
    }

    try {
      const url = editingChild ? `/api/children/${editingChild.id}` : '/api/children'
      const method = editingChild ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          birthDate: birthDate || null,
          className: className || null,
          notes: notes || null,
        }),
      })

      if (response.ok) {
        await fetchChildren()
        resetForm()
      } else {
        const data = await response.json()
        alert(data.error || '오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to save child:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까? 관련된 모든 문서 기록도 함께 삭제됩니다.')) {
      return
    }

    try {
      const response = await fetch(`/api/children/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchChildren()
      } else {
        const data = await response.json()
        alert(data.error || '삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete child:', error)
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
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">👶</span>
                <h1 className="text-4xl font-bold text-gray-900">원아 관리</h1>
              </div>
              <p className="text-gray-600 ml-16">우리 반 아이들을 등록하고 관리하세요</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md flex items-center gap-2"
            >
              <span className="text-xl">+</span> 원아 등록
            </button>
          </div>
        </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                {editingChild ? '원아 수정' : '원아 등록'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900"
                  placeholder="예: 김민준"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">생년월일</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">반</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-900"
                  placeholder="예: 햇님반"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">메모</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none text-gray-900"
                  rows={4}
                  placeholder="특이사항, 알레르기 등"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
                >
                  {editingChild ? '수정 완료' : '등록하기'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {children.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">👶</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">등록된 원아가 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 원아를 등록해보세요</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md"
            >
              원아 등록하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{child.name}</h3>
                      {child.class_name && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {child.class_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(child)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 text-sm font-medium rounded-lg transition"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(child.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 text-sm font-medium rounded-lg transition"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {child.birth_date && (
                  <div className="flex items-center gap-2 text-gray-700 mb-3">
                    <span className="text-lg">🎂</span>
                    <span className="font-medium">
                      {new Date(child.birth_date).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )}

                {child.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {child.notes}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => router.push(`/documents?childId=${child.id}`)}
                  className="w-full bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 font-medium px-4 py-3 rounded-lg hover:from-gray-100 hover:to-gray-200 transition flex items-center justify-center gap-2 border border-gray-200"
                >
                  <span>📄</span> 문서 기록 보기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
