const pool = require('../config/db');

// batches columns: id, product_id, batch_number, mfg_date, exp_date, quantity

const getExpiryAlerts = async (req, res) => {
  try {
    // Batches expiring within 120 days (Upcoming)
    const [expiringSoon] = await pool.query(
      `SELECT
         p.name                           AS product_name,
         p.brand,
         b.batch_number,
         b.mfg_date,
         b.exp_date,
         b.quantity,
         DATEDIFF(b.exp_date, CURDATE()) AS days_remaining
       FROM batches b
       JOIN products p ON b.product_id = p.id
       WHERE b.exp_date >= CURDATE()
         AND b.exp_date <= DATE_ADD(CURDATE(), INTERVAL 120 DAY)
         AND b.quantity > 0
       ORDER BY b.exp_date ASC`
    );

    // Already expired batches
    const [alreadyExpired] = await pool.query(
      `SELECT
         p.name                          AS product_name,
         p.brand,
         b.batch_number,
         b.exp_date,
         b.quantity,
         DATEDIFF(CURDATE(), b.exp_date) AS days_overdue
       FROM batches b
       JOIN products p ON b.product_id = p.id
       WHERE b.exp_date < CURDATE()
         AND b.quantity > 0
       ORDER BY b.exp_date DESC
       LIMIT 50`
    );

    res.json({ expiringSoon, alreadyExpired });
  } catch (err) {
    console.error('[expiryController]', err.message);
    res.status(500).json({ error: 'Failed to fetch expiry data', details: err.message });
  }
};

module.exports = { getExpiryAlerts };
