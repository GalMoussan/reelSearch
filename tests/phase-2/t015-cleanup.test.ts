import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  rm: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    reel: {
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { cleanupTempFiles, markReelDone } from "@/services/cleanup";
import { rm } from "fs/promises";
import { prisma } from "@/lib/prisma";

const mockedRm = vi.mocked(rm);

describe("T015 — Temp File Cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls rm with correct path and recursive+force options", async () => {
    await cleanupTempFiles("reel-123");

    expect(mockedRm).toHaveBeenCalledWith(
      expect.stringContaining("/tmp/reelsearch/reel-123"),
      expect.objectContaining({ recursive: true, force: true }),
    );
  });

  it("does not throw when rm fails", async () => {
    mockedRm.mockRejectedValue(new Error("ENOENT: no such file or directory"));

    await expect(cleanupTempFiles("reel-123")).resolves.not.toThrow();
  });

  it("markReelDone updates reel status to DONE", async () => {
    await markReelDone("reel-456");

    expect(prisma.reel.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "reel-456" }),
        data: expect.objectContaining({ status: "DONE" }),
      }),
    );
  });
});
