// Live catalog data loaded directly from Supabase public API.
globalThis.products = [];
globalThis.categories = [];

function getPublicSupabaseConfig() {
  const cfg = globalThis.PUBLIC_SUPABASE_CONFIG || {};
  const url = String(cfg.url || "").trim().replace(/\/$/, "");
  const anonKey = String(cfg.anonKey || "").trim();

  if (!url || !anonKey || url.includes("your-project-ref") || anonKey.includes("your_supabase_anon_key")) {
    throw new Error("Missing PUBLIC_SUPABASE_CONFIG. Update js/public-config.js with your Supabase URL and anon key.");
  }

  return { url, anonKey };
}

async function supabaseRest(path) {
  const { url, anonKey } = getPublicSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Supabase request failed (${response.status})`);
  }

  return response.json();
}

const WHATSAPP_CONFIG = {
  phoneNumber: "919876543210",
  getProductMessage: (product, quantity = 1) => {
    return `Hi, I want to order:\n\n${product.name}\nPrice: ₹${product.price}\nQuantity: ${quantity}\n\nTotal: ₹${product.price * quantity}`;
  },
  getCartMessage: (cartItems) => {
    let message = "Hi, I want to order:\n\n";
    let total = 0;

    cartItems.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      message += `${index + 1}. ${item.name}\n   ₹${item.price} x ${item.quantity} = ₹${itemTotal}\n\n`;
    });

    message += `Total Amount: ₹${total}`;
    return message;
  },
  getWhatsAppUrl: (message) => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${encodedMessage}`;
  }
};

globalThis.WHATSAPP_CONFIG = WHATSAPP_CONFIG;

async function loadCatalogData() {
  const [productsData, categoriesData] = await Promise.all([
    supabaseRest("products?select=id,name,price,image,images,category,description,stock,is_active,created_at&is_active=eq.true&order=created_at.desc"),
    supabaseRest("categories?select=name,is_active,created_at&is_active=eq.true&order=name.asc")
  ]);

  globalThis.products = Array.isArray(productsData)
    ? productsData.map((item) => ({
      ...item,
      price: Number(item.price || 0),
      stock: Number(item.stock || 0),
      images: (() => {
        if (Array.isArray(item.images) && item.images.length) {
          return item.images;
        }
        if (item.image) {
          return [item.image];
        }
        return [];
      })()
    }))
    : [];

  const iconByCategory = new Map();
  globalThis.products.forEach((item) => {
    const categoryName = String(item.category || "").trim();
    if (!categoryName || iconByCategory.has(categoryName)) {
      return;
    }
    iconByCategory.set(categoryName, String(item.image || "").trim());
  });

  globalThis.categories = Array.isArray(categoriesData)
    ? categoriesData.map((item) => {
      const name = String(item.name || "").trim();
      return {
        name,
        icon: iconByCategory.get(name) || ""
      };
    }).filter((item) => item.name)
    : [];

  if (!globalThis.categories.length) {
    const fallbackByCategory = new Map();
    globalThis.products.forEach((item) => {
      if (!fallbackByCategory.has(item.category)) {
        fallbackByCategory.set(item.category, item.image || "");
      }
    });

    globalThis.categories = Array.from(fallbackByCategory.entries()).map(([name, icon]) => ({
      name,
      icon
    }));
  }
}

async function initializeCatalog() {
  try {
    await loadCatalogData();
    document.dispatchEvent(new CustomEvent("catalog-ready"));
    return true;
  } catch (error) {
    console.error("Catalog load failed", error);
    document.dispatchEvent(new CustomEvent("catalog-error", { detail: error }));
    return false;
  }
}

const catalogReadyPromise = initializeCatalog();

async function ensureCatalogReady() {
  return catalogReadyPromise;
}

globalThis.ensureCatalogReady = ensureCatalogReady;
