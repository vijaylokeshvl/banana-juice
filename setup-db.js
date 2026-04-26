const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    // Create products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        flavor TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT NOT NULL,
        badge TEXT
    )`);

    // Create cart table (for a simple implementation, we might not need this if using local storage, but good for full stack)
    db.run(`CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity INTEGER,
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);

    // Clear existing products
    db.run('DELETE FROM products');

    // Seed products
    const stmt = db.prepare("INSERT INTO products (name, flavor, description, price, image, badge) VALUES (?, ?, ?, ?, ?, ?)");
    
    stmt.run("Banana Bliss", "banana", "Creamy, potassium-rich banana juice blended with a hint of honey.", 4.99, "fruit3.png", "Best Seller");
    stmt.run("Orange Splash", "mango", "Freshly squeezed oranges, bursting with Vitamin C and citrus zest.", 5.49, "fruit1.png", "Popular");
    stmt.run("Coconut Cool", "green", "Natural electrolytes and refreshing coconut water straight from the grove.", 5.99, "fruit2.png", null);
    stmt.run("Masala Magic", "berry", "A traditional Indian blend of spices and fresh fruit for an exotic kick.", 6.49, "fruit4.png", "New");
    
    stmt.finalize();

    console.log("Database initialized and products seeded successfully.");
});

db.close();
