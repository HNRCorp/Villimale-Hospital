-- Drop existing policies on the 'users' table to avoid conflicts and ensure a clean slate
DROP POLICY IF EXISTS "Authenticated users can read all users" ON public.users;
DROP POLICY IF EXISTS "System and Inventory Managers can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile and managers can update all" ON public.users;
DROP POLICY IF EXISTS "System and Inventory Managers can delete users" ON public.users;

-- Drop the security definer functions if they exist to allow recreation
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_inventory_manager();

-- Create a function to check if the current user is an admin, bypassing RLS on 'users' table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- This is crucial: runs with definer's privileges, bypassing RLS on 'users'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'system_administrator'
  );
END;
$$;

-- Create a function to check if the current user is an inventory manager, bypassing RLS on 'users' table
CREATE OR REPLACE FUNCTION public.is_inventory_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'inventory_manager'
  );
END;
$$;

-- Enable Row Level Security for the 'users' table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Authenticated users can read all user data
CREATE POLICY "Authenticated users can read all users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Policy for INSERT: Only system_administrator or inventory_manager can create new users
CREATE POLICY "System and Inventory Managers can insert users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin() OR public.is_inventory_manager()
);

-- Policy for UPDATE: Users can update their own profile, and system_administrator/inventory_manager can update any user
CREATE POLICY "Users can update their own profile and managers can update all"
ON public.users
FOR UPDATE
TO authenticated
USING (
    auth.uid() = id::uuid OR public.is_admin() OR public.is_inventory_manager()
)
WITH CHECK (
    auth.uid() = id::uuid OR public.is_admin() OR public.is_inventory_manager()
);

-- Policy for DELETE: Only system_administrator or inventory_manager can delete users
CREATE POLICY "System and Inventory Managers can delete users"
ON public.users
FOR DELETE
TO authenticated
USING (
    public.is_admin() OR public.is_inventory_manager()
);
