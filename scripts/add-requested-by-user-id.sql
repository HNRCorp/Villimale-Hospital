-- Migration: Add requested_by_user_id to requests table
-- This script adds a new column to link requests directly to users by their UUID.

-- Add the new column
ALTER TABLE requests
ADD COLUMN requested_by_user_id UUID;

-- Add foreign key constraint (optional, but recommended for data integrity)
-- This assumes a 'users' table with an 'id' column of type UUID.
-- If your 'users' table is named differently or has a different primary key type, adjust accordingly.
ALTER TABLE requests
ADD CONSTRAINT fk_requested_by_user
FOREIGN KEY (requested_by_user_id) REFERENCES users(id)
ON DELETE SET NULL; -- Or ON DELETE CASCADE, depending on your desired behavior

-- Optional: Backfill existing requests with a user ID if possible (e.g., from a known admin user)
-- This step is highly dependent on your existing data and how you want to migrate it.
-- You might need to adjust the user ID based on your actual 'admin' user's UUID.
-- SELECT id FROM users WHERE email = 'admin@villimale-hospital.mv'; -- Run this to get the admin UUID
-- UPDATE requests
-- SET requested_by_user_id = '00000000-0000-0000-0000-000000000001' -- Replace with actual admin UUID
-- WHERE requested_by_user_id IS NULL;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_requests_requested_by_user_id ON requests(requested_by_user_id);

-- Update RLS policy for requests to allow users to create requests linked to their ID
-- First, drop existing policies that might conflict or need updating
DROP POLICY IF EXISTS "Authorized users can manage requests" ON requests;
DROP POLICY IF EXISTS "Users can create requests" ON requests;
DROP POLICY IF EXISTS "Allow users to view their own requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to read all requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to update their own requests" ON requests;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own requests" ON requests;

-- Re-add policies with consideration for the new column and user ID
-- Policy for users to view all requests (can be refined later to only view their own/department's)
CREATE POLICY "Users can view requests" ON requests FOR SELECT USING (true);

-- Policy for users to create requests, ensuring requested_by_user_id matches their auth.uid()
CREATE POLICY "Users can create requests linked to their ID" ON requests FOR INSERT WITH CHECK (
    requested_by_user_id = auth.uid()
);

-- Policy for authorized users (e.g., Inventory Managers, Admins) to manage requests
-- This policy allows full access for users with 'Full Access' or 'Approve Requests' permissions
-- You might need to adjust the permission check based on your actual user roles/permissions structure
CREATE POLICY "Authorized users can manage requests" ON requests FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND (permissions ? 'Full Access' OR permissions ? 'Approve Requests') -- Assuming 'permissions' is a JSONB column
    )
);

-- Ensure RLS is enabled for the table
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Column requested_by_user_id added to requests table successfully!';
    RAISE NOTICE '✅ RLS policies for requests updated to include requested_by_user_id check.';
END $$;
