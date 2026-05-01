const pool = require('../config/db');

// sales columns: id, store_id, customer_id, product_id, quantity, total_amount, sale_date

const getSales = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         s.id,
         c.name             AS customer_name,
         st.name            AS store_name,
         p.name             AS product_name,
         p.brand,
         s.quantity,
         COALESCE(p.discounted_price, p.price) AS unit_price,
         (s.quantity * COALESCE(p.discounted_price, p.price)) AS total_amount,
         s.sale_date
       FROM sales s
       JOIN customers c ON s.customer_id = c.id
       JOIN stores   st ON s.store_id    = st.id
       JOIN products p  ON s.product_id  = p.id
       ORDER BY s.sale_date DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    console.error('[salesController]', err.message);
    res.status(500).json({ error: 'Failed to fetch sales', details: err.message });
  }
};

module.exports = { getSales };
