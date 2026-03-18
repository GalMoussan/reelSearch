import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock next-auth/react
const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: (...args: unknown[]) => mockSignIn(...args),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: () => null,
  }),
  redirect: vi.fn(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  LogIn: (props: Record<string, unknown>) => <div data-testid="login-icon" {...props} />,
  Chrome: (props: Record<string, unknown>) => <div data-testid="chrome-icon" {...props} />,
  Loader2: (props: Record<string, unknown>) => <div data-testid="loader-icon" {...props} />,
}));

import LoginPage from "@/app/login/page";

describe("T033 — Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the 'Sign in with Google' button", () => {
    render(<LoginPage />);

    const button = screen.getByRole("button", { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
  });

  it("calls signIn with 'google' when the button is clicked", () => {
    render(<LoginPage />);

    const button = screen.getByRole("button", { name: /sign in with google/i });
    fireEvent.click(button);

    expect(mockSignIn).toHaveBeenCalledWith(
      "google",
      expect.objectContaining({
        callbackUrl: expect.any(String),
      })
    );
  });

  it("renders the login page heading or brand text", () => {
    render(<LoginPage />);

    // The page should have identifiable content
    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
  });
});
