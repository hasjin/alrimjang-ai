'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SetupResponse {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export default function TwoFactorSettings() {
  const router = useRouter()
  const [step, setStep] = useState<'initial' | 'setup' | 'verify'>('initial')
  const [setupData, setSetupData] = useState<SetupResponse | null>(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSetup = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '2FA 설정 시작 실패')
      }

      const data = await response.json()
      setSetupData(data)
      setStep('setup')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async () => {
    if (!token || token.length !== 6) {
      setError('6자리 OTP 코드를 입력하세요.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '2FA 활성화 실패')
      }

      alert('2FA가 성공적으로 활성화되었습니다!')
      setStep('verify')
      setToken('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!token || token.length !== 6) {
      setError('6자리 OTP 코드를 입력하여 비활성화하세요.')
      return
    }

    if (!confirm('정말 2FA를 비활성화하시겠습니까?')) {
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '2FA 비활성화 실패')
      }

      alert('2FA가 비활성화되었습니다.')
      setStep('initial')
      setSetupData(null)
      setToken('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1"
          >
            ← 대시보드로
          </button>
          <h1 className="text-3xl font-bold text-gray-900">🔐 2단계 인증 (2FA)</h1>
          <p className="mt-2 text-gray-600">Google Authenticator로 계정을 보호하세요</p>
        </div>

        {/* 초기 상태 */}
        {step === 'initial' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">2단계 인증 설정</h2>
              <p className="text-gray-600">
                Google Authenticator 앱을 사용하여 계정 보안을 강화하세요.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">📱 필요한 앱</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Google Authenticator (iOS/Android)</li>
                <li>• Authy</li>
                <li>• Microsoft Authenticator</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '설정 중...' : '2FA 설정 시작'}
            </button>
          </div>
        )}

        {/* 설정 중 */}
        {step === 'setup' && setupData && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">QR 코드 스캔</h2>

            <div className="space-y-6">
              {/* QR 코드 */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-4">1️⃣ QR 코드 스캔</h3>
                <div className="flex justify-center">
                  <img src={setupData.qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
                <p className="text-sm text-gray-600 text-center mt-4">
                  Google Authenticator 앱에서 위 QR 코드를 스캔하세요
                </p>
              </div>

              {/* 백업 코드 */}
              <div className="border rounded-lg p-6 bg-yellow-50 border-yellow-200">
                <h3 className="font-semibold text-gray-900 mb-4">2️⃣ 백업 코드 저장 (중요!)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  휴대폰을 분실한 경우를 대비해 안전한 곳에 보관하세요. 각 코드는 1회만 사용 가능합니다.
                </p>
                <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded border">
                  {setupData.backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-sm text-gray-800">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* OTP 입력 */}
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">3️⃣ 인증 코드 입력</h3>
                <p className="text-sm text-gray-600 mb-4">
                  앱에 표시된 6자리 코드를 입력하세요
                </p>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('initial')
                    setSetupData(null)
                    setToken('')
                    setError('')
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
                <button
                  onClick={handleEnable}
                  disabled={loading || token.length !== 6}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? '확인 중...' : '2FA 활성화'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 활성화 완료 */}
        {step === 'verify' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">2FA 활성화 완료!</h2>
              <p className="text-gray-600">
                이제 관리자 페이지 접근 시 OTP 코드가 필요합니다.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">✨ 보안이 강화되었습니다</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ Google Authenticator 연동 완료</li>
                <li>✓ 백업 코드 10개 생성됨</li>
                <li>✓ 관리자 계정 보호 활성화</li>
              </ul>
            </div>

            {/* 비활성화 섹션 */}
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">2FA 비활성화</h3>
              <p className="text-sm text-gray-600 mb-4">
                2FA를 비활성화하려면 현재 OTP 코드를 입력하세요
              </p>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-xl font-mono tracking-widest mb-4"
                maxLength={6}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleDisable}
                disabled={loading || token.length !== 6}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : '2FA 비활성화'}
              </button>
            </div>

            <button
              onClick={() => router.push('/admin')}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              대시보드로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
