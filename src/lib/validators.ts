import { z } from "zod"

const PLATFORM_REGEXES = [
  // Instagram
  /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|p)\/[\w-]+\/?(?:\?.*)?$/,
  // Facebook
  /^(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/(?:reel\/\d+|watch\/?\?v=\d+|[\w.]+\/videos\/\d+)\/?(?:\?.*)?$/,
  /^(?:https?:\/\/)?fb\.watch\/[\w-]+\/?(?:\?.*)?$/,
  // YouTube
  /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|shorts\/)[\w-]+(?:[&?].*)?$/,
  /^(?:https?:\/\/)?youtu\.be\/[\w-]+(?:\?.*)?$/,
  // X (Twitter)
  /^(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/\w+\/status\/\d+\/?(?:\?.*)?$/,
  // Reddit
  /^(?:https?:\/\/)?(?:www\.|old\.)?reddit\.com\/r\/\w+\/comments\/[\w]+\/.*$/,
  /^(?:https?:\/\/)?v\.redd\.it\/[\w]+\/?$/,
]

export function isValidReelUrl(url: string): boolean {
  return PLATFORM_REGEXES.some((regex) => regex.test(url))
}

export const reelUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine(isValidReelUrl, "Paste a valid URL from Instagram, Facebook, YouTube, X, or Reddit")

export const reelUrlsSchema = z
  .array(reelUrlSchema)
  .min(1, "At least one URL is required")
  .max(20, "Maximum 20 URLs per batch")

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().trim().max(500, "Description must be 500 characters or less").optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").optional(),
})

export const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or less").optional(),
  description: z.string().trim().max(500, "Description must be 500 characters or less").nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").nullable().optional(),
})

export const addReelToCollectionSchema = z.object({
  reelId: z.string().min(1, "Reel ID is required"),
})

export const reelNoteSchema = z.object({
  content: z.string().max(5000, "Note must be 5000 characters or less"),
})

export const semanticSearchSchema = z.object({
  query: z.string().trim().min(1, "query is required and must be a non-empty string"),
  limit: z.number().int().min(1).max(50).optional().default(10),
})
