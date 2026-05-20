// Shared layout components injected into each page

function getNavbarHTML(activePage = '') {
  return `
  <nav class="navbar">
    <div class="nav-inner">
      <a href="index.html" class="nav-logo">Shop<span>Haus</span></a>
      <div class="nav-links">
        <a href="index.html" style="${activePage==='home'?'color:var(--dark)':''}">Shop</a>
        <a href="orders.html" style="${activePage==='orders'?'color:var(--dark)':''}">My Orders</a>
      </div>
      <div class="nav-right">
        <div class="nav-search">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" id="nav-search" placeholder="Search products…" onkeydown="if(event.key==='Enter')doSearch(this.value)">
        </div>

        <button class="nav-icon-btn" onclick="openCart()" aria-label="Cart">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span class="cart-badge" id="cart-badge">0</span>
        </button>

        <a href="index.html" id="nav-auth-btn" class="btn-nav-auth" onclick="event.preventDefault();openAuthModal('login')">Sign In</a>

        <div class="user-menu-wrap" id="user-menu-wrap" style="display:none">
          <button class="nav-icon-btn" onclick="toggleUserMenu()" style="gap:0.3rem;width:auto;padding:0 0.5rem;border-radius:20px;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span id="user-name" style="font-size:14px;font-weight:500"></span>
          </button>
          <div class="user-menu" id="user-menu">
            <a href="orders.html" class="user-menu-item">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
              </svg>
              My Orders
            </a>
            <div class="divider"></div>
            <button class="user-menu-item danger" onclick="logout()">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>`;
}

function getCartSidebarHTML() {
  return `
  <div class="cart-overlay" id="cart-overlay" onclick="closeCart()"></div>
  <div class="cart-sidebar" id="cart-sidebar">
    <div class="cart-header">
      <h2>Shopping Cart</h2>
      <button class="cart-close" onclick="closeCart()">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="cart-items" id="cart-items"></div>
    <div class="cart-footer">
      <div class="cart-total">
        <span>Total</span>
        <span id="cart-total">$0.00</span>
      </div>
      <button class="btn btn-primary btn-full" id="checkout-btn">Proceed to Checkout</button>
    </div>
  </div>`;
}

function getAuthModalHTML() {
  return `
  <div class="modal-overlay" id="auth-modal" onclick="if(event.target===this)closeAuthModal()">
    <div class="modal" style="position:relative">
      <button class="modal-close-btn" onclick="closeAuthModal()">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="modal-header">
        <div class="modal-title">ShopHaus</div>
        <div class="modal-sub">Sign in or create an account</div>
      </div>
      <div class="tab-row">
        <button class="tab-btn active" data-tab="login" onclick="switchTab('login')">Sign In</button>
        <button class="tab-btn" data-tab="register" onclick="switchTab('register')">Register</button>
      </div>

      <form id="login-form" class="auth-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="login-email" placeholder="you@example.com" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="login-password" placeholder="••••••••" required>
        </div>
        <div class="form-error" id="login-error"></div>
        <button type="submit" class="btn btn-primary btn-full" style="margin-top:1rem">Sign In</button>
      </form>

      <form id="register-form" class="auth-form" style="display:none">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="reg-name" placeholder="Your name" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="reg-email" placeholder="you@example.com" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="reg-password" placeholder="Min. 6 characters" minlength="6" required>
        </div>
        <div class="form-error" id="reg-error"></div>
        <button type="submit" class="btn btn-primary btn-full" style="margin-top:1rem">Create Account</button>
      </form>
    </div>
  </div>`;
}

function getToastContainerHTML() {
  return `<div class="toast-container" id="toast-container"></div>`;
}

function injectLayout(activePage = '') {
  document.getElementById('navbar-mount').innerHTML = getNavbarHTML(activePage);
  document.getElementById('cart-mount').innerHTML = getCartSidebarHTML();
  document.getElementById('modal-mount').innerHTML = getAuthModalHTML();
  document.getElementById('toast-mount').innerHTML = getToastContainerHTML();
}