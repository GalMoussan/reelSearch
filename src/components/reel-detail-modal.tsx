"use client"

import Image from "next/image"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ExternalLink, Film } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface ReelDetailModalProps {
  reelId: string | null
  onClose: () => void
}

interface ReelDetail {
  id: string
  url: string
  title: string | null
  summary: string | null
  transcript: string | null
  thumbnailUrl: string | null
  language: string | null
  status: string
  createdAt: string
  tags: Array<{ id: string; name: string }>
  addedBy: { name: string | null; image: string | null } | null
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className ?? ""}`}
    />
  )
}

export function ReelDetailModal({ reelId, onClose }: ReelDetailModalProps) {
  const { data: reel, isLoading, isError } = useQuery<ReelDetail>({
    queryKey: ["reel-detail", reelId],
    queryFn: async () => {
      const res = await fetch(`/api/reels/${reelId}`)
      if (!res.ok) throw new Error("Failed to fetch reel details")
      const json = await res.json()
      return json.data
    },
    enabled: !!reelId,
  })

  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={!!reelId} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Failed to load reel details. Please try again.
          </div>
        ) : reel ? (
          <ReelContent reel={reel} onClose={onClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex flex-wrap gap-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

function ReelContent({
  reel,
  onClose,
}: {
  reel: ReelDetail
  onClose: () => void
}) {
  return (
    <div className="space-y-4">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {reel.thumbnailUrl ? (
          <Image
            src={reel.thumbnailUrl}
            alt={reel.title ?? "Reel thumbnail"}
            fill
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 672px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Header */}
      <DialogHeader>
        <DialogTitle className="text-xl">
          {reel.title ?? "Untitled Reel"}
        </DialogTitle>
        {reel.summary && (
          <DialogDescription className="text-sm leading-relaxed">
            {reel.summary}
          </DialogDescription>
        )}
      </DialogHeader>

      {/* Tags */}
      {reel.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {reel.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.name}`}
              onClick={onClose}
            >
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/60"
              >
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Transcript */}
      {reel.transcript && (
        <div>
          <h4 className="mb-2 text-sm font-medium">Transcript</h4>
          <div className="max-h-60 overflow-y-auto rounded-lg bg-muted p-4 text-sm font-mono">
            {reel.transcript}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm text-muted-foreground">
        <div className="flex flex-col gap-1">
          {reel.addedBy?.name && (
            <span>Added by {reel.addedBy.name}</span>
          )}
          <span>{formatDate(reel.createdAt)}</span>
        </div>

        {/* External link */}
        <a
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View on Instagram
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
