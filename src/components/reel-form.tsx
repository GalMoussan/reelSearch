"use client"

import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { reelUrlSchema } from "@/lib/validators"

interface ReelFormProps {
  onSubmitted?: (reelId: string) => void
}

export function ReelForm({ onSubmitted }: ReelFormProps) {
  const [url, setUrl] = useState("")
  const [bulkText, setBulkText] = useState("")
  const [isBulk, setIsBulk] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { toast } = useToast()

  const bulkUrls = bulkText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  async function handleSingleSubmit() {
    const parsed = reelUrlSchema.safeParse(url)
    if (!parsed.success) {
      setValidationError(parsed.error.errors[0]?.message ?? "Invalid URL")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: parsed.data }),
      })

      if (response.status === 201) {
        const body = await response.json().catch(() => null)
        toast("Reel submitted! Processing started.", "success")
        setUrl("")
        if (body?.reel?.id) onSubmitted?.(body.reel.id)
        return
      }

      if (response.status === 200) {
        toast("This reel already exists.", "info")
        return
      }

      const body = await response.json().catch(() => null)
      toast(body?.error ?? "Something went wrong.", "error")
    } catch {
      toast("Network error. Please check your connection.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleBulkSubmit() {
    if (bulkUrls.length === 0) {
      setValidationError("Enter at least one URL")
      return
    }
    if (bulkUrls.length > 20) {
      setValidationError("Maximum 20 URLs per batch")
      return
    }

    // Validate each URL client-side
    const invalid = bulkUrls.filter((u) => !reelUrlSchema.safeParse(u).success)
    if (invalid.length > 0) {
      setValidationError(
        `${invalid.length} invalid URL${invalid.length > 1 ? "s" : ""}: ${invalid[0]}`,
      )
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/reels/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: bulkUrls }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        toast(body?.error ?? "Bulk submit failed.", "error")
        return
      }

      const result = await response.json()
      const parts: string[] = []
      if (result.submitted?.length) parts.push(`${result.submitted.length} submitted`)
      if (result.duplicates?.length) parts.push(`${result.duplicates.length} duplicate`)
      if (result.errors?.length) parts.push(`${result.errors.length} failed`)

      toast(parts.join(", "), result.errors?.length ? "info" : "success")
      setBulkText("")

      if (result.submitted?.[0]?.id) {
        onSubmitted?.(result.submitted[0].id)
      }
    } catch {
      toast("Network error. Please check your connection.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setValidationError(null)
    if (isBulk) {
      handleBulkSubmit()
    } else {
      handleSingleSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-2">
      {isBulk ? (
        <div className="space-y-2">
          <textarea
            value={bulkText}
            onChange={(e) => {
              setBulkText(e.target.value)
              if (validationError) setValidationError(null)
            }}
            placeholder={"Paste one URL per line...\nhttps://www.instagram.com/reel/ABC123\nhttps://www.youtube.com/shorts/xyz"}
            disabled={isSubmitting}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Reel URLs (one per line)"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {bulkUrls.length} URL{bulkUrls.length !== 1 ? "s" : ""} (max 20)
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsBulk(false)
                  setValidationError(null)
                }}
              >
                Single
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || bulkUrls.length === 0}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    Submitting...
                  </span>
                ) : (
                  `Submit ${bulkUrls.length} URL${bulkUrls.length !== 1 ? "s" : ""}`
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (validationError) setValidationError(null)
            }}
            placeholder="Paste a video URL (Instagram, YouTube, X, Reddit, Facebook)..."
            disabled={isSubmitting}
            aria-label="Reel URL"
            className="flex-1"
          />
          <Button type="submit" disabled={isSubmitting || url.trim().length === 0}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Submitting...
              </span>
            ) : (
              "Submit"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsBulk(true)
              setValidationError(null)
            }}
            className="shrink-0"
          >
            Bulk
          </Button>
        </div>
      )}
      {validationError && (
        <p className="text-sm text-destructive" role="alert">
          {validationError}
        </p>
      )}
    </form>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
