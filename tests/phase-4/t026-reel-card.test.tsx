import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Film: (props: Record<string, unknown>) => <div data-testid="film-icon" {...props} />,
  Clock: (props: Record<string, unknown>) => <div data-testid="clock-icon" {...props} />,
  Tag: (props: Record<string, unknown>) => <div data-testid="tag-icon" {...props} />,
  User: (props: Record<string, unknown>) => <div data-testid="user-icon" {...props} />,
  MoreHorizontal: (props: Record<string, unknown>) => <div data-testid="more-icon" {...props} />,
  RotateCcw: (props: Record<string, unknown>) => <div data-testid="rotate-icon" {...props} />,
}));

import { ReelCard } from "@/components/reel-card";

const makeTags = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `tag-${i + 1}`,
    name: `tag${i + 1}`,
  }));

const baseReel = {
  id: "reel-1",
  title: "Test Reel Title",
  summary: "A short summary of the reel",
  thumbnailUrl: "https://example.com/thumb.jpg",
  status: "COMPLETED" as const,
  createdAt: new Date().toISOString(),
  tags: makeTags(3),
  addedBy: { name: "Test User", image: null },
};

describe("T026 — Reel Card Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the reel title", () => {
    render(<ReelCard reel={baseReel} />);
    expect(screen.getByText("Test Reel Title")).toBeInTheDocument();
  });

  it("renders 'Untitled Reel' when title is null", () => {
    const reel = { ...baseReel, title: null };
    render(<ReelCard reel={reel} />);
    expect(screen.getByText("Untitled Reel")).toBeInTheDocument();
  });

  it("renders the thumbnail image when thumbnailUrl is provided", () => {
    render(<ReelCard reel={baseReel} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
  });

  it("renders a placeholder icon when thumbnailUrl is absent", () => {
    const reel = { ...baseReel, thumbnailUrl: null };
    render(<ReelCard reel={reel} />);
    expect(screen.getByTestId("film-icon")).toBeInTheDocument();
  });

  it("shows the first 5 tags and a '+N more' badge when more than 5 tags exist", () => {
    const reel = { ...baseReel, tags: makeTags(7) };
    render(<ReelCard reel={reel} />);

    // First 5 tags should be visible
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`tag${i}`)).toBeInTheDocument();
    }

    // Tags 6 and 7 should not be rendered directly
    expect(screen.queryByText("tag6")).not.toBeInTheDocument();
    expect(screen.queryByText("tag7")).not.toBeInTheDocument();

    // Should show "+2 more" badge
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("fires onClick with the reel id when clicked", () => {
    const onClick = vi.fn();
    render(<ReelCard reel={baseReel} onClick={onClick} />);

    const card = screen.getByText("Test Reel Title").closest("[role='button'], button, [data-testid]")
      ?? screen.getByText("Test Reel Title").parentElement!;
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledWith("reel-1");
  });
});
