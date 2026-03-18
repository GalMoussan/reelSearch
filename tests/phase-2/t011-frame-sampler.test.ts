import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("child_process", () => ({
  execFile: vi.fn(),
}));

import { extractFrames } from "@/services/frame-sampler";
import { execFile } from "child_process";

const mockedExecFile = vi.mocked(execFile);

describe("T011 — Frame Sampler", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedExecFile.mockImplementation((...args: unknown[]) => {
      const command = args[0] as string;
      const cb = args[args.length - 1];

      if (typeof cb === "function") {
        if (command.includes("ffprobe")) {
          // ffprobe returns duration as stdout
          (cb as (err: null, stdout: string, stderr: string) => void)(
            null,
            "30.0",
            "",
          );
        } else if (command.includes("ffmpeg")) {
          // ffmpeg returns image buffer as stdout
          (
            cb as (err: null, stdout: Buffer, stderr: string) => void
          )(null, Buffer.from("fake-jpeg"), "");
        }
      }
      return undefined as never;
    });
  });

  it("returns an array of base64 strings", async () => {
    const frames = await extractFrames("/tmp/video.mp4");

    expect(frames).toBeInstanceOf(Array);
    expect(frames.length).toBeGreaterThan(0);
    frames.forEach((frame) => {
      expect(typeof frame).toBe("string");
      // Verify it is valid base64
      expect(frame).toBe(Buffer.from("fake-jpeg").toString("base64"));
    });
  });

  it("extracts 5 frames by default for a 30s video", async () => {
    const frames = await extractFrames("/tmp/video.mp4");

    expect(frames).toHaveLength(5);
  });

  it("extracts custom number of frames when count is specified", async () => {
    const frames = await extractFrames("/tmp/video.mp4", 3);

    expect(frames).toHaveLength(3);
  });

  it("extracts 1 frame per second for short videos (<5s)", async () => {
    mockedExecFile.mockImplementation((...args: unknown[]) => {
      const command = args[0] as string;
      const cb = args[args.length - 1];

      if (typeof cb === "function") {
        if (command.includes("ffprobe")) {
          (cb as (err: null, stdout: string, stderr: string) => void)(
            null,
            "3.0",
            "",
          );
        } else if (command.includes("ffmpeg")) {
          (
            cb as (err: null, stdout: Buffer, stderr: string) => void
          )(null, Buffer.from("fake-jpeg"), "");
        }
      }
      return undefined as never;
    });

    const frames = await extractFrames("/tmp/video.mp4");

    expect(frames).toHaveLength(3);
  });

  it("throws when count is less than 1", async () => {
    await expect(extractFrames("/tmp/video.mp4", 0)).rejects.toThrow();
    await expect(extractFrames("/tmp/video.mp4", -1)).rejects.toThrow();
  });

  it("calls ffprobe to get video duration", async () => {
    await extractFrames("/tmp/video.mp4");

    const ffprobeCall = mockedExecFile.mock.calls.find(
      (call) => typeof call[0] === "string" && call[0].includes("ffprobe"),
    );
    expect(ffprobeCall).toBeDefined();
  });

  it("calls ffmpeg for each frame extraction", async () => {
    await extractFrames("/tmp/video.mp4", 3);

    const ffmpegCalls = mockedExecFile.mock.calls.filter(
      (call) => typeof call[0] === "string" && call[0].includes("ffmpeg"),
    );
    expect(ffmpegCalls).toHaveLength(3);
  });
});
