import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"

/**
 * Supabase server client using service role key.
 * Use this for server-side operations (API routes, workers) only.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

/**
 * Upload a file to Supabase Storage and return its public URL.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    })

  if (error) {
    throw new Error(`Supabase upload failed for ${bucket}/${path}: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return urlData.publicUrl
}

/**
 * Get a public thumbnail URL for a reel.
 * Expects thumbnails stored at `thumbnails/{reelId}.jpg` in the given bucket.
 */
export function getThumbnailUrl(bucket: string, reelId: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(`thumbnails/${reelId}.jpg`)

  return data.publicUrl
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw new Error(`Supabase delete failed for ${bucket}/${path}: ${error.message}`)
  }
}
