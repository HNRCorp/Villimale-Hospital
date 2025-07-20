/* ---------------------------------------------------------------------------
   Villimale Hospital – Demo Seed Data
   ---------------------------------------------------------------------------
   1.  Assumes the tables were created by scripts/create-tables.sql.
   2.  Uses fixed UUIDs for deterministic seeding across environments.
   3.  All INSERT blocks end with a semicolon to avoid “terminated early” errors.
   ------------------------------------------------------------------------- */

/* ---------- House-keeping: clear existing data (optional) ----------------- */
TRUNCATE TABLE
  releases,
  orders,
  requests,
  inventory_items,
  users
RESTART IDENTITY CASCADE;

/* ---------- Users --------------------------------------------------------- */
/* Passwords are bcrypt-hashed versions of: admin123, doctor123, nurse123     */
INSERT INTO users (
  id,
  employee_id,
  username,
  email,
  password_hash,
  role,
  status,
  created_at,
  first_login
) VALUES
  ('00000000-0000-0000-0000-000000000001','EMP001','admin',
   'admin@hospital.local',
   '$2a$10$sAlpPIsWxHu7d7fEYJIhbeMr18bODsPwhj/KgOMGNJUgIAQ9PEG8G', -- admin123
   'admin','active',NOW(),TRUE),

  ('00000000-0000-0000-0000-000000000002','EMP002','drsmith',
   'drsmith@hospital.local',
   '$2a$10$KbSIXYzbae.Y1/6VXOvNhutX6YsJhBKt3vnDnN/SUXOc6Bx/6CkXG', -- doctor123
   'doctor','active',NOW(),TRUE),

  ('00000000-0000-0000-0000-000000000003','EMP003','nursejane',
   'nursejane@hospital.local',
   '$2a$10$Pi8TmP2m.GnhZZQvCA/rleZzRs0N9YkGpglH6fv3g6uTy1l4NRDb2', -- nurse123
   'nurse','active',NOW(),TRUE);

/* ---------- Inventory Items ---------------------------------------------- */
INSERT INTO inventory_items (
  id,
  name,
  description,
  quantity,
  unit,
  reorder_threshold,
  expiry_date,
  created_at
) VALUES
  ('10000000-0000-0000-0000-000000000001','Paracetamol 500 mg',
   'Analgesic tablets', 450,'tablet',100,'2026-12-31',NOW()),

  ('10000000-0000-0000-0000-000000000002','Sterile Gloves – M',
   'Latex-free examination gloves (Medium)', 1200,'pair',300,'2027-06-30',NOW()),

  ('10000000-0000-0000-0000-000000000003','Bandages 5 cm × 4 m',
   'Elastic conforming bandages', 350,'roll',75,'2028-01-15',NOW()),

  ('10000000-0000-0000-0000-000000000004','Syringe 5 mL',
   'Luer-lock disposable syringes', 800,'piece',200,'2029-09-30',NOW()),

  ('10000000-0000-0000-0000-000000000005','IV Fluids – 0.9 % Saline 1 L',
   'Intravenous isotonic saline', 180,'bag',50,'2027-03-01',NOW());

/* ---------- Sample Order -------------------------------------------------- */
INSERT INTO orders (
  id,
  order_number,
  supplier,
  ordered_by_user_id,
  status,
  total_items,
  created_at
) VALUES
  ('30000000-0000-0000-0000-000000000001','PO-2025-0001',
   'MedSupplies Ltd.',
   '00000000-0000-0000-0000-000000000001', /* admin */
   'received',
   5,
   NOW());

/* ---------- Sample Request (Ward → Pharmacy) ------------------------------ */
INSERT INTO requests (
  id,
  request_number,
  requested_by_user_id,
  ward,
  status,
  created_at
) VALUES
  ('20000000-0000-0000-0000-000000000001','REQ-2025-0001',
   '00000000-0000-0000-0000-000000000003', /* nursejane */
   'Ward A',
   'approved',
   NOW());

/* ---------- Sample Release (Inventory Deduction) -------------------------- */
INSERT INTO releases (
  id,
  release_number,
  request_id,
  processed_by_user_id,
  released_at
) VALUES
  ('40000000-0000-0000-0000-000000000001','REL-2025-0001',
   '20000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000002', /* drsmith */
   NOW());

/* ---------- Done ---------------------------------------------------------- */
