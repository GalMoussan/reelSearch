-- Update FTS GIN index to include title field
DROP INDEX IF EXISTS "Reel_fts_idx";
CREATE INDEX "Reel_fts_idx" ON "Reel" USING GIN (
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(transcript, '') || ' ' || COALESCE(summary, ''))
);
