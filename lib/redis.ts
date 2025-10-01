import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_URL?.replace('redis://', '').split(':')[0] || 'localhost',
  port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    if (times > 3) {
      return null // Stop retrying
    }
    return Math.min(times * 50, 2000)
  },
})

redis.on('error', (err) => {
  console.error('Redis connection error:', err)
})

export default redis
