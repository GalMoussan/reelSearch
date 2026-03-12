"use client"
import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReelStatus } from "@/hooks/use-reel-status"

interface ProcessingStatusProps {
  reelId: string | null
}

export function ProcessingStatus({ reelId }: ProcessingStatusProps) {
  const { data: reel, isLoading } = useReelStatus(reelId)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (reel?.status === "DONE") {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [reel?.status])

  // Don't render if no reelId
  if (!reelId) return null

  // Don't render if query hasn't started
  if (!isLoading && !reel) return null

  const status = reel?.status

  return (
    <div
      className={cn(
        "mt-4 overflow-hidden transition-all duration-300 ease-out",
        showSuccess || status
          ? "max-h-20 opacity-100"
          : "max-h-0 opacity-0"
      )}
    >
      <div className="rounded-lg border p-3 text-sm">
        {status === "PENDING" && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            <span className="text-gray-700">Queued for processing...</span>
          </div>
        )}

        {status === "PROCESSING" && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span
                className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
            <span className="text-gray-700">Processing reel...</span>
          </div>
        )}

        {status === "DONE" && showSuccess && (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-700 font-medium">Ready!</span>
          </div>
        )}

        {status === "FAILED" && (
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-red-700 font-medium">Processing failed</p>
              {reel?.error && (
                <p className="text-xs text-red-600 mt-1">{reel.error}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
