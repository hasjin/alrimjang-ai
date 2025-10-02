import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin, verify2FAToken, verify2FABackupCode, logAdminActivity } from '@/lib/admin-auth'

interface RequestBody {
  token: string // 6자리 OTP 또는 백업 코드
  isBackupCode?: boolean
}

/**
 * 2FA 검증 (관리자 페이지 접근 시)
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
    const { token, isBackupCode } = body

    if (!token) {
      return NextResponse.json(
        { error: 'OTP 코드 또는 백업 코드를 입력해주세요.' },
        { status: 400 }
      )
    }

    let isValid = false

    if (isBackupCode) {
      // 백업 코드 검증
      isValid = await verify2FABackupCode(session.user.id, token)
    } else {
      // OTP 검증
      if (token.length !== 6) {
        return NextResponse.json(
          { error: '유효한 6자리 OTP 코드를 입력해주세요.' },
          { status: 400 }
        )
      }
      isValid = await verify2FAToken(session.user.id, token)
    }

    if (!isValid) {
      // 활동 로그 (실패)
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
      await logAdminActivity(
        session.user.id,
        '2fa_verify_failed',
        null,
        { is_backup_code: isBackupCode },
        ipAddress
      )

      return NextResponse.json(
        { error: isBackupCode ? '백업 코드가 올바르지 않습니다.' : 'OTP 코드가 올바르지 않습니다.' },
        { status: 400 }
      )
    }

    // 활동 로그 (성공)
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
    await logAdminActivity(
      session.user.id,
      '2fa_verify_success',
      null,
      { is_backup_code: isBackupCode },
      ipAddress
    )

    return NextResponse.json({
      success: true,
      message: '2FA 인증에 성공했습니다.',
    })
  } catch (error: unknown) {
    console.error('2FA Verify Error:', error)
    return NextResponse.json(
      { error: '2FA 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
