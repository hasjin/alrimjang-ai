import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const result = await pool.query(
      'SELECT * FROM alrimjang.generation_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [session.user.id]
    )

    return NextResponse.json({
      history: result.rows.length > 0 ? result.rows[0] : null
    })
  } catch (error) {
    console.error('Last history fetch error:', error)
    return NextResponse.json({ error: '이력 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
