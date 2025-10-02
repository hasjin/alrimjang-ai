import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireAdmin, hasAdminRole, logAdminActivity } from '@/lib/admin-auth'
import pool from '@/lib/db'

interface RequestBody {
  amount: number // 양수: 지급, 음수: 회수
  reason: string
}

/**
 * 사용자에게 하트 지급/회수
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  try {
    const session = await getServerSession(authOptions)
    const { isAdmin } = await requireAdmin(session)

    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // admin 이상 권한 필요
    const hasPermission = await hasAdminRole(session!.user.id, 'admin')
    if (!hasPermission) {
      return NextResponse.json(
        { error: '하트 지급/회수 권한이 부족합니다.' },
        { status: 403 }
      )
    }

    const body: RequestBody = await req.json()
    const { amount, reason } = body

    if (!amount || amount === 0) {
      return NextResponse.json(
        { error: '지급/회수할 하트 수를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!reason) {
      return NextResponse.json(
        { error: '사유를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 존재 확인
    const userResult = await pool.query(
      'SELECT id, email FROM alrimjang.users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 하트 정보 조회 (없으면 생성)
    const heartsResult = await pool.query(
      `INSERT INTO alrimjang.hearts (user_id, remaining_hearts, total_earned)
       VALUES ($1, 0, 0)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING *`,
      [userId]
    )

    // 현재 하트 조회
    const currentHeartsResult = await pool.query(
      'SELECT remaining_hearts, total_earned FROM alrimjang.hearts WHERE user_id = $1',
      [userId]
    )

    const currentHearts = currentHeartsResult.rows[0].remaining_hearts
    const totalEarned = currentHeartsResult.rows[0].total_earned

    // 회수 시 현재 하트보다 많이 회수할 수 없음
    if (amount < 0 && Math.abs(amount) > currentHearts) {
      return NextResponse.json(
        { error: `현재 하트(${currentHearts})보다 많이 회수할 수 없습니다.` },
        { status: 400 }
      )
    }

    // 하트 업데이트
    const newHearts = currentHearts + amount
    const newTotalEarned = amount > 0 ? totalEarned + amount : totalEarned

    await pool.query(
      `UPDATE alrimjang.hearts
       SET remaining_hearts = $1, total_earned = $2, last_updated = NOW()
       WHERE user_id = $3`,
      [newHearts, newTotalEarned, userId]
    )

    // 활동 로그
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
    await logAdminActivity(
      session!.user.id,
      amount > 0 ? 'grant_hearts' : 'revoke_hearts',
      userId,
      {
        amount,
        reason,
        previous_hearts: currentHearts,
        new_hearts: newHearts,
      },
      ipAddress
    )

    return NextResponse.json({
      success: true,
      message: amount > 0
        ? `${Math.abs(amount)}개의 하트를 지급했습니다.`
        : `${Math.abs(amount)}개의 하트를 회수했습니다.`,
      previousHearts: currentHearts,
      newHearts,
    })
  } catch (error: unknown) {
    console.error('Admin Grant Hearts Error:', error)
    return NextResponse.json(
      { error: '하트 지급/회수 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
