const pool = require('./config/db');

async function testQuery() {
  try {
    const query = `
      SELECT
         DATE_FORMAT(sale_date, '%b %Y') AS month,
         MONTH(sale_date)                AS month_num,
         YEAR(sale_date)                 AS year_num,
         SUM(total_amount)               AS revenue
       FROM sales
       WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY YEAR(sale_date), MONTH(sale_date), DATE_FORMAT(sale_date, '%b %Y')
       ORDER BY YEAR(sale_date), MONTH(sale_date)
    `;
    const [rows] = await pool.query(query);
    console.log('Monthly Revenue Data:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Query Error:', err.message);
  } finally {
    process.exit();
  }
}

testQuery();
