import { z } from "zod"

const INSTAGRAM_URL_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/[\w-]+\/?(?:\?.*)?$/

export const reelUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .regex(INSTAGRAM_URL_REGEX, "Must be a valid Instagram reel or post URL (e.g. https://www.instagram.com/reel/ABC123)")

export const reelUrlsSchema = z
  .array(reelUrlSchema)
  .min(1, "At least one URL is required")
  .max(20, "Maximum 20 URLs per batch")
