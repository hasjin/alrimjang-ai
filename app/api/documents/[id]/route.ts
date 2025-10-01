import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const result = await pool.query(
      'DELETE FROM alrimjang.documents WHERE id = $1 AND user_id = $2 RETURNING *',
      [params.id, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '문서를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Document deletion error:', error)
    return NextResponse.json({ error: '문서 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
