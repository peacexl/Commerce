let allProducts = []; 

fetch('https://fakestoreapi.com/products')
  .then(response => response.json())
  .then(data => {
    allProducts = data; 
    renderProducts(allProducts); 

    const searchInput = document.querySelector("input[placeholder='Search ExcelExchange...']");
    const searchButton = document.querySelector("button.bg-red-500"); 

    searchButton.addEventListener("click", () => {
      const query = searchInput.value.toLowerCase().trim();
      const filtered = allProducts.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
      renderProducts(filtered);
    });
  });

function renderProducts(products) {
  const productsContainer = document.querySelector('main section');
  productsContainer.innerHTML = '';

  if (products.length === 0) {
    productsContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">No products found</p>`;
    return;
  }

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'rounded-lg bg-white p-4 transition-transform duration-300 transform hover:scale-105 shadow border border-gray-200';
    productCard.innerHTML = `
      <a href="#">
        <img class="h-60 w-full object-contain mx-auto" src="${product.image}" alt="${product.title}" />
        <div class="text-sm text-center mt-4 space-y-1">
          <p class="font-semibold">${product.title}</p>
          <p class="text-gray-600">${product.category}</p>
          <p class="font-bold text-lg">$${product.price}</p>
          <p class="text-gray-400 text-xs truncate" title="${product.description}">
            ${product.description}
          </p>
        </div>
      </a>
    `;
    productsContainer.appendChild(productCard);
  });
}
