"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  loading?: boolean
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search reels...",
  loading = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }

  const handleClear = () => {
    setLocalValue("")
    onChange("")
  }

  return (
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
  )
}
