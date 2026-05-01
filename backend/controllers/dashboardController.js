const pool = require('../config/db');

const getDashboard = async (req, res) => {
  try {

    // --- KPI 1: total products ---
    const [[{ totalProducts }]] = await pool.query(
      `SELECT COUNT(*) AS totalProducts FROM products`
    );

    // --- KPI 2: sales count + revenue TODAY ---
    const [[todayRow]] = await pool.query(
      `SELECT
         COUNT(*) AS salesToday,
         COALESCE(SUM(s.quantity * COALESCE(p.discounted_price, p.price)), 0) AS revenueToday
       FROM sales s
       JOIN products p ON s.product_id = p.id
       WHERE DATE(s.sale_date) = CURDATE()`
    );

    // --- KPI 3: revenue THIS month ---
    const [[{ monthRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(s.quantity * COALESCE(p.discounted_price, p.price)), 0) AS monthRevenue
       FROM sales s
       JOIN products p ON s.product_id = p.id
       WHERE MONTH(s.sale_date) = MONTH(CURDATE())
         AND YEAR(s.sale_date)  = YEAR(CURDATE())`
    );

    // --- KPI 4: revenue LAST month (for trend %) ---
    const [[{ lastMonthRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(s.quantity * COALESCE(p.discounted_price, p.price)), 0) AS lastMonthRevenue
       FROM sales s
       JOIN products p ON s.product_id = p.id
       WHERE MONTH(s.sale_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
         AND YEAR(s.sale_date)  = YEAR(DATE_SUB(CURDATE(),  INTERVAL 1 MONTH))`
    );

    // --- KPI 5: active customers (bought in last 30 days) ---
    const [[{ activeCustomers }]] = await pool.query(
      `SELECT COUNT(DISTINCT customer_id) AS activeCustomers
       FROM sales
       WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
    );

    // --- KPI 6: total customers ---
    const [[{ totalCustomers }]] = await pool.query(
      `SELECT COUNT(*) AS totalCustomers FROM customers`
    );

    // --- KPI 7: low stock count (NEW) ---
    const [[{ lowStockCount }]] = await pool.query(
      `SELECT COUNT(*) AS lowStockCount
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       WHERE i.quantity <= p.reorder_level`
    );

    // --- Chart: monthly revenue for last 6 months ---
    const [monthlyRevenue] = await pool.query(
      `SELECT
         DATE_FORMAT(s.sale_date, '%b %Y') AS month,
         MONTH(s.sale_date)                AS month_num,
         YEAR(s.sale_date)                 AS year_num,
         SUM(s.quantity * COALESCE(p.discounted_price, p.price)) AS revenue
       FROM sales s
       JOIN products p ON s.product_id = p.id
       WHERE s.sale_date >= DATE_SUB(CURDATE(), INTERVAL 24 MONTH)
       GROUP BY YEAR(s.sale_date), MONTH(s.sale_date), DATE_FORMAT(s.sale_date, '%b %Y')
       ORDER BY YEAR(s.sale_date), MONTH(s.sale_date)`
    );

    // --- Chart: top 6 selling products ---
    const [topProducts] = await pool.query(
      `SELECT
         p.name,
         SUM(s.quantity) AS units_sold,
         SUM(s.quantity * COALESCE(p.discounted_price, p.price)) AS revenue
       FROM sales s
       JOIN products p ON s.product_id = p.id
       GROUP BY p.id, p.name
       ORDER BY units_sold DESC
       LIMIT 6`
    );

    // --- Section: low stock alerts ---
    const [lowStock] = await pool.query(
      `SELECT
         p.name                                                      AS product_name,
         st.name                                                     AS store_name,
         i.quantity,
         p.reorder_level,
         GREATEST(p.reorder_level * 2 - i.quantity, p.reorder_level) AS suggested_reorder
       FROM inventory i
       JOIN products p  ON i.product_id = p.id
       JOIN stores   st ON i.store_id   = st.id
       WHERE i.quantity <= p.reorder_level
       ORDER BY i.quantity ASC
       LIMIT 8`
    );

    // --- Section: expiry alerts (All Expired + All Future with quantity) ---
    const [expiryAlerts] = await pool.query(
      `SELECT
         p.name                              AS product_name,
         b.batch_number                      AS batch_number,
         b.exp_date                          AS exp_date,
         DATEDIFF(b.exp_date, CURDATE())     AS days_remaining
       FROM batches b
       JOIN products p ON b.product_id = p.id
       WHERE b.quantity > 0
       ORDER BY b.exp_date ASC
       LIMIT 15`
    );

    // --- Section: recent transfers (Keeping logic for API but UI will be removed as requested) ---
    const [transfers] = await pool.query(
      `SELECT
         p.name          AS product_name,
         COALESCE(s1.name, 'Warehouse') AS from_store,
         s2.name         AS to_store,
         t.quantity,
         t.transfer_date
       FROM transfers t
       JOIN products p  ON t.product_id    = p.id
       LEFT JOIN stores s1 ON t.from_store_id = s1.id
       JOIN stores   s2 ON t.to_store_id   = s2.id
       ORDER BY t.transfer_date DESC
       LIMIT 8`
    );

    // --- Section: top customers ---
    const [customers] = await pool.query(
      `SELECT
         c.name,
         COUNT(s.id) AS total_orders,
         COALESCE(SUM(s.quantity * COALESCE(p.discounted_price, p.price)), 0) AS total_spend,
         MAX(s.sale_date) AS last_purchase
       FROM customers c
       LEFT JOIN sales s ON s.customer_id = c.id
       LEFT JOIN products p ON s.product_id = p.id
       GROUP BY c.id, c.name
       HAVING total_orders > 0
       ORDER BY total_spend DESC
       LIMIT 8`
    );

    res.json({
      kpis: {
        totalProducts,
        totalCustomers,
        salesToday:       todayRow.salesToday,
        revenueToday:     todayRow.revenueToday,
        activeCustomers,
        monthRevenue,
        lastMonthRevenue,
        lowStockCount,
      },
      monthlyRevenue: monthlyRevenue.map(row => ({ ...row, revenue: parseFloat(row.revenue) })),
      topProducts,
      lowStock,
      expiryAlerts,
      transfers,
      customers,
    });

  } catch (err) {
    console.error('[dashboardController]', err.message);
    res.status(500).json({ error: 'Dashboard data fetch failed', details: err.message });
  }
};

module.exports = { getDashboard };
