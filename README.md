# SmartStore Management System

Full-stack retail management dashboard built with React + Node.js + MySQL.

## Features
- Role-based authentication (Admin / Manager / Staff)
- Full product CRUD (Add, Edit, Delete)
- Inventory tracking with low-stock alerts
- Sales analytics with charts
- Expiry batch alerts
- Inter-store transfer tracking
- Customer behavior analysis
- All currency in Indian Rupees (₹)

## Quick Start

### 1. Database Setup
```bash
mysql -u root -p < backend/config/schema.sql
mysql -u root -p smart_store < backend/config/users.sql
```

### 2. Backend
```bash
cd backend
npm install
# Edit .env → set DB_PASSWORD to your MySQL password
npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## Login Credentials (all use password: `password123`)

| Role    | Email                      | Access                          |
|---------|----------------------------|---------------------------------|
| Admin   | admin@smartstore.com       | Full access including delete    |
| Manager | manager@smartstore.com     | Add & edit products, view all   |
| Staff   | staff@smartstore.com       | View only, no edit/delete       |

## API Endpoints

| Method | Route              | Auth Required  | Description          |
|--------|--------------------|----------------|----------------------|
| POST   | /api/auth/login    | None           | Login                |
| GET    | /api/auth/me       | Any            | Current user info    |
| GET    | /api/dashboard     | Any            | Dashboard data       |
| GET    | /api/products      | Any            | List products        |
| POST   | /api/products      | Manager+       | Add product          |
| PUT    | /api/products/:id  | Manager+       | Update product       |
| DELETE | /api/products/:id  | Admin only     | Delete product       |
| GET    | /api/inventory     | Any            | Inventory status     |
| GET    | /api/sales         | Any            | Sales transactions   |
| GET    | /api/customers     | Any            | Customer insights    |
| GET    | /api/transfers     | Any            | Transfer log         |
| GET    | /api/expiry        | Any            | Expiry alerts        |

## Database: smart_store
Tables: `products`, `inventory`, `batches`, `stores`, `customers`, `sales`, `transfers`, `users`
