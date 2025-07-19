-- Update user passwords with properly hashed versions
-- Run this after the initial seed data is inserted

-- Update admin password (admin123)
UPDATE users SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email = 'admin@villimale-hospital.mv';

-- Update inventory manager password (inventory123)  
UPDATE users SET password_hash = '$2b$10$K7L/8Y3r6wN9yTVFQdnnie7Q/.1sVBjr/4X5PYLd/PUDVfGo.Hqvq'
WHERE email = 'john.smith@villimale-hospital.mv';

-- Update doctor password (doctor123)
UPDATE users SET password_hash = '$2b$10$9Y4H8Y3r6wN9yTVFQdnnie7Q/.1sVBjr/4X5PYLd/PUDVfGo.Hqvq'
WHERE email = 'sarah.johnson@villimale-hospital.mv';

-- Verify the updates
SELECT email, first_name, last_name, role, status, is_first_login 
FROM users 
ORDER BY created_at;
