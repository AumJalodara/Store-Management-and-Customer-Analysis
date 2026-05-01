const pool = require('../config/db');

// ── GET /api/products ─────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.brand,
         p.category_id,
         c.name AS category_name,
         p.price,
         COALESCE(p.discounted_price, p.price) AS discounted_price,
         p.seasonal_flag,
         p.reorder_level,
         COALESCE(SUM(i.quantity), 0) AS total_quantity
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory i  ON i.product_id = p.id
       GROUP BY
         p.id, p.name, p.brand, p.category_id, c.name,
         p.price, p.discounted_price, p.seasonal_flag, p.reorder_level
       ORDER BY p.name`
    );
    res.json(rows);
  } catch (err) {
    console.error('[productController] getProducts:', err.message);
    res.status(500).json({ error: 'Failed to fetch products.', details: err.message });
  }
};

// ── POST /api/products ────────────────────────────────────────────────────────
const addProduct = async (req, res) => {
  const { name, category_id, brand, price, discounted_price, seasonal_flag, reorder_level } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Product name and price are required.' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM products WHERE LOWER(name) = LOWER(?)',
      [name.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: `A product named "${name}" already exists.` });
    }

    const [result] = await pool.query(
      `INSERT INTO products
         (name, category_id, brand, price, discounted_price, seasonal_flag, reorder_level)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category_id   || null,
        brand?.trim() || null,
        parseFloat(price),
        discounted_price ? parseFloat(discounted_price) : parseFloat(price),
        seasonal_flag  ? 'festive' : 'all',
        parseInt(reorder_level) || 10,
      ]
    );

    res.status(201).json({
      message: `Product "${name}" added successfully.`,
      id: result.insertId,
    });

  } catch (err) {
    console.error('[productController] Error Details:', {
      message: err.message,
      sqlMessage: err.sqlMessage,
      code: err.code
    });
    res.status(500).json({ error: 'Failed to add product.', details: err.sqlMessage || err.message });
  }
};

// ── PUT /api/products/:id ─────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category_id, brand, price, discounted_price, seasonal_flag, reorder_level } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Product name and price are required.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const [dupCheck] = await pool.query(
      'SELECT id FROM products WHERE LOWER(name) = LOWER(?) AND id != ?',
      [name.trim(), id]
    );
    if (dupCheck.length > 0) {
      return res.status(409).json({ error: `Another product named "${name}" already exists.` });
    }

    await pool.query(
      `UPDATE products
         SET name = ?, category_id = ?, brand = ?, price = ?,
             discounted_price = ?, seasonal_flag = ?, reorder_level = ?
       WHERE id = ?`,
      [
        name.trim(),
        category_id   || null,
        brand?.trim() || null,
        parseFloat(price),
        discounted_price ? parseFloat(discounted_price) : parseFloat(price),
        seasonal_flag ? 'festive' : 'all',
        parseInt(reorder_level) || 10,
        id,
      ]
    );

    res.json({ message: `Product "${name}" updated successfully.` });

  } catch (err) {
    console.error('[productController] updateProduct:', err.message);
    res.status(500).json({ error: 'Failed to update product.', details: err.message });
  }
};

// ── DELETE /api/products/:id ──────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query(
      'SELECT id, name FROM products WHERE id = ?', [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const productName = existing[0].name;

    // Remove child rows first to avoid FK constraint errors
    await pool.query('DELETE FROM inventory WHERE product_id = ?', [id]);
    await pool.query('DELETE FROM batches   WHERE product_id = ?', [id]);
    await pool.query('DELETE FROM products  WHERE id = ?',         [id]);

    res.json({ message: `Product "${productName}" deleted successfully.` });

  } catch (err) {
    console.error('[productController] deleteProduct:', err.message);
    res.status(500).json({ error: 'Failed to delete product.', details: err.message });
  }
};

// ── GET /api/stores ───────────────────────────────────────────────────────────
const getStores = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM stores ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('[productController] getStores:', err.message);
    res.status(500).json({ error: 'Failed to fetch stores.', details: err.message });
  }
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct, getStores };
