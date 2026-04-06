// Render cart items
function renderCart() {
  const cart = cartManager.getCart();
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartSummaryContainer = document.querySelector('.cart-summary');
  const emptyCartMessage = document.querySelector('.cart-empty');

  if (cart.length === 0) {
    // Hide cart grid
    const cartGrid = document.querySelector('.cart-grid');
    if (cartGrid) cartGrid.style.display = 'none';

    // Create or show empty cart message
    if (!emptyCartMessage) {
      const container = document.querySelector('.cart-page .container');
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'cart-empty';
      emptyDiv.innerHTML = `
                <div class="cart-empty-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p style="color: #999; margin-bottom: 1.5rem;">Add some products to get started!</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            `;
      container.appendChild(emptyDiv);
    } else {
      emptyCartMessage.style.display = 'block';
    }
    return;
  }

  // Hide empty message and show cart grid
  if (emptyCartMessage) emptyCartMessage.style.display = 'none';
  const cartGrid = document.querySelector('.cart-grid');
  if (cartGrid) cartGrid.style.display = 'grid';

  // Render cart items
  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item fade-in" onclick="goToProduct(${item.id})" style="cursor: pointer;">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p class="cart-item-price">₹${item.price.toLocaleString()}</p>
        <div class="quantity-controls" onclick="event.stopPropagation();">
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="cart-item-actions" onclick="event.stopPropagation();">
        <p style="font-size: 1.25rem; font-weight: 700;">₹${(item.price * item.quantity).toLocaleString()}</p>
        <button class="remove-btn" onclick="removeItem(${item.id})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Remove
        </button>
      </div>
    </div>
  `).join('');

  // Render cart summary
  const subtotal = cartManager.getCartTotal();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Get applied coupon discount
  const discount = window.appliedDiscount || 0;
  const total = subtotal - discount;

  cartSummaryContainer.innerHTML = `
    <h2>Order Summary</h2>
    <div class="summary-row">
      <span>Items (${itemCount})</span>
      <span>₹${subtotal.toLocaleString()}</span>
    </div>
    ${discount > 0 ? `
    <div class="summary-row" style="color: #28A745;">
      <span>Coupon Discount</span>
      <span>- ₹${discount.toLocaleString()}</span>
    </div>
    ` : ''}
    <div class="summary-row total">
      <span>Total</span>
      <span>₹${total.toLocaleString()}</span>
    </div>
    
    <div class="coupon-section">
      <input type="text" id="couponInput" class="coupon-input" placeholder="Enter coupon code">
      <button class="apply-coupon-btn" onclick="applyCoupon()">Apply</button>
    </div>
    <div id="couponMessage" class="coupon-message"></div>
    
    <button class="checkout-btn" onclick="checkout()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
      Checkout via WhatsApp
    </button>
  `;
}

// Coupon codes with discounts
const COUPON_CODES = {
  'SAVE10': { discount: 10, type: 'percentage', description: '10% off' },
  'SAVE100': { discount: 100, type: 'fixed', description: '₹100 off' },
  'SAVE200': { discount: 200, type: 'fixed', description: '₹200 off' },
  'FIRST50': { discount: 50, type: 'fixed', description: '₹50 off for first order' }
};

// Apply coupon code
function applyCoupon() {
  const couponInput = document.getElementById('couponInput');
  const couponMessage = document.getElementById('couponMessage');
  const code = couponInput.value.trim().toUpperCase();

  if (!code) {
    couponMessage.textContent = 'Please enter a coupon code';
    couponMessage.style.color = '#dc3545';
    return;
  }

  const coupon = COUPON_CODES[code];

  if (!coupon) {
    couponMessage.textContent = 'Invalid coupon code';
    couponMessage.style.color = '#dc3545';
    window.appliedDiscount = 0;
    renderCart();
    return;
  }

  const subtotal = cartManager.getCartTotal();
  let discount = 0;

  if (coupon.type === 'percentage') {
    discount = Math.floor((subtotal * coupon.discount) / 100);
  } else {
    discount = coupon.discount;
  }

  window.appliedDiscount = discount;
  couponMessage.textContent = `Coupon applied! ${coupon.description}`;
  couponMessage.style.color = '#28A745';

  renderCart();
}

// Update quantity
function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    if (confirm('Remove this item from cart?')) {
      cartManager.removeFromCart(productId);
      renderCart();
    }
  } else {
    cartManager.updateQuantity(productId, newQuantity);
    renderCart();
  }
}

// Remove item
function removeItem(productId) {
  if (confirm('Remove this item from cart?')) {
    cartManager.removeFromCart(productId);
    renderCart();
  }
}

// Checkout via WhatsApp
function checkout() {
  const cart = cartManager.getCart();
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  let message = 'Hi, I want to order:\n\n';
  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    message += `${index + 1}. ${item.name}\n   ₹${item.price} x ${item.quantity} = ₹${itemTotal}\n\n`;
  });

  const discount = window.appliedDiscount || 0;
  const total = subtotal - discount;

  message += `Subtotal: ₹${subtotal}\n`;

  if (discount > 0) {
    message += `Coupon Discount: -₹${discount}\n`;
  }

  message += `\nTotal Amount: ₹${total}`;

  const whatsappUrl = WHATSAPP_CONFIG.getWhatsAppUrl(message);

  // Open WhatsApp
  window.open(whatsappUrl, '_blank');

  // Optional: Clear cart after checkout
  // Uncomment the following lines if you want to clear cart after checkout
  // setTimeout(() => {
  //   if (confirm('Order placed! Clear your cart?')) {
  //     cartManager.clearCart();
  //     window.appliedDiscount = 0;
  //     renderCart();
  //   }
  // }, 1000);
}

// Go to product detail page
function goToProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  cartManager.updateCartBadge();
});
