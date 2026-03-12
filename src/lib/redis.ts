import IORedis from "ioredis"

const globalForRedis = globalThis as unknown as {
  redis: IORedis | undefined
}

function createRedisConnection() {
  const url = process.env.REDIS_URL
  if (!url) {
    throw new Error("REDIS_URL environment variable is required")
  }

  const connection = new IORedis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })

  connection.on("error", (err) => {
    console.error("Redis connection error:", err.message)
  })

  return connection
}

export const redis = globalForRedis.redis ?? createRedisConnection()

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis
}
