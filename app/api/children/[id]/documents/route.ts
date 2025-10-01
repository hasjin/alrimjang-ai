import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const documentType = searchParams.get('type')

    let query = 'SELECT * FROM alrimjang.documents WHERE child_id = $1 AND user_id = $2'
    const queryParams: any[] = [params.id, session.user.id]

    if (documentType) {
      query += ' AND document_type = $3'
      queryParams.push(documentType)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, queryParams)

    return NextResponse.json({ documents: result.rows })
  } catch (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json({ error: '문서 목록 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
