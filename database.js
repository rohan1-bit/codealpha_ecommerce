const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'shop.db');

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    initSchema();
    saveDb();
  }

  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      shipping_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Seed products
  const products = [
    { id: 'p1', name: 'Wireless Noise-Cancelling Headphones', description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for travel and work-from-home.', price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', category: 'Electronics', stock: 42 },
    { id: 'p2', name: 'Minimalist Leather Watch', description: 'Handcrafted genuine leather strap with a clean Swiss-movement dial. Water resistant to 50m. Comes with gift box.', price: 189.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', category: 'Accessories', stock: 18 },
    { id: 'p3', name: 'Mechanical Keyboard TKL', description: 'Tenkeyless mechanical keyboard with Cherry MX Red switches, RGB backlighting, and a durable aluminum frame. USB-C connectivity.', price: 149.99, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80', category: 'Electronics', stock: 55 },
    { id: 'p4', name: 'Linen Tote Bag', description: 'Eco-friendly heavyweight linen tote with reinforced handles and an interior pocket. Fits 15-inch laptops comfortably.', price: 49.95, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', category: 'Bags', stock: 120 },
    { id: 'p5', name: 'Ceramic Pour-Over Coffee Set', description: 'Hand-thrown ceramic dripper with matching mug. Includes a stainless steel gooseneck kettle and specialty filters. Perfect gift for coffee lovers.', price: 89.00, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', category: 'Kitchen', stock: 30 },
    { id: 'p6', name: 'Portable Bluetooth Speaker', description: '360° surround sound with 20W output, IPX7 waterproof rating, and 12-hour playtime. Pairs instantly with all Bluetooth devices.', price: 119.99, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80', category: 'Electronics', stock: 67 },
    { id: 'p7', name: 'Merino Wool Crewneck Sweater', description: 'Ultra-soft 100% merino wool knit, temperature-regulating and naturally odor-resistant. Available in 6 colors, machine washable.', price: 135.00, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80', category: 'Clothing', stock: 84 },
    { id: 'p8', name: 'Stainless Steel Water Bottle', description: 'Triple-wall vacuum insulation keeps drinks cold 48h and hot 24h. BPA-free, leak-proof lid, fits most car cup holders. 32oz.', price: 39.99, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80', category: 'Kitchen', stock: 200 },
  ];

  for (const p of products) {
    db.run(
      `INSERT OR IGNORE INTO products (id, name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.description, p.price, p.image, p.category, p.stock]
    );
  }
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

module.exports = { getDb, query, run, saveDb };
