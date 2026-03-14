-- Fix table name: _ReelTags -> _ReelToTag (Prisma implicit many-to-many convention)
ALTER TABLE IF EXISTS "_ReelTags" RENAME TO "_ReelToTag";

-- Rename indexes and constraints for the renamed table
ALTER INDEX IF EXISTS "_ReelTags_AB_pkey" RENAME TO "_ReelToTag_AB_pkey";
ALTER INDEX IF EXISTS "_ReelTags_B_index" RENAME TO "_ReelToTag_B_index";

-- Rename foreign key constraints
ALTER TABLE "_ReelToTag" RENAME CONSTRAINT "_ReelTags_A_fkey" TO "_ReelToTag_A_fkey";
ALTER TABLE "_ReelToTag" RENAME CONSTRAINT "_ReelTags_B_fkey" TO "_ReelToTag_B_fkey";

-- Fix column name: addedBy -> addedById
ALTER TABLE "Reel" RENAME COLUMN "addedBy" TO "addedById";

-- Rename foreign key constraint to match new column name
ALTER TABLE "Reel" DROP CONSTRAINT IF EXISTS "Reel_addedBy_fkey";
ALTER TABLE "Reel" ADD CONSTRAINT "Reel_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add missing updatedAt column
ALTER TABLE "Reel" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add missing status index
CREATE INDEX IF NOT EXISTS "Reel_status_idx" ON "Reel"("status");

-- Add missing createdAt index
CREATE INDEX IF NOT EXISTS "Reel_createdAt_idx" ON "Reel"("createdAt");
