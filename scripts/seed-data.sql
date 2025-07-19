-- Hospital Inventory Management System Seed Data
-- Run this script after create-tables.sql to populate with sample data

-- Insert users with hashed passwords (using bcrypt hash for 'password123' format)
INSERT INTO users (
    id, email, password_hash, first_name, last_name, role, department, 
    status, employee_id, phone, permissions, is_first_login, 
    password_last_changed, login_attempts, approved_by, approved_at
) VALUES 
-- System Administrator
(
    '00000000-0000-0000-0000-000000000001',
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
    NOW() - INTERVAL '30 days',
    0,
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '30 days'
),
-- Inventory Manager
(
    '00000000-0000-0000-0000-000000000002',
    'john.smith@villimale-hospital.mv',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', -- inventory123
    'John',
    'Smith',
    'Inventory Manager',
    'Inventory',
    'Active',
    'EMP002',
    '+960 330-1002',
    '["View Inventory", "Add/Edit Items", "Manage Orders", "Release Items", "Approve Requests", "View Reports", "Generate Reports", "Manage Suppliers"]'::jsonb,
    false,
    NOW() - INTERVAL '15 days',
    0,
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '30 days'
),
-- Emergency Doctor
(
    '00000000-0000-0000-0000-000000000003',
    'sarah.johnson@villimale-hospital.mv',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', -- doctor123
    'Dr. Sarah',
    'Johnson',
    'Doctor',
    'Emergency',
    'Active',
    'DOC001',
    '+960 330-1003',
    '["View Inventory", "Request Items", "View Request Status"]'::jsonb,
    false,
    NOW() - INTERVAL '10 days',
    0,
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '30 days'
),
-- ICU Nurse Manager
(
    '00000000-0000-0000-0000-000000000004',
    'maria.garcia@villimale-hospital.mv',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', -- nurse123
    'Maria',
    'Garcia',
    'Nurse Manager',
    'ICU',
    'Active',
    'NUR001',
    '+960 330-1004',
    '["View Inventory", "Request Items", "Approve Nursing Requests", "View Department Reports"]'::jsonb,
    false,
    NOW() - INTERVAL '5 days',
    0,
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '30 days'
),
-- Pharmacist
(
    '00000000-0000-0000-0000-000000000005',
    'ahmed.hassan@villimale-hospital.mv',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', -- pharmacist123
    'Ahmed',
    'Hassan',
    'Pharmacist',
    'Pharmacy',
    'Active',
    'PHA001',
    '+960 330-1005',
    '["View Inventory", "Request Items", "Manage Medications", "View Pharmacy Reports", "Track Controlled Substances"]'::jsonb,
    false,
    NOW() - INTERVAL '2 days',
    0,
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '30 days'
);

