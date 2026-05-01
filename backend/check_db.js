const pool = require('./config/db');

async function checkStores() {
  try {
    const [rows] = await pool.query('SELECT * FROM stores');
    console.log('Stores in database:', JSON.stringify(rows, null, 2));
    
    const [products] = await pool.query('SELECT id, name FROM products LIMIT 5');
    console.log('Sample Products:', JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Database Check Error:', err.message);
  } finally {
    process.exit();
  }
}

checkStores();
