import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireAdmin, logAdminActivity } from '@/lib/admin-auth'
import pool from '@/lib/db'

/**
 * 관리자 통계 조회
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { isAdmin, requires2FA } = await requireAdmin(session)

    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 2FA 필요 여부 체크 (세션에서 2FA 검증 여부는 별도 처리 필요)
    // 현재는 API 호출 가능하도록 허용

    // 전체 사용자 수
    const totalUsersResult = await pool.query(
      'SELECT COUNT(*) as count FROM alrimjang.users'
    )
    const totalUsers = parseInt(totalUsersResult.rows[0].count)

    // 오늘 가입한 사용자 수
    const todayUsersResult = await pool.query(
      `SELECT COUNT(*) as count FROM alrimjang.users
       WHERE created_at >= CURRENT_DATE`
    )
    const todayUsers = parseInt(todayUsersResult.rows[0].count)

    // 이번 주 가입 사용자 수
    const weekUsersResult = await pool.query(
      `SELECT COUNT(*) as count FROM alrimjang.users
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
    )
    const weekUsers = parseInt(weekUsersResult.rows[0].count)

    // 전체 문서 생성 수
    const totalDocumentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM alrimjang.documents'
    )
    const totalDocuments = parseInt(totalDocumentsResult.rows[0].count)

    // 오늘 생성된 문서 수
    const todayDocumentsResult = await pool.query(
      `SELECT COUNT(*) as count FROM alrimjang.documents
       WHERE created_at >= CURRENT_DATE`
    )
    const todayDocuments = parseInt(todayDocumentsResult.rows[0].count)

    // 문서 타입별 통계
    const documentTypeStatsResult = await pool.query(
      `SELECT document_type, COUNT(*) as count
       FROM alrimjang.documents
       GROUP BY document_type
       ORDER BY count DESC`
    )
    const documentTypeStats = documentTypeStatsResult.rows

    // 활성 사용자 (최근 7일 내 문서 생성)
    const activeUsersResult = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM alrimjang.documents
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
    )
    const activeUsers = parseInt(activeUsersResult.rows[0].count)

    // 전체 하트 사용량
    const totalHeartsResult = await pool.query(
      'SELECT SUM(total_earned) as total, SUM(remaining_hearts) as remaining FROM alrimjang.hearts'
    )
    const totalHeartsEarned = parseInt(totalHeartsResult.rows[0].total || 0)
    const totalHeartsRemaining = parseInt(totalHeartsResult.rows[0].remaining || 0)
    const totalHeartsUsed = totalHeartsEarned - totalHeartsRemaining

    // 일별 사용자 가입 추이 (최근 30일)
    const userGrowthResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM alrimjang.users
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    )
    const userGrowth = userGrowthResult.rows

    // 일별 문서 생성 추이 (최근 30일)
    const documentGrowthResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM alrimjang.documents
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    )
    const documentGrowth = documentGrowthResult.rows

    // 관리자 활동 로그
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
    await logAdminActivity(
      session!.user.id,
      'view_stats',
      null,
      null,
      ipAddress
    )

    return NextResponse.json({
      overview: {
        totalUsers,
        todayUsers,
        weekUsers,
        activeUsers,
        totalDocuments,
        todayDocuments,
      },
      hearts: {
        totalEarned: totalHeartsEarned,
        totalRemaining: totalHeartsRemaining,
        totalUsed: totalHeartsUsed,
      },
      documentTypes: documentTypeStats,
      growth: {
        users: userGrowth,
        documents: documentGrowth,
      },
    })
  } catch (error: unknown) {
    console.error('Admin Stats Error:', error)
    return NextResponse.json(
      { error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
