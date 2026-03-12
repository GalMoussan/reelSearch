import { z } from "zod"

const INSTAGRAM_URL_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/[\w-]+\/?(?:\?.*)?$/

export const reelUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .regex(INSTAGRAM_URL_REGEX, "Must be a valid Instagram reel or post URL (e.g. https://www.instagram.com/reel/ABC123)")
