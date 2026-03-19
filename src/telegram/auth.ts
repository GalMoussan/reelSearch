import { env } from "../lib/env"

// Maps Telegram user ID → reelSearch User ID (cuid from User table)
// Env format: TELEGRAM_ALLOWED_USERS=123456789:cluserXXX,987654321:cluserYYY
const allowedUsers = new Map<number, string>()

export function loadAllowedUsers(): void {
  allowedUsers.clear()

  const raw = env.TELEGRAM_ALLOWED_USERS
  if (!raw) return

  for (const entry of raw.split(",")) {
    const trimmed = entry.trim()
    if (!trimmed) continue

    const [telegramId, userId] = trimmed.split(":")
    const numericId = Number(telegramId)

    if (!Number.isFinite(numericId) || !userId) {
      console.warn(`[Auth] Invalid TELEGRAM_ALLOWED_USERS entry: "${trimmed}"`)
      continue
    }

    allowedUsers.set(numericId, userId)
  }

  console.log(`[Auth] Loaded ${allowedUsers.size} allowed Telegram users`)
}

export function getAllowedUserId(telegramId: number): string | null {
  return allowedUsers.get(telegramId) ?? null
}
