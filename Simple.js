const express = require('express');
const app = express();
app.use(express.json());

// In-memory store
const items = [{ id: 1, name: 'Hello', price: 1 }];

// Health
app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

// List items
app.get('/items', (req, res) => {
    res.json(items);
});

// Create item
app.post('/items', (req, res) => {
    const { name, price } = req.body || {};
    if (typeof name !== 'string' || typeof price !== 'number') {
        return res.status(400).json({ message: 'name (string) and price (number) required' });
    }
    const newItem = { id: items.length + 1, name, price };
    items.push(newItem);
    res.status(201).json(newItem);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));






