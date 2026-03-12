"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./mobile-nav"

export function Header() {
  const { data: session, status } = useSession()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>

            <Link href="/" className="text-lg font-bold tracking-tight">
              reelSearch
            </Link>

            {/* Desktop nav links */}
            <nav className="ml-6 hidden items-center gap-4 md:flex">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/tags"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Tags
              </Link>
            </nav>
          </div>

          {/* Right: auth */}
          <div className="hidden items-center gap-3 md:flex">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? "User avatar"}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium">
                  {session.user.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => signIn("google")}>
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile auth icon — small avatar or sign-in */}
          <div className="flex items-center md:hidden">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User avatar"}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => signIn("google")}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  )
}
