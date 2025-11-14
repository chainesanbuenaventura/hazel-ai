-- Add webhook_response column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS webhook_response JSONB;

-- Add index for better performance on webhook_response queries
CREATE INDEX IF NOT EXISTS idx_campaigns_webhook_response 
ON campaigns USING GIN (webhook_response);

-- Update existing campaigns to have null webhook_response
UPDATE campaigns 
SET webhook_response = NULL 
WHERE webhook_response IS NULL;
