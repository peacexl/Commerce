let allProducts = [];

fetch('https://fakestoreapi.com/products')
  .then(response => response.json())
  .then(data => {
    allProducts = data;
    renderProducts(allProducts);

    const searchInput = document.querySelector("input[placeholder='Search ExcelExchange...']");
    const searchButton =
      document.querySelector('form[role="search"] button[type="submit"]') ||
      document.querySelector("button.bg-red-500") ||
      document.querySelector("button.bg-black") ||
      document.querySelector('button[aria-label="Search"]');

    const productsContainer = document.querySelector('main section');
    const categoryDropdown = document.getElementById("categoryDropdown");
    const backHomeBtn = document.getElementById("backHomeBtn");

    // --- Populate category dropdown dynamically ---
    const categories = [...new Set(allProducts.map(p => p.category))]; // unique categories
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categoryDropdown.appendChild(option);
    });

    // --- Utility functions ---
    function showHomeButton() {
      backHomeBtn.classList.remove("hidden");
    }

    function hideHomeButton() {
      backHomeBtn.classList.add("hidden");
    }

    // --- Search by button click ---
    searchButton.addEventListener("click", (e) => {
      e.preventDefault();
      const query = (searchInput.value || "").toLowerCase().trim();

      if (!query) {
        productsContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Products not found</p>`;
        showHomeButton();
        return;
      }

      const filtered = allProducts.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        productsContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Products not found</p>`;
      } else {
        renderProducts(filtered);
      }

      showHomeButton();
    });

    // --- Search with Enter key ---
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchButton.click(); // reuse search button logic
      }
    });

    // --- Category filter ---
    categoryDropdown.addEventListener("change", () => {
      const selected = categoryDropdown.value;

      if (selected === "all") {
        renderProducts(allProducts);
        hideHomeButton();
        return;
      }

      const filtered = allProducts.filter(product => product.category === selected);

      if (filtered.length === 0) {
        productsContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Products not found</p>`;
      } else {
        renderProducts(filtered);
      }

      showHomeButton();
    });

    // --- Back to Home ---
    backHomeBtn.addEventListener("click", () => {
      renderProducts(allProducts);
      searchInput.value = "";
      categoryDropdown.value = "all";
      hideHomeButton();
    });
  })
  .catch(err => {
    console.error("Failed to load products:", err);
  });

function renderProducts(products) {
  const productsContainer = document.getElementById('products');
  productsContainer.innerHTML = '';

  if (products.length === 0) {
    productsContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Products not found</p>`;
    return;
  }

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className =
      'rounded-lg bg-white p-4 transition-transform duration-300 transform hover:scale-105 shadow border border-gray-200 flex flex-col justify-between';

    productCard.innerHTML = `
      <a href="#">
        <img class="h-60 w-full object-contain mx-auto" src="${product.image}" alt="${escapeHtml(product.title)}" />
        <div class="text-sm text-center mt-4 space-y-1">
          <p class="font-semibold">${escapeHtml(product.title)}</p>
          <p class="text-gray-600">${escapeHtml(product.category)}</p>
          <p class="font-bold text-lg">$${product.price}</p>
          <p class="text-gray-400 text-xs truncate" title="${escapeHtml(product.description)}">
            ${escapeHtml(product.description)}
          </p>
        </div>
      </a>
      <button class="mt-4 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 addToCartBtn">
        Add to Cart 🛒
      </button>
    `;

    // Attach "Add to Cart" click event
    productCard.querySelector(".addToCartBtn").addEventListener("click", () => {
      addToCart(product);
    });

    productsContainer.appendChild(productCard);
  });
}


// --- Small helper to sanitize text ---
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems > 0) {
    cartCount.textContent = totalItems;
    cartCount.classList.remove("hidden");

    // Little "pop" animation
    cartCount.classList.add("scale-125");
    setTimeout(() => {
      cartCount.classList.remove("scale-125");
    }, 200);
  } else {
    cartCount.classList.add("hidden");
  }
}

function showToast(message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");

  toast.className =
    "bg-black text-white px-4 py-2 rounded shadow-md opacity-0 transform translate-y-2 transition-all duration-300";
  toast.textContent = message;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
    toast.classList.add("opacity-100", "translate-y-0");
  }, 50);

  // Remove after 3s
  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
    showToast(`Increased quantity of "${product.title}" 🛒`);
  } else {
    cart.push({ ...product, quantity: 1 });
    showToast(`Added "${product.title}" to cart 🛒`);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}
