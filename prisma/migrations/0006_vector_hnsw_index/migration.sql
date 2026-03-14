-- Create HNSW index for fast approximate nearest-neighbor vector search
CREATE INDEX IF NOT EXISTS "Reel_embedding_idx" ON "Reel"
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
