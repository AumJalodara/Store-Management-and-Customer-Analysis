const pool = require('./config/db');
const fs = require('fs');

async function checkStores() {
  let output = '';
  try {
    const [rows] = await pool.query('SELECT * FROM stores');
    output += 'Stores in database: ' + JSON.stringify(rows, null, 2) + '\n';
    
    const [products] = await pool.query('SELECT id, name FROM products LIMIT 5');
    output += 'Sample Products: ' + JSON.stringify(products, null, 2) + '\n';
  } catch (err) {
    output += 'Database Check Error: ' + err.message + '\n';
  } finally {
    fs.writeFileSync('db_check_result.txt', output);
    process.exit();
  }
}

checkStores();
