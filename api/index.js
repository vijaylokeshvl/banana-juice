const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Error handling for Vercel
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Use /tmp for database when running on Vercel
const dbPath = process.env.VERCEL ? '/tmp/database.sqlite' : path.join(__dirname, '..', 'database.sqlite');

app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        environment: process.env.VERCEL ? 'vercel' : 'local',
        dbPath: dbPath
    });
});



// Database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables (especially important for Vercel's ephemeral /tmp storage)
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                flavor TEXT NOT NULL,
                description TEXT NOT NULL,
                price REAL NOT NULL,
                image TEXT NOT NULL,
                badge TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS cart_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                quantity INTEGER,
                FOREIGN KEY(product_id) REFERENCES products(id)
            )`);

            // Seed products if empty
            db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
                if (row && row.count === 0) {
                    const stmt = db.prepare("INSERT INTO products (name, flavor, description, price, image, badge) VALUES (?, ?, ?, ?, ?, ?)");
                    stmt.run("Banana Bliss", "banana", "Creamy, potassium-rich banana juice blended with a hint of honey.", 4.99, "fruit3.png", "Best Seller");
                    stmt.run("Orange Splash", "mango", "Freshly squeezed oranges, bursting with Vitamin C and citrus zest.", 5.49, "fruit1.png", "Popular");
                    stmt.run("Coconut Cool", "green", "Natural electrolytes and refreshing coconut water straight from the grove.", 5.99, "fruit2.png", null);
                    stmt.run("Masala Magic", "berry", "A traditional Indian blend of spices and fresh fruit for an exotic kick.", 6.49, "fruit4.png", "New");
                    stmt.finalize();
                }
            });
        });
    }
});

// API Endpoints

// 1. Get all products
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

// 2. Get cart items
app.get('/api/cart', (req, res) => {
    const query = `
        SELECT cart_items.id as cart_item_id, cart_items.quantity, products.*
        FROM cart_items
        JOIN products ON cart_items.product_id = products.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

// 3. Add to cart
app.post('/api/cart', (req, res) => {
    const { product_id, quantity } = req.body;
    
    // Check if item already in cart
    db.get("SELECT * FROM cart_items WHERE product_id = ?", [product_id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (row) {
            // Update quantity
            db.run("UPDATE cart_items SET quantity = quantity + ? WHERE product_id = ?", [quantity || 1, product_id], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: "Cart updated", id: row.id });
            });
        } else {
            // Insert new item
            db.run("INSERT INTO cart_items (product_id, quantity) VALUES (?, ?)", [product_id, quantity || 1], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: "Added to cart", id: this.lastID });
            });
        }
    });
});

// 4. Remove from cart
app.delete('/api/cart/:id', (req, res) => {
    db.run("DELETE FROM cart_items WHERE cart_item_id = ?", req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "deleted", changes: this.changes });
    });
});

// 5. Checkout
app.post('/api/checkout', (req, res) => {
    // In a real app, you would process payment, save order details, etc.
    // Here we just clear the cart to simulate a successful checkout.
    db.run("DELETE FROM cart_items", [], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Checkout successful! Thank you for your order." });
    });
});

// Export for Vercel serverless functions
module.exports = app;

// Start server locally
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
