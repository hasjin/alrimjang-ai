import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await req.json()
    const { title, childName, category, memo, style, generatedContent } = body

    if (!title || !childName || !category || !memo || !style || !generatedContent) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 })
    }

    const result = await pool.query(
      'INSERT INTO alrimjang.templates (user_id, title, child_name, category, memo, style, generated_content) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [session.user.id, title, childName, category, memo, style, generatedContent]
    )

    return NextResponse.json({ template: result.rows[0] })
  } catch (error) {
    console.error('Template save error:', error)
    return NextResponse.json({ error: '템플릿 저장 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const result = await pool.query(
      'SELECT * FROM alrimjang.templates WHERE user_id = $1 ORDER BY created_at DESC',
      [session.user.id]
    )

    return NextResponse.json({ templates: result.rows })
  } catch (error) {
    console.error('Template fetch error:', error)
    return NextResponse.json({ error: '템플릿 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
