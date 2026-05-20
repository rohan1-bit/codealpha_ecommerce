const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { getDb, query, run } = require('./database');
const { authenticate, SECRET } = require('./middleware');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files from the same directory as server.js
app.use(express.static(path.join(__dirname)));

// ─── AUTH ROUTES ────────────────────────────────────────────────────────────

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const existing = query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    run('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', [id, name, email, hashed]);

    const token = jwt.sign({ id, name, email, role: 'customer' }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, name, email, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/me', authenticate, (req, res) => {
  const users = query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!users.length) return res.status(404).json({ error: 'User not found' });
  res.json(users[0]);
});

// ─── PRODUCT ROUTES ──────────────────────────────────────────────────────────

app.get('/api/products/categories', (req, res) => {
  const cats = query('SELECT DISTINCT category FROM products ORDER BY category');
  res.json(['All', ...cats.map(c => c.category)]);
});

app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (sort === 'price_asc') sql += ' ORDER BY price ASC';
  else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
  else sql += ' ORDER BY created_at DESC';

  res.json(query(sql, params));
});

app.get('/api/products/:id', (req, res) => {
  const products = query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!products.length) return res.status(404).json({ error: 'Product not found' });
  res.json(products[0]);
});

// ─── ORDER ROUTES ────────────────────────────────────────────────────────────

app.post('/api/orders', authenticate, (req, res) => {
  try {
    const { items, shipping_address } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'No items in order' });
    if (!shipping_address) return res.status(400).json({ error: 'Shipping address required' });

    let total = 0;
    const enrichedItems = [];

    for (const item of items) {
      const products = query('SELECT * FROM products WHERE id = ?', [item.productId]);
      if (!products.length) return res.status(404).json({ error: `Product ${item.productId} not found` });
      const product = products[0];
      if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      total += product.price * item.quantity;
      enrichedItems.push({ product, quantity: item.quantity });
    }

    const orderId = uuidv4();
    run('INSERT INTO orders (id, user_id, total, status, shipping_address) VALUES (?, ?, ?, ?, ?)',
      [orderId, req.user.id, total, 'confirmed', JSON.stringify(shipping_address)]);

    for (const { product, quantity } of enrichedItems) {
      run('INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), orderId, product.id, quantity, product.price]);
      run('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, product.id]);
    }

    const order = query('SELECT * FROM orders WHERE id = ?', [orderId])[0];
    const orderItems = query(`
      SELECT oi.*, p.name, p.image FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?`, [orderId]);

    res.json({ ...order, items: orderItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', authenticate, (req, res) => {
  const orders = query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  const result = orders.map(order => {
    const items = query(`
      SELECT oi.*, p.name, p.image FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?`, [order.id]);
    return { ...order, items };
  });
  res.json(result);
});

app.get('/api/orders/:id', authenticate, (req, res) => {
  const orders = query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!orders.length) return res.status(404).json({ error: 'Order not found' });
  const items = query(`
    SELECT oi.*, p.name, p.image FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?`, [req.params.id]);
  res.json({ ...orders[0], items });
});

// ─── START ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;

getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🛒 ShopHaus running at http://localhost:${PORT}`);
    console.log(`   Open http://localhost:${PORT}/index.html in your browser`);
  });
}).catch(console.error);