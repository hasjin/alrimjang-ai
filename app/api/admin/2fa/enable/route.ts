import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin, enable2FA, logAdminActivity } from '@/lib/admin-auth'

interface RequestBody {
  token: string // 6자리 OTP
}

/**
 * 2FA 활성화 (OTP 검증)
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
        { error: '유효한 6자리 OTP 코드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // OTP 검증 및 2FA 활성화
    const success = await enable2FA(session.user.id, token)

    if (!success) {
      return NextResponse.json(
        { error: 'OTP 코드가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    // 활동 로그
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
    await logAdminActivity(
      session.user.id,
      'enable_2fa',
      null,
      null,
      ipAddress
    )

    return NextResponse.json({
      success: true,
      message: '2FA가 성공적으로 활성화되었습니다.',
    })
  } catch (error: unknown) {
    console.error('2FA Enable Error:', error)
    return NextResponse.json(
      { error: '2FA 활성화 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
