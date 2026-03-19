import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// --- Mocks ---

const mockMutate = vi.fn();
let mockMutationState: {
  isPending: boolean;
  isError: boolean;
  data: unknown;
  mutate: typeof mockMutate;
};

vi.mock("@tanstack/react-query", () => ({
  useMutation: () => {
    mockMutationState.mutate = mockMutate;
    return mockMutationState;
  },
}));

vi.mock("lucide-react", () => ({
  Sparkles: (props: Record<string, unknown>) => (
    <span data-testid="sparkles-icon" {...props} />
  ),
  Search: (props: Record<string, unknown>) => (
    <span data-testid="search-icon" {...props} />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
    className?: string;
  }) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  CardContent: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLSpanElement> & { variant?: string }) => (
    <span {...props}>{children}</span>
  ),
}));

vi.mock("@/components/reel-card", () => ({
  ReelCard: ({ reel }: { reel: { id: string; title: string | null } }) => (
    <div data-testid={`reel-${reel.id}`}>{reel.title}</div>
  ),
}));

import { NLSearch } from "@/components/nl-search";

function resetMutationState() {
  mockMutationState = {
    isPending: false,
    isError: false,
    data: undefined,
    mutate: mockMutate,
  };
}

describe("T030 — Natural Language Search UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMutationState();
  });

  it("renders mode toggle buttons (Keyword + AI Search)", () => {
    render(<NLSearch />);

    expect(screen.getByRole("button", { name: /keyword/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ai search/i })).toBeInTheDocument();
  });

  it("renders search input with placeholder", () => {
    render(<NLSearch />);

    const input = screen.getByPlaceholderText(/search your reels/i);
    expect(input).toBeInTheDocument();
  });

  it("calls mutate with trimmed query on form submit", () => {
    render(<NLSearch />);

    const input = screen.getByPlaceholderText(/search your reels/i);
    fireEvent.change(input, { target: { value: "  cooking tips  " } });

    const submitButton = screen.getByRole("button", { name: /^search$/i });
    fireEvent.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith("cooking tips");
  });

  it("shows 'Searching...' loading state", () => {
    mockMutationState.isPending = true;
    render(<NLSearch />);

    expect(screen.getByRole("button", { name: /searching/i })).toBeInTheDocument();
  });

  it("renders results grid with count badge", () => {
    mockMutationState.data = {
      data: [
        { id: "r1", title: "Reel One", summary: null, thumbnailUrl: null, status: "DONE", createdAt: "2025-01-01", tags: [] },
        { id: "r2", title: "Reel Two", summary: null, thumbnailUrl: null, status: "DONE", createdAt: "2025-01-02", tags: [] },
      ],
      meta: { page: 1, limit: 50, total: 2, totalPages: 1 },
    };

    render(<NLSearch />);

    expect(screen.getByText("2 results")).toBeInTheDocument();
    expect(screen.getByTestId("reel-r1")).toBeInTheDocument();
    expect(screen.getByTestId("reel-r2")).toBeInTheDocument();
  });

  it("shows error card on failure", () => {
    mockMutationState.isError = true;
    render(<NLSearch />);

    expect(screen.getByText(/search failed/i)).toBeInTheDocument();
  });

  it("shows 'No reels found' for empty results", () => {
    mockMutationState.data = {
      data: [],
      meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
    };

    render(<NLSearch />);

    expect(screen.getByText(/no reels found/i)).toBeInTheDocument();
  });

  it("calls onModeChange callback when Keyword is clicked", () => {
    const onModeChange = vi.fn();
    render(<NLSearch onModeChange={onModeChange} />);

    fireEvent.click(screen.getByRole("button", { name: /keyword/i }));

    expect(onModeChange).toHaveBeenCalledWith(false);
  });
});
