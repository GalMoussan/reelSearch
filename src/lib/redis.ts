import IORedis from "ioredis"
import { env } from "./env"

const globalForRedis = globalThis as unknown as {
  redis: IORedis | undefined
}

function createRedisConnection() {
  const connection = new IORedis(env.REDIS_URL, {
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
