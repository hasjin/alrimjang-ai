import redis from './redis'

// 하트 시스템 (10배 스케일)
const DAILY_HEARTS = 40 // 무료 플랜: 일 40 하트
const WINDOW_SIZE = 24 * 60 * 60 // 24 hours in seconds

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

// 하트 사용 가능 여부 확인 (하트 차감 없음, 조회만)
export async function checkHearts(userId: string, requiredHearts: number, userEmail?: string): Promise<RateLimitResult> {
  // 개발 환경에서 특정 이메일은 무제한 허용
  if (process.env.NODE_ENV === 'development' && userEmail && DEV_UNLIMITED_EMAILS.includes(userEmail)) {
    return {
      allowed: true,
      remaining: 9999,
      resetAt: new Date(Date.now() + (WINDOW_SIZE * 1000)),
    }
  }

  const key = `hearts:${userId}`

  try {
    const now = Date.now()
    const windowStart = now - (WINDOW_SIZE * 1000)

    // Remove old entries outside the 24-hour window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Calculate total hearts used
    const entries = await redis.zrange(key, 0, -1, 'WITHSCORES')
    let totalUsed = 0
    for (let i = 0; i < entries.length; i += 2) {
      const hearts = parseInt(entries[i])
      totalUsed += hearts
    }

    const remaining = Math.max(0, DAILY_HEARTS - totalUsed)

    if (remaining < requiredHearts) {
      // Get the oldest timestamp to calculate reset time
      const oldestEntry = await redis.zrange(key, 0, 0, 'WITHSCORES')
      const oldestTimestamp = oldestEntry.length > 1 ? parseInt(oldestEntry[1]) : now
      const resetAt = new Date(oldestTimestamp + (WINDOW_SIZE * 1000))

      return {
        allowed: false,
        remaining,
        resetAt,
      }
    }

    return {
      allowed: true,
      remaining,
      resetAt: new Date(now + (WINDOW_SIZE * 1000)),
    }
  } catch (error) {
    console.error('Hearts check error:', error)
    // Fail open - allow the request if Redis is down
    return {
      allowed: true,
      remaining: DAILY_HEARTS,
      resetAt: new Date(Date.now() + (WINDOW_SIZE * 1000)),
    }
  }
}

// 기존 함수명 호환성 유지
export async function checkRateLimit(userId: string, userEmail?: string): Promise<RateLimitResult> {
  return checkHearts(userId, HEART_COSTS.GENERATE, userEmail)
}

// 하트 차감 (실제 사용)
export async function useHearts(userId: string, hearts: number): Promise<void> {
  const key = `hearts:${userId}`
  const now = Date.now()

  try {
    // Store: hearts used as score, timestamp as member
    await redis.zadd(key, now, `${hearts}`)

    // Set expiry on the key (25 hours to be safe)
    await redis.expire(key, WINDOW_SIZE + 3600)
  } catch (error) {
    console.error('Hearts usage error:', error)
  }
}

// 기존 함수명 호환성 유지
export async function incrementRateLimit(userId: string): Promise<void> {
  return useHearts(userId, HEART_COSTS.GENERATE)
}

// 남은 하트 조회
export async function getRemainingHearts(userId: string): Promise<{ remaining: number; resetAt: Date | null }> {
  const key = `hearts:${userId}`

  try {
    const now = Date.now()
    const windowStart = now - (WINDOW_SIZE * 1000)

    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart)

    // Calculate total hearts used
    const entries = await redis.zrange(key, 0, -1, 'WITHSCORES')
    let totalUsed = 0
    for (let i = 0; i < entries.length; i += 2) {
      const hearts = parseInt(entries[i])
      totalUsed += hearts
    }

    const remaining = Math.max(0, DAILY_HEARTS - totalUsed)

    // Get reset time
    let resetAt: Date | null = null
    if (entries.length > 0) {
      const oldestEntry = await redis.zrange(key, 0, 0, 'WITHSCORES')
      if (oldestEntry.length > 1) {
        const oldestTimestamp = parseInt(oldestEntry[1])
        resetAt = new Date(oldestTimestamp + (WINDOW_SIZE * 1000))
      }
    }

    return { remaining, resetAt }
  } catch (error) {
    console.error('Get remaining hearts error:', error)
    return { remaining: DAILY_HEARTS, resetAt: null }
  }
}

// 기존 함수명 호환성 유지
export async function getRemainingUsage(userId: string): Promise<{ remaining: number; resetAt: Date | null }> {
  return getRemainingHearts(userId)
}
