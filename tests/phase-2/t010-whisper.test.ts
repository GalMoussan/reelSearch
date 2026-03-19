import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("@/lib/env", () => ({
  env: new Proxy({} as Record<string, string>, {
    get(_, prop: string) {
      return process.env[prop] ?? "";
    },
  }),
}));

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: mockCreate,
      },
    },
  })),
}));

vi.mock("fs", async (importOriginal) => {
  const original = await importOriginal<typeof import("fs")>();
  return {
    ...original,
    createReadStream: vi.fn().mockReturnValue("mock-stream"),
  };
});

import { transcribe } from "@/services/transcriber";

describe("T010 — Whisper Transcription", () => {
  const originalEnv = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-api-key";
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.OPENAI_API_KEY = originalEnv;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it("returns transcript text and mapped language for English", async () => {
    mockCreate.mockResolvedValue({
      text: "Hello world, this is a test video.",
      language: "english",
    });

    const result = await transcribe("/tmp/audio.mp3");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "whisper-1",
        response_format: "verbose_json",
      }),
    );
    expect(result.text).toBe("Hello world, this is a test video.");
    expect(result.language).toBe("en");
  });

  it("maps Hebrew language correctly", async () => {
    mockCreate.mockResolvedValue({
      text: "שלום עולם",
      language: "hebrew",
    });

    const result = await transcribe("/tmp/audio.mp3");

    expect(result.text).toBe("שלום עולם");
    expect(result.language).toBe("he");
  });

  it("maps unknown languages to 'none'", async () => {
    mockCreate.mockResolvedValue({
      text: "some text",
      language: "klingon",
    });

    const result = await transcribe("/tmp/audio.mp3");

    expect(result.language).toBe("none");
  });

  it("handles 'no speech' error gracefully", async () => {
    mockCreate.mockRejectedValue(new Error("no speech detected"));

    const result = await transcribe("/tmp/audio.mp3");

    expect(result.text).toBe("");
    expect(result.language).toBe("none");
  });

  it("returns early with empty result when API key is not set", async () => {
    delete process.env.OPENAI_API_KEY;

    const result = await transcribe("/tmp/audio.mp3");

    expect(result.text).toBe("");
    expect(result.language).toBe("none");
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
