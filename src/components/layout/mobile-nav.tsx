"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface MobileNavProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { data: session } = useSession()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose()
          }}
          role="button"
          tabIndex={0}
          aria-label="Close navigation"
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-background border-r shadow-lg transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-bold tracking-tight">reelSearch</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <Link
            href="/"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Home
          </Link>
          <Link
            href="/tags"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Tags
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          {session?.user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? "User avatar"}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium truncate">
                  {session.user.name}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => signIn("google")}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
