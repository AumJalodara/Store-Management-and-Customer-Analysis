const pool = require('../config/db');

// customers columns: id, name, email, phone
// sales     columns: id, store_id, customer_id, product_id, quantity, total_amount, sale_date

const getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         c.id,
         c.name,
         c.email,
         c.phone,
         COUNT(s.id) AS total_orders,
         COALESCE(SUM(s.quantity * COALESCE(p.discounted_price, p.price)), 0) AS total_spend,
         COALESCE(AVG(s.quantity * COALESCE(p.discounted_price, p.price)), 0) AS avg_order_value,
         MAX(s.sale_date) AS last_purchase
       FROM customers c
       LEFT JOIN sales s ON s.customer_id = c.id
       LEFT JOIN products p ON s.product_id = p.id
       GROUP BY c.id, c.name, c.email, c.phone
       ORDER BY total_spend DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[customerController]', err.message);
    res.status(500).json({ error: 'Failed to fetch customers', details: err.message });
  }
};

const addCustomer = async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('[customerController] addCustomer:', err.message);
    res.status(500).json({ error: 'Failed to add customer', details: err.message });
  }
};

const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[customerController] deleteCustomer:', err.message);
    res.status(500).json({ error: 'Failed to delete customer', details: err.message });
  }
};

module.exports = { getCustomers, addCustomer, deleteCustomer };
