import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireAdmin, logAdminActivity } from '@/lib/admin-auth'
import pool from '@/lib/db'

/**
 * 전체 문서 모니터링 (페이지네이션)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { isAdmin } = await requireAdmin(session)

    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const documentType = searchParams.get('type') || ''
    const userId = searchParams.get('userId') || ''
    const offset = (page - 1) * limit

    let query = `
      SELECT
        d.id, d.user_id, d.child_id, d.document_type,
        d.child_name, d.created_at,
        u.email as user_email, u.name as user_name,
        LENGTH(d.generated_content) as content_length
      FROM alrimjang.documents d
      JOIN alrimjang.users u ON d.user_id = u.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (documentType) {
      query += ` AND d.document_type = $${paramIndex}`
      params.push(documentType)
      paramIndex++
    }

    if (userId) {
      query += ` AND d.user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // 전체 문서 수
    let countQuery = 'SELECT COUNT(*) as count FROM alrimjang.documents WHERE 1=1'
    const countParams: any[] = []
    let countParamIndex = 1

    if (documentType) {
      countQuery += ` AND document_type = $${countParamIndex}`
      countParams.push(documentType)
      countParamIndex++
    }

    if (userId) {
      countQuery += ` AND user_id = $${countParamIndex}`
      countParams.push(userId)
    }

    const countResult = await pool.query(countQuery, countParams)
    const totalDocuments = parseInt(countResult.rows[0].count)
    const totalPages = Math.ceil(totalDocuments / limit)

    // 활동 로그
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
    await logAdminActivity(
      session!.user.id,
      'view_documents',
      null,
      { page, type: documentType, userId },
      ipAddress
    )

    return NextResponse.json({
      documents: result.rows,
      pagination: {
        page,
        limit,
        totalDocuments,
        totalPages,
      },
    })
  } catch (error: unknown) {
    console.error('Admin Documents List Error:', error)
    return NextResponse.json(
      { error: '문서 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
