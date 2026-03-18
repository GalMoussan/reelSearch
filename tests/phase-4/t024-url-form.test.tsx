import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock validators
const mockSafeParse = vi.fn();
vi.mock("@/lib/validators", () => ({
  reelUrlSchema: {
    safeParse: (...args: unknown[]) => mockSafeParse(...args),
  },
}));

// Mock toast
const mockToast = vi.fn();
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { ReelForm } from "@/components/reel-form";

describe("T024 — Reel URL Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSafeParse.mockReturnValue({
      success: true,
      data: "https://instagram.com/reel/123",
    });
    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ reel: { id: "reel-1" } }),
    });
  });

  it("renders the URL input and submit button", () => {
    render(<ReelForm />);

    const input = screen.getByLabelText("Reel URL");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "url");

    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find((b) => /submit/i.test(b.textContent ?? ""));
    expect(submitButton).toBeInTheDocument();
  });

  it("shows a validation error when an invalid URL is submitted", async () => {
    mockSafeParse.mockReturnValue({
      success: false,
      error: { errors: [{ message: "Invalid URL" }], issues: [{ message: "Invalid URL" }] },
    });

    render(<ReelForm />);

    const input = screen.getByLabelText("Reel URL");
    fireEvent.change(input, { target: { value: "not-a-url" } });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });
  });

  it("calls fetch with the correct endpoint on successful submission", async () => {
    const onSubmitted = vi.fn();
    render(<ReelForm onSubmitted={onSubmitted} />);

    const input = screen.getByLabelText("Reel URL");
    fireEvent.change(input, {
      target: { value: "https://instagram.com/reel/123" },
    });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/reels",
        expect.objectContaining({
          method: "POST",
          body: expect.any(String),
        })
      );
    });
  });

  it("invokes the onSubmitted callback after a successful submission", async () => {
    const onSubmitted = vi.fn();
    render(<ReelForm onSubmitted={onSubmitted} />);

    const input = screen.getByLabelText("Reel URL");
    fireEvent.change(input, {
      target: { value: "https://instagram.com/reel/123" },
    });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmitted).toHaveBeenCalledWith("reel-1");
    });
  });
});
