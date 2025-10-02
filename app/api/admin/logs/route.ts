import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireAdmin, hasAdminRole } from '@/lib/admin-auth'
import pool from '@/lib/db'

/**
 * 관리자 활동 로그 조회
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

    // super_admin 권한 필요
    const isSuperAdmin = await hasAdminRole(session!.user.id, 'super_admin')
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: '로그 조회는 슈퍼 관리자만 가능합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action') || ''
    const adminUserId = searchParams.get('adminUserId') || ''
    const offset = (page - 1) * limit

    let query = `
      SELECT
        l.id, l.admin_user_id, l.action, l.target_user_id,
        l.details, l.ip_address, l.created_at,
        au.email as admin_email, au.name as admin_name,
        tu.email as target_email, tu.name as target_name
      FROM alrimjang.admin_logs l
      JOIN alrimjang.users au ON l.admin_user_id = au.id
      LEFT JOIN alrimjang.users tu ON l.target_user_id = tu.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramIndex = 1

    if (action) {
      query += ` AND l.action = $${paramIndex}`
      params.push(action)
      paramIndex++
    }

    if (adminUserId) {
      query += ` AND l.admin_user_id = $${paramIndex}`
      params.push(adminUserId)
      paramIndex++
    }

    query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    // 전체 로그 수
    let countQuery = 'SELECT COUNT(*) as count FROM alrimjang.admin_logs WHERE 1=1'
    const countParams: any[] = []
    let countParamIndex = 1

    if (action) {
      countQuery += ` AND action = $${countParamIndex}`
      countParams.push(action)
      countParamIndex++
    }

    if (adminUserId) {
      countQuery += ` AND admin_user_id = $${countParamIndex}`
      countParams.push(adminUserId)
    }

    const countResult = await pool.query(countQuery, countParams)
    const totalLogs = parseInt(countResult.rows[0].count)
    const totalPages = Math.ceil(totalLogs / limit)

    return NextResponse.json({
      logs: result.rows,
      pagination: {
        page,
        limit,
        totalLogs,
        totalPages,
      },
    })
  } catch (error: unknown) {
    console.error('Admin Logs Error:', error)
    return NextResponse.json(
      { error: '로그 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
