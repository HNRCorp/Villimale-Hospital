-- Villimale Hospital Inventory System - Initial Data
-- Run this script AFTER creating the tables with create-tables.sql

-- Clear existing data (optional - remove if you want to keep existing data)
DELETE FROM releases;
DELETE FROM orders;
DELETE FROM requests;
DELETE FROM inventory_items;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS inventory_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS requests_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS releases_id_seq RESTART WITH 1;

-- Insert initial users with hashed passwords
-- Default passwords: admin123, inventory123, doctor123, nurse123, pharmacist123
INSERT INTO users (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    department, 
    status, 
    employee_id, 
    phone, 
    permissions, 
    is_first_login, 
    login_attempts, 
    approved_at,
    password_last_changed
) VALUES 
-- System Administrator (admin123)
(
    'admin@villimale-hospital.mv',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
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
    NOW(),
    NOW()
),
-- Inventory Manager (inventory123)
(
    'john.smith@villimale-hospital.mv',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
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
    NOW(),
    NOW()
),
-- Department Head - Emergency (doctor123)
(
    'sarah.johnson@villimale-hospital.mv',
    '$2a$12$8k2lTAkjkwNYAeOkN9qBqOmMmw5pAOeAoRQ5QlVpO5PwHQ9gY8jO6',
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
    NOW(),
    NOW()
),
-- Senior Nurse (nurse123)
(
    'maria.garcia@villimale-hospital.mv',
    '$2a$12$4k8lTAkjkwNYAeOkN9qBqOmMmw5pAOeAoRQ5QlVpO5PwHQ9gY8jO6',
    'Maria',
    'Garcia',
    'Senior Nurse',
    'ICU',
    'Active',
    'NUR001',
    '+960 330-1004',
    '["View Inventory", "Request Items", "View Department Reports"]'::jsonb,
    false,
    0,
    NOW(),
    NOW()
),
-- Pharmacist (pharmacist123)
(
    'ahmed.hassan@villimale-hospital.mv',
    '$2a$12$6k2lTAkjkwNYAeOkN9qBqOmMmw5pAOeAoRQ5QlVpO5PwHQ9gY8jO6',
    'Ahmed',
    'Hassan',
    'Pharmacist',
    'Pharmacy',
    'Active',
    'PHA001',
    '+960 330-1005',
    '["View Inventory", "Request Items", "Manage Medications", "View Reports"]'::jsonb,
    false,
    0,
    NOW(),
    NOW()
);

-- Update approved_by for all users (admin approves everyone)
UPDATE users SET approved_by = (SELECT id FROM users WHERE email = 'admin@villimale-hospital.mv' LIMIT 1);

-- Insert comprehensive inventory items
INSERT INTO inventory_items (
    name, 
    category, 
    description, 
    current_stock, 
    minimum_stock, 
    maximum_stock,
    unit_of_measure, 
    unit_price, 
    supplier, 
    location, 
    expiry_date, 
    batch_number, 
    status
) VALUES 
-- Medications
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
    'Ibuprofen 400mg',
    'Medications',
    'Anti-inflammatory pain reliever',
    80,
    30,
    300,
    'tablets',
    0.35,
    'PharmaCorp Ltd',
    'Pharmacy - Shelf A2',
    '2025-08-20',
    'PC2024002',
    'In Stock'
),
(
    'Amoxicillin 500mg',
    'Medications',
    'Broad-spectrum antibiotic capsules',
    45,
    25,
    200,
    'capsules',
    1.25,
    'PharmaCorp Ltd',
    'Pharmacy - Shelf B1',
    '2025-03-15',
    'PC2024003',
    'In Stock'
),
(
    'Insulin (Rapid Acting)',
    'Medications',
    'Fast-acting insulin for diabetes management',
    12,
    20,
    50,
    'vials',
    45.00,
    'DiabetesCare Co',
    'Pharmacy - Refrigerated Section',
    '2025-01-30',
    'DC2024001',
    'Low Stock'
),
(
    'Morphine 10mg/ml',
    'Medications',
    'Strong pain relief injection',
    8,
    15,
    30,
    'ampoules',
    12.50,
    'PainCare Ltd',
    'Pharmacy - Controlled Substances',
    '2025-09-10',
    'PC2024004',
    'Low Stock'
),

