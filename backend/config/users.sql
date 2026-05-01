USE smart_store;

-- Users table for role-based authentication
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'staff',
  is_active    TINYINT(1) DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed users (passwords are bcrypt of: admin123, manager123, staff123)
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
(
  'Admin User',
  'admin@smartstore.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
),
(
  'Store Manager',
  'manager@smartstore.com',
  '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B9d/oQi',
  'manager'
),
(
  'Staff Member',
  'staff@smartstore.com',
  '$2a$10$p/LmYqlzQ2b8TiI57gVmBeXk8yt9kzLU.P9Ci9AHm0IhK9.Nq4k6i',
  'staff'
);
-- Passwords: admin@smartstore.com → password123
--            manager@smartstore.com → password123
--            staff@smartstore.com → password123
