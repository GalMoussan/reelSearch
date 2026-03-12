"use client"

import { useTags } from "@/hooks/use-tags"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface TagFilterBarProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagFilterBar({ selectedTags, onTagsChange }: TagFilterBarProps) {
  const { data: tags = [], isLoading } = useTags()

  if (!isLoading && tags.length === 0) {
    return null
  }

  const handleTagClick = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const handleClearAll = () => {
    onTagsChange([])
  }

  return (
    <div className="space-y-2">
      {/* Scrollable tag container */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {isLoading
          ? // Skeleton badges while loading
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-20 animate-pulse rounded-full bg-muted flex-shrink-0"
              />
            ))
          : // Actual tag badges
            tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.id)}
                  className="flex-shrink-0 focus:outline-none"
                >
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected && "hover:bg-primary/80",
                      !isSelected && "hover:bg-accent"
                    )}
                  >
                    {tag.name} ({tag.count})
                  </Badge>
                </button>
              )
            })}
      </div>

      {/* Clear all button */}
      {selectedTags.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-8 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