-- Medical Supplies
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
    'Critical'
),
(
    'Surgical Gloves (Large)',
    'Medical Supplies',
    'Latex-free surgical gloves - Large size',
    45,
    50,
    500,
    'boxes',
    12.50,
    'MedSupply Inc',
    'Storage Room B - Shelf 3',
    NULL,
    'SG2024002',
    'Low Stock'
),
(
    'Disposable Syringes 5ml',
    'Medical Supplies',
    'Sterile disposable syringes',
    200,
    100,
    1000,
    'pieces',
    0.75,
    'MedSupply Inc',
    'Storage Room A - Shelf 1',
    '2026-12-31',
    'MS2024001',
    'In Stock'
),
(
    'Bandages (Sterile)',
    'Medical Supplies',
    'Sterile gauze bandages for wound care',
    150,
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
    'IV Fluid Bags (Normal Saline)',
    'Medical Supplies',
    '0.9% Sodium Chloride IV solution',
    30,
    50,
    200,
    'bags',
    8.75,
    'FluidCare Inc',
    'Storage Room C - Refrigerated',
    '2025-11-15',
    'FC2024001',
    'Low Stock'
),

-- Medical Equipment
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
),
(
    'Thermometer (Digital)',
    'Medical Equipment',
    'Digital thermometer for patient temperature',
    8,
    10,
    50,
    'units',
    25.00,
    'MedTech Solutions',
    'Equipment Room - Cabinet 2',
    NULL,
    'MT2024002',
    'Low Stock'
),
(
    'Stethoscope',
    'Medical Equipment',
    'Professional stethoscope for examination',
    12,
    8,
    30,
    'units',
    85.00,
    'MedTech Solutions',
    'Equipment Room - Cabinet 3',
    NULL,
    'MT2024003',
    'In Stock'
),
(
    'Pulse Oximeter',
    'Medical Equipment',
    'Fingertip pulse oximeter for oxygen saturation',
    6,
    10,
    25,
    'units',
    45.00,
    'MedTech Solutions',
    'Equipment Room - Cabinet 4',
    NULL,
    'MT2024004',
    'Low Stock'
),
(
    'Wheelchair',
    'Medical Equipment',
    'Standard hospital wheelchair',
    2,
    5,
    15,
    'units',
    250.00,
    'MobilityAid Co',
    'Equipment Storage - Area A',
    NULL,
    'MA2024001',
    'Critical'
),

-- Laboratory Supplies
(
    'Blood Collection Tubes',
    'Laboratory Supplies',
    'Vacuum blood collection tubes with EDTA',
    500,
    200,
    2000,
    'tubes',
    1.25,
    'LabSupply Corp',
    'Laboratory - Storage Cabinet',
    '2025-12-31',
    'LS2024001',
    'In Stock'
),
(
    'Urine Collection Cups',
    'Laboratory Supplies',
    'Sterile urine specimen containers',
    100,
    50,
    500,
    'cups',
    0.85,
    'LabSupply Corp',
    'Laboratory - Storage Cabinet',
    '2026-06-30',
    'LS2024002',
    'In Stock'
),

-- Personal Protective Equipment
(
    'N95 Face Masks',
    'PPE',
    'N95 respiratory protection masks',
    50,
    100,
    1000,
    'masks',
    3.50,
    'SafetyFirst Ltd',
    'PPE Storage Room',
    '2026-01-15',
    'SF2024001',
    'Critical'
),
(
    'Surgical Face Masks',
    'PPE',
    'Disposable surgical face masks',
    200,
    150,
    2000,
    'masks',
    0.45,
    'SafetyFirst Ltd',
    'PPE Storage Room',
    '2025-10-30',
    'SF2024002',
    'In Stock'
),
(
    'Safety Goggles',
    'PPE',
    'Protective safety goggles',
    15,
    20,
    100,
    'units',
    12.00,
    'SafetyFirst Ltd',
    'PPE Storage Room',
    NULL,
    'SF2024003',
    'Low Stock'
);

