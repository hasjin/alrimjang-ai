'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [usage, setUsage] = useState<{ remaining: number; resetAt: string } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (session) {
      fetchUsage()
    }

    const handleUsageUpdate = () => {
      fetchUsage()
    }

    window.addEventListener('usage-updated', handleUsageUpdate)
    return () => window.removeEventListener('usage-updated', handleUsageUpdate)
  }, [session])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    }
  }

  const navLinks = [
    { href: '/generate', label: '문서 생성' },
    { href: '/children', label: '원아 관리' },
    { href: '/documents', label: '문서 기록' },
    { href: '/mypage', label: '마이페이지' },
  ]

  if (pathname === '/') return null

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <button
            onClick={() => router.push('/generate')}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <span className="text-2xl">🌼</span>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-blue-600 hover:text-blue-700">알도AI</span>
              <span className="text-[10px] text-orange-600 font-semibold -mt-1">BETA</span>
            </div>
          </button>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* 데스크톱 우측 */}
          <div className="hidden md:flex items-center space-x-4">
            {usage && (
              <div className="text-sm">
                <span className={`font-medium ${
                  usage.remaining === 0 ? 'text-red-600' :
                  usage.remaining <= 2 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {usage.remaining}회
                </span>
                <span className="text-gray-600"> / 5회</span>
              </div>
            )}

            {session ? (
              <div className="flex items-center space-x-3">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                로그인
              </button>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex md:hidden items-center space-x-3">
            {/* 모바일 사용량 표시 */}
            {usage && (
              <div className="text-xs">
                <span className={`font-bold ${
                  usage.remaining === 0 ? 'text-red-600' :
                  usage.remaining <= 2 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {usage.remaining}/5
                </span>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 드롭다운 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    router.push(link.href)
                    setMobileMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-md text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className="border-t pt-2 mt-2">
                {session ? (
                  <div className="px-4 py-2">
                    <div className="flex items-center space-x-3 mb-3">
                      {session.user?.image && (
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900">{session.user?.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/' })
                        setMobileMenuOpen(false)
                      }}
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mx-4"
                  >
                    로그인
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
