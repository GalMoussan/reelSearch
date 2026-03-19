import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/exec", () => ({
  execText: vi.fn().mockResolvedValue(""),
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
import { execText } from "@/lib/exec";
import { mkdir, readdir } from "fs/promises";
import { uploadFile } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

const mockedExecText = vi.mocked(execText);
const mockedMkdir = vi.mocked(mkdir);
const mockedReaddir = vi.mocked(readdir);
const mockedUploadFile = vi.mocked(uploadFile);

describe("T009 — yt-dlp Downloader", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedExecText.mockResolvedValue("");

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

    const ytdlpCall = mockedExecText.mock.calls.find(
      (call) => call[0] === "yt-dlp",
    );
    expect(ytdlpCall).toBeDefined();

    const args = ytdlpCall![1] as string[];
    expect(args).toEqual(
      expect.arrayContaining([
        "-o",
        expect.stringContaining("reel-123"),
        "--format",
        "best[ext=mp4]/bestvideo+bestaudio/best",
        "--merge-output-format",
        "mp4",
        "--write-thumbnail",
        "--no-playlist",
        "https://instagram.com/reel/123",
      ]),
    );
  });

  it("calls ffmpeg for audio extraction", async () => {
    await downloadReel("reel-123", "https://instagram.com/reel/123");

    const ffmpegCall = mockedExecText.mock.calls.find(
      (call) => call[0] === "ffmpeg",
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
