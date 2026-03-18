"use client"

import Image from "next/image"
import { Sparkles, Film } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useResurface } from "@/hooks/use-resurface"

interface RediscoverSectionProps {
  recentQuery?: string
  onReelClick?: (reelId: string) => void
}

export function RediscoverSection({ recentQuery, onReelClick }: RediscoverSectionProps) {
  const { data: reels, isLoading } = useResurface(recentQuery)

  if (isLoading || !reels?.length) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-semibold">Rediscover</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {reels.map((reel) => (
          <Card
            key={reel.id}
            className="min-w-[200px] max-w-[220px] shrink-0 cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
            onClick={() => onReelClick?.(reel.id)}
          >
            <div className="relative aspect-video w-full bg-muted">
              {reel.thumbnailUrl ? (
                <Image
                  src={reel.thumbnailUrl}
                  alt={reel.title ?? "Reel thumbnail"}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Film className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-2.5">
              <h3 className="line-clamp-1 text-xs font-semibold">
                {reel.title ?? "Untitled Reel"}
              </h3>
              {reel.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {reel.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-[9px] px-1 py-0"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
