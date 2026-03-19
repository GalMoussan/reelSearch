"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import { Film, Loader2, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function highlightText(text: string, terms: string[]): ReactNode {
  if (!terms.length) return text
  const escaped = terms
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  if (!escaped.length) return text
  const regex = new RegExp(`(${escaped.join("|")})`, "gi")
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-inherit rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

interface ReelCardProps {
  reel: {
    id: string
    title: string | null
    summary: string | null
    thumbnailUrl: string | null
    status: string
    errorMessage?: string | null
    createdAt: string
    tags: Array<{ id: string; name: string }>
    addedBy?: { name: string | null; image: string | null }
  }
  onClick?: (reelId: string) => void
  highlightTerms?: string[]
}

function formatRelativeDate(date: string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffSeconds = Math.floor((now - then) / 1000)

  if (diffSeconds < 60) return "just now"

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}mo ago`

  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears}y ago`
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  FAILED: "bg-red-100 text-red-800 border-red-200",
}

const MAX_VISIBLE_TAGS = 5

export function ReelCard({ reel, onClick, highlightTerms = [] }: ReelCardProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const visibleTags = reel.tags.slice(0, MAX_VISIBLE_TAGS)
  const remainingCount = reel.tags.length - MAX_VISIBLE_TAGS
  const showStatusBadge = reel.status !== "DONE"
  const isProcessing = reel.status === "PENDING" || reel.status === "PROCESSING"
  const isFailed = reel.status === "FAILED"

  function handleClick() {
    onClick?.(reel.id)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.(reel.id)
    }
  }

  async function handleRetry(e: React.MouseEvent) {
    e.stopPropagation()
    setIsRetrying(true)
    try {
      const res = await fetch(`/api/reels/${reel.id}/retry`, { method: "POST" })
      if (!res.ok) {
        console.error("Retry failed:", await res.text())
      }
    } catch (err) {
      console.error("Retry error:", err)
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-lg",
        onClick && "cursor-pointer",
        isFailed && "border-destructive/50 bg-destructive/5"
      )}
      tabIndex={0}
      role="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-muted">
        {isProcessing ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium text-primary">Processing video…</span>
          </div>
        ) : reel.thumbnailUrl ? (
          <Image
            src={reel.thumbnailUrl}
            alt={reel.title ?? "Reel thumbnail"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Film className="h-10 w-10 text-muted-foreground" />
          </div>
        )}

        {showStatusBadge && (
          <Badge
            className={cn(
              "absolute right-2 top-2 z-20",
              STATUS_STYLES[reel.status] ?? "bg-gray-100 text-gray-800 border-gray-200"
            )}
          >
            {reel.status}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Failed state: retry button + error message */}
        {isFailed && (
          <div className="mb-2 flex items-center justify-between gap-2">
            <span
              className="truncate text-xs text-destructive"
              title={reel.errorMessage ?? "Processing failed"}
            >
              {reel.errorMessage ?? "Processing failed"}
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="h-6 shrink-0 px-2 text-xs"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              <RotateCcw className={cn("mr-1 h-3 w-3", isRetrying && "animate-spin")} />
              {isRetrying ? "Retrying..." : "Retry"}
            </Button>
          </div>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {reel.title
            ? highlightText(reel.title, highlightTerms)
            : isProcessing
              ? "Brewing something great…"
              : "Untitled Reel"}
        </h3>

        {/* Summary */}
        {reel.summary && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {highlightText(reel.summary, highlightTerms)}
          </p>
        )}

        {/* Tags */}
        {reel.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag.name}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{remainingCount} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer: date and added by */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatRelativeDate(reel.createdAt)}</span>
          {reel.addedBy?.name && (
            <span className="flex items-center gap-1.5 truncate max-w-[50%]">
              {reel.addedBy.image ? (
                <Image
                  src={reel.addedBy.image}
                  alt={reel.addedBy.name}
                  width={24}
                  height={24}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {reel.addedBy.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="truncate">{reel.addedBy.name}</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
