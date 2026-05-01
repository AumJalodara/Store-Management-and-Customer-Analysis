-- Smart Store Management System Database Schema
-- Run this file to initialize and seed the database

CREATE DATABASE IF NOT EXISTS smartstore;
USE smartstore;

-- ============================================================
-- TABLE: stores
-- ============================================================
CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200),
  manager VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100),
  sku VARCHAR(50) UNIQUE,
  unit_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  reorder_level INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: inventory
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  store_id INT,
  quantity INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- ============================================================
-- TABLE: customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: sales
-- ============================================================
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

-- ============================================================
-- TABLE: batches
-- ============================================================
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

-- ============================================================
-- TABLE: warehouse_stock
-- ============================================================
CREATE TABLE IF NOT EXISTS warehouse_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  quantity INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================
-- TABLE: transfers
-- ============================================================
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

-- ============================================================
-- SEED DATA: stores
-- ============================================================
INSERT INTO stores (name, location, manager) VALUES
('Main Branch', 'Downtown Plaza, Block A', 'Ahmed Hassan'),
('North Store', 'North Mall, Level 2', 'Sara Ali'),
('East Outlet', 'East Commercial Hub', 'Omar Farooq'),
('West Point', 'Westside Shopping Center', 'Layla Nasser');

-- ============================================================
-- SEED DATA: products
-- ============================================================
INSERT INTO products (name, category, sku, unit_price, cost_price, reorder_level) VALUES
('Samsung Galaxy S24', 'Electronics', 'SKU-ELEC-001', 899.99, 650.00, 5),
('Apple iPhone 15', 'Electronics', 'SKU-ELEC-002', 1099.99, 800.00, 5),
('Sony WH-1000XM5 Headphones', 'Electronics', 'SKU-ELEC-003', 349.99, 230.00, 8),
('LG 4K Smart TV 55"', 'Electronics', 'SKU-ELEC-004', 699.99, 500.00, 3),
('Nike Air Max 270', 'Footwear', 'SKU-FOOT-001', 149.99, 80.00, 15),
('Adidas Ultraboost 23', 'Footwear', 'SKU-FOOT-002', 179.99, 100.00, 12),
('Levi\'s 501 Jeans', 'Clothing', 'SKU-CLTH-001', 79.99, 40.00, 20),
('Ralph Lauren Polo Shirt', 'Clothing', 'SKU-CLTH-002', 89.99, 45.00, 18),
('Nescafe Gold 200g', 'Groceries', 'SKU-GROC-001', 12.99, 7.00, 30),
('Lipton Green Tea (100 bags)', 'Groceries', 'SKU-GROC-002', 8.99, 4.50, 40),
('Dove Body Wash 500ml', 'Personal Care', 'SKU-CARE-001', 7.49, 3.50, 25),
('Colgate Total Toothpaste', 'Personal Care', 'SKU-CARE-002', 4.99, 2.20, 35),
('Bosch Power Drill', 'Tools', 'SKU-TOOL-001', 129.99, 80.00, 6),
('3M Safety Gloves', 'Tools', 'SKU-TOOL-002', 19.99, 8.00, 20),
('Nestle Milo 1kg', 'Groceries', 'SKU-GROC-003', 14.99, 8.00, 25);

-- ============================================================
-- SEED DATA: inventory
-- ============================================================
INSERT INTO inventory (product_id, store_id, quantity) VALUES
(1, 1, 12), (1, 2, 3), (1, 3, 8), (1, 4, 15),
(2, 1, 7), (2, 2, 2), (2, 3, 9), (2, 4, 4),
(3, 1, 4), (3, 2, 11), (3, 3, 2), (3, 4, 6),
(4, 1, 2), (4, 2, 5), (4, 3, 1), (4, 4, 3),
(5, 1, 20), (5, 2, 8), (5, 3, 25), (5, 4, 3),
(6, 1, 18), (6, 2, 5), (6, 3, 22), (6, 4, 9),
(7, 1, 35), (7, 2, 12), (7, 3, 28), (7, 4, 7),
(8, 1, 22), (8, 2, 9), (8, 3, 16), (8, 4, 4),
(9, 1, 60), (9, 2, 28), (9, 3, 45), (9, 4, 15),
(10, 1, 75), (10, 2, 32), (10, 3, 50), (10, 4, 20),
(11, 1, 40), (11, 2, 18), (11, 3, 33), (11, 4, 8),
(12, 1, 55), (12, 2, 22), (12, 3, 40), (12, 4, 12),
(13, 1, 5), (13, 2, 3), (13, 3, 8), (13, 4, 2),
(14, 1, 30), (14, 2, 7), (14, 3, 25), (14, 4, 5),
(15, 1, 48), (15, 2, 19), (15, 3, 36), (15, 4, 10);

