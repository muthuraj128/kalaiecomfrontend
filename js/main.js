// Cart Management
class CartManager {
  constructor() {
    this.storageKey = 'ecat_cart';
  }

  getCart() {
    const cart = localStorage.getItem(this.storageKey);
    return cart ? JSON.parse(cart) : [];
  }

  saveCart(cart) {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    this.updateCartBadge();
  }

  addToCart(product, quantity = 1) {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }

    this.saveCart(cart);
    this.showNotification(`${product.name} added to cart!`);
  }

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    this.saveCart(cart);
  }

  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveCart(cart);
      }
    }
  }

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  clearCart() {
    localStorage.removeItem(this.storageKey);
    this.updateCartBadge();
  }

  updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      const count = this.getCartCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #28A745;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize cart manager
const cartManager = new CartManager();

// Render categories
function renderCategories() {
  const categoryGrid = document.querySelector('.category-grid');
  if (!categoryGrid) return;

  categoryGrid.innerHTML = categories.map(category => `
    <div class="category-card" onclick="filterByCategory('${category.name}')">
      <img src="${category.icon}" alt="${category.name}" class="category-icon">
      <span class="category-name">${category.name}</span>
    </div>
  `).join('');
}

// Render products by category
function renderProductsByCategory() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  // Group products by category
  const productsByCategory = {};
  products.forEach(product => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });

  // Render each category section
  let html = '';
  Object.keys(productsByCategory).forEach(category => {
    html += `
      <section class="product-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">${category}</h2>
            <a href="#" class="view-all" onclick="filterByCategory('${category}'); return false;">
              View all
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </a>
          </div>
          <div class="product-grid">
            ${productsByCategory[category].slice(0, 6).map(product => createProductCard(product)).join('')}
          </div>
        </div>
      </section>
    `;
  });

  mainContent.innerHTML = html;
}

// Create product card HTML
function createProductCard(product) {
  return `
    <div class="product-card fade-in" onclick="goToProduct(${product.id})">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <button class="wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id})">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">₹${product.price.toLocaleString()}</p>
        <div class="product-actions">
          <button class="btn btn-outline" onclick="event.stopPropagation(); addToCart(${product.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

// Add to cart function
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    cartManager.addToCart(product);
  }
}

// Go to product detail page
function goToProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

// Filter by category
function filterByCategory(categoryName) {
  const productsByCategory = products.filter(p => p.category === categoryName);
  const mainContent = document.querySelector('.main-content');

  if (!mainContent) return;

  mainContent.innerHTML = `
    <section class="product-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">${categoryName}</h2>
        </div>
        <div class="product-grid">
          ${productsByCategory.length > 0
      ? productsByCategory.map(product => createProductCard(product)).join('')
      : '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #999;">No products found in this category</p>'
    }
        </div>
      </div>
    </section>
  `;

  // Update active nav link
  updateActiveNavLink(categoryName);

  // Update wishlist button states
  setTimeout(() => {
    if (typeof updateWishlistButtons === 'function') {
      updateWishlistButtons();
    }
  }, 100);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show all products
function showAllProducts() {
  renderProductsByCategory();

  // Update active nav link
  updateActiveNavLink('All Products');

  // Update wishlist button states
  setTimeout(() => {
    if (typeof updateWishlistButtons === 'function') {
      updateWishlistButtons();
    }
  }, 100);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update active navigation link
function updateActiveNavLink(categoryName) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.textContent === categoryName) {
      link.classList.add('active');
    }
  });
}

// Search functionality
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (query.length === 0) {
      renderProductsByCategory();
      return;
    }

    const filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );

    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    mainContent.innerHTML = `
      <section class="product-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Search Results (${filteredProducts.length})</h2>
          </div>
          <div class="product-grid">
            ${filteredProducts.length > 0
        ? filteredProducts.map(product => createProductCard(product)).join('')
        : '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #999;">No products found</p>'
      }
          </div>
        </div>
      </section>
    `;
  });
}

// Mobile menu toggle
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('mobile-open');
    });
  }
}

// Focus search bar (for mobile)
function focusSearchBar() {
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Focus search input after scroll
    setTimeout(() => {
      searchInput.focus();
    }, 300);
  }
}

// Wishlist toggle
function toggleWishlist(productId) {
  // Initialize wishlist manager if not already done
  if (typeof WishlistManager !== 'undefined' && typeof wishlistManager === 'undefined') {
    window.wishlistManager = new WishlistManager();
  }

  if (typeof wishlistManager !== 'undefined') {
    const product = products.find(p => p.id === productId);
    if (product) {
      if (wishlistManager.isInWishlist(productId)) {
        wishlistManager.removeFromWishlist(productId);
        wishlistManager.showNotification(`${product.name} removed from wishlist`, 'info');
        updateWishlistButtons();
      } else {
        wishlistManager.addToWishlist(product);
        updateWishlistButtons();
      }
    }
  }
}

// Update wishlist button states
function updateWishlistButtons() {
  if (typeof wishlistManager === 'undefined') return;

  const wishlistButtons = document.querySelectorAll('.wishlist-btn');
  wishlistButtons.forEach(btn => {
    const productCard = btn.closest('.product-card');
    if (productCard) {
      const productId = parseInt(productCard.getAttribute('data-product-id') ||
        btn.getAttribute('onclick')?.match(/\d+/)?.[0]);
      if (productId && wishlistManager.isInWishlist(productId)) {
        btn.classList.add('active');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
      } else {
        btn.classList.remove('active');
        btn.querySelector('svg').setAttribute('fill', 'none');
      }
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof ensureCatalogReady === 'function') {
    await ensureCatalogReady();
  }

  renderCategories();
  renderProductsByCategory();
  initSearch();
  initMobileMenu();
  cartManager.updateCartBadge();

  // Initialize search dropdown
  if (typeof initSearchDropdown === 'function') {
    initSearchDropdown();
  }

  // Initialize wishlist manager if available
  if (typeof WishlistManager !== 'undefined') {
    window.wishlistManager = new WishlistManager();
    wishlistManager.updateWishlistBadge();

    // Update wishlist button states after products are rendered
    setTimeout(() => {
      updateWishlistButtons();
    }, 100);
  }
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
