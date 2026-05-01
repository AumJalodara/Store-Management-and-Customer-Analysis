-- Seed data for smart_store database
-- Use this if your dashboard shows 0 values

CREATE DATABASE IF NOT EXISTS smart_store;
USE smart_store;

-- ── TABLE STRUCTURES (if not exists) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  manager VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  brand VARCHAR(100),
  category_id INT,
  price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  reorder_level INT DEFAULT 10,
  seasonal_flag TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  store_id INT,
  quantity INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  store_id INT,
  product_id INT,
  quantity INT,
  unit_price DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  store_id INT,
  batch_code VARCHAR(50),
  quantity INT,
  manufacture_date DATE,
  expiry_date DATE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  from_store_id INT,
  to_store_id INT,
  quantity INT,
  transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Completed',
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (from_store_id) REFERENCES stores(id),
  FOREIGN KEY (to_store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'staff',
  is_active    TINYINT(1) DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── SEED DATA ────────────────────────────────────────────────────────────────

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE inventory;
TRUNCATE TABLE transfers;
TRUNCATE TABLE sales;
TRUNCATE TABLE batches;
TRUNCATE TABLE products;
TRUNCATE TABLE customers;
TRUNCATE TABLE stores;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO stores (id, name, location, manager) VALUES
(1, 'Main Store', 'Downtown', 'Admin'),
(2, 'Sub Store A', 'North Square', 'Manager A'),
(3, 'Sub Store B', 'East Gate', 'Manager B');

INSERT INTO products (id, name, brand, category_id, price, discounted_price, reorder_level) VALUES
(1, 'Samsung Galaxy S24', 'Samsung', 1, 79999.00, 74999.00, 5),
(2, 'iPhone 15 Pro', 'Apple', 1, 129999.00, 119999.00, 3),
(3, 'Sony WH-1000XM5', 'Sony', 2, 29999.00, 24999.00, 8),
(4, 'Nike Air Max 270', 'Nike', 3, 12999.00, 10999.00, 10),
(5, 'Maggi Noodles', 'Nestle', 4, 15.00, 14.00, 50);

INSERT INTO inventory (product_id, store_id, quantity) VALUES
(1, 1, 15), (1, 2, 5),
(2, 1, 10), (2, 3, 2),
(3, 1, 20), (3, 2, 8),
(4, 1, 5), (4, 3, 25),
(5, 1, 500), (5, 2, 100), (5, 3, 50);

INSERT INTO customers (id, name, email, phone, city) VALUES
(1, 'John Doe', 'john@example.com', '9876543210', 'Mumbai'),
(2, 'Jane Smith', 'jane@example.com', '9876543211', 'Delhi'),
(3, 'Amit Patel', 'amit@example.com', '9876543212', 'Ahmedabad');

INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@smartstore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Manager', 'manager@smartstore.com', '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B9d/oQi', 'manager');

-- Sales
INSERT INTO sales (product_id, customer_id, store_id, quantity, unit_price, total_amount, sale_date) VALUES
(1, 1, 1, 1, 74999.00, 74999.00, NOW()),
(3, 2, 1, 2, 24999.00, 49998.00, NOW()),
(5, 3, 2, 10, 14.00, 140.00, NOW()),
-- History for graph
(1, 1, 1, 1, 74999.00, 74999.00, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(2, 2, 1, 1, 119999.00, 119999.00, DATE_SUB(NOW(), INTERVAL 2 MONTH)),
(3, 3, 2, 1, 24999.00, 24999.00, DATE_SUB(NOW(), INTERVAL 3 MONTH)),
(4, 3, 3, 2, 10999.00, 21998.00, DATE_SUB(NOW(), INTERVAL 4 MONTH)),
(5, 1, 1, 20, 14.00, 280.00, DATE_SUB(NOW(), INTERVAL 5 MONTH));

INSERT INTO batches (product_id, store_id, batch_code, quantity, manufacture_date, expiry_date) VALUES
(5, 1, 'B001', 100, DATE_SUB(CURDATE(), INTERVAL 3 MONTH), DATE_ADD(CURDATE(), INTERVAL 10 DAY)),
(5, 2, 'B002', 50, DATE_SUB(CURDATE(), INTERVAL 2 MONTH), DATE_ADD(CURDATE(), INTERVAL 5 DAY));

INSERT INTO transfers (product_id, from_store_id, to_store_id, quantity, transfer_date, status) VALUES
(1, 1, 2, 5, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Completed'),
(3, 1, 3, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Completed');
