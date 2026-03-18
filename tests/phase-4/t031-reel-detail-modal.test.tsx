import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock @tanstack/react-query
const mockUseQuery = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useQueryClient: () => ({}),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <a {...props}>{children}</a>
  ),
}));

// Mock dialog components to render children directly
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogClose: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ExternalLink: (props: Record<string, unknown>) => <div data-testid="external-link-icon" {...props} />,
  X: (props: Record<string, unknown>) => <div data-testid="x-icon" {...props} />,
  Film: (props: Record<string, unknown>) => <div data-testid="film-icon" {...props} />,
  Tag: (props: Record<string, unknown>) => <div data-testid="tag-icon" {...props} />,
  Clock: (props: Record<string, unknown>) => <div data-testid="clock-icon" {...props} />,
  Loader2: (props: Record<string, unknown>) => <div data-testid="loader-icon" {...props} />,
  FileText: (props: Record<string, unknown>) => <div data-testid="file-text-icon" {...props} />,
  User: (props: Record<string, unknown>) => <div data-testid="user-icon" {...props} />,
  ArrowRight: (props: Record<string, unknown>) => <div data-testid="arrow-right-icon" {...props} />,
  ChevronDown: (props: Record<string, unknown>) => <div data-testid="chevron-down-icon" {...props} />,
  ChevronUp: (props: Record<string, unknown>) => <div data-testid="chevron-up-icon" {...props} />,
}));

import { ReelDetailModal } from "@/components/reel-detail-modal";

const mockReelData = {
  id: "reel-1",
  title: "Test Reel",
  summary: "A summary",
  transcript: "This is the full transcript of the reel content.",
  thumbnailUrl: "https://example.com/thumb.jpg",
  url: "https://instagram.com/reel/123",
  status: "COMPLETED",
  createdAt: new Date().toISOString(),
  tags: [
    { id: "t1", name: "cooking" },
    { id: "t2", name: "recipes" },
    { id: "t3", name: "italian" },
  ],
  addedBy: { name: "Test User" },
};

describe("T031 — Reel Detail Modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render the dialog when reelId is null", () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<ReelDetailModal reelId={null} onClose={vi.fn()} />);

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("renders transcript content when reel data is available", () => {
    mockUseQuery.mockReturnValue({
      data: mockReelData,
      isLoading: false,
      error: null,
    });

    render(<ReelDetailModal reelId="reel-1" onClose={vi.fn()} />);

    expect(
      screen.getByText("This is the full transcript of the reel content.")
    ).toBeInTheDocument();
  });

  it("renders all tags without truncation", () => {
    mockUseQuery.mockReturnValue({
      data: mockReelData,
      isLoading: false,
      error: null,
    });

    render(<ReelDetailModal reelId="reel-1" onClose={vi.fn()} />);

    expect(screen.getByText("cooking")).toBeInTheDocument();
    expect(screen.getByText("recipes")).toBeInTheDocument();
    expect(screen.getByText("italian")).toBeInTheDocument();
  });

  it("renders an external link with target='_blank'", () => {
    mockUseQuery.mockReturnValue({
      data: mockReelData,
      isLoading: false,
      error: null,
    });

    render(<ReelDetailModal reelId="reel-1" onClose={vi.fn()} />);

    const externalLink = screen.getByText(/view on instagram/i)?.closest("a");
    expect(externalLink).toHaveAttribute("target", "_blank");
    expect(externalLink).toHaveAttribute("href", "https://instagram.com/reel/123");
  });
});
