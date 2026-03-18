import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-utils"
import { ReelDetailPage } from "./reel-detail-page"

export default async function ReelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession()
  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params

  return <ReelDetailPage reelId={id} />
}
