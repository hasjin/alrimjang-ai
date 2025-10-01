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

    const { searchParams } = new URL(req.url)
    const childId = searchParams.get('childId')
    const documentType = searchParams.get('type')

    let query = 'SELECT * FROM alrimjang.documents WHERE user_id = $1'
    const queryParams: any[] = [session.user.id]

    if (childId) {
      query += ` AND child_id = $${queryParams.length + 1}`
      queryParams.push(parseInt(childId))
    }

    if (documentType && documentType !== 'all') {
      query += ` AND document_type = $${queryParams.length + 1}`
      queryParams.push(documentType)
    }

    query += ' ORDER BY created_at DESC LIMIT 100'

    const result = await pool.query(query, queryParams)

    return NextResponse.json({ documents: result.rows })
  } catch (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json({ error: '문서 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
