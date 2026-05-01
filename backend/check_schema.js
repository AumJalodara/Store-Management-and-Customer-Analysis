const pool = require('./config/db');

async function checkSchema() {
  try {
    const [cols] = await pool.query('DESCRIBE products');
    console.log('Products Table Schema:', JSON.stringify(cols, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

checkSchema();
