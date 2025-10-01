'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignIn() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/generate')
    }
  }, [status, router])

  // Development auto-login
  const handleDevLogin = async () => {
    await signIn('credentials', { callbackUrl: '/generate' })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🌼</span>
            <h1 className="text-4xl font-bold text-gray-900">
              알도AI
            </h1>
          </div>
          <p className="text-lg text-gray-700 font-medium">
            로그인하여 시작하세요
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleDevLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center gap-3 text-base mb-4"
          >
            🚀 개발용 빠른 로그인
          </button>
        )}

        <button
          onClick={() => signIn('google', { callbackUrl: '/generate' })}
          className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 font-bold py-4 px-6 rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center gap-3 text-base"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google로 로그인
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          로그인하면{' '}
          <a href="/terms" target="_blank" className="text-purple-600 hover:underline font-semibold">
            서비스 이용약관
          </a>{' '}
          및{' '}
          <a href="/privacy" target="_blank" className="text-purple-600 hover:underline font-semibold">
            개인정보 처리방침
          </a>
          에<br />동의하게 됩니다
        </p>
      </div>
    </div>
  )
}
