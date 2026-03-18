"use client"

import { Download, Copy, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatReelAsMarkdown, downloadAsMarkdown } from "@/lib/reel-export"
import { useToast } from "@/components/ui/toast"

interface ExportableReel {
  id: string
  title: string | null
  url: string
  createdAt: string
  language: string | null
  tags: Array<{ name: string }>
  summary: string | null
  transcript: string | null
}

interface ReelExportButtonProps {
  reel: ExportableReel
  notes?: string | null
  variant?: "icon" | "button"
}

export function ReelExportButton({ reel, notes, variant = "button" }: ReelExportButtonProps) {
  const { toast } = useToast()

  const markdown = formatReelAsMarkdown(reel, notes)
  const filename = `${(reel.title ?? "reel").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.md`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown)
      toast("Copied to clipboard as Markdown")
    } catch {
      toast("Failed to copy to clipboard", "error")
    }
  }

  function handleDownload() {
    downloadAsMarkdown(filename, markdown)
    toast(`Downloaded ${filename}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "button" ? (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Export
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Export</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download .md
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
