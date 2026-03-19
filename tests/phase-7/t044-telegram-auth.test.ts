import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/env", () => ({
  env: {
    TELEGRAM_ALLOWED_USERS: "111111:user-aaa,222222:user-bbb",
  },
}))

import { loadAllowedUsers, getAllowedUserId } from "@/telegram/auth"

describe("Telegram Auth", () => {
  beforeEach(() => {
    loadAllowedUsers()
  })

  it("returns userId for allowed Telegram ID", () => {
    expect(getAllowedUserId(111111)).toBe("user-aaa")
    expect(getAllowedUserId(222222)).toBe("user-bbb")
  })

  it("returns null for unknown Telegram ID", () => {
    expect(getAllowedUserId(999999)).toBeNull()
  })
})
