"use client"

import { FolderOpen, Library, Trash2, Pencil } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  useCollections,
  useDeleteCollection,
  useUpdateCollection,
} from "@/hooks/use-collections"
import { CreateCollectionDialog } from "./create-collection-dialog"

interface CollectionSidebarProps {
  activeCollectionId: string | null
  onSelectCollection: (id: string | null) => void
}

export function CollectionSidebar({
  activeCollectionId,
  onSelectCollection,
}: CollectionSidebarProps) {
  const { data: collections, isLoading } = useCollections()
  const deleteCollection = useDeleteCollection()
  const updateCollection = useUpdateCollection()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  function handleStartEdit(e: React.MouseEvent, id: string, name: string) {
    e.stopPropagation()
    setEditingId(id)
    setEditName(name)
  }

  function handleSaveEdit(id: string) {
    if (editName.trim()) {
      updateCollection.mutate({ id, name: editName.trim() })
    }
    setEditingId(null)
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (activeCollectionId === id) {
      onSelectCollection(null)
    }
    deleteCollection.mutate(id)
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Collections
        </h2>
      </div>

      <Separator />

      <nav className="flex-1 overflow-y-auto p-2">
        {/* All Reels */}
        <button
          onClick={() => onSelectCollection(null)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeCollectionId === null
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          )}
        >
          <Library className="h-4 w-4 shrink-0" />
          All Reels
        </button>

        {isLoading ? (
          <div className="space-y-1 mt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : (
          <div className="mt-1 space-y-0.5">
            {collections?.map((collection) => (
              <div
                key={collection.id}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
                  activeCollectionId === collection.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
                onClick={() => onSelectCollection(collection.id)}
              >
                {collection.color ? (
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: collection.color }}
                  />
                ) : (
                  <FolderOpen className="h-4 w-4 shrink-0" />
                )}

                {editingId === collection.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleSaveEdit(collection.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(collection.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    className="h-6 text-sm px-1"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="flex-1 truncate">{collection.name}</span>
                    <span className="text-xs text-muted-foreground/60">
                      {collection.reelCount}
                    </span>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => handleStartEdit(e, collection.id, collection.name)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(e, collection.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>

      <Separator />

      <div className="p-2">
        <CreateCollectionDialog />
      </div>
    </aside>
  )
}
