-- Migration: Add image URL columns to users and update products
-- Description: Add profile_image to users table and update products images structure

-- Add profile_image column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_profile_image ON users(profile_image);

-- Note: products table already has images JSONB column
-- We'll keep it as JSONB array of image URLs for multiple product images
-- Example: ["https://res.cloudinary.com/...", "https://res.cloudinary.com/..."]

-- Add comment to clarify the images column usage
COMMENT ON COLUMN products.images IS 'JSONB array of Cloudinary image URLs';
