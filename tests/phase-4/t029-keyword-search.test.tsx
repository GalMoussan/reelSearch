import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock use-tags hook
vi.mock("@/hooks/use-tags", () => ({
  useTags: () => ({ data: [] }),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Search: (props: Record<string, unknown>) => <div data-testid="search-icon" {...props} />,
  X: (props: Record<string, unknown>) => <div data-testid="x-icon" {...props} />,
  Loader2: (props: Record<string, unknown>) => <div data-testid="loader-icon" {...props} />,
  Tag: (props: Record<string, unknown>) => <div data-testid="tag-icon" {...props} />,
}));

import { SearchBar } from "@/components/search-bar";

describe("T029 — Keyword Search Bar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the search input with correct aria attributes", () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} placeholder="Search reels..." />);

    const input = screen.getByLabelText("Search reels");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("role", "searchbox");
    expect(input).toHaveAttribute("placeholder", "Search reels...");
  });

  it("fires onChange after debounce delay when typing", () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByLabelText("Search reels");
    fireEvent.change(input, { target: { value: "cooking" } });

    // Should not fire immediately
    expect(onChange).not.toHaveBeenCalled();

    // Advance past debounce delay
    vi.advanceTimersByTime(300);

    expect(onChange).toHaveBeenCalledWith("cooking");
  });

  it("shows a clear button when input has value and clears it on click", () => {
    const onChange = vi.fn();
    render(<SearchBar value="some query" onChange={onChange} />);

    const clearButton = screen.getByLabelText("Clear search");
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("does not show clear button when value is empty", () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
  });
});
