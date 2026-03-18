"use client"

import { FolderPlus, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useCollections,
  useReelCollections,
  useAddReelToCollection,
  useRemoveReelFromCollection,
} from "@/hooks/use-collections"
import { CreateCollectionDialog } from "./create-collection-dialog"

interface AddToCollectionDropdownProps {
  reelId: string
  variant?: "icon" | "button"
}

export function AddToCollectionDropdown({ reelId, variant = "icon" }: AddToCollectionDropdownProps) {
  const { data: collections } = useCollections()
  const { data: reelCollectionIds } = useReelCollections(reelId)
  const addToCollection = useAddReelToCollection()
  const removeFromCollection = useRemoveReelFromCollection()

  function handleToggle(collectionId: string) {
    const isInCollection = reelCollectionIds?.includes(collectionId)

    if (isInCollection) {
      removeFromCollection.mutate({ collectionId, reelId })
    } else {
      addToCollection.mutate({ collectionId, reelId })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "button" ? (
          <Button variant="outline" size="sm" className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Add to Collection
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FolderPlus className="h-4 w-4" />
            <span className="sr-only">Add to collection</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {collections && collections.length > 0 ? (
          <>
            {collections.map((collection) => {
              const isInCollection = reelCollectionIds?.includes(collection.id)
              return (
                <DropdownMenuItem
                  key={collection.id}
                  onClick={(e) => {
                    e.preventDefault()
                    handleToggle(collection.id)
                  }}
                  className="gap-2"
                >
                  {collection.color && (
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: collection.color }}
                    />
                  )}
                  <span className="flex-1 truncate">{collection.name}</span>
                  {isInCollection && <Check className="h-4 w-4 shrink-0" />}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
          </>
        ) : null}
        <CreateCollectionDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <span className="text-sm">+ New Collection</span>
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
