-- Remove image_url and add cost_vnd
ALTER TABLE meals DROP COLUMN image_url;
ALTER TABLE meals ADD COLUMN cost_vnd INTEGER;

-- Drop the security tables as they are no longer needed for uploads
DROP TABLE IF EXISTS upload_requests CASCADE;
DROP TABLE IF EXISTS admin_alerts CASCADE;
