"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguages } from "@/hooks/use-languages"

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "DONE", "FAILED"] as const

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  DONE: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  FAILED: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
}

export interface FilterBarValues {
  language?: string
  dateFrom?: string
  dateTo?: string
  status?: string
}

interface FilterBarProps {
  values: FilterBarValues
  onChange: (values: FilterBarValues) => void
}

export function FilterBar({ values, onChange }: FilterBarProps) {
  const { data: languages } = useLanguages()

  const hasActiveFilters = Boolean(
    values.language || values.dateFrom || values.dateTo || values.status,
  )

  function handleStatusToggle(status: string) {
    onChange({
      ...values,
      status: values.status === status ? undefined : status,
    })
  }

  function handleClear() {
    onChange({ language: undefined, dateFrom: undefined, dateTo: undefined, status: undefined })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((s) => (
          <Badge
            key={s}
            variant="outline"
            className={`cursor-pointer text-xs transition-colors ${
              values.status === s
                ? STATUS_STYLES[s]
                : "hover:bg-muted"
            }`}
            onClick={() => handleStatusToggle(s)}
          >
            {s}
          </Badge>
        ))}
      </div>

      {/* Language select */}
      {languages && languages.length > 0 && (
        <Select
          value={values.language ?? "__all__"}
          onValueChange={(v) =>
            onChange({ ...values, language: v === "__all__" ? undefined : v })
          }
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All languages</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Date range */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={values.dateFrom ?? ""}
          onChange={(e) =>
            onChange({ ...values, dateFrom: e.target.value || undefined })
          }
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          aria-label="From date"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          type="date"
          value={values.dateTo ?? ""}
          onChange={(e) =>
            onChange({ ...values, dateTo: e.target.value || undefined })
          }
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          aria-label="To date"
        />
      </div>

      {/* Clear button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-7 gap-1 px-2 text-xs text-muted-foreground"
        >
          <X className="h-3 w-3" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
