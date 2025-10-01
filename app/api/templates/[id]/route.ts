import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { id } = params

    // 소유자 확인 후 삭제
    const result = await pool.query(
      'DELETE FROM alrimjang.templates WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '템플릿을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ message: '템플릿이 삭제되었습니다.' })
  } catch (error) {
    console.error('Template delete error:', error)
    return NextResponse.json({ error: '템플릿 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
