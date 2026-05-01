const pool = require('./config/db');

async function syncSalesPrices() {
  try {
    console.log('Starting Price Sync between Products and Sales...');

    // Get all products and their current prices
    const [products] = await pool.query(
      'SELECT id, price, COALESCE(discounted_price, price) AS current_price FROM products'
    );
    const priceMap = {};
    products.forEach(p => { priceMap[p.id] = p.current_price; });

    // Get all sales
    const [sales] = await pool.query('SELECT id, product_id, quantity, total_amount FROM sales');
    
    let updatedCount = 0;
    for (const sale of sales) {
      const currentPrice = priceMap[sale.product_id];
      if (currentPrice !== undefined) {
        const newTotal = sale.quantity * currentPrice;
        
        // Only update if it actually changed
        if (parseFloat(newTotal).toFixed(2) !== parseFloat(sale.total_amount).toFixed(2)) {
          await pool.query(
            'UPDATE sales SET unit_price = ?, total_amount = ? WHERE id = ?',
            [currentPrice, newTotal, sale.id]
          );
          updatedCount++;
        }
      }
    }

    console.log(`Sync complete! Updated ${updatedCount} sales records to match current product prices.`);

  } catch (err) {
    console.error('Sync Error:', err.message);
  } finally {
    process.exit();
  }
}

syncSalesPrices();
