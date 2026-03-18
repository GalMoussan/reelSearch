"use client"

import { FolderOpen, Trash2, Pencil } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  useCollections,
  useDeleteCollection,
  useUpdateCollection,
} from "@/hooks/use-collections"
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog"

export default function CollectionsPage() {
  const { data: collections, isLoading } = useCollections()
  const deleteCollection = useDeleteCollection()
  const updateCollection = useUpdateCollection()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  function handleStartEdit(id: string, name: string) {
    setEditingId(id)
    setEditName(name)
  }

  function handleSaveEdit(id: string) {
    if (editName.trim()) {
      updateCollection.mutate({ id, name: editName.trim() })
    }
    setEditingId(null)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Collections</h1>
        <CreateCollectionDialog
          trigger={
            <Button>New Collection</Button>
          }
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : !collections?.length ? (
        <div className="py-16 text-center text-muted-foreground">
          <FolderOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No collections yet</p>
          <p className="text-sm mt-1">Create a collection to organize your reels.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Card key={collection.id} className="group relative overflow-hidden">
              {collection.color && (
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: collection.color }}
                />
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  {editingId === collection.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSaveEdit(collection.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(collection.id)
                        if (e.key === "Escape") setEditingId(null)
                      }}
                      className="h-8 text-sm"
                      autoFocus
                    />
                  ) : (
                    <Link href={`/?collection=${collection.id}`} className="flex-1">
                      <h3 className="font-semibold hover:underline">
                        {collection.name}
                      </h3>
                    </Link>
                  )}

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleStartEdit(collection.id, collection.name)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteCollection.mutate(collection.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {collection.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {collection.description}
                  </p>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  {collection.reelCount} {collection.reelCount === 1 ? "reel" : "reels"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
