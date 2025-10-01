import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await req.json()
    const { name, birthDate, className, notes } = body

    if (!name) {
      return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 })
    }

    const result = await pool.query(
      'UPDATE alrimjang.children SET name = $1, birth_date = $2, class_name = $3, notes = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [name, birthDate || null, className || null, notes || null, params.id, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '원아를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ child: result.rows[0] })
  } catch (error) {
    console.error('Child update error:', error)
    return NextResponse.json({ error: '원아 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const result = await pool.query(
      'DELETE FROM alrimjang.children WHERE id = $1 AND user_id = $2 RETURNING *',
      [params.id, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '원아를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Child deletion error:', error)
    return NextResponse.json({ error: '원아 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
