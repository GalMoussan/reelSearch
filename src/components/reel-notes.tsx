"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Loader2 } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ReelNotesProps {
  reelId: string
}

type SaveStatus = "idle" | "saving" | "saved"

export function ReelNotes({ reelId }: ReelNotesProps) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef(false)

  const { data: noteData } = useQuery<{ content: string } | null>({
    queryKey: ["reel-note", reelId],
    queryFn: async () => {
      const res = await fetch(`/api/reels/${reelId}/notes`)
      if (!res.ok) throw new Error("Failed to fetch note")
      const json = await res.json()
      return json.data
    },
  })

  // Initialize content from fetched data
  useEffect(() => {
    if (noteData && !initializedRef.current) {
      setContent(noteData.content)
      initializedRef.current = true
    } else if (noteData === null && !initializedRef.current) {
      initializedRef.current = true
    }
  }, [noteData])

  const saveMutation = useMutation({
    mutationFn: async (newContent: string) => {
      const res = await fetch(`/api/reels/${reelId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      })
      if (!res.ok) throw new Error("Failed to save note")
      return res.json()
    },
    onMutate: () => {
      setSaveStatus("saving")
    },
    onSuccess: () => {
      setSaveStatus("saved")
      queryClient.invalidateQueries({ queryKey: ["reel-note", reelId] })
      setTimeout(() => setSaveStatus("idle"), 2000)
    },
    onError: () => {
      setSaveStatus("idle")
    },
  })

  const debouncedSave = useCallback(
    (newContent: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        saveMutation.mutate(newContent)
      }, 1500)
    },
    [saveMutation],
  )

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newContent = e.target.value
    setContent(newContent)
    debouncedSave(newContent)
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="reel-notes">Notes</Label>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Saved
            </>
          )}
        </span>
      </div>
      <Textarea
        id="reel-notes"
        value={content}
        onChange={handleChange}
        placeholder="Add your notes about this reel..."
        rows={4}
        maxLength={5000}
        className="resize-y"
      />
    </div>
  )
}
