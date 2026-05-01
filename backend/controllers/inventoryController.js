const pool = require('../config/db');

// inventory columns : id, store_id, product_id, quantity
// products  columns : id, name, category_id, brand, price, reorder_level, ...
// stores    columns : id, name
// NOTE: inventory has NO batch_id column

const getInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.name        AS product_name,
         p.brand,
         p.category_id,
         st.name       AS store_name,
         i.quantity,
         p.reorder_level,
         CASE
           WHEN i.quantity  = 0               THEN 'Out of Stock'
           WHEN i.quantity <= p.reorder_level  THEN 'Low'
           ELSE 'OK'
         END           AS status
       FROM inventory i
       JOIN products p  ON i.product_id = p.id
       JOIN stores   st ON i.store_id   = st.id
       ORDER BY
         FIELD(status, 'Out of Stock', 'Low', 'OK'),
         i.quantity ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[inventoryController]', err.message);
    res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
  }
};

module.exports = { getInventory };
