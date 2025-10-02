import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin, setup2FA, has2FAEnabled } from '@/lib/admin-auth'

/**
 * 2FA 설정 시작 (QR 코드 생성)
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

    // 이미 2FA가 활성화되어 있는지 확인
    const alreadyEnabled = await has2FAEnabled(session.user.id)
    if (alreadyEnabled) {
      return NextResponse.json(
        { error: '이미 2FA가 활성화되어 있습니다. 먼저 비활성화해주세요.' },
        { status: 400 }
      )
    }

    // 2FA 설정 (Secret 생성, QR 코드, 백업 코드)
    const { qrCodeUrl, backupCodes } = await setup2FA(
      session.user.id,
      session.user.email || ''
    )

    return NextResponse.json({
      qrCodeUrl,
      backupCodes,
      message: 'Google Authenticator로 QR 코드를 스캔하고, 백업 코드를 안전한 곳에 보관하세요.',
    })
  } catch (error: unknown) {
    console.error('2FA Setup Error:', error)
    return NextResponse.json(
      { error: '2FA 설정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
