import redis from './redis'

const DAILY_LIMIT = 5
const WINDOW_SIZE = 24 * 60 * 60 // 24 hours in seconds

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const key = `rate_limit:${userId}`

  try {
    const now = Date.now()
    const windowStart = now - (WINDOW_SIZE * 1000)

    // Remove old entries outside the 24-hour window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count current usage
    const currentCount = await redis.zcard(key)

    if (currentCount >= DAILY_LIMIT) {
      // Get the oldest timestamp to calculate reset time
      const oldestEntry = await redis.zrange(key, 0, 0, 'WITHSCORES')
      const oldestTimestamp = oldestEntry.length > 1 ? parseInt(oldestEntry[1]) : now
      const resetAt = new Date(oldestTimestamp + (WINDOW_SIZE * 1000))

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      }
    }

    return {
      allowed: true,
      remaining: DAILY_LIMIT - currentCount,
      resetAt: new Date(now + (WINDOW_SIZE * 1000)),
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Fail open - allow the request if Redis is down
    return {
      allowed: true,
      remaining: DAILY_LIMIT,
      resetAt: new Date(Date.now() + (WINDOW_SIZE * 1000)),
    }
  }
}

export async function incrementRateLimit(userId: string): Promise<void> {
  const key = `rate_limit:${userId}`
  const now = Date.now()

  try {
    // Add current timestamp to the sorted set
    await redis.zadd(key, now, `${now}`)

    // Set expiry on the key (25 hours to be safe)
    await redis.expire(key, WINDOW_SIZE + 3600)
  } catch (error) {
    console.error('Rate limit increment error:', error)
  }
}

export async function getRemainingUsage(userId: string): Promise<{ remaining: number; resetAt: Date | null }> {
  const key = `rate_limit:${userId}`

  try {
    const now = Date.now()
    const windowStart = now - (WINDOW_SIZE * 1000)

    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count current usage
    const currentCount = await redis.zcard(key)
    const remaining = Math.max(0, DAILY_LIMIT - currentCount)

    // Get reset time
    let resetAt: Date | null = null
    if (currentCount > 0) {
      const oldestEntry = await redis.zrange(key, 0, 0, 'WITHSCORES')
      if (oldestEntry.length > 1) {
        const oldestTimestamp = parseInt(oldestEntry[1])
        resetAt = new Date(oldestTimestamp + (WINDOW_SIZE * 1000))
      }
    }

    return { remaining, resetAt }
  } catch (error) {
    console.error('Get remaining usage error:', error)
    return { remaining: DAILY_LIMIT, resetAt: null }
  }
}
