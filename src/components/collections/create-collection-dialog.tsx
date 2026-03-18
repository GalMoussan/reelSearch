"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateCollection } from "@/hooks/use-collections"

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // violet
]

interface CreateCollectionDialogProps {
  trigger?: React.ReactNode
}

export function CreateCollectionDialog({ trigger }: CreateCollectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState<string>(PRESET_COLORS[4])

  const createCollection = useCreateCollection()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    createCollection.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setName("")
          setDescription("")
          setColor(PRESET_COLORS[4])
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Collection
        </Button>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
          <DialogDescription>
            Organize your reels into themed collections.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collection-name">Name</Label>
            <Input
              id="collection-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cooking Tips"
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection-description">Description (optional)</Label>
            <Textarea
              id="collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection about?"
              maxLength={500}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    color === c ? "scale-110 border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || createCollection.isPending}
            >
              {createCollection.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
