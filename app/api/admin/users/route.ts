import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireAdmin, logAdminActivity } from '@/lib/admin-auth'
import pool from '@/lib/db'

/**
 * 사용자 목록 조회 (페이지네이션)
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
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    let query = `
      SELECT
        u.id, u.email, u.name, u.image, u.created_at,
        (SELECT COUNT(*) FROM alrimjang.documents WHERE user_id = u.id) as document_count,
        (SELECT remaining_hearts FROM alrimjang.hearts WHERE user_id = u.id) as hearts,
        (SELECT role FROM alrimjang.admin_users WHERE user_id = u.id) as admin_role
      FROM alrimjang.users u
    `

    const params: any[] = []

    if (search) {
      query += ` WHERE u.email ILIKE $1 OR u.name ILIKE $1`
      params.push(`%${search}%`)
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // 전체 사용자 수
    let countQuery = 'SELECT COUNT(*) as count FROM alrimjang.users'
    const countParams: any[] = []

    if (search) {
      countQuery += ` WHERE email ILIKE $1 OR name ILIKE $1`
      countParams.push(`%${search}%`)
    }

    const countResult = await pool.query(countQuery, countParams)
    const totalUsers = parseInt(countResult.rows[0].count)
    const totalPages = Math.ceil(totalUsers / limit)

    // 활동 로그
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
    await logAdminActivity(
      session!.user.id,
      'view_users',
      null,
      { page, search },
      ipAddress
    )

    return NextResponse.json({
      users: result.rows,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
      },
    })
  } catch (error: unknown) {
    console.error('Admin Users List Error:', error)
    return NextResponse.json(
      { error: '사용자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
