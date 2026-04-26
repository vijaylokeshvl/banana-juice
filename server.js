const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