-- Insert inventory items
INSERT INTO inventory_items (
    id, name, category, description, current_stock, minimum_stock, maximum_stock,
    unit_of_measure, unit_price, supplier, location, expiry_date, batch_number, status
) VALUES 
-- Medications
(
    '10000000-0000-0000-0000-000000000001',
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
    '10000000-0000-0000-0000-000000000002',
    'Ibuprofen 400mg',
    'Medications',
    'Anti-inflammatory pain reliever',
    75,
    30,
    300,
    'tablets',
    0.35,
    'PharmaCorp Ltd',
    'Pharmacy - Shelf A2',
    '2025-08-20',
    'IB2024002',
    'In Stock'
),
(
    '10000000-0000-0000-0000-000000000003',
    'Amoxicillin 250mg',
    'Medications',
    'Antibiotic for bacterial infections',
    25,
    40,
    200,
    'capsules',
    0.85,
    'MediSupply Co',
    'Pharmacy - Refrigerated Section',
    '2024-12-30',
    'AM2024003',
    'Low Stock'
),
(
    '10000000-0000-0000-0000-000000000004',
    'Insulin (Rapid Acting)',
    'Medications',
    'Fast-acting insulin for diabetes management',
    8,
    15,
    50,
    'vials',
    25.50,
    'DiabetesCare Co',
    'Pharmacy - Refrigerated Section',
    '2024-11-15',
    'IN2024004',
    'Critical'
),
(
    '10000000-0000-0000-0000-000000000005',
    'Morphine 10mg/ml',
    'Medications',
    'Controlled substance for severe pain management',
    12,
    10,
    30,
    'ampoules',
    15.75,
    'PainCare Pharmaceuticals',
    'Pharmacy - Controlled Substances Safe',
    '2025-03-10',
    'MO2024005',
    'In Stock'
),
-- Medical Supplies
(
    '10000000-0000-0000-0000-000000000006',
    'Surgical Gloves (Medium)',
    'Medical Supplies',
    'Latex-free sterile surgical gloves',
    25,
    100,
    1000,
    'boxes',
    12.50,
    'MedSupply Inc',
    'Storage Room B - Shelf 3',
    NULL,
    'SG2024006',
    'Low Stock'
),
(
    '10000000-0000-0000-0000-000000000007',
    'Disposable Syringes 5ml',
    'Medical Supplies',
    'Single-use sterile syringes with needles',
    200,
    150,
    800,
    'pieces',
    0.75,
    'MedSupply Inc',
    'Storage Room B - Shelf 1',
    NULL,
    'DS2024007',
    'In Stock'
),
(
    '10000000-0000-0000-0000-000000000008',
    'Sterile Gauze Bandages',
    'Medical Supplies',
    'Sterile gauze for wound dressing',
    80,
    50,
    300,
    'rolls',
    2.25,
    'WoundCare Solutions',
    'Storage Room A - Shelf 2',
    NULL,
    'GB2024008',
    'In Stock'
),
(
    '10000000-0000-0000-0000-000000000009',
    'IV Fluid - Normal Saline 500ml',
    'Medical Supplies',
    'Intravenous fluid for hydration',
    45,
    60,
    200,
    'bags',
    3.50,
    'FluidCare Medical',
    'Storage Room C - Shelf 1',
    '2025-09-30',
    'NS2024009',
    'Low Stock'
),
(
    '10000000-0000-0000-0000-000000000010',
    'Catheter (Foley) 16Fr',
    'Medical Supplies',
    'Urinary catheter for patient care',
    30,
    25,
    100,
    'pieces',
    8.75,
    'UrologyCare Inc',
    'Storage Room B - Shelf 4',
    NULL,
    'FC2024010',
    'In Stock'
),
-- Medical Equipment
(
    '10000000-0000-0000-0000-000000000011',
    'Digital Blood Pressure Monitor',
    'Medical Equipment',
    'Automatic BP monitor with cuff',
    5,
    8,
    20,
    'units',
    125.00,
    'MedTech Solutions',
    'Equipment Room - Shelf A',
    NULL,
    'BP2024011',
    'Critical'
),
(
    '10000000-0000-0000-0000-000000000012',
    'Digital Thermometer',
    'Medical Equipment',
    'Non-contact infrared thermometer',
    15,
    12,
    40,
    'units',
    45.00,
    'TempCare Devices',
    'Equipment Room - Shelf B',
    NULL,
    'TH2024012',
    'In Stock'
),
(
    '10000000-0000-0000-0000-000000000013',
    'Stethoscope (Adult)',
    'Medical Equipment',
    'Professional acoustic stethoscope',
    8,
    10,
    25,
    'units',
    85.00,
    'CardiacCare Medical',
    'Equipment Room - Shelf C',
    NULL,
    'ST2024013',
    'Low Stock'
),
(
    '10000000-0000-0000-0000-000000000014',
    'Wheelchair (Standard)',
    'Medical Equipment',
    'Manual wheelchair for patient transport',
    3,
    5,
    15,
    'units',
    250.00,
    'MobilityCare Inc',
    'Equipment Storage Area',
    NULL,
    'WC2024014',
    'Critical'
),
(
    '10000000-0000-0000-0000-000000000015',
    'Pulse Oximeter',
    'Medical Equipment',
    'Fingertip pulse oximeter for oxygen saturation',
    12,
    8,
    30,
    'units',
    35.00,
    'OxygenCare Devices',
    'Equipment Room - Shelf D',
    NULL,
    'PO2024015',
    'In Stock'
),
-- Laboratory Supplies
(
    '10000000-0000-0000-0000-000000000016',
    'Blood Collection Tubes (EDTA)',
    'Laboratory Supplies',
    'Vacuum tubes for blood sample collection',
    150,
    100,
    500,
    'tubes',
    1.25,
    'LabSupply Corp',
    'Laboratory - Storage Cabinet A',
    '2025-12-31',
    'BC2024016',
    'In Stock'
),
(
    '10000000-0000-0000-0000-000000000017',
    'Urine Collection Cups',
    'Laboratory Supplies',
    'Sterile containers for urine samples',
    80,
    60,
    300,
    'cups',
    0.95,
    'LabSupply Corp',
    'Laboratory - Storage Cabinet B',
    NULL,
    'UC2024017',
    'In Stock'
),
-- PPE (Personal Protective Equipment)
(
    '10000000-0000-0000-0000-000000000018',
    'N95 Respirator Masks',
    'PPE',
    'High-filtration respiratory protection',
    200,
    300,
    1000,
    'masks',
    2.50,
    'SafetyFirst Medical',
    'PPE Storage Room - Shelf 1',
    NULL,
    'N95-2024018',
    'Low Stock'
),
(
    '10000000-0000-0000-0000-000000000019',
    'Surgical Masks (3-ply)',
    'PPE',
    'Disposable surgical face masks',
    500,
    200,
    2000,
    'masks',
    0.35,
    'SafetyFirst Medical',
    'PPE Storage Room - Shelf 2',
    NULL,
    'SM2024019',
    'In Stock'
),
(
    '10000000-0000-0000-0000-000000000020',
    'Safety Goggles',
    'PPE',
    'Protective eyewear for medical procedures',
    25,
    30,
    100,
    'pairs',
    8.50,
    'EyeProtect Solutions',
    'PPE Storage Room - Shelf 3',
    NULL,
    'SG2024020',
    'Low Stock'
);

