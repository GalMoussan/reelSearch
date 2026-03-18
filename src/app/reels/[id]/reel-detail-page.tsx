"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ExternalLink, Film } from "lucide-react"

function getPlatformLabel(url: string): string {
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "Facebook"
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube"
  if (url.includes("twitter.com") || url.includes("x.com")) return "X"
  if (url.includes("reddit.com") || url.includes("redd.it")) return "Reddit"
  return "Instagram"
}

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ReelNotes } from "@/components/reel-notes"
import { AddToCollectionDropdown } from "@/components/collections/add-to-collection-dropdown"
import { ReelExportButton } from "@/components/reel-export-button"

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
  collections: Array<{ id: string; name: string; color: string | null }>
  note: string | null
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
}

interface ReelDetailPageProps {
  reelId: string
}

export function ReelDetailPage({ reelId }: ReelDetailPageProps) {
  const router = useRouter()

  const { data: reel, isLoading, isError } = useQuery<ReelDetail>({
    queryKey: ["reel-detail", reelId],
    queryFn: async () => {
      const res = await fetch(`/api/reels/${reelId}`)
      if (!res.ok) throw new Error("Failed to fetch reel details")
      const json = await res.json()
      return json.data
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
          <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (isError || !reel) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Failed to load reel details.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="space-y-6">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {reel.thumbnailUrl ? (
            <Image
              src={reel.thumbnailUrl}
              alt={reel.title ?? "Reel thumbnail"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Film className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Title + Actions */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">
              {reel.title ?? "Untitled Reel"}
            </h1>
            <Badge className={`mt-2 ${STATUS_STYLES[reel.status] ?? ""}`}>
              {reel.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <ReelExportButton reel={reel} notes={reel.note} />
            <AddToCollectionDropdown reelId={reelId} variant="button" />
          </div>
        </div>

        {/* View on Instagram */}
        <a
          href={reel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          View on {getPlatformLabel(reel.url)}
          <ExternalLink className="h-4 w-4" />
        </a>

        {/* Tags */}
        {reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {reel.tags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.name}`}>
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

        {/* Collections */}
        {reel.collections.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              In Collections
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {reel.collections.map((c) => (
                <Badge
                  key={c.id}
                  variant="outline"
                  className="gap-1.5"
                >
                  {c.color && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                  )}
                  {c.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Summary */}
        {reel.summary && (
          <div>
            <h3 className="text-sm font-medium mb-2">Summary</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {reel.summary}
            </p>
          </div>
        )}

        {/* Transcript */}
        {reel.transcript && (
          <div>
            <h3 className="text-sm font-medium mb-2">Transcript</h3>
            <div className="max-h-80 overflow-y-auto rounded-lg bg-muted p-4 text-sm font-mono whitespace-pre-wrap">
              {reel.transcript}
            </div>
          </div>
        )}

        <Separator />

        {/* Notes */}
        <ReelNotes reelId={reelId} />

        <Separator />

        {/* Metadata footer */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {reel.addedBy?.name && (
            <span className="flex items-center gap-2">
              {reel.addedBy.image ? (
                <Image
                  src={reel.addedBy.image}
                  alt={reel.addedBy.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {reel.addedBy.name.charAt(0).toUpperCase()}
                </span>
              )}
              Added by {reel.addedBy.name}
            </span>
          )}
          <span>{formatDate(reel.createdAt)}</span>
          {reel.language && <span>Language: {reel.language}</span>}
        </div>
      </div>
    </div>
  )
}
