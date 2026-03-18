import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockEmbeddingsCreate = vi.fn();

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: mockEmbeddingsCreate,
    },
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $executeRaw: vi.fn().mockResolvedValue(1),
  },
}));

import {
  generateEmbedding,
  storeEmbedding,
  embedAndStore,
  isEmbeddingEnabled,
} from "@/services/embedder";
import { prisma } from "@/lib/prisma";

const mockedExecuteRaw = vi.mocked(prisma.$executeRaw);

describe("T014 — Embedding Generation", () => {
  const originalApiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-api-key";

    mockEmbeddingsCreate.mockResolvedValue({
      data: [{ embedding: [0.1, 0.2, 0.3, 0.4, 0.5] }],
    });
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.OPENAI_API_KEY = originalApiKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it("generateEmbedding returns an embedding array", async () => {
    const embedding = await generateEmbedding("test text for embedding");

    expect(mockEmbeddingsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "text-embedding-3-small",
        input: "test text for embedding",
      }),
    );
    expect(embedding).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
  });

  it("storeEmbedding calls prisma.$executeRaw", async () => {
    await storeEmbedding("reel-123", [0.1, 0.2, 0.3]);

    expect(mockedExecuteRaw).toHaveBeenCalled();
  });

  it("embedAndStore generates and stores embedding when API key is set", async () => {
    await embedAndStore("reel-123", "Some reel transcript text");

    expect(mockEmbeddingsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "text-embedding-3-small",
      }),
    );
    expect(mockedExecuteRaw).toHaveBeenCalled();
  });

  it("embedAndStore skips when API key is not set", async () => {
    delete process.env.OPENAI_API_KEY;

    await embedAndStore("reel-123", "Some text");

    expect(mockEmbeddingsCreate).not.toHaveBeenCalled();
    expect(mockedExecuteRaw).not.toHaveBeenCalled();
  });

  it("embedAndStore truncates text to 8000 characters", async () => {
    const longText = "a".repeat(10000);

    await embedAndStore("reel-123", longText);

    const callArgs = mockEmbeddingsCreate.mock.calls[0][0];
    expect(callArgs.input.length).toBeLessThanOrEqual(8000);
  });

  it("generateEmbedding throws on empty text", async () => {
    await expect(generateEmbedding("")).rejects.toThrow();
  });

  it("isEmbeddingEnabled returns true when API key is set", () => {
    expect(isEmbeddingEnabled()).toBe(true);
  });

  it("isEmbeddingEnabled returns false when API key is not set", () => {
    delete process.env.OPENAI_API_KEY;
    expect(isEmbeddingEnabled()).toBe(false);
  });
});
