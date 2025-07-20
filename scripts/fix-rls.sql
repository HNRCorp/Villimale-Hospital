-- This script fixes the "infinite recursion detected in policy for relation users"
-- and "operator does not exist: text = uuid" errors by:
-- 1. Dropping existing problematic RLS policies.
-- 2. Creating SECURITY DEFINER functions to safely check user roles.
-- 3. Re-applying RLS policies using these safe functions.

-- IMPORTANT: Run this script in your Supabase SQL Editor.

-- Step 1: Drop existing RLS policies on the 'users' table to avoid conflicts
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow system administrators to manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow system administrators to insert users" ON public.users;
DROP POLICY IF EXISTS "Allow system administrators to delete users" ON public.users;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 2: Create helper functions to check user roles safely
-- These functions are SECURITY DEFINER, meaning they run with the privileges
-- of the user who created them (typically the database owner/admin),
-- bypassing RLS on the 'users' table itself when called from policies.

-- Function to check if the current user is a System Administrator
CREATE OR REPLACE FUNCTION public.is_system_administrator()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'System Administrator'
  );
END;
$$;

-- Function to check if the current user is an Inventory Manager
CREATE OR REPLACE FUNCTION public.is_inventory_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'Inventory Manager'
  );
END;
$$;

-- Function to check if the current user is a Doctor
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'Doctor'
  );
END;
$$;

-- Function to check if the current user is a Nurse
CREATE OR REPLACE FUNCTION public.is_nurse()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'Nurse'
  );
END;
$$;

-- Function to check if the current user is a Pharmacist
CREATE OR REPLACE FUNCTION public.is_pharmacist()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'Pharmacist'
  );
END;
$$;

-- Step 3: Re-apply RLS policies using the new safe functions

-- Policy for SELECT on users table
CREATE POLICY "Allow authenticated users to read their own profile and admins to read all"
ON public.users FOR SELECT
TO authenticated
USING (
  (auth.uid() = id) OR public.is_system_administrator()
);

-- Policy for INSERT on users table
CREATE POLICY "Allow system administrators to insert users"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (
  public.is_system_administrator()
);

-- Policy for UPDATE on users table
CREATE POLICY "Allow authenticated users to update their own profile and admins to update all"
ON public.users FOR UPDATE
TO authenticated
USING (
  (auth.uid() = id) OR public.is_system_administrator()
)
WITH CHECK (
  (auth.uid() = id) OR public.is_system_administrator()
);

-- Policy for DELETE on users table
CREATE POLICY "Allow system administrators to delete users"
ON public.users FOR DELETE
TO authenticated
USING (
  public.is_system_administrator()
);

-- Policies for inventory_items table
-- Drop existing policies first to avoid conflicts
ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access to inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow inventory managers and admins to manage inventory items" ON public.inventory_items;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access to inventory items"
ON public.inventory_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow inventory managers and admins to manage inventory items"
ON public.inventory_items FOR ALL
TO authenticated
USING (
  public.is_system_administrator() OR public.is_inventory_manager()
)
WITH CHECK (
  public.is_system_administrator() OR public.is_inventory_manager()
);

-- Policies for requests table
-- Drop existing policies first to avoid conflicts
ALTER TABLE public.requests DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access to requests" ON public.requests;
DROP POLICY IF EXISTS "Allow relevant roles to manage requests" ON public.requests;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access to requests"
ON public.requests FOR SELECT
TO authenticated
USING (
  (auth.uid() = requested_by_user_id) OR
  public.is_system_administrator() OR
  public.is_inventory_manager() OR
  public.is_doctor() OR
  public.is_nurse() OR
  public.is_pharmacist()
);

CREATE POLICY "Allow relevant roles to manage requests"
ON public.requests FOR ALL
TO authenticated
USING (
  public.is_system_administrator() OR
  public.is_inventory_manager() OR
  public.is_doctor() OR
  public.is_nurse() OR
  public.is_pharmacist()
)
WITH CHECK (
  public.is_system_administrator() OR
  public.is_inventory_manager() OR
  public.is_doctor() OR
  public.is_nurse() OR
  public.is_pharmacist()
);

-- Policies for orders table
-- Drop existing policies first to avoid conflicts
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow inventory managers and admins to manage orders" ON public.orders;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access to orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  public.is_system_administrator() OR
  public.is_inventory_manager()
);

CREATE POLICY "Allow inventory managers and admins to manage orders"
ON public.orders FOR ALL
TO authenticated
USING (
  public.is_system_administrator() OR
  public.is_inventory_manager()
)
WITH CHECK (
  public.is_system_administrator() OR
  public.is_inventory_manager()
);

-- Policies for releases table
-- Drop existing policies first to avoid conflicts
ALTER TABLE public.releases DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read access to releases" ON public.releases;
DROP POLICY IF EXISTS "Allow inventory managers and admins to manage releases" ON public.releases;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access to releases"
ON public.releases FOR SELECT
TO authenticated
USING (
  public.is_system_administrator() OR
  public.is_inventory_manager() OR
  public.is_doctor() OR
  public.is_nurse() OR
  public.is_pharmacist()
);

CREATE POLICY "Allow inventory managers and admins to manage releases"
ON public.releases FOR ALL
TO authenticated
USING (
  public.is_system_administrator() OR
  public.is_inventory_manager() OR
  public.is_doctor() OR
  public.is_nurse() OR
  public.is_pharmacist()
)
WITH CHECK (
  public.is_system_administrator() OR
  public.is_inventory_manager() OR
  public.is_doctor() OR
  public.is_nurse() OR
  public.is_pharmacist()
);
