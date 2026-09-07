-- 0003_unique_parcels_request_id.sql

-- Add UNIQUE constraint on parcels.request_id to prevent duplicate parcels per request
ALTER TABLE parcels ADD CONSTRAINT parcels_request_id_unique UNIQUE (request_id);
