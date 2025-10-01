import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRemainingUsage } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { remaining, resetAt } = await getRemainingUsage(session.user.id)

    return NextResponse.json({
      remaining,
      resetAt: resetAt?.toISOString() || null,
    })
  } catch (error) {
    console.error('Usage check error:', error)
    return NextResponse.json({ error: '사용량 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
