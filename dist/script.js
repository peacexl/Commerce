fetch('https://fakestoreapi.com/products')
  .then(response => response.json())
  .then(data => {
    const productsContainer = document.querySelector('main section');
    productsContainer.innerHTML = ''; // Clear existing content

    data.forEach(product => {
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
  });