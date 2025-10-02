import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getHeartUsageLogs } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const logs = await getHeartUsageLogs(session.user.id, limit)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Hearts logs fetch error:', error)
    return NextResponse.json(
      { error: '하트 사용 이력 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