-- Insert sample requests
INSERT INTO requests (
    department, 
    requested_by, 
    requested_date, 
    required_date, 
    status, 
    priority, 
    items, 
    notes
) VALUES 
-- Emergency Department Request
(
    'Emergency',
    'Dr. Sarah Johnson',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '1 day',
    'Pending',
    'High',
    jsonb_build_array(
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Paracetamol 500mg'),
            'itemName', 'Paracetamol 500mg',
            'requestedQuantity', 100,
            'unitOfMeasure', 'tablets',
            'urgency', 'High',
            'justification', 'Running low on pain medication for emergency patients'
        ),
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Surgical Gloves (Medium)'),
            'itemName', 'Surgical Gloves (Medium)',
            'requestedQuantity', 20,
            'unitOfMeasure', 'boxes',
            'urgency', 'Critical',
            'justification', 'Essential for emergency procedures'
        )
    ),
    'Urgent request for emergency department restocking'
),
-- ICU Request
(
    'ICU',
    'Maria Garcia',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '2 days',
    'Approved',
    'Medium',
    jsonb_build_array(
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'IV Fluid Bags (Normal Saline)'),
            'itemName', 'IV Fluid Bags (Normal Saline)',
            'requestedQuantity', 25,
            'unitOfMeasure', 'bags',
            'urgency', 'Medium',
            'justification', 'Regular ICU patient care requirements'
        ),
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Disposable Syringes 5ml'),
            'itemName', 'Disposable Syringes 5ml',
            'requestedQuantity', 50,
            'unitOfMeasure', 'pieces',
            'urgency', 'Medium',
            'justification', 'Daily medication administration'
        )
    ),
    'Regular ICU supply request'
),
-- Pharmacy Request
(
    'Pharmacy',
    'Ahmed Hassan',
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '5 days',
    'Completed',
    'Low',
    jsonb_build_array(
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Amoxicillin 500mg'),
            'itemName', 'Amoxicillin 500mg',
            'requestedQuantity', 100,
            'unitOfMeasure', 'capsules',
            'urgency', 'Low',
            'justification', 'Restocking pharmacy inventory'
        )
    ),
    'Monthly pharmacy restock'
);

-- Insert sample orders
INSERT INTO orders (
    supplier, 
    order_date, 
    expected_delivery, 
    status, 
    total_amount, 
    items, 
    notes
) VALUES 
-- PharmaCorp Order
(
    'PharmaCorp Ltd',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '3 days',
    'Confirmed',
    1375.00,
    jsonb_build_array(
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Paracetamol 500mg'),
            'itemName', 'Paracetamol 500mg',
            'quantity', 1000,
            'unitPrice', 0.25,
            'totalPrice', 250.00
        ),
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Ibuprofen 400mg'),
            'itemName', 'Ibuprofen 400mg',
            'quantity', 500,
            'unitPrice', 0.35,
            'totalPrice', 175.00
        ),
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Amoxicillin 500mg'),
            'itemName', 'Amoxicillin 500mg',
            'quantity', 200,
            'unitPrice', 1.25,
            'totalPrice', 250.00
        ),
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Insulin (Rapid Acting)'),
            'itemName', 'Insulin (Rapid Acting)',
            'quantity', 20,
            'unitPrice', 45.00,
            'totalPrice', 900.00
        )
    ),
    'Monthly medication restock order'
),
-- MedSupply Order
(
    'MedSupply Inc',
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '1 day',
    'Shipped',
    2125.00,
    jsonb_build_array(
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Surgical Gloves (Medium)'),
            'itemName', 'Surgical Gloves (Medium)',
            'quantity', 100,
            'unitPrice', 12.50,
            'totalPrice', 1250.00
        ),
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Surgical Gloves (Large)'),
            'itemName', 'Surgical Gloves (Large)',
            'quantity', 50,
            'unitPrice', 12.50,
            'totalPrice', 625.00
        ),
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Disposable Syringes 5ml'),
            'itemName', 'Disposable Syringes 5ml',
            'quantity', 500,
            'unitPrice', 0.75,
            'totalPrice', 375.00
        )
    ),
    'Critical supplies reorder due to low stock'
);

