// Search dropdown functionality (YouTube-style)
function initSearchDropdown() {
    const searchInput = document.querySelector('.search-input');
    const searchDropdown = document.getElementById('searchDropdown');

    if (!searchInput || !searchDropdown) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const categorySection = document.querySelector('.category-section');
        const mainContent = document.querySelector('.main-content');

        if (query.length === 0) {
            searchDropdown.classList.remove('active');
            searchDropdown.innerHTML = '';
            // Show categories and restore original content when search is empty
            if (categorySection) {
                categorySection.style.display = 'block';
            }
            // Restore original products view
            if (mainContent && typeof renderProductsByCategory === 'function') {
                renderProductsByCategory();
            }
            return;
        }

        // Hide categories when searching
        if (categorySection) {
            categorySection.style.display = 'none';
        }

        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );

        if (filteredProducts.length > 0) {
            // Create simple text suggestions with search icon
            const suggestions = filteredProducts.slice(0, 10).map(product => {
                return `
          <div class="search-dropdown-item" onclick="goToProduct(${product.id})">
            <svg class="search-dropdown-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span class="search-dropdown-name">${product.name}</span>
          </div>
        `;
            }).join('');

            searchDropdown.innerHTML = suggestions;
            searchDropdown.classList.add('active');
        } else {
            searchDropdown.innerHTML = '<div class="search-dropdown-empty">No results</div>';
            searchDropdown.classList.add('active');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar')) {
            searchDropdown.classList.remove('active');
        }
    });

    // Handle Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.toLowerCase().trim();
            if (query) {
                performFullSearch(query);
            }
        }
    });

    // Handle arrow key navigation
    let selectedIndex = -1;
    searchInput.addEventListener('keydown', (e) => {
        const items = searchDropdown.querySelectorAll('.search-dropdown-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'Enter' && selectedIndex >= 0 && items[selectedIndex]) {
            e.preventDefault();
            items[selectedIndex].click();
        }
    });

    function updateSelection(items, index) {
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
}

// Perform full search and show results
function performFullSearch(query) {
    const searchDropdown = document.getElementById('searchDropdown');
    const categorySection = document.querySelector('.category-section');

    if (searchDropdown) {
        searchDropdown.classList.remove('active');
    }

    // Hide categories during full search
    if (categorySection) {
        categorySection.style.display = 'none';
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

    // Update wishlist button states
    setTimeout(() => {
        if (typeof updateWishlistButtons === 'function') {
            updateWishlistButtons();
        }
    }, 100);
}

// Call this in DOMContentLoaded
if (typeof initSearch !== 'undefined') {
    const oldInitSearch = initSearch;
    initSearch = function () {
        initSearchDropdown();
    };
}
