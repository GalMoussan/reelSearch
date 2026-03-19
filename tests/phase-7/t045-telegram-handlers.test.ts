import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    reel: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock("@/lib/queue", () => ({
  addReelJob: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("@/telegram/auth", () => ({
  getAllowedUserId: vi.fn(),
}))

vi.mock("@/telegram/notifications", () => ({
  trackPendingNotification: vi.fn(),
}))

vi.mock("@/lib/exec", () => ({
  execText: vi.fn().mockResolvedValue(""),
}))

import { handleUrl } from "@/telegram/handlers"
import { prisma } from "@/lib/prisma"
import { addReelJob } from "@/lib/queue"
import { getAllowedUserId } from "@/telegram/auth"

function makeCtx(overrides: Record<string, unknown> = {}) {
  return {
    from: { id: 111111 },
    chat: { id: 12345 },
    reply: vi.fn().mockResolvedValue(undefined),
    telegram: { getFileLink: vi.fn() },
    message: {},
    ...overrides,
  } as any
}

describe("handleUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects unauthorized users", async () => {
    vi.mocked(getAllowedUserId).mockReturnValue(null)
    const ctx = makeCtx()

    await handleUrl(ctx, "https://www.instagram.com/reel/abc123/")

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Unauthorized")
    )
    expect(addReelJob).not.toHaveBeenCalled()
  })

  it("rejects messages without URLs", async () => {
    vi.mocked(getAllowedUserId).mockReturnValue("user-aaa")
    const ctx = makeCtx()

    await handleUrl(ctx, "just some text")

    expect(ctx.reply).toHaveBeenCalledWith("No URL found in your message.")
  })

  it("rejects unsupported URLs", async () => {
    vi.mocked(getAllowedUserId).mockReturnValue("user-aaa")
    const ctx = makeCtx()

    await handleUrl(ctx, "https://example.com/video")

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Unsupported URL")
    )
  })

  it("detects duplicate URLs", async () => {
    vi.mocked(getAllowedUserId).mockReturnValue("user-aaa")
    vi.mocked(prisma.reel.findUnique).mockResolvedValue({
      id: "existing",
      url: "https://www.instagram.com/reel/abc123/",
      status: "DONE",
    } as any)
    const ctx = makeCtx()

    await handleUrl(ctx, "https://www.instagram.com/reel/abc123/")

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("already in your library")
    )
  })

  it("creates reel and enqueues job for valid URL", async () => {
    vi.mocked(getAllowedUserId).mockReturnValue("user-aaa")
    vi.mocked(prisma.reel.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.reel.create).mockResolvedValue({
      id: "new-reel-id",
      url: "https://www.instagram.com/reel/abc123/",
      status: "PENDING",
    } as any)
    const ctx = makeCtx()

    await handleUrl(ctx, "https://www.instagram.com/reel/abc123/")

    expect(prisma.reel.create).toHaveBeenCalledWith({
      data: {
        url: "https://www.instagram.com/reel/abc123/",
        status: "PENDING",
        addedById: "user-aaa",
      },
    })
    expect(addReelJob).toHaveBeenCalledWith("new-reel-id")
    expect(ctx.reply).toHaveBeenCalledWith("Queued for processing.")
  })

  it("extracts URL from surrounding text", async () => {
    vi.mocked(getAllowedUserId).mockReturnValue("user-aaa")
    vi.mocked(prisma.reel.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.reel.create).mockResolvedValue({
      id: "reel-1",
    } as any)
    const ctx = makeCtx()

    await handleUrl(ctx, "Check this out https://www.instagram.com/reel/abc123/ so cool")

    expect(prisma.reel.create).toHaveBeenCalled()
  })
})
