-- Add latitude and longitude columns to uploads table for heatmap functionality
-- Run this in your Supabase SQL editor

ALTER TABLE uploads
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Optional: Add an index for better performance on location queries
CREATE INDEX IF NOT EXISTS idx_uploads_location ON uploads(latitude, longitude);