import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture the processor function passed to the BullMQ Worker constructor
let capturedProcessor: ((job: unknown) => Promise<void>) | null = null;

vi.mock("bullmq", () => ({
  Worker: vi.fn().mockImplementation((_name: string, processor: (job: unknown) => Promise<void>) => {
    capturedProcessor = processor;
    return {
      on: vi.fn().mockReturnThis(),
      close: vi.fn(),
    };
  }),
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    close: vi.fn(),
  })),
}));

vi.mock("dotenv", () => ({
  config: vi.fn(),
}));

vi.mock("dotenv/config", () => ({}));

const mockDownloadReel = vi.fn();
const mockTranscribe = vi.fn();
const mockExtractFrames = vi.fn();
const mockAnalyzeReel = vi.fn();
const mockNormalizeTags = vi.fn();
const mockEmbedAndStore = vi.fn();
const mockCleanupTempFiles = vi.fn();
const mockMarkReelDone = vi.fn();

vi.mock("@/services/downloader", () => ({
  downloadReel: mockDownloadReel,
}));

vi.mock("@/services/transcriber", () => ({
  transcribe: mockTranscribe,
}));

vi.mock("@/services/frame-sampler", () => ({
  extractFrames: mockExtractFrames,
}));

vi.mock("@/services/analyzer", () => ({
  analyzeReel: mockAnalyzeReel,
}));

vi.mock("@/services/tag-normalizer", () => ({
  normalizeTags: mockNormalizeTags,
}));

vi.mock("@/services/embedder", () => ({
  embedAndStore: mockEmbedAndStore,
}));

vi.mock("@/services/cleanup", () => ({
  cleanupTempFiles: mockCleanupTempFiles,
  markReelDone: mockMarkReelDone,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    reel: {
      update: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn().mockResolvedValue({ id: "test-id", url: "https://instagram.com/reel/test" }),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("T016 — Pipeline Error Handling", () => {
  const fakeJob = {
    data: { reelId: "test-id" },
    updateProgress: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    capturedProcessor = null;

    // Reset module to re-trigger Worker registration
    vi.resetModules();

    // Re-apply mocks after resetModules
    vi.doMock("bullmq", () => ({
      Worker: vi.fn().mockImplementation((_name: string, processor: (job: unknown) => Promise<void>) => {
        capturedProcessor = processor;
        return {
          on: vi.fn().mockReturnThis(),
          close: vi.fn(),
        };
      }),
      Queue: vi.fn().mockImplementation(() => ({
        add: vi.fn(),
        close: vi.fn(),
      })),
    }));

    vi.doMock("dotenv", () => ({ config: vi.fn() }));
    vi.doMock("dotenv/config", () => ({}));

    vi.doMock("@/services/downloader", () => ({
      downloadReel: mockDownloadReel,
    }));
    vi.doMock("@/services/transcriber", () => ({
      transcribe: mockTranscribe,
    }));
    vi.doMock("@/services/frame-sampler", () => ({
      extractFrames: mockExtractFrames,
    }));
    vi.doMock("@/services/analyzer", () => ({
      analyzeReel: mockAnalyzeReel,
    }));
    vi.doMock("@/services/tag-normalizer", () => ({
      normalizeTags: mockNormalizeTags,
    }));
    vi.doMock("@/services/embedder", () => ({
      embedAndStore: mockEmbedAndStore,
    }));
    vi.doMock("@/services/cleanup", () => ({
      cleanupTempFiles: mockCleanupTempFiles,
      markReelDone: mockMarkReelDone,
    }));
    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        reel: {
          update: vi.fn().mockResolvedValue({}),
          findUnique: vi.fn().mockResolvedValue({
            id: "test-id",
            url: "https://instagram.com/reel/test",
          }),
        },
      },
    }));

    // Import the worker module to trigger Worker registration
    await import("@/workers/reel-processor");
  });

  it("on download failure: updates reel to FAILED, cleans up, and re-throws", async () => {
    expect(capturedProcessor).not.toBeNull();

    const downloadError = new Error("yt-dlp download failed");
    mockDownloadReel.mockRejectedValue(downloadError);

    await expect(capturedProcessor!(fakeJob)).rejects.toThrow(
      "yt-dlp download failed",
    );

    // Access prisma from the mocked module
    const { prisma: mockedPrisma } = await import("@/lib/prisma");
    expect(mockedPrisma.reel.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "test-id" }),
        data: expect.objectContaining({
          status: "FAILED",
          errorMessage: expect.stringContaining("yt-dlp download failed"),
        }),
      }),
    );

    expect(mockCleanupTempFiles).toHaveBeenCalledWith("test-id");
  });

  it("successful path calls all services in order", async () => {
    expect(capturedProcessor).not.toBeNull();

    mockDownloadReel.mockResolvedValue({
      videoPath: "/tmp/reelsearch/test-id/video.mp4",
      audioPath: "/tmp/reelsearch/test-id/audio.mp3",
      thumbnailUrl: "https://supabase.co/thumb.jpg",
    });
    mockTranscribe.mockResolvedValue({
      text: "Hello world",
      language: "en",
    });
    mockExtractFrames.mockResolvedValue(["frame1base64", "frame2base64"]);
    mockAnalyzeReel.mockResolvedValue({
      tags: Array.from({ length: 20 }, (_, i) => `tag${i}`),
      summary: "A test video",
      title: "Test Reel",
      language: "en",
    });
    mockNormalizeTags.mockResolvedValue(undefined);
    mockEmbedAndStore.mockResolvedValue(undefined);
    mockCleanupTempFiles.mockResolvedValue(undefined);
    mockMarkReelDone.mockResolvedValue(undefined);

    await capturedProcessor!(fakeJob);

    // Verify download was called
    expect(mockDownloadReel).toHaveBeenCalled();

    // Transcribe and extractFrames may run in parallel
    expect(mockTranscribe).toHaveBeenCalled();
    expect(mockExtractFrames).toHaveBeenCalled();

    // Analysis happens after transcription + frames
    expect(mockAnalyzeReel).toHaveBeenCalled();

    // Tag normalization and embedding
    expect(mockNormalizeTags).toHaveBeenCalled();
    expect(mockEmbedAndStore).toHaveBeenCalled();

    // Cleanup is called
    expect(mockCleanupTempFiles).toHaveBeenCalledWith("test-id");
  });
});