-- Insert sample releases
INSERT INTO releases (
    department, 
    released_by, 
    released_date, 
    request_id, 
    items, 
    notes
) VALUES 
-- Emergency Department Release
(
    'Emergency',
    'John Smith',
    NOW() - INTERVAL '1 day',
    (SELECT id FROM requests WHERE department = 'Emergency' AND status = 'Pending' LIMIT 1),
    jsonb_build_array(
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Paracetamol 500mg'),
            'itemName', 'Paracetamol 500mg',
            'releasedQuantity', 50,
            'unitOfMeasure', 'tablets',
            'batchNumber', 'PC2024001',
            'expiryDate', '2025-06-15'
        )
    ),
    'Partial release - remaining items pending approval'
),
-- ICU Release
(
    'ICU',
    'John Smith',
    NOW() - INTERVAL '6 hours',
    (SELECT id FROM requests WHERE department = 'ICU' AND status = 'Approved' LIMIT 1),
    jsonb_build_array(
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'IV Fluid Bags (Normal Saline)'),
            'itemName', 'IV Fluid Bags (Normal Saline)',
            'releasedQuantity', 25,
            'unitOfMeasure', 'bags',
            'batchNumber', 'FC2024001',
            'expiryDate', '2025-11-15'
        ),
        jsonb_build_object(
            'itemId', (SELECT id FROM inventory_items WHERE name = 'Disposable Syringes 5ml'),
            'itemName', 'Disposable Syringes 5ml',
            'releasedQuantity', 50,
            'unitOfMeasure', 'pieces',
            'batchNumber', 'MS2024001',
            'expiryDate', '2026-12-31'
        )
    ),
    'Complete release for ICU request'
);

-- Update inventory stock levels after releases
UPDATE inventory_items 
SET current_stock = current_stock - 50 
WHERE name = 'Paracetamol 500mg';

UPDATE inventory_items 
SET current_stock = current_stock - 25 
WHERE name = 'IV Fluid Bags (Normal Saline)';

UPDATE inventory_items 
SET current_stock = current_stock - 50 
WHERE name = 'Disposable Syringes 5ml';

-- Update stock status based on current levels
UPDATE inventory_items 
SET status = CASE 
    WHEN current_stock <= 0 THEN 'Out of Stock'
    WHEN current_stock <= (minimum_stock * 0.5) THEN 'Critical'
    WHEN current_stock <= minimum_stock THEN 'Low Stock'
    ELSE 'In Stock'
END;

-- Display summary
SELECT 
    'SEEDING COMPLETE' as status,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM inventory_items) as total_items,
    (SELECT COUNT(*) FROM requests) as total_requests,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM releases) as total_releases;

-- Display user accounts created
SELECT 
    'USER ACCOUNTS' as info,
    email,
    first_name || ' ' || last_name as full_name,
    role,
    department,
    status
FROM users
ORDER BY role, last_name;

-- Display inventory summary
SELECT 
    'INVENTORY SUMMARY' as info,
    category,
    COUNT(*) as item_count,
    SUM(CASE WHEN status = 'Critical' THEN 1 ELSE 0 END) as critical_items,
    SUM(CASE WHEN status = 'Low Stock' THEN 1 ELSE 0 END) as low_stock_items
FROM inventory_items
GROUP BY category
ORDER BY category;
