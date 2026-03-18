interface ExportableReel {
  title: string | null
  url: string
  createdAt: string
  language: string | null
  tags: Array<{ name: string }>
  summary: string | null
  transcript: string | null
}

export function formatReelAsMarkdown(
  reel: ExportableReel,
  notes?: string | null,
): string {
  const lines: string[] = []

  lines.push(`# ${reel.title ?? "Untitled Reel"}`)
  lines.push("")
  lines.push(`**URL:** ${reel.url}`)
  lines.push(
    `**Date:** ${new Date(reel.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
  )

  if (reel.language) {
    lines.push(`**Language:** ${reel.language}`)
  }

  if (reel.tags.length > 0) {
    lines.push(`**Tags:** ${reel.tags.map((t) => t.name).join(", ")}`)
  }

  if (reel.summary) {
    lines.push("")
    lines.push("## Summary")
    lines.push("")
    lines.push(reel.summary)
  }

  if (reel.transcript) {
    lines.push("")
    lines.push("## Transcript")
    lines.push("")
    lines.push(reel.transcript)
  }

  if (notes) {
    lines.push("")
    lines.push("## Notes")
    lines.push("")
    lines.push(notes)
  }

  lines.push("")

  return lines.join("\n")
}

export function downloadAsMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
