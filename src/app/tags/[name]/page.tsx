import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
import { TagReels } from "./tag-reels"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params
  const decodedName = decodeURIComponent(name)
  return {
    title: `reelSearch | #${decodedName}`,
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  const tag = await prisma.tag.findUnique({
    where: { name: decodedName },
    include: { _count: { select: { reels: true } } },
  })

  if (!tag) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-3xl font-bold">No reels found with tag #{decodedName}</h1>
        <Link
          href="/"
          className="text-primary hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back
      </Link>

      <div>
        <h1 className="text-4xl font-bold">
          #{decodedName}{" "}
          <span className="text-lg text-muted-foreground">
            ({tag._count.reels} {tag._count.reels === 1 ? "reel" : "reels"})
          </span>
        </h1>
      </div>

      <TagReels tagName={decodedName} />
    </div>
  )
}
