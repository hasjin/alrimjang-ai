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
      'SELECT * FROM alrimjang.generation_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [session.user.id]
    )

    return NextResponse.json({ history: result.rows })
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json({ error: '이력 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 })
    }

    await pool.query(
      'DELETE FROM alrimjang.generation_history WHERE id = $1 AND user_id = $2',
      [id, session.user.id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('History delete error:', error)
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
