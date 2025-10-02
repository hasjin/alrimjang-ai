import pool from './db'

// 하트 시스템 (10배 스케일)
const DAILY_HEARTS = 40 // 무료 플랜: 일 40 하트

// 하트 비용
export const HEART_COSTS = {
  GENERATE: 10, // 신규 생성: 10 하트
  REFINE: 3,    // 수정: 3 하트
  RAG_MULTIPLIER: 3, // RAG 사용 시 3배 (30 하트)
}

// 개발 환경에서 무제한 사용 허용할 이메일
const DEV_UNLIMITED_EMAILS = ['hasjin9@gmail.com']

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

// KST 기준 다음 06:00 계산
function getNextResetTime(): Date {
  const now = new Date()
  const kstOffset = 9 * 60 * 60 * 1000 // KST = UTC+9
  const kstNow = new Date(now.getTime() + kstOffset)

  const today6am = new Date(kstNow)
  today6am.setUTCHours(6 - 9, 0, 0, 0) // 6AM KST = 21:00 UTC previous day (or 9PM)

  if (kstNow.getUTCHours() >= 6) {
    // 이미 오늘 06시 지남 -> 내일 06시
    today6am.setUTCDate(today6am.getUTCDate() + 1)
  }

  return new Date(today6am.getTime() - kstOffset) // UTC로 변환
}

// 하트 리셋 필요 여부 확인 및 자동 리셋
async function checkAndResetHearts(userId: string): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT remaining_hearts, reset_at FROM alrimjang.hearts WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      // 하트 레코드가 없으면 초기화 (신규 사용자)
      const nextReset = getNextResetTime()
      await pool.query(
        `INSERT INTO alrimjang.hearts (user_id, remaining_hearts, total_earned, reset_at, last_updated)
         VALUES ($1, $2, $2, $3, NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, DAILY_HEARTS, nextReset]
      )
      return
    }

    const { remaining_hearts, reset_at } = result.rows[0]
    const now = new Date()

    // 리셋 시간이 지났으면 하트 리셋
    if (reset_at && new Date(reset_at) <= now) {
      const nextReset = getNextResetTime()

      await pool.query(
        `UPDATE alrimjang.hearts
         SET remaining_hearts = $1,
             total_earned = total_earned + $1,
             reset_at = $2,
             last_updated = NOW()
         WHERE user_id = $3`,
        [DAILY_HEARTS, nextReset, userId]
      )

      // 하트 리셋 이력 기록
      await pool.query(
        `INSERT INTO alrimjang.heart_usage_logs (user_id, action_type, hearts_used, hearts_remaining, description)
         VALUES ($1, 'reset', $2, $2, '일일 하트 리셋 (06:00 KST)')`,
        [userId, DAILY_HEARTS]
      )
    } else if (!reset_at) {
      // reset_at이 없으면 설정 (기존 사용자 마이그레이션)
      const nextReset = getNextResetTime()
      await pool.query(
        'UPDATE alrimjang.hearts SET reset_at = $1 WHERE user_id = $2',
        [nextReset, userId]
      )
    }
  } catch (error) {
    console.error('Heart reset check error:', error)
    throw error
  }
}

// 하트 사용 가능 여부 확인 (하트 차감 없음, 조회만)
export async function checkHearts(userId: string, requiredHearts: number, userEmail?: string): Promise<RateLimitResult> {
  // 개발 환경에서 특정 이메일은 무제한 허용
  if (process.env.NODE_ENV === 'development' && userEmail && DEV_UNLIMITED_EMAILS.includes(userEmail)) {
    return {
      allowed: true,
      remaining: 9999,
      resetAt: getNextResetTime(),
    }
  }

  try {
    // 하트 리셋 체크 및 자동 리셋
    await checkAndResetHearts(userId)

    // 현재 하트 조회
    const result = await pool.query(
      'SELECT remaining_hearts, reset_at FROM alrimjang.hearts WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      // 방금 생성된 경우
      return {
        allowed: requiredHearts <= DAILY_HEARTS,
        remaining: DAILY_HEARTS,
        resetAt: getNextResetTime(),
      }
    }

    const { remaining_hearts, reset_at } = result.rows[0]
    const remaining = remaining_hearts || 0

    return {
      allowed: remaining >= requiredHearts,
      remaining,
      resetAt: reset_at ? new Date(reset_at) : getNextResetTime(),
    }
  } catch (error) {
    console.error('Hearts check error:', error)
    // Fail open - allow the request if DB is down
    return {
      allowed: true,
      remaining: DAILY_HEARTS,
      resetAt: getNextResetTime(),
    }
  }
}

// 기존 함수명 호환성 유지
export async function checkRateLimit(userId: string, userEmail?: string): Promise<RateLimitResult> {
  return checkHearts(userId, HEART_COSTS.GENERATE, userEmail)
}

// 하트 차감 (실제 사용)
export async function useHearts(userId: string, hearts: number, description?: string): Promise<void> {
  try {
    // 하트 차감
    const result = await pool.query(
      `UPDATE alrimjang.hearts
       SET remaining_hearts = remaining_hearts - $1,
           last_updated = NOW()
       WHERE user_id = $2
       RETURNING remaining_hearts`,
      [hearts, userId]
    )

    const remainingHearts = result.rows[0]?.remaining_hearts || 0

    // 사용 이력 기록
    await pool.query(
      `INSERT INTO alrimjang.heart_usage_logs (user_id, action_type, hearts_used, hearts_remaining, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        hearts === HEART_COSTS.GENERATE ? 'generate' : hearts === HEART_COSTS.REFINE ? 'refine' : 'use',
        -hearts, // 음수로 저장 (사용)
        remainingHearts,
        description || '하트 사용'
      ]
    )
  } catch (error) {
    console.error('Hearts usage error:', error)
    throw error
  }
}

// 기존 함수명 호환성 유지
export async function incrementRateLimit(userId: string): Promise<void> {
  return useHearts(userId, HEART_COSTS.GENERATE)
}

// 남은 하트 조회
export async function getRemainingHearts(userId: string): Promise<{ remaining: number; resetAt: Date | null }> {
  try {
    // 하트 리셋 체크 및 자동 리셋
    await checkAndResetHearts(userId)

    const result = await pool.query(
      'SELECT remaining_hearts, reset_at FROM alrimjang.hearts WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return { remaining: DAILY_HEARTS, resetAt: getNextResetTime() }
    }

    const { remaining_hearts, reset_at } = result.rows[0]

    return {
      remaining: remaining_hearts || 0,
      resetAt: reset_at ? new Date(reset_at) : getNextResetTime()
    }
  } catch (error) {
    console.error('Get remaining hearts error:', error)
    return { remaining: DAILY_HEARTS, resetAt: null }
  }
}

// 하트 사용 이력 조회
export async function getHeartUsageLogs(userId: string, limit = 50): Promise<any[]> {
  try {
    const result = await pool.query(
      `SELECT action_type, hearts_used, hearts_remaining, description, created_at
       FROM alrimjang.heart_usage_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    )

    return result.rows
  } catch (error) {
    console.error('Get heart usage logs error:', error)
    return []
  }
}

// 기존 함수명 호환성 유지
export async function getRemainingUsage(userId: string): Promise<{ remaining: number; resetAt: Date | null }> {
  return getRemainingHearts(userId)
}
