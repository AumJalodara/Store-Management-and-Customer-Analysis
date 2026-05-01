const pool = require('./config/db');
const fs = require('fs');

async function debugStores() {
  let output = '';
  try {
    const [tables] = await pool.query('SHOW TABLES');
    output += 'Tables: ' + JSON.stringify(tables, null, 2) + '\n\n';
    
    try {
      const [desc] = await pool.query('DESCRIBE stores');
      output += 'Stores Description: ' + JSON.stringify(desc, null, 2) + '\n\n';
      
      const [rows] = await pool.query('SELECT * FROM stores');
      output += 'Stores Data: ' + JSON.stringify(rows, null, 2) + '\n';
    } catch (e) {
      output += 'Error details for stores: ' + e.message + '\n';
    }
  } catch (err) {
    output += 'Database Debug Error: ' + err.message + '\n';
  } finally {
    fs.writeFileSync('db_debug_stores.txt', output);
    console.log('Debug complete. Check db_debug_stores.txt');
    process.exit();
  }
}

debugStores();
