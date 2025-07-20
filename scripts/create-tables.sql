-- scripts/create-tables.sql
-- Comprehensive SQL script to create all necessary tables for the Villimale Hospital Inventory App

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Store bcrypt hash here
    role TEXT NOT NULL, -- e.g., 'admin', 'doctor', 'nurse', 'pharmacist', 'staff'
    status TEXT NOT NULL DEFAULT 'Active', -- e.g., 'Active', 'Inactive', 'Locked', 'Pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    first_login BOOLEAN DEFAULT TRUE
);

-- 2. Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    unit_of_measure TEXT NOT NULL,
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE,
    status TEXT NOT NULL DEFAULT 'In Stock', -- e.g., 'In Stock', 'Low Stock', 'Critical', 'Expired', 'Out of Stock'
    location TEXT,
    supplier TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requested_by TEXT NOT NULL, -- Name of the user who requested
    requested_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Link to users table
    department TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { itemId, itemName, quantity, unitOfMeasure }
    status TEXT NOT NULL DEFAULT 'Pending', -- e.g., 'Pending', 'Approved', 'Rejected', 'Completed'
    priority TEXT NOT NULL DEFAULT 'Medium', -- e.g., 'Low', 'Medium', 'High', 'Urgent'
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by TEXT, -- Name of the user who approved
    notes TEXT
);

-- 4. Orders Table (for purchasing new stock)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    supplier TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { itemId, itemName, quantity, unitPrice, totalPrice }
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- e.g., 'Pending', 'Ordered', 'Received', 'Cancelled'
    ordered_by TEXT NOT NULL, -- Name of the user who placed the order
    received_date TIMESTAMP WITH TIME ZONE
);

-- 5. Releases Table (for dispensing stock to departments/patients)
CREATE TABLE IF NOT EXISTS public.releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_by TEXT NOT NULL, -- Name of the user who released the items
    department TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { itemId, itemName, quantity, unitOfMeasure }
    notes TEXT
);

-- Enable Row Level Security (RLS) for tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users Table
-- Admins can see and manage all users
CREATE POLICY "Admins can manage all users" ON public.users
FOR ALL
USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT
USING (id = auth.uid());

-- RLS Policies for Inventory Items Table
-- All authenticated users can view inventory
CREATE POLICY "All authenticated users can view inventory" ON public.inventory_items
FOR SELECT
USING (auth.role() = 'authenticated');

-- Inventory Managers and Admins can manage inventory
CREATE POLICY "Inventory managers and admins can manage inventory" ON public.inventory_items
FOR ALL
USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'inventory_manager')))
WITH CHECK (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'inventory_manager')));

-- RLS Policies for Requests Table
-- All authenticated users can view requests
CREATE POLICY "All authenticated users can view requests" ON public.requests
FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can create requests linked to their ID
CREATE POLICY "Users can create requests linked to their ID" ON public.requests
FOR INSERT
WITH CHECK (requested_by_user_id = auth.uid());

-- Inventory Managers and Admins can manage all requests
CREATE POLICY "Inventory managers and admins can manage all requests" ON public.requests
FOR ALL
USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'inventory_manager')))
WITH CHECK (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'inventory_manager')));

-- RLS Policies for Orders Table
-- All authenticated users can view orders
CREATE POLICY "All authenticated users can view orders" ON public.orders
FOR SELECT
USING (auth.role() = 'authenticated');

-- Inventory Managers and Admins can manage orders
CREATE POLICY "Inventory managers and admins can manage orders" ON public.orders
FOR ALL
USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'inventory_manager')))
WITH CHECK (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'inventory_manager')));

-- RLS Policies for Releases Table
-- All authenticated users can view releases
CREATE POLICY "All authenticated users can view releases" ON public.releases
FOR SELECT
USING (auth.role() = 'authenticated');

-- Inventory Managers and Admins can manage releases
CREATE POLICY "Inventory managers and admins can manage releases" ON public.releases
FOR ALL
USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'inventory_manager')))
WITH CHECK (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND (role = 'admin' OR role = 'inventory_manager')));

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ All tables created and RLS policies applied successfully!';
END $$;
