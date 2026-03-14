import { Film, Link2, Sparkles, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  variant?: "initial" | "filtered" | "search"
  searchQuery?: string
  onClearFilters?: () => void
}

const STEPS = [
  {
    icon: Link2,
    label: "Paste a reel URL",
    description: "Drop an Instagram or TikTok link into the input above",
  },
  {
    icon: Sparkles,
    label: "AI processes it",
    description: "We extract the transcript, generate tags, and create a summary",
  },
  {
    icon: Search,
    label: "Search & discover",
    description: "Find any reel instantly by topic, keyword, or natural language",
  },
] as const

export function EmptyState({ variant = "initial", searchQuery, onClearFilters }: EmptyStateProps) {
  if (variant === "search") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-semibold">
          No results{searchQuery ? ` for "${searchQuery}"` : ""}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Try different keywords or use AI Search for natural language queries.
        </p>
        {onClearFilters && (
          <Button variant="outline" className="mt-4" onClick={onClearFilters}>
            Clear search
          </Button>
        )}
      </div>
    )
  }

  if (variant === "filtered") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-semibold">No reels match your filters</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Try adjusting your search terms or removing some filters to see more results.
        </p>
        {onClearFilters && (
          <Button variant="outline" className="mt-4" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Film className="h-12 w-12 text-muted-foreground/50" />
      <h2 className="mt-4 text-lg font-semibold">No reels yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Get started by adding your first reel. Here is how it works:
      </p>

      <div className="mt-8 grid w-full max-w-lg gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.label}
            className="flex flex-col items-center gap-2 rounded-lg border p-4"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <step.icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Step {i + 1}
            </span>
            <h3 className="text-sm font-semibold">{step.label}</h3>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