-- ============================================================
-- SEED DATA: customers
-- ============================================================
INSERT INTO customers (name, email, phone, city) VALUES
('Mohammed Al-Rashid', 'mohammed@email.com', '+966501234567', 'Riyadh'),
('Fatima Al-Sayed', 'fatima@email.com', '+966502345678', 'Jeddah'),
('Abdullah Khan', 'abdullah@email.com', '+966503456789', 'Dammam'),
('Aisha Ibrahim', 'aisha@email.com', '+966504567890', 'Riyadh'),
('Khalid Al-Mansouri', 'khalid@email.com', '+966505678901', 'Mecca'),
('Nora Al-Qahtani', 'nora@email.com', '+966506789012', 'Medina'),
('Tariq Hassan', 'tariq@email.com', '+966507890123', 'Riyadh'),
('Layla Al-Otaibi', 'layla@email.com', '+966508901234', 'Jeddah'),
('Yusuf Mahmoud', 'yusuf@email.com', '+966509012345', 'Taif'),
('Rania Al-Zahrani', 'rania@email.com', '+966510123456', 'Riyadh'),
('Omar Farhan', 'omar@email.com', '+966511234567', 'Abha'),
('Maryam Saleh', 'maryam@email.com', '+966512345678', 'Riyadh');

-- ============================================================
-- SEED DATA: sales (last 6 months)
-- ============================================================
INSERT INTO sales (customer_id, store_id, product_id, quantity, unit_price, total_amount, sale_date) VALUES
-- January
(1, 1, 1, 1, 899.99, 899.99, '2025-01-05 10:30:00'),
(2, 2, 5, 2, 149.99, 299.98, '2025-01-08 14:20:00'),
(3, 1, 9, 5, 12.99, 64.95, '2025-01-12 09:15:00'),
(4, 3, 2, 1, 1099.99, 1099.99, '2025-01-15 16:45:00'),
(5, 1, 7, 3, 79.99, 239.97, '2025-01-20 11:00:00'),
(6, 4, 11, 4, 7.49, 29.96, '2025-01-22 13:30:00'),
(7, 2, 3, 1, 349.99, 349.99, '2025-01-25 15:00:00'),
(1, 1, 12, 6, 4.99, 29.94, '2025-01-28 10:00:00'),
-- February
(8, 1, 4, 1, 699.99, 699.99, '2025-02-03 12:00:00'),
(9, 3, 6, 2, 179.99, 359.98, '2025-02-07 14:30:00'),
(10, 1, 10, 8, 8.99, 71.92, '2025-02-10 09:00:00'),
(11, 2, 8, 2, 89.99, 179.98, '2025-02-14 16:00:00'),
(12, 4, 13, 1, 129.99, 129.99, '2025-02-18 11:30:00'),
(1, 1, 15, 3, 14.99, 44.97, '2025-02-22 13:00:00'),
(2, 3, 1, 1, 899.99, 899.99, '2025-02-26 15:30:00'),
-- March
(3, 1, 5, 3, 149.99, 449.97, '2025-03-02 10:30:00'),
(4, 2, 9, 10, 12.99, 129.90, '2025-03-06 14:00:00'),
(5, 1, 2, 1, 1099.99, 1099.99, '2025-03-10 09:30:00'),
(6, 4, 7, 4, 79.99, 319.96, '2025-03-14 16:30:00'),
(7, 3, 11, 6, 7.49, 44.94, '2025-03-18 11:00:00'),
(8, 1, 3, 1, 349.99, 349.99, '2025-03-22 13:30:00'),
(9, 2, 14, 5, 19.99, 99.95, '2025-03-26 15:00:00'),
(10, 1, 6, 2, 179.99, 359.98, '2025-03-30 10:00:00'),
-- April
(11, 3, 4, 1, 699.99, 699.99, '2025-04-03 12:30:00'),
(12, 1, 10, 12, 8.99, 107.88, '2025-04-07 14:00:00'),
(1, 4, 8, 3, 89.99, 269.97, '2025-04-11 09:00:00'),
(2, 1, 15, 5, 14.99, 74.95, '2025-04-15 16:00:00'),
(3, 2, 1, 2, 899.99, 1799.98, '2025-04-19 11:30:00'),
(4, 1, 12, 8, 4.99, 39.92, '2025-04-23 13:00:00'),
(5, 3, 5, 4, 149.99, 599.96, '2025-04-27 15:30:00'),
-- May
(6, 1, 2, 1, 1099.99, 1099.99, '2025-05-02 10:00:00'),
(7, 4, 9, 15, 12.99, 194.85, '2025-05-06 14:30:00'),
(8, 2, 3, 2, 349.99, 699.98, '2025-05-10 09:30:00'),
(9, 1, 7, 5, 79.99, 399.95, '2025-05-14 16:30:00'),
(10, 3, 11, 8, 7.49, 59.92, '2025-05-18 11:00:00'),
(11, 1, 6, 3, 179.99, 539.97, '2025-05-22 13:30:00'),
(12, 2, 13, 1, 129.99, 129.99, '2025-05-26 15:00:00'),
(1, 1, 4, 1, 699.99, 699.99, '2025-05-30 10:30:00'),
-- June (current month - partial)
(2, 3, 1, 1, 899.99, 899.99, '2025-06-03 12:00:00'),
(3, 1, 10, 6, 8.99, 53.94, '2025-06-07 14:00:00'),
(4, 4, 5, 2, 149.99, 299.98, '2025-06-10 09:00:00'),
(5, 1, 2, 1, 1099.99, 1099.99, '2025-06-12 16:30:00'),
(6, 2, 15, 4, 14.99, 59.96, '2025-06-14 11:00:00');

