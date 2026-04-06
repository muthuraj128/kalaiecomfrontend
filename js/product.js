// Get product ID from URL
function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return parseInt(urlParams.get('id'));
}

// Get product by ID
function getProduct(productId) {
  return products.find(p => p.id === productId);
}

// Render product detail
function renderProductDetail() {
  const productId = getProductIdFromUrl();
  const product = getProduct(productId);

  if (!product) {
    document.querySelector('.product-detail').innerHTML = `
      <div class="container">
        <div class="cart-empty">
          <div class="cart-empty-icon">⚠️</div>
          <h2>Product not found</h2>
          <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Home</a>
        </div>
      </div>
    `;
    return;
  }

  const productDetailContainer = document.querySelector('.product-detail-container');

  productDetailContainer.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-gallery">
        <div class="main-image-wrapper">
          <img src="${product.images[0]}" alt="${product.name}" class="main-image" id="mainImage">
        </div>
        ${product.images.length > 1 ? `
          <div class="thumbnail-grid">
            ${product.images.map((img, index) => `
              <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeImage('${img}', ${index})">
                <img src="${img}" alt="${product.name}">
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="product-detail-info">
        <h1>${product.name}</h1>
        <p class="product-detail-price">₹${product.price.toLocaleString()}</p>
        
        <div class="product-badges">
          <div class="badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
            </svg>
            Premium Quality
          </div>
          <div class="badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Genuine Quality
          </div>
          <div class="badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            Satisfaction Guaranteed
          </div>
        </div>

        <div class="product-description">
          <h3>Product Description</h3>
          <p>${product.description}</p>
        </div>

        <div class="product-detail-actions">
          <button class="btn btn-outline" onclick="addToCartFromDetail(${product.id})">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </button>
          <button class="btn btn-primary" onclick="buyNow(${product.id})">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  `;

  // Render related products
  renderRelatedProducts(product);
}

// Change main image
function changeImage(imageSrc, index) {
  const mainImage = document.getElementById('mainImage');
  mainImage.src = imageSrc;

  // Update active thumbnail
  document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

// Add to cart from detail page
function addToCartFromDetail(productId) {
  const product = getProduct(productId);
  if (product) {
    cartManager.addToCart(product);

    // Show success notification
    showToast(`${product.name} added to cart!`);
  }
}

// Show toast notification
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => toast.classList.add('show'), 100);

  // Hide and remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Buy now - redirect to WhatsApp
function buyNow(productId) {
  const product = getProduct(productId);
  if (product) {
    const message = WHATSAPP_CONFIG.getProductMessage(product, 1);
    const whatsappUrl = WHATSAPP_CONFIG.getWhatsAppUrl(message);
    window.open(whatsappUrl, '_blank');
  }
}

// Render related products
function renderRelatedProducts(currentProduct) {
  const relatedProducts = products
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4);

  if (relatedProducts.length === 0) return;

  const relatedSection = document.createElement('section');
  relatedSection.className = 'product-section';
  relatedSection.style.marginTop = '3rem';
  relatedSection.innerHTML = `
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Related Products</h2>
      </div>
      <div class="product-grid">
        ${relatedProducts.map(product => createProductCard(product)).join('')}
      </div>
    </div>
  `;

  document.querySelector('.product-detail').appendChild(relatedSection);
}

// Create product card (same as main.js)
function createProductCard(product) {
  return `
    <div class="product-card fade-in" onclick="goToProduct(${product.id})">
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <button class="wishlist-btn" onclick="event.stopPropagation();">
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

// Add to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    cartManager.addToCart(product);
  }
}

// Go to product
function goToProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof ensureCatalogReady === 'function') {
    await ensureCatalogReady();
  }

  renderProductDetail();
  cartManager.updateCartBadge();
});
