import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/env", () => ({
  env: new Proxy({} as Record<string, string>, {
    get(_, prop: string) {
      return process.env[prop] ?? "";
    },
  }),
}));

// Define APIError class that will be used both in the mock and in tests
const { MockAPIError, mockCreate } = vi.hoisted(() => {
  class MockAPIError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = "APIError";
      this.status = status;
    }
  }
  return { MockAPIError, mockCreate: vi.fn() };
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: Object.assign(
    vi.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    })),
    {
      APIError: MockAPIError,
    }
  ),
}));

import { analyzeReel } from "@/services/analyzer";

const VALID_TAGS = [
  "cooking",
  "recipe",
  "food",
  "kitchen",
  "tutorial",
  "howto",
  "chef",
  "meal",
  "dinner",
  "lunch",
  "breakfast",
  "healthy",
  "vegan",
  "organic",
  "homemade",
  "delicious",
  "trending",
  "viral",
  "foodie",
  "plating",
];

const VALID_RESPONSE = {
  tags: VALID_TAGS,
  summary: "A cooking tutorial showing how to make a healthy vegan meal.",
  title: "Easy Vegan Dinner Recipe",
  language: "en" as const,
};

describe("T012 — Claude Vision Analyzer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns analysis with tags, summary, title, and language", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(VALID_RESPONSE) }],
    });

    const result = await analyzeReel(
      ["base64frame1", "base64frame2"],
      "Hello this is a cooking video",
    );

    expect(result.tags).toEqual(VALID_TAGS);
    expect(result.summary).toBe(VALID_RESPONSE.summary);
    expect(result.title).toBe(VALID_RESPONSE.title);
    expect(result.language).toBe("en");
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("strips markdown code fences from response", async () => {
    const wrappedJson =
      "```json\n" + JSON.stringify(VALID_RESPONSE) + "\n```";
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: wrappedJson }],
    });

    const result = await analyzeReel(["frame1"], "transcript text");

    expect(result.tags).toEqual(VALID_TAGS);
    expect(result.title).toBe(VALID_RESPONSE.title);
  });

  it("throws validation error when fewer than 20 tags are returned", async () => {
    const invalidResponse = {
      tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
      summary: "Short summary",
      title: "Some Title",
      language: "en",
    };
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(invalidResponse) }],
    });

    await expect(
      analyzeReel(["frame1"], "transcript"),
    ).rejects.toThrow();
  });

  it("throws descriptive error on invalid JSON response", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "this is not valid json at all" }],
    });

    await expect(
      analyzeReel(["frame1"], "transcript"),
    ).rejects.toThrow();
  });

  it("retries on 429 rate limit errors", async () => {
    const rateLimitError = new MockAPIError(429, "Rate limited");

    mockCreate
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce({
        content: [{ type: "text", text: JSON.stringify(VALID_RESPONSE) }],
      });

    const result = await analyzeReel(["frame1"], "transcript");

    expect(result.tags).toEqual(VALID_TAGS);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("retries on 5xx server errors", async () => {
    const serverError = new MockAPIError(500, "Internal Server Error");

    mockCreate
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce({
        content: [{ type: "text", text: JSON.stringify(VALID_RESPONSE) }],
      });

    const result = await analyzeReel(["frame1"], "transcript");

    expect(result.tags).toEqual(VALID_TAGS);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });
});
