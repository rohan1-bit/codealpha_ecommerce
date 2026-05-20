// ─── CONFIG ────────────────────────────────────────────────────────────────
const API = 'http://localhost:3001/api';

// ─── STATE ─────────────────────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let user = JSON.parse(localStorage.getItem('user') || 'null');
let token = localStorage.getItem('token') || null;

// ─── CART FUNCTIONS ─────────────────────────────────────────────────────────

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(product, qty = 1) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, product.stock);
  } else {
    cart.push({ ...product, quantity: qty });
  }
  saveCart();
  showToast(`${product.name} added to cart`, 'success');
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
}

function updateCartQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart();
}

function cartTotal() {
  return cart.reduce((s, i) => s + i.price * i.quantity, 0);
}

function cartCount() {
  return cart.reduce((s, i) => s + i.quantity, 0);
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const count = cartCount();
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  }
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p>Your cart is empty</p>
      </div>`;
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/72'">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="qty-mini-btn" onclick="updateCartQty('${item.id}', -1)">−</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="qty-mini-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
        </svg>
      </button>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = `$${cartTotal().toFixed(2)}`;
}

// ─── AUTH FUNCTIONS ──────────────────────────────────────────────────────────

function setAuthState(u, t) {
  user = u;
  token = t;
  if (u) {
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', t);
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  updateAuthUI();
}

function logout() {
  setAuthState(null, null);
  showToast('Logged out successfully');
  if (window.location.pathname.includes('orders') || window.location.pathname.includes('checkout')) {
    navigate('index.html');
  }
}

function updateAuthUI() {
  const authBtn = document.getElementById('nav-auth-btn');
  const userMenu = document.getElementById('user-menu-wrap');
  const userName = document.getElementById('user-name');

  if (user) {
    if (authBtn) authBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'block';
    if (userName) userName.textContent = user.name.split(' ')[0];
  } else {
    if (authBtn) authBtn.style.display = '';
    if (userMenu) userMenu.style.display = 'none';
  }
}

// ─── API HELPERS ──────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function showToast(message, type = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    '': `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || icons['']} <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ─── CART SIDEBAR TOGGLE ──────────────────────────────────────────────────────

function openCart() {
  document.getElementById('cart-overlay')?.classList.add('open');
  document.getElementById('cart-sidebar')?.classList.add('open');
}

function closeCart() {
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.getElementById('cart-sidebar')?.classList.remove('open');
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('open');
    switchTab(tab);
  }
}

function closeAuthModal() {
  document.getElementById('auth-modal')?.classList.remove('open');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.auth-form').forEach(f => f.style.display = f.id === `${tab}-form` ? 'block' : 'none');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');

  try {
    const data = await apiFetch('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setAuthState(data.user, data.token);
    closeAuthModal();
    showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const errEl = document.getElementById('reg-error');

  try {
    const data = await apiFetch('/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    setAuthState(data.user, data.token);
    closeAuthModal();
    showToast(`Welcome, ${data.user.name.split(' ')[0]}!`, 'success');
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
  }
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

function navigate(page, params = {}) {
  const qs = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
  window.location.href = page + qs;
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ─── USER MENU TOGGLE ─────────────────────────────────────────────────────────

function toggleUserMenu() {
  document.getElementById('user-menu')?.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const wrap = document.getElementById('user-menu-wrap');
  const menu = document.getElementById('user-menu');
  if (wrap && menu && !wrap.contains(e.target)) {
    menu.classList.remove('open');
  }
});

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  updateAuthUI();

  // Auth modal form listeners
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);
  document.getElementById('register-form')?.addEventListener('submit', handleRegister);

  // Checkout button
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    if (!user) {
      closeCart();
      openAuthModal('login');
      showToast('Please sign in to checkout', '');
    } else if (!cart.length) {
      showToast('Your cart is empty', 'error');
    } else {
      closeCart();
      navigate('checkout.html');
    }
  });
});