-- Insert sample requests
INSERT INTO requests (
    id, department, requested_by, requested_date, required_date, status, priority, items, notes
) VALUES 
(
    '20000000-0000-0000-0000-000000000001',
    'Emergency',
    'Dr. Sarah Johnson',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '1 day',
    'Pending',
    'High',
    '[
        {
            "itemId": "10000000-0000-0000-0000-000000000001",
            "itemName": "Paracetamol 500mg",
            "requestedQuantity": 100,
            "unitOfMeasure": "tablets"
        },
        {
            "itemId": "10000000-0000-0000-0000-000000000006",
            "itemName": "Surgical Gloves (Medium)",
            "requestedQuantity": 20,
            "unitOfMeasure": "boxes"
        }
    ]'::jsonb,
    'Urgent request for emergency department restocking due to high patient volume'
),
(
    '20000000-0000-0000-0000-000000000002',
    'ICU',
    'Maria Garcia',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '2 days',
    'Approved',
    'Medium',
    '[
        {
            "itemId": "10000000-0000-0000-0000-000000000009",
            "itemName": "IV Fluid - Normal Saline 500ml",
            "requestedQuantity": 50,
            "approvedQuantity": 40,
            "unitOfMeasure": "bags"
        },
        {
            "itemId": "10000000-0000-0000-0000-000000000007",
            "itemName": "Disposable Syringes 5ml",
            "requestedQuantity": 100,
            "approvedQuantity": 100,
            "unitOfMeasure": "pieces"
        }
    ]'::jsonb,
    'Regular ICU supplies replenishment'
),
(
    '20000000-0000-0000-0000-000000000003',
    'Pharmacy',
    'Ahmed Hassan',
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '5 days',
    'In Progress',
    'Urgent',
    '[
        {
            "itemId": "10000000-0000-0000-0000-000000000004",
            "itemName": "Insulin (Rapid Acting)",
            "requestedQuantity": 20,
            "approvedQuantity": 15,
            "unitOfMeasure": "vials"
        },
        {
            "itemId": "10000000-0000-0000-0000-000000000003",
            "itemName": "Amoxicillin 250mg",
            "requestedQuantity": 50,
            "approvedQuantity": 30,
            "unitOfMeasure": "capsules"
        }
    ]'::jsonb,
    'Critical medication restock - running low on essential items'
);

-- Update approved requests
UPDATE requests 
SET approved_by = 'John Smith', approved_date = NOW() - INTERVAL '12 hours'
WHERE status IN ('Approved', 'In Progress');

