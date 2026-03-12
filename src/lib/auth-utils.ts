import { getServerSession as nextAuthGetServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function getServerSession() {
  return nextAuthGetServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getServerSession()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}
