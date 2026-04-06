// Wishlist Management
class WishlistManager {
    constructor() {
        this.storageKey = 'ecat_wishlist';
    }

    getWishlist() {
        const wishlist = localStorage.getItem(this.storageKey);
        return wishlist ? JSON.parse(wishlist) : [];
    }

    saveWishlist(wishlist) {
        localStorage.setItem(this.storageKey, JSON.stringify(wishlist));
        this.updateWishlistBadge();
    }

    addToWishlist(product) {
        const wishlist = this.getWishlist();
        const existingItem = wishlist.find(item => item.id === product.id);

        if (!existingItem) {
            wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category
            });
            this.saveWishlist(wishlist);
            this.showNotification(`${product.name} added to wishlist!`, 'success');
            return true;
        } else {
            this.showNotification(`${product.name} is already in wishlist!`, 'info');
            return false;
        }
    }

    removeFromWishlist(productId) {
        let wishlist = this.getWishlist();
        wishlist = wishlist.filter(item => item.id !== productId);
        this.saveWishlist(wishlist);
    }

    isInWishlist(productId) {
        const wishlist = this.getWishlist();
        return wishlist.some(item => item.id === productId);
    }

    getWishlistCount() {
        const wishlist = this.getWishlist();
        return wishlist.length;
    }

    clearWishlist() {
        localStorage.removeItem(this.storageKey);
        this.updateWishlistBadge();
    }

    updateWishlistBadge() {
        const badges = document.querySelectorAll('.wishlist-badge');
        const count = this.getWishlistCount();
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        const bgColor = type === 'success' ? '#28A745' : type === 'info' ? '#0066CC' : '#FF6B35';

        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize wishlist manager
const wishlistManager = new WishlistManager();

// Render wishlist items
function renderWishlist() {
    const container = document.querySelector('.wishlist-container');
    if (!container) return;

    const wishlist = wishlistManager.getWishlist();

    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </div>
                <h2>Your wishlist is empty</h2>
                <p style="color: #999; margin-bottom: 2rem;">Add products you love to your wishlist!</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="product-grid">
            ${wishlist.map(item => `
                <div class="product-card">
                    <div class="product-image-wrapper" onclick="goToProduct(${item.id})">
                        <img src="${item.image}" alt="${item.name}" class="product-image">
                        <button class="wishlist-btn active" onclick="event.stopPropagation(); removeFromWishlistPage(${item.id})" title="Remove from wishlist">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${item.name}</h3>
                        <p class="product-price">₹${item.price.toLocaleString()}</p>
                        <div class="product-actions">
                            <button class="btn btn-primary" onclick="addToCartFromWishlist(${item.id})">
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
            `).join('')}
        </div>
    `;
}

// Remove from wishlist and re-render
function removeFromWishlistPage(productId) {
    wishlistManager.removeFromWishlist(productId);
    renderWishlist();
    wishlistManager.showNotification('Removed from wishlist', 'info');
}

// Add to cart from wishlist
function addToCartFromWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (product && typeof cartManager !== 'undefined') {
        cartManager.addToCart(product);
    }
}

// Go to product detail page
function goToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof ensureCatalogReady === 'function') {
        await ensureCatalogReady();
    }

    renderWishlist();
    wishlistManager.updateWishlistBadge();

    // Also update cart badge if cart manager is available
    if (typeof cartManager !== 'undefined') {
        cartManager.updateCartBadge();
    }
});
