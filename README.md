# 🛒 ShopHaus — Full-Stack E-Commerce Store

A complete e-commerce application with product listings, cart, checkout, user auth, and order history.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript     |
| Backend   | Node.js + Express.js                |
| Database  | SQLite (via sql.js — zero setup)    |
| Auth      | JWT + bcrypt                        |

## Features

- ✅ Product listings with category filters & search
- ✅ Product detail pages
- ✅ Shopping cart (persisted in localStorage)
- ✅ User registration & login (JWT auth)
- ✅ Checkout with shipping address form
- ✅ Order processing & confirmation
- ✅ Order history page
- ✅ Stock management (auto-decrements on purchase)
- ✅ Responsive design

## Project Structure

```
ecommerce/
├── backend/
│   ├── server.js       # Express API server
│   ├── database.js     # SQLite setup + seed data
│   └── middleware.js   # JWT auth middleware
└── frontend/
    ├── index.html      # Product listing / homepage
    ├── product.html    # Product detail page
    ├── checkout.html   # Checkout page
    ├── success.html    # Order confirmation
    ├── orders.html     # Order history
    ├── css/style.css   # All styles
    └── js/
        ├── app.js      # API, cart, auth logic
        └── layout.js   # Shared navbar/cart/modal
```

## Setup & Run

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Start the API server
```bash
node server.js
# Server starts at http://localhost:3001
```

### 3. Open the frontend
Open `frontend/index.html` in your browser.

> **Tip:** Use a local server like VS Code's Live Server extension or:
> ```bash
> cd frontend && npx serve .
> ```

## API Endpoints

| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| POST   | /api/register         | No   | Create account       |
| POST   | /api/login            | No   | Get JWT token        |
| GET    | /api/me               | Yes  | Current user info    |
| GET    | /api/products         | No   | List products        |
| GET    | /api/products/:id     | No   | Product detail       |
| GET    | /api/products/categories | No | Category list     |
| POST   | /api/orders           | Yes  | Place order          |
| GET    | /api/orders           | Yes  | My orders            |
| GET    | /api/orders/:id       | Yes  | Order detail         |

## Seed Data

The database auto-seeds with 8 products across 4 categories:
- Electronics (Headphones, Keyboard, Speaker)
- Accessories (Watch)
- Bags (Tote)
- Kitchen (Coffee Set, Water Bottle)
- Clothing (Sweater)
