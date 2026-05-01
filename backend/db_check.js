const pool = require('./config/db');

async function check() {
  try {
    const [[{ db }]] = await pool.query('SELECT DATABASE() as db');
    console.log('Connected to Database:', db);

    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables found:', tables.map(t => Object.values(t)[0]));

    const [[{ products }]] = await pool.query('SELECT COUNT(*) as products FROM products');
    const [[{ customers }]] = await pool.query('SELECT COUNT(*) as customers FROM customers');
    const [[{ sales }]] = await pool.query('SELECT COUNT(*) as sales FROM sales');
    
    console.log('Row counts:');
    console.log('- Products:', products);
    console.log('- Customers:', customers);
    console.log('- Sales:', sales);

  } catch (err) {
    console.error('Database Check Error:', err.message);
  } finally {
    process.exit();
  }
}

check();
