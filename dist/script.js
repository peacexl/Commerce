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

    // const productsContainer = document.querySelector('main section');
    const categoryDropdown = document.getElementById("categoryDropdown");
    const backHomeBtn = document.getElementById("backHomeBtn");

    // --- Populate category dropdown dynamically ---
    const categories = [...new Set(allProducts.map(p => p.category))];
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
        searchButton.click();
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


// ---------------- RENDER PRODUCTS ----------------
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
      <div class="cursor-pointer" onclick="openProductModal(${product.id})">
        <img class="h-60 w-full object-contain mx-auto" src="${product.image}" alt="${product.title}" />
        <div class="text-sm text-center mt-4 space-y-1">
          <p class="font-semibold">${product.title}</p>
          <p class="text-gray-600">${product.category}</p>
          <p class="font-bold text-lg">$${product.price}</p>

          <!-- Stars -->
          <div class="flex justify-center gap-1 rating" data-id="${product.id}">
            ${renderInteractiveStars(product.rating?.rate || 0)}
          </div>

          <p class="text-gray-400 text-xs truncate" title="${product.description}">
            ${product.description}
          </p>
        </div>
      </div>
      <button class="mt-4 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 addToCartBtn">
        Add to Cart 🛒
      </button>
    `;

    // "Add to Cart" button
    productCard.querySelector(".addToCartBtn").addEventListener("click", (e) => {
      e.stopPropagation(); // prevent accidental modal open
      addToCart(product);
    });

    // Stars click handler
    const ratingDiv = productCard.querySelector(".rating");
    ratingDiv.querySelectorAll(".star").forEach((star, index) => {
      star.addEventListener("click", (e) => {
        e.stopPropagation(); // 🔥 Prevent modal popup
        updateStarRating(ratingDiv, index + 1);
        storeRating(product.id, index + 1); // Save to localStorage
      });
    });

    productsContainer.appendChild(productCard);
  });
}

// Render stars with interactivity
function renderInteractiveStars(rating) {
  const fullStars = Math.round(rating);
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    stars += `<span class="star cursor-pointer text-lg ${i <= fullStars ? "text-yellow-500" : "text-gray-300"}">★</span>`;
  }

  return stars;
}

// Update stars on click
function updateStarRating(container, newRating) {
  const stars = container.querySelectorAll(".star");
  stars.forEach((star, index) => {
    if (index < newRating) {
      star.classList.add("text-yellow-500");
      star.classList.remove("text-gray-300");
    } else {
      star.classList.add("text-gray-300");
      star.classList.remove("text-yellow-500");
    }
  });
}

// Store rating in localStorage
function storeRating(productId, rating) {
  let ratings = JSON.parse(localStorage.getItem("ratings")) || {};
  ratings[productId] = rating;
  localStorage.setItem("ratings", JSON.stringify(ratings));
}


// ---------------- CART LOGIC ----------------
let cart = JSON.parse(localStorage.getItem("cart")) || [];

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
  updateMenuBadge(); // 🔥 update the menu badge too
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cartCount) {
    if (totalItems > 0) {
      cartCount.textContent = totalItems;
      cartCount.classList.remove("hidden");
      cartCount.classList.add("scale-125");
      setTimeout(() => cartCount.classList.remove("scale-125"), 200);
    } else {
      cartCount.classList.add("hidden");
    }
  }
}

// ---------------- MENU BADGE ----------------
const menuBadge = document.getElementById("menuBadge");
const cartLink = document.getElementById("cartLink");

function updateMenuBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!menuBadge) return;

  if (totalItems > 0) {
    menuBadge.textContent = totalItems;
    menuBadge.classList.remove("hidden");

    // bounce animation
    menuBadge.classList.remove("animate-bounce-once");
    void menuBadge.offsetWidth; // reflow
    menuBadge.classList.add("animate-bounce-once");
  } else {
    menuBadge.classList.add("hidden");
  }
}

// Clear badge when cart is opened
if (cartLink) {
  cartLink.addEventListener("click", () => {
    menuBadge.classList.add("hidden");
  });
}

// Initialize badges on load
updateCartCount();
updateMenuBadge();

// ---------------- MOBILE CART BADGE ----------------
function updateMobileCartCount() {
  const mobileCartCount = document.getElementById("mobileCartCount");
  if (!mobileCartCount) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems > 0) {
    mobileCartCount.textContent = totalItems;
    mobileCartCount.classList.remove("hidden");

    // bounce animation
    mobileCartCount.classList.remove("animate-bounce-once");
    void mobileCartCount.offsetWidth; // reflow
    mobileCartCount.classList.add("animate-bounce-once");
  } else {
    mobileCartCount.classList.add("hidden");
  }
}

// Patch existing updateCartCount & updateMenuBadge
const oldUpdateCartCount = updateCartCount;
updateCartCount = function () {
  oldUpdateCartCount();
  updateMobileCartCount(); // 🔥 sync with mobile
};

const oldUpdateMenuBadge = updateMenuBadge;
updateMenuBadge = function () {
  oldUpdateMenuBadge();
  updateMobileCartCount(); // 🔥 sync with mobile
};

// Initialize all badges on load
updateMobileCartCount();


// ---------------- TOAST ----------------
function showToast(message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");

  toast.className =
    "bg-black text-white px-4 py-2 rounded shadow-md opacity-0 transform translate-y-2 transition-all duration-300";
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("opacity-0", "translate-y-2");
    toast.classList.add("opacity-100", "translate-y-0");
  }, 50);

  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Password toggle for login page
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");
  });
}

// Login form redirect
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    window.location.href = "shop.html";
  });
}

// Password toggle for Sign Up page
const togglePassword1 = document.getElementById("togglePassword1");
const password1 = document.getElementById("password");

if (togglePassword1 && password1) {
  togglePassword1.addEventListener("click", () => {
    const type = password1.getAttribute("type") === "password" ? "text" : "password";
    password1.setAttribute("type", type);

    togglePassword1.classList.toggle("fa-eye");
    togglePassword1.classList.toggle("fa-eye-slash");
  });
}

const togglePassword2 = document.getElementById("togglePassword2");
const password2 = document.getElementById("confirmPassword");

if (togglePassword2 && password2) {
  togglePassword2.addEventListener("click", () => {
    const type = password2.getAttribute("type") === "password" ? "text" : "password";
    password2.setAttribute("type", type);

    togglePassword2.classList.toggle("fa-eye");
    togglePassword2.classList.toggle("fa-eye-slash");
  });
}

const signupForm = document.getElementById("signupForm");
const errorMsg = document.getElementById("errorMsg");

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    if (password1.value !== password2.value) {
      e.preventDefault();
      errorMsg.style.display = "block";
    } else {
      errorMsg.style.display = "none";
    }
  });
}

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu = document.getElementById("closeMenu");
const menuOverlay = document.getElementById("menuOverlay");

if (menuToggle && mobileMenu && closeMenu && menuOverlay) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.remove("translate-x-full");
    menuOverlay.classList.remove("hidden");
  });

  closeMenu.addEventListener("click", () => {
    mobileMenu.classList.add("translate-x-full");
    menuOverlay.classList.add("hidden");
  });

  menuOverlay.addEventListener("click", () => {
    mobileMenu.classList.add("translate-x-full");
    menuOverlay.classList.add("hidden");
  });
}

// Modal elements
const modal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

// Open modal with product details
function openProductModal(productId) {
  fetch(`https://fakestoreapi.com/products/${productId}`)
    .then(res => res.json())
    .then(product => {
      modalContent.innerHTML = `
      <div class="grid md:grid-cols-2 gap-6">
          <!-- Image -->
          <img src="${product.image}" alt="${(product.title)}" class="w-full h-80 object-contain bg-gray-50 rounded">

          <!-- Info -->
          <div class="space-y-4">
            <h2 class="text-2xl font-bold">${(product.title)}</h2>
            <p class="text-gray-600">${(product.category)}</p>
            <p class="text-gray-700">${(product.description)}</p>
            <p class="text-2xl font-bold text-red-600">$${product.price}</p>

            <!-- Rating -->
            <div class="flex items-center gap-1">
              ${renderStars(product.rating?.rate || 0)}
              <span class="text-sm text-gray-500">(${product.rating?.count || 0} reviews)</span>
            </div>

            <!-- Actions -->
            <button class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800" 
              onclick='addToCart(${JSON.stringify(product)})'>
              Add to Cart 🛒
            </button>
          </div>
        </div>
      `;
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    });
}

// ✅ Proper close handling
function closeModalFn() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

closeModal.addEventListener("click", closeModalFn);
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFn();
});

// Render stars
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let stars = "";

  for (let i = 0; i < fullStars; i++) {
    stars += "⭐";
  }
  if (halfStar) stars += "✨";
  while (stars.length < 5) {
    stars += "☆";
  }

  return `<span class="text-yellow-500 text-lg">${stars}</span>`;
}