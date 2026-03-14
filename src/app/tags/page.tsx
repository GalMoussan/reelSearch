import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "reelSearch | Tags",
}

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    where: { reels: { some: {} } },
    select: {
      id: true,
      name: true,
      _count: { select: { reels: true } },
    },
    orderBy: { reels: { _count: "desc" } },
  })

  return (
    <div className="space-y-6 pt-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Tags</h1>
        <p className="mt-2 text-muted-foreground">
          Browse reels by tag ({tags.length} {tags.length === 1 ? "tag" : "tags"})
        </p>
      </div>

      {tags.length === 0 ? (
        <p className="text-muted-foreground">
          No tags yet. Tags are automatically created when reels are processed.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link key={tag.id} href={`/tags/${encodeURIComponent(tag.name)}`}>
              <Badge
                variant="secondary"
                className="cursor-pointer px-4 py-2 text-base hover:bg-secondary/60 transition-colors"
              >
                #{tag.name}
                <span className="ml-2 text-muted-foreground">
                  ({tag._count.reels})
                </span>
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
