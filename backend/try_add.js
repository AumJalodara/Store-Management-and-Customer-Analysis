const pool = require('./config/db');

async function tryAdd() {
  try {
    const name = "iphone17 pro test " + Math.random();
    const category_id = 9;
    const brand = "apple";
    const price = 145000;
    const discounted_price = 25000;
    const seasonal_flag = 'all';
    const reorder_level = 10;

    const [result] = await pool.query(
      `INSERT INTO products
         (name, category_id, brand, price, discounted_price, seasonal_flag, reorder_level)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id, brand, price, discounted_price, seasonal_flag, reorder_level]
    );
    console.log('Success:', result.insertId);
  } catch (err) {
    console.log('SQL ERROR:', err.sqlMessage || err.message);
  } finally {
    process.exit();
  }
}

tryAdd();
