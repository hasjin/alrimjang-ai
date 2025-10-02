import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin, disable2FA, verify2FAToken, logAdminActivity } from '@/lib/admin-auth'

interface RequestBody {
  token: string // 6자리 OTP (확인용)
}

/**
 * 2FA 비활성화
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 관리자 확인
    const admin = await isAdmin(session.user.id)
    if (!admin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body: RequestBody = await req.json()
    const { token } = body

    if (!token || token.length !== 6) {
      return NextResponse.json(
        { error: '확인을 위해 현재 OTP 코드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // OTP 검증 (비활성화 전 확인)
    const isValid = await verify2FAToken(session.user.id, token)

    if (!isValid) {
      return NextResponse.json(
        { error: 'OTP 코드가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    // 2FA 비활성화
    const success = await disable2FA(session.user.id)

    if (!success) {
      return NextResponse.json(
        { error: '2FA 비활성화에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 활동 로그
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
    await logAdminActivity(
      session.user.id,
      'disable_2fa',
      null,
      null,
      ipAddress
    )

    return NextResponse.json({
      success: true,
      message: '2FA가 성공적으로 비활성화되었습니다.',
    })
  } catch (error: unknown) {
    console.error('2FA Disable Error:', error)
    return NextResponse.json(
      { error: '2FA 비활성화 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
