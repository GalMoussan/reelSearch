-- CreateIndex (Full-Text Search)
CREATE INDEX IF NOT EXISTS "Reel_fts_idx" ON "Reel" USING GIN (
  to_tsvector('english', COALESCE(transcript, '') || ' ' || COALESCE(summary, ''))
);
