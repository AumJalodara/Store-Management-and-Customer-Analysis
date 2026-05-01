const pool = require('../config/db');

const getTransfers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.name           AS product_name,
         s1.name          AS from_store,
         s2.name          AS to_store,
         t.quantity,
         t.transfer_date,
         t.status
       FROM transfers t
       JOIN products p  ON t.product_id    = p.id
       JOIN stores   s1 ON t.from_store_id = s1.id
       JOIN stores   s2 ON t.to_store_id   = s2.id
       ORDER BY t.transfer_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[transferController]', err.message);
    res.status(500).json({ error: 'Failed to fetch transfers', details: err.message });
  }
};

const createTransfer = async (req, res) => {
  const { product_id, from_store_id, to_store_id, quantity, transfer_date } = req.body;

  if (!product_id || !from_store_id || !to_store_id || !quantity) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Check if source store has enough stock
    const [sourceStock] = await conn.query(
      'SELECT quantity FROM inventory WHERE product_id = ? AND store_id = ?',
      [product_id, from_store_id]
    );

    if (sourceStock.length === 0 || sourceStock[0].quantity < quantity) {
      await conn.rollback();
      return res.status(400).json({ error: 'Insufficient stock in source store.' });
    }

    // 2. Reduce stock from source store
    await conn.query(
      'UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND store_id = ?',
      [quantity, product_id, from_store_id]
    );

    // 3. Increase stock in destination store
    // Check if record exists in destination store
    const [destStock] = await conn.query(
      'SELECT id FROM inventory WHERE product_id = ? AND store_id = ?',
      [product_id, to_store_id]
    );

    if (destStock.length > 0) {
      await conn.query(
        'UPDATE inventory SET quantity = quantity + ? WHERE product_id = ? AND store_id = ?',
        [quantity, product_id, to_store_id]
      );
    } else {
      await conn.query(
        'INSERT INTO inventory (product_id, store_id, quantity) VALUES (?, ?, ?)',
        [product_id, to_store_id, quantity]
      );
    }

    // 4. Insert into transfers table
    await conn.query(
      `INSERT INTO transfers (product_id, from_store_id, to_store_id, quantity, transfer_date, status)
       VALUES (?, ?, ?, ?, ?, 'Completed')`,
      [product_id, from_store_id, to_store_id, quantity, transfer_date || new Date()]
    );

    await conn.commit();
    res.status(201).json({ message: 'Transfer completed successfully.' });

  } catch (err) {
    await conn.rollback();
    console.error('[transferController] createTransfer:', err.message);
    res.status(500).json({ error: 'Failed to complete transfer.', details: err.message });
  } finally {
    conn.release();
  }
};

module.exports = { getTransfers, createTransfer };
