const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const path = require('path');
const app    = express();
const routes = require('./routes/index');
const pool = require('./config/db'); // Import DB connection

// Configure EJS explicitly
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (for background images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Required for EJS form submissions

// All API routes are under /api (React uses these)
app.use('/api', routes);

const session = require('express-session');

app.use(session({
  secret: process.env.JWT_SECRET || 'smartstore-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

function authMiddleware(req, res, next) {
  // Check if session contains a user to protect the route
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// ----------------------------------------
// PROTECTED EJS VIEWS
// ----------------------------------------

app.get('/sales', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT
        p.name AS product_name,
        SUM(s.quantity) AS total_sold
      FROM sales s
      JOIN products p ON s.product_id = p.id
      GROUP BY p.name;
    `;
    const [data] = await pool.query(query);
    res.render('sales', { sales: data, error: null });
  } catch (err) {
    console.error('Error fetching sales data:', err);
    res.render('sales', { sales: [], error: 'Failed to fetch sales data.' });
  }
});

app.get('/customers', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY id DESC');
    res.render('customers', { customers: rows });
  } catch (err) {
    console.error('Customers EJS Error:', err);
    res.status(500).send('Server Error');
  }
});

app.get('/customers/add', authMiddleware, (req, res) => {
  res.render('addCustomer', { success: false, error: null });
});

app.post('/customers/add', authMiddleware, async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const query = `INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)`;
    await pool.query(query, [name, email, phone]);
    res.redirect('/customers');
  } catch (err) {
    console.error('Insert Customer Error:', err);
    res.render('addCustomer', { success: false, error: 'Database error occurred.' });
  }
});

app.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) AS low_stock_count
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.quantity <= p.reorder_level;
    `;
    const [result] = await pool.query(query);
    const lowStockCount = result[0].low_stock_count;

    const salesQuery = `
      SELECT 
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_sales
      FROM sales
      WHERE DATE(sale_date) = CURDATE()
    `;
    const [salesResult] = await pool.query(salesQuery);
    const salesToday = salesResult[0].total_sales;

    res.render('dashboard', { 
      lowStock: lowStockCount,
      salesToday: salesToday
    });
  } catch (err) {
    console.error('Dashboard EJS Error:', err);
    res.status(500).send('Server Error');
  }
});

app.get('/products', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id, p.name, p.brand, p.price, p.discounted_price, c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name ASC;
    `;
    const [rows] = await pool.query(query);
    res.render('products-ejs', { products: rows });
  } catch (err) {
    console.error('Products EJS Error:', err);
    res.status(500).send('Server Error');
  }
});

app.get('/revenue-dashboard', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT DATE_FORMAT(sale_date, '%b %Y') AS month, SUM(total_amount) AS revenue
      FROM sales WHERE YEAR(sale_date) = YEAR(CURDATE())
      GROUP BY DATE_FORMAT(sale_date, '%b %Y'), MONTH(sale_date) ORDER BY MONTH(sale_date);
    `;
    const [rows] = await pool.query(query);
    let revenueData = new Array(12).fill(0);
    rows.forEach(row => {
      const monthIndex = new Date(row.month + "-01").getMonth();
      revenueData[monthIndex] = parseFloat(row.revenue);
    });
    res.render('revenue', { revenueData: revenueData });
  } catch (error) {
    console.error('Revenue Error:', error);
    res.status(500).send('Server Error');
  }
});

// ----------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------

app.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

app.get('/', (req, res) => {
  res.redirect('/login');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Smart Store backend running on http://localhost:${PORT}`);
  console.log(`   Login endpoint: POST http://localhost:${PORT}/api/auth/login`);
});
