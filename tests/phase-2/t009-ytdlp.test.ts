import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("child_process", () => ({
  execFile: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue(Buffer.from("fake-image-data")),
  readdir: vi.fn().mockResolvedValue(["video.mp4", "video.jpg"]),
}));

vi.mock("@/lib/supabase", () => ({
  uploadFile: vi.fn().mockResolvedValue("https://supabase.co/storage/thumb.jpg"),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    reel: {
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { downloadReel } from "@/services/downloader";
import { execFile } from "child_process";
import { mkdir, readdir } from "fs/promises";
import { uploadFile } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

const mockedExecFile = vi.mocked(execFile);
const mockedMkdir = vi.mocked(mkdir);
const mockedReaddir = vi.mocked(readdir);
const mockedUploadFile = vi.mocked(uploadFile);

describe("T009 — yt-dlp Downloader", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedExecFile.mockImplementation((...args: unknown[]) => {
      const cb = args[args.length - 1];
      if (typeof cb === "function") {
        (cb as (err: null, stdout: string, stderr: string) => void)(
          null,
          "",
          "",
        );
      }
      return undefined as never;
    });

    mockedReaddir.mockResolvedValue(
      ["video.mp4", "video.jpg"] as unknown as Awaited<
        ReturnType<typeof readdir>
      >,
    );
    mockedUploadFile.mockResolvedValue(
      "https://supabase.co/storage/thumb.jpg",
    );
  });

  it("creates temp directory with recursive:true", async () => {
    await downloadReel("reel-123", "https://instagram.com/reel/123");

    expect(mockedMkdir).toHaveBeenCalledWith(
      expect.stringContaining("/tmp/reelsearch/reel-123"),
      expect.objectContaining({ recursive: true }),
    );
  });

  it("calls yt-dlp with correct arguments", async () => {
    await downloadReel("reel-123", "https://instagram.com/reel/123");

    const ytdlpCall = mockedExecFile.mock.calls.find(
      (call) => typeof call[0] === "string" && call[0].includes("yt-dlp"),
    );
    expect(ytdlpCall).toBeDefined();

    const args = ytdlpCall![1] as string[];
    expect(args).toEqual(
      expect.arrayContaining([
        "-o",
        expect.stringContaining("reel-123"),
        "--format",
        "best[ext=mp4]/best",
        "--write-thumbnail",
        "--convert-thumbnails",
        "jpg",
        "https://instagram.com/reel/123",
      ]),
    );
  });

  it("calls ffmpeg for audio extraction", async () => {
    await downloadReel("reel-123", "https://instagram.com/reel/123");

    const ffmpegCall = mockedExecFile.mock.calls.find(
      (call) => typeof call[0] === "string" && call[0].includes("ffmpeg"),
    );
    expect(ffmpegCall).toBeDefined();
  });

  it("returns correct videoPath and audioPath", async () => {
    const result = await downloadReel(
      "reel-123",
      "https://instagram.com/reel/123",
    );

    expect(result).toHaveProperty("videoPath");
    expect(result).toHaveProperty("audioPath");
    expect(result.videoPath).toContain("reel-123");
    expect(result.audioPath).toContain("reel-123");
  });

  it("uploads thumbnail when a thumb file exists in the directory", async () => {
    const result = await downloadReel(
      "reel-123",
      "https://instagram.com/reel/123",
    );

    expect(mockedReaddir).toHaveBeenCalled();
    expect(mockedUploadFile).toHaveBeenCalled();
    expect(result.thumbnailUrl).toBe("https://supabase.co/storage/thumb.jpg");
    expect(prisma.reel.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "reel-123" }),
        data: expect.objectContaining({
          thumbnailUrl: "https://supabase.co/storage/thumb.jpg",
        }),
      }),
    );
  });

  it("handles missing thumbnail gracefully", async () => {
    mockedReaddir.mockResolvedValue(
      ["video.mp4"] as unknown as Awaited<ReturnType<typeof readdir>>,
    );

    const result = await downloadReel(
      "reel-123",
      "https://instagram.com/reel/123",
    );

    expect(result).toHaveProperty("videoPath");
    expect(result).toHaveProperty("audioPath");
    expect(mockedUploadFile).not.toHaveBeenCalled();
  });
});
