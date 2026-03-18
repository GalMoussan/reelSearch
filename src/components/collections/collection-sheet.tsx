"use client"

import { Library } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CollectionSidebar } from "./collection-sidebar"

interface CollectionSheetProps {
  activeCollectionId: string | null
  onSelectCollection: (id: string | null) => void
}

export function CollectionSheet({
  activeCollectionId,
  onSelectCollection,
}: CollectionSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 md:hidden">
          <Library className="h-4 w-4" />
          Collections
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Collections</SheetTitle>
        </SheetHeader>
        <CollectionSidebar
          activeCollectionId={activeCollectionId}
          onSelectCollection={onSelectCollection}
        />
      </SheetContent>
    </Sheet>
  )
}
