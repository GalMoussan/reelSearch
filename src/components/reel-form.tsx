"use client"

import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { reelUrlSchema } from "@/lib/validators"

export function ReelForm() {
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setValidationError(null)

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
        toast("Reel submitted! Processing started.", "success")
        setUrl("")
        return
      }

      if (response.status === 200) {
        toast("This reel already exists.", "info")
        return
      }

      const body = await response.json().catch(() => null)
      const message =
        body?.error ?? body?.message ?? "Something went wrong. Please try again."
      toast(message, "error")
    } catch {
      toast("Network error. Please check your connection.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-2">
      <div className="flex gap-2">
        <Input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (validationError) setValidationError(null)
          }}
          placeholder="Paste Instagram Reel URL..."
          disabled={isSubmitting}
          aria-label="Instagram Reel URL"
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
      </div>
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
