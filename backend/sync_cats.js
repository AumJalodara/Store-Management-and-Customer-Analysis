const pool = require('./config/db');

async function syncCategories() {
  try {
    const [cats] = await pool.query('SELECT id, name FROM categories');
    console.log('Categories found:', cats);

    const productsToUpdate = [
      { name: 'Basmati Rice 5kg', category: 'Groceries' },
      { name: 'Toor Dal 1kg', category: 'Groceries' },
      { name: 'Alphonso Mango Pulp', category: 'Groceries' },
      { name: 'iphone17 pro', category: 'Groceries' },
      { name: 'Mango Juice 1L', category: 'Beverages' },
      { name: 'Cold Coffee 500ml', category: 'Beverages' },
      { name: 'Hot Chocolate Mix', category: 'Beverages' },
      { name: 'Full Cream Milk 1L', category: 'Dairy' },
      { name: 'Paneer 200g', category: 'Dairy' },
      { name: 'Lays Chips 60g', category: 'Snacks' },
      { name: 'Kurkure 100g', category: 'Snacks' },
      { name: 'Shampoo 200ml', category: 'Personal Care' },
      { name: 'Soap 3-pack', category: 'Personal Care' },
      { name: 'Sunscreen SPF50', category: 'Personal Care' },
      { name: 'Pen', category: 'Personal Care' },
      { name: 'USB Cable 1m', category: 'Electronics' },
      { name: 'Earphones', category: 'Electronics' }
    ];

    for (const item of productsToUpdate) {
      const cat = cats.find(c => c.name.toLowerCase() === item.category.toLowerCase());
      if (cat) {
        await pool.query(
          'UPDATE products SET category_id = ? WHERE LOWER(name) = LOWER(?)',
          [cat.id, item.name.trim()]
        );
        console.log(`Updated ${item.name} -> ${item.category} (ID: ${cat.id})`);
      } else {
        console.warn(`Category ${item.category} not found for product ${item.name}`);
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

syncCategories();
