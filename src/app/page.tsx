import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import HomePage from "./home-page"

export default async function Page() {
  const session = await getServerSession()

  let initialReels = undefined

  if (session?.user) {
    try {
      const [reels, total] = await Promise.all([
        prisma.reel.findMany({
          include: {
            tags: true,
            addedBy: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.reel.count(),
      ])

      initialReels = {
        data: JSON.parse(JSON.stringify(reels)),
        meta: {
          page: 1,
          limit: 20,
          total,
          totalPages: Math.ceil(total / 20),
        },
      }
    } catch (err) {
      console.error("Failed to prefetch reels:", err)
    }
  }

  return <HomePage initialReels={initialReels} />
}
