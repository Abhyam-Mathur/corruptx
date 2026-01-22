-- Add campaign_request_id and campaign_pending columns to uploads table
-- Run this in your Supabase SQL editor

ALTER TABLE uploads
ADD COLUMN IF NOT EXISTS campaign_request_id uuid REFERENCES campaign_requests(id),
ADD COLUMN IF NOT EXISTS campaign_pending boolean DEFAULT false;

-- Optional: Add index for performance
CREATE INDEX IF NOT EXISTS idx_uploads_campaign_request_id ON uploads(campaign_request_id);
CREATE INDEX IF NOT EXISTS idx_uploads_campaign_pending ON uploads(campaign_pending);