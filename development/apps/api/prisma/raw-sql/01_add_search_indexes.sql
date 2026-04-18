-- Comment 1: Full-text search searchVector column has no GIN index — every search query scans the entire Listings table.
-- Run this in your Supabase SQL Editor or via Prisma db execute.

CREATE INDEX listing_search_vector_gin ON "Listing" USING GIN ("searchVector");
CREATE INDEX listing_title_gin ON "Listing" USING GIN (to_tsvector('english', title));
