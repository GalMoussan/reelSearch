"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTags } from "@/hooks/use-tags"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onTagSelect?: (tagName: string) => void
  placeholder?: string
  loading?: boolean
}

export function SearchBar({
  value,
  onChange,
  onTagSelect,
  placeholder = "Search reels...",
  loading = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: tags } = useTags()

  // Update local value when prop changes (e.g., from parent reset)
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounce onChange calls
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(localValue)
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [localValue, onChange])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
    setShowSuggestions(e.target.value.length >= 2)
  }

  const handleClear = () => {
    setLocalValue("")
    onChange("")
    setShowSuggestions(false)
  }

  const handleTagClick = (tagName: string) => {
    onTagSelect?.(tagName)
    setLocalValue("")
    onChange("")
    setShowSuggestions(false)
  }

  // Filter tags client-side
  const matchingTags = localValue.length >= 2 && tags
    ? tags
        .filter((t) => t.name.includes(localValue.toLowerCase()))
        .slice(0, 8)
    : []

  return (
    <div ref={containerRef} className="relative flex flex-col">
      <div className="relative flex items-center">
        {/* Search icon on the left */}
        <Search
          className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />

        {/* Input field */}
        <Input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          onFocus={() => localValue.length >= 2 && setShowSuggestions(true)}
          className="pl-9 pr-12"
          aria-label="Search reels"
          role="searchbox"
        />

        {/* Loading spinner (visible when loading prop is true) */}
        {loading && (
          <Loader2
            className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}

        {/* Clear button (visible when input has text and not loading) */}
        {!loading && localValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-0 h-10 w-10 p-0 hover:bg-transparent"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
      </div>

      {/* Tag suggestions dropdown */}
      {showSuggestions && matchingTags.length > 0 && onTagSelect && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-2 shadow-md">
          <p className="mb-1.5 text-xs text-muted-foreground px-1">Filter by tag:</p>
          <div className="flex flex-wrap gap-1.5">
            {matchingTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/60"
                onClick={() => handleTagClick(tag.name)}
              >
                #{tag.name}
                <span className="ml-1 text-muted-foreground">({tag.count})</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