-- ============================================================
-- SEED DATA: batches (some expiring soon)
-- ============================================================
INSERT INTO batches (product_id, store_id, batch_code, quantity, manufacture_date, expiry_date) VALUES
(9, 1, 'BATCH-GROC-001', 50, '2025-01-01', DATE_ADD(CURDATE(), INTERVAL 10 DAY)),
(10, 2, 'BATCH-GROC-002', 30, '2025-02-01', DATE_ADD(CURDATE(), INTERVAL 15 DAY)),
(11, 1, 'BATCH-CARE-001', 40, '2025-03-01', DATE_ADD(CURDATE(), INTERVAL 22 DAY)),
(12, 3, 'BATCH-CARE-002', 60, '2025-01-15', DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
(15, 4, 'BATCH-GROC-003', 25, '2025-02-15', DATE_ADD(CURDATE(), INTERVAL 28 DAY)),
(9, 2, 'BATCH-GROC-004', 45, '2025-04-01', DATE_ADD(CURDATE(), INTERVAL 45 DAY)),
(10, 1, 'BATCH-GROC-005', 35, '2025-04-15', DATE_ADD(CURDATE(), INTERVAL 60 DAY));

-- ============================================================
-- SEED DATA: warehouse_stock
-- ============================================================
INSERT INTO warehouse_stock (product_id, quantity) VALUES
(1, 50), (2, 45), (3, 60), (4, 20),
(5, 100), (6, 90), (7, 150), (8, 120),
(9, 300), (10, 400), (11, 250), (12, 350),
(13, 40), (14, 180), (15, 200);

-- ============================================================
-- SEED DATA: transfers
-- ============================================================
INSERT INTO transfers (product_id, from_store_id, to_store_id, quantity, transfer_date, status) VALUES
(1, 1, 2, 5, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Completed'),
(5, 3, 4, 10, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Completed'),
(9, 1, 3, 20, DATE_SUB(NOW(), INTERVAL 1 DAY), 'In Transit'),
(7, 2, 4, 8, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Completed'),
(11, 1, 2, 15, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Completed'),
(3, 2, 3, 3, NOW(), 'Pending'),
(13, 1, 4, 2, DATE_SUB(NOW(), INTERVAL 6 DAY), 'Completed'),
(6, 3, 1, 7, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Completed'),
(4, 4, 1, 2, DATE_SUB(NOW(), INTERVAL 7 DAY), 'Completed'),
(2, 1, 3, 4, DATE_SUB(NOW(), INTERVAL 1 DAY), 'In Transit');

-- ============================================================
-- VIEW: customer behavior analysis
-- ============================================================
CREATE OR REPLACE VIEW customer_behavior AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.city,
  COUNT(s.id) AS total_orders,
  SUM(s.total_amount) AS total_spend,
  AVG(s.total_amount) AS avg_order_value,
  MAX(s.sale_date) AS last_purchase
FROM customers c
LEFT JOIN sales s ON c.id = s.customer_id
GROUP BY c.id, c.name, c.email, c.city;

-- ============================================================
-- TRIGGER: auto discount on expiring batches
-- ============================================================
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS apply_expiry_discount
BEFORE UPDATE ON batches
FOR EACH ROW
BEGIN
  DECLARE days_left INT;
  SET days_left = DATEDIFF(NEW.expiry_date, CURDATE());
  IF days_left <= 7 THEN
    UPDATE products SET unit_price = unit_price * 0.70 WHERE id = NEW.product_id;
  ELSEIF days_left <= 14 THEN
    UPDATE products SET unit_price = unit_price * 0.85 WHERE id = NEW.product_id;
  END IF;
END$$
DELIMITER ;