-- Insert sample orders
INSERT INTO orders (
    id, supplier, order_date, expected_delivery, status, total_amount, items, notes
) VALUES 
(
    '30000000-0000-0000-0000-000000000001',
    'PharmaCorp Ltd',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '3 days',
    'Confirmed',
    2875.00,
    '[
        {
            "itemId": "10000000-0000-0000-0000-000000000001",
            "itemName": "Paracetamol 500mg",
            "quantity": 1000,
            "unitPrice": 0.25,
            "totalPrice": 250.00
        },
        {
            "itemId": "10000000-0000-0000-0000-000000000002",
            "itemName": "Ibuprofen 400mg",
            "quantity": 500,
            "unitPrice": 0.35,
            "totalPrice": 175.00
        },
        {
            "itemId": "10000000-0000-0000-0000-000000000004",
            "itemName": "Insulin (Rapid Acting)",
            "quantity": 100,
            "unitPrice": 25.50,
            "totalPrice": 2550.00
        }
    ]'::jsonb,
    'Monthly medication restock order - priority items'
),
(
    '30000000-0000-0000-0000-000000000002',
    'MedSupply Inc',
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '5 days',
    'Shipped',
    1875.00,
    '[
        {
            "itemId": "10000000-0000-0000-0000-000000000006",
            "itemName": "Surgical Gloves (Medium)",
            "quantity": 100,
            "unitPrice": 12.50,
            "totalPrice": 1250.00
        },
        {
            "itemId": "10000000-0000-0000-0000-000000000007",
            "itemName": "Disposable Syringes 5ml",
            "quantity": 500,
            "unitPrice": 0.75,
            "totalPrice": 375.00
        },
        {
            "itemId": "10000000-0000-0000-0000-000000000008",
            "itemName": "Sterile Gauze Bandages",
            "quantity": 100,
            "unitPrice": 2.25,
            "totalPrice": 225.00
        }
    ]'::jsonb,
    'Medical supplies restock - high usage items'
);

-- Insert sample releases
INSERT INTO releases (
    id, department, released_by, released_date, request_id, items, notes
) VALUES 
(
    '40000000-0000-0000-0000-000000000001',
    'ICU',
    'John Smith',
    NOW() - INTERVAL '6 hours',
    '20000000-0000-0000-0000-000000000002',
    '[
        {
            "itemId": "10000000-0000-0000-0000-000000000009",
            "itemName": "IV Fluid - Normal Saline 500ml",
            "releasedQuantity": 40,
            "unitOfMeasure": "bags"
        },
        {
            "itemId": "10000000-0000-0000-0000-000000000007",
            "itemName": "Disposable Syringes 5ml",
            "releasedQuantity": 100,
            "unitOfMeasure": "pieces"
        }
    ]'::jsonb,
    'Full release as per approved request - ICU supplies'
),
(
    '40000000-0000-0000-0000-000000000002',
    'Pharmacy',
    'John Smith',
    NOW() - INTERVAL '2 hours',
    '20000000-0000-0000-0000-000000000003',
    '[
        {
            "itemId": "10000000-0000-0000-0000-000000000004",
            "itemName": "Insulin (Rapid Acting)",
            "releasedQuantity": 8,
            "unitOfMeasure": "vials"
        }
    ]'::jsonb,
    'Partial release - remaining insulin to be released when new stock arrives'
);

-- Update inventory stock levels based on releases
UPDATE inventory_items 
SET current_stock = current_stock - 40
WHERE id = '10000000-0000-0000-0000-000000000009'; -- IV Fluid

UPDATE inventory_items 
SET current_stock = current_stock - 100
WHERE id = '10000000-0000-0000-0000-000000000007'; -- Syringes

UPDATE inventory_items 
SET current_stock = current_stock - 8
WHERE id = '10000000-0000-0000-0000-000000000004'; -- Insulin

-- Update request status for completed releases
UPDATE requests 
SET status = 'Fulfilled'
WHERE id = '20000000-0000-0000-0000-000000000002';

-- Display summary of seeded data
DO $$
DECLARE
    user_count INTEGER;
    item_count INTEGER;
    request_count INTEGER;
    order_count INTEGER;
    release_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO item_count FROM inventory_items;
    SELECT COUNT(*) INTO request_count FROM requests;
    SELECT COUNT(*) INTO order_count FROM orders;
    SELECT COUNT(*) INTO release_count FROM releases;
    
    RAISE NOTICE '🎉 Hospital Inventory Database Seeded Successfully!';
    RAISE NOTICE '👥 Users created: %', user_count;
    RAISE NOTICE '📦 Inventory items created: %', item_count;
    RAISE NOTICE '📋 Requests created: %', request_count;
    RAISE NOTICE '🛒 Orders created: %', order_count;
    RAISE NOTICE '📤 Releases created: %', release_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Test Login Credentials:';
    RAISE NOTICE '   Admin: admin@villimale-hospital.mv / admin123';
    RAISE NOTICE '   Inventory Manager: john.smith@villimale-hospital.mv / inventory123';
    RAISE NOTICE '   Doctor: sarah.johnson@villimale-hospital.mv / doctor123';
    RAISE NOTICE '   Nurse: maria.garcia@villimale-hospital.mv / nurse123';
    RAISE NOTICE '   Pharmacist: ahmed.hassan@villimale-hospital.mv / pharmacist123';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Database is ready for testing!';
END $$;
