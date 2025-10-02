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

    // 일별 문서 생성 패턴 (최근 30일)
    const dailyDocumentsResult = await pool.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as total_count,
        COUNT(DISTINCT user_id) as active_users,
        document_type,
        COUNT(*) FILTER (WHERE curriculum IS NOT NULL) as with_curriculum,
        AVG(CASE WHEN input_data::text LIKE '%useRAG%true%' THEN 1 ELSE 0 END) * 100 as rag_usage_rate
       FROM alrimjang.documents
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at), document_type
       ORDER BY date DESC, total_count DESC`
    )

    // 시간대별 사용 패턴 (24시간)
    const hourlyPatternResult = await pool.query(
      `SELECT
        EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Seoul') as hour,
        COUNT(*) as count
       FROM alrimjang.documents
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Seoul')
       ORDER BY hour ASC`
    )

    // 사용자 행동 인사이트
    const userBehaviorResult = await pool.query(
      `SELECT
        COUNT(DISTINCT user_id) as total_users,
        AVG(doc_count) as avg_docs_per_user,
        MAX(doc_count) as max_docs_per_user,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY doc_count) as median_docs_per_user
       FROM (
         SELECT user_id, COUNT(*) as doc_count
         FROM alrimjang.documents
         WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY user_id
       ) user_stats`
    )

    // 재방문율 (7일 이내 재사용)
    const retentionResult = await pool.query(
      `SELECT
        COUNT(DISTINCT CASE WHEN days_since_first <= 7 THEN user_id END)::FLOAT /
        NULLIF(COUNT(DISTINCT user_id), 0) * 100 as retention_rate_7days
       FROM (
         SELECT
           user_id,
           EXTRACT(DAY FROM (MAX(created_at) - MIN(created_at))) as days_since_first
         FROM alrimjang.documents
         GROUP BY user_id
         HAVING COUNT(*) > 1
       ) retention_stats`
    )

    // 기능 사용 통계
    const featureUsageResult = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE curriculum IS NOT NULL) as curriculum_usage,
        COUNT(*) FILTER (WHERE input_data::text LIKE '%useRAG%true%') as rag_usage,
        COUNT(DISTINCT user_id) FILTER (WHERE curriculum IS NOT NULL) as curriculum_users,
        COUNT(DISTINCT user_id) FILTER (WHERE input_data::text LIKE '%useRAG%true%') as rag_users,
        COUNT(*) as total
       FROM alrimjang.documents
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`
    )

    // 하트 사용 패턴 (심플하게)
    const heartUsageResult = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE action_type = 'generate') as generates,
        COUNT(*) FILTER (WHERE action_type = 'refine') as refines,
        COUNT(*) FILTER (WHERE ABS(hearts_used) >= 30) as rag_uses,
        DATE(created_at) as date
       FROM alrimjang.heart_usage_logs
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
         AND action_type IN ('generate', 'refine')
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 7`
    )

    // 일별 사용자 가입 추이 (최근 30일)
    const userGrowthResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM alrimjang.users
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    )
    const userGrowth = userGrowthResult.rows

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
      documentTypes: documentTypeStats,
      growth: {
        users: userGrowth,
      },
      // 인사이트 데이터
      insights: {
        dailyPatterns: dailyDocumentsResult.rows,
        hourlyPattern: hourlyPatternResult.rows,
        userBehavior: userBehaviorResult.rows[0] || {},
        retention: retentionResult.rows[0] || {},
        featureUsage: featureUsageResult.rows[0] || {},
        heartUsagePattern: heartUsageResult.rows,
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
