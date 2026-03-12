import { ReelForm } from "@/components/reel-form"
import { ReelGrid } from "@/components/reel-grid"

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 pt-16 pb-24">
      <section className="flex flex-col items-center gap-4 text-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Save &amp; Search Instagram Reels
        </h1>
        <p className="text-lg text-muted-foreground">
          Paste a reel URL to save it. We&apos;ll transcribe, summarize, and make
          it searchable so you can find it later.
        </p>
      </section>

      <ReelForm />

      <section className="w-full max-w-7xl px-4">
        <ReelGrid />
      </section>
    </div>
  )
}
