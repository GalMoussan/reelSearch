import { redis } from "./redis"

interface RateLimitResult {
  allowed: boolean
  remaining: number
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, windowSeconds)
  }

  const remaining = Math.max(0, limit - current)

  return {
    allowed: current <= limit,
    remaining,
  }
}
