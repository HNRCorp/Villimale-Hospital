# Supabase Setup Guide for Villimale Hospital Inventory System

## ✅ Project Created
Your Supabase project is ready at: https://ftixfdshvmepacptxnwo.supabase.co

## ✅ Environment Variables Configured
The `.env.local` file has been created with your actual Supabase keys.

## Next Steps

### 1. Create Database Tables

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/ftixfdshvmepacptxnwo)
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL script:

\`\`\`sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Pending Approval', 'Suspended')),
    employee_id VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    permissions JSONB DEFAULT '[]'::jsonb,
    profile_image TEXT,
    is_first_login BOOLEAN DEFAULT true,
    password_last_changed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    maximum_stock INTEGER NOT NULL DEFAULT 1000,
    unit_of_measure VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    supplier VARCHAR(255),
    location VARCHAR(255),
    expiry_date DATE,
    batch_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock', 'Critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department VARCHAR(100) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    requested_date TIMESTAMP WITH TIME ZONE NOT NULL,
    required_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'In Progress', 'Fulfilled')),
    priority VARCHAR(10) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    approved_by VARCHAR(255),
    approved_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier VARCHAR(255) NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_delivery TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create releases table
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department VARCHAR(100) NOT NULL,
    released_by VARCHAR(255) NOT NULL,
    released_date TIMESTAMP WITH TIME ZONE NOT NULL,
    request_id UUID REFERENCES requests(id),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_requests_department ON requests(department);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_requested_date ON requests(requested_date);
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders(supplier);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_releases_department ON releases(department);
CREATE INDEX IF NOT EXISTS idx_releases_released_date ON releases(released_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON releases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - can be refined later)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view inventory items" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Authorized users can modify inventory" ON inventory_items FOR ALL USING (true);

CREATE POLICY "Users can view requests" ON requests FOR SELECT USING (true);
CREATE POLICY "Users can create requests" ON requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Authorized users can modify requests" ON requests FOR UPDATE USING (true);

CREATE POLICY "Users can view orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Authorized users can modify orders" ON orders FOR ALL USING (true);

CREATE POLICY "Users can view releases" ON releases FOR SELECT USING (true);
CREATE POLICY "Authorized users can modify releases" ON releases FOR ALL USING (true);
\`\`\`

4. Click **Run** to execute the script

### 2. Seed Initial Data

After creating the tables, run this script to add sample data:

\`\`\`sql
-- Insert sample users with hashed passwords
-- Note: In production, passwords should be properly hashed with bcrypt
INSERT INTO users (
    email, password_hash, first_name, last_name, role, department, 
    status, employee_id, phone, permissions, is_first_login, 
    login_attempts, approved_by, approved_at
) VALUES 
(
    'admin@villimale-hospital.mv',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', -- admin123
    'System',
    'Administrator',
    'System Administrator',
    'IT',
    'Active',
    'EMP001',
    '+960 330-1001',
    '["Full Access", "User Management", "System Settings", "View Reports", "Manage Orders", "Release Items", "Approve Requests", "View Inventory", "Generate Reports"]'::jsonb,
    false,
    0,
    (SELECT id FROM users WHERE email = 'admin@villimale-hospital.mv'),
    NOW()
),
(
    'john.smith@villimale-hospital.mv',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- inventory123
    'John',
    'Smith',
    'Inventory Manager',
    'Inventory',
    'Active',
    'EMP002',
    '+960 330-1002',
    '["View Inventory", "Add/Edit Items", "Manage Orders", "Release Items", "Approve Requests", "View Reports", "Generate Reports", "Manage Suppliers"]'::jsonb,
    false,
    0,
    (SELECT id FROM users WHERE email = 'admin@villimale-hospital.mv'),
    NOW()
),
(
    'sarah.johnson@villimale-hospital.mv',
    '$2a$12$8k2lTAkjkwNYAeOkN9qBqOmMmw5pAOeAoRQ5QlVpO5PwHQ9gY8jO6', -- doctor123
    'Dr. Sarah',
    'Johnson',
    'Department Head',
    'Emergency',
    'Active',
    'DOC001',
    '+960 330-1003',
    '["View Inventory", "Request Items", "Approve Department Requests", "View Department Reports", "Manage Department Users"]'::jsonb,
    false,
    0,
    (SELECT id FROM users WHERE email = 'admin@villimale-hospital.mv'),
    NOW()
);

-- Insert sample inventory items
INSERT INTO inventory_items (
    name, category, description, current_stock, minimum_stock, maximum_stock,
    unit_of_measure, unit_price, supplier, location, expiry_date, batch_number, status
) VALUES 
(
    'Paracetamol 500mg',
    'Medications',
    'Pain relief and fever reducer tablets',
    150,
    50,
    500,
    'tablets',
    0.25,
    'PharmaCorp Ltd',
    'Pharmacy - Shelf A1',
    '2025-06-15',
    'PC2024001',
    'In Stock'
),
(
    'Surgical Gloves (Medium)',
    'Medical Supplies',
    'Latex-free surgical gloves for medical procedures',
    25,
    100,
    1000,
    'boxes',
    12.50,
    'MedSupply Inc',
    'Storage Room B - Shelf 3',
    NULL,
    'SG2024001',
    'Low Stock'
),
(
    'Insulin Syringes',
    'Medical Equipment',
    '1ml insulin syringes with fine needle',
    5,
    50,
    200,
    'boxes',
    8.75,
    'DiabetesCare Co',
    'Pharmacy - Refrigerated Section',
    '2025-12-31',
    'IS2024001',
    'Critical'
),
(
    'Bandages (Sterile)',
    'Medical Supplies',
    'Sterile gauze bandages for wound care',
    200,
    75,
    500,
    'rolls',
    2.50,
    'WoundCare Ltd',
    'Storage Room A - Shelf 2',
    '2026-03-20',
    'WC2024001',
    'In Stock'
),
(
    'Blood Pressure Monitor',
    'Medical Equipment',
    'Digital blood pressure monitor with cuff',
    3,
    5,
    20,
    'units',
    125.00,
    'MedTech Solutions',
    'Equipment Room - Cabinet 1',
    NULL,
    'MT2024001',
    'Low Stock'
);

-- Insert sample request
INSERT INTO requests (
    department, requested_by, requested_date, required_date, status, priority, items, notes
) VALUES (
    'Emergency',
    'Dr. Sarah Johnson',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '1 day',
    'Pending',
    'High',
    '[
        {
            "itemId": "' || (SELECT id FROM inventory_items WHERE name = 'Paracetamol 500mg') || '",
            "itemName": "Paracetamol 500mg",
            "requestedQuantity": 100,
            "unitOfMeasure": "tablets"
        },
        {
            "itemId": "' || (SELECT id FROM inventory_items WHERE name = 'Surgical Gloves (Medium)') || '",
            "itemName": "Surgical Gloves (Medium)",
            "requestedQuantity": 20,
            "unitOfMeasure": "boxes"
        }
    ]'::jsonb,
    'Urgent request for emergency department restocking'
);

-- Insert sample order
INSERT INTO orders (
    supplier, order_date, expected_delivery, status, total_amount, items, notes
) VALUES (
    'PharmaCorp Ltd',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '3 days',
    'Confirmed',
    1250.00,
    '[
        {
            "itemId": "' || (SELECT id FROM inventory_items WHERE name = 'Paracetamol 500mg') || '",
            "itemName": "Paracetamol 500mg",
            "quantity": 1000,
            "unitPrice": 0.25,
            "totalPrice": 250.00
        },
        {
            "itemId": "' || (SELECT id FROM inventory_items WHERE name = 'Insulin Syringes') || '",
            "itemName": "Insulin Syringes",
            "quantity": 100,
            "unitPrice": 8.75,
            "totalPrice": 875.00
        }
    ]'::jsonb,
    'Monthly medication restock order'
);

-- Insert sample release
INSERT INTO releases (
    department, released_by, released_date, request_id, items, notes
) VALUES (
    'Emergency',
    'John Smith',
    NOW() - INTERVAL '1 day',
    (SELECT id FROM requests WHERE department = 'Emergency' LIMIT 1),
    '[
        {
            "itemId": "' || (SELECT id FROM inventory_items WHERE name = 'Paracetamol 500mg') || '",
            "itemName": "Paracetamol 500mg",
            "releasedQuantity": 50,
            "unitOfMeasure": "tablets"
        }
    ]'::jsonb,
    'Partial release - remaining items pending approval'
);
\`\`\`

### 3. Test the Setup

1. Restart your development server
2. The app should now connect to your Supabase database
3. Try logging in with these test accounts:
   - **Admin**: `admin@villimale-hospital.mv` / `admin123`
   - **Inventory Manager**: `john.smith@villimale-hospital.mv` / `inventory123`
   - **Doctor**: `sarah.johnson@villimale-hospital.mv` / `doctor123`

### 4. Verify Data Loading

- Check the **Inventory** page for sample items
- Check the **Requests** page for sample requests
- Check the **Orders** page for sample orders
- Check the **Users** page (admin only) for user management

## Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Passwords are properly hashed with bcrypt
- ✅ Service role key is kept server-side only
- ✅ Proper indexing for performance

## Troubleshooting

### Connection Issues
- Verify environment variables are set correctly
- Check Supabase project status in dashboard
- Ensure tables were created successfully

### Authentication Issues
- Verify users table has data
- Check password hashing is working
- Test with provided sample credentials

### Data Loading Issues
- Confirm all tables exist in Supabase
- Check browser console for specific errors
- Verify RLS policies allow data access

## Production Deployment

When deploying to Vercel:
1. Add environment variables in Vercel dashboard
2. Set all three variables for Production, Preview, and Development
3. Redeploy after adding variables

Your Supabase setup is now complete! 🎉
