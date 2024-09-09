let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;
let groceryItems = JSON.parse(localStorage.getItem('groceryItems')) || [];
let editingItemId = null; // To track the item being edited

// Authentication
document.getElementById('auth-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        document.getElementById('auth').style.display = 'none';
        document.getElementById('grocery-list').style.display = 'block';
        loadGroceryList();
    } else {
        alert('Invalid credentials');
    }
});

// Toggle between login and register forms
document.getElementById('toggle-auth').addEventListener('click', function () {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('register').style.display = 'block';
});

document.getElementById('toggle-auths').addEventListener('click', function () {
    document.getElementById('auth').style.display = 'block';
    document.getElementById('register').style.display = 'none';
});

// Registration
document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;

    if (users.find(u => u.username === username)) {
        alert('Username already exists');
        return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! You can now log in.');
    document.getElementById('register').style.display = 'none';
    document.getElementById('auth').style.display = 'block';
});

// Add Item Modal
const addItemModal = document.getElementById("addItemModal");
const addBtn = document.getElementById("add-item-button");

addBtn.onclick = function() {
    editingItemId = null; // Reset editing ID when opening the modal for adding
    addItemModal.style.display = "block";
}

// Close Add Item Modal
function closeAddItemModal() {
    addItemModal.style.display = "none";
}

// Close Edit Item Modal
function closeEditItemModal() {
    document.getElementById('edit-item-form').reset(); // Reset the form
    document.getElementById('editItemModal').style.display = "none";
}

// Grocery List Management for Adding Item
document.getElementById('add-item-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const productName = document.getElementById('product-name').value;
    const brand = document.getElementById('brand').value;
    const price = document.getElementById('price').value;
    const weight = document.getElementById('weight').value;
    const quantity = document.getElementById('quantity').value;
    const store = document.getElementById('store').value;
    const category = document.getElementById('category').value;
    const image = document.getElementById('image').files[0];

    const reader = new FileReader();
    reader.onloadend = function () {
        const item = {
            id: Date.now(), // New ID for new items
            productName,
            brand,
            price: parseFloat(price), // Ensure price is a number
            weight,
            quantity,
            store,
            category,
            image: reader.result // Store Base64 string
        };

        groceryItems.push(item);
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
        loadGroceryList();
        closeAddItemModal(); // Hide modal after adding
        document.getElementById('add-item-form').reset(); // Reset the form after adding
    };

    if (image) {
        reader.readAsDataURL(image); // Convert to Base64
    } else {
        alert('Please select an image.');
    }
});

// Grocery List Management for Editing Item
document.getElementById('edit-item-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const productName = document.getElementById('edit-product-name').value;
    const brand = document.getElementById('edit-brand').value;
    const price = document.getElementById('edit-price').value;
    const weight = document.getElementById('edit-weight').value;
    const quantity = document.getElementById('edit-quantity').value;
    const store = document.getElementById('edit-store').value;
    const category = document.getElementById('edit-category').value;
    const image = document.getElementById('edit-image').files[0];

    const reader = new FileReader();
    reader.onloadend = function () {
        const item = {
            id: editingItemId, // Keep the same ID
            productName,
            brand,
            price: parseFloat(price), // Ensure price is a number
            weight,
            quantity,
            store,
            category,
            image: image ? reader.result : groceryItems.find(i => i.id === editingItemId).image // Retain old image if new one is not uploaded
        };

        groceryItems = groceryItems.map(groceryItem => groceryItem.id === editingItemId ? item : groceryItem);
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
        loadGroceryList();
        closeEditItemModal(); // Hide modal after editing
    };

    if (image) {
        reader.readAsDataURL(image); // Convert to Base64
    } else {
        closeEditItemModal(); // Hide modal without saving changes
    }
});

// Load Grocery List
function loadGroceryList() {
    const list = document.getElementById('list');
    list.innerHTML = '';

    // Get filter and sort values
    const filterValue = document.getElementById('filter-category').value;
    const sortValue = document.getElementById('sort-category').value;

    // Filter items
    let filteredItems = groceryItems.filter(item => {
        return filterValue === 'All' || item.category === filterValue;
    });

    // Sort items
    if (sortValue === 'name') {
        filteredItems.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (sortValue === 'price') {
        filteredItems.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'store') {
        filteredItems.sort((a, b) => a.store.localeCompare(b.store));
    }

    // Display items
    filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <input type="checkbox" class="item-check" id="check-${item.id}" onclick="toggleStrikeThrough(this, ${item.id})">
                ${item.image ? `<img src="${item.image}" alt="${item.productName}" style="max-width: 100px; max-height: 100px;">` : ''} <br>
                <strong class="item-name" id="name-${item.id}">${item.productName}</strong><br>
                <span class="item-price" id="price-${item.id}">Price: ₱${item.price}</span><br>
                <span class="item-store" id="store-${item.id}">Store: ${item.store}</span><br>
                <span class="item-quantity" id="quantity-${item.id}">Quantity: ${item.quantity}</span><br>
            </div>
            <button class="edit" onclick="editItem(${item.id})">Edit</button>
            <button class="delete" onclick="removeItem(${item.id})">Remove</button>
        `;

        list.appendChild(li);
    });
}

// Toggle Strike Through
function toggleStrikeThrough(checkbox, id) {
    const nameElement = document.getElementById(`name-${id}`);
    const priceElement = document.getElementById(`price-${id}`);
    const storeElement = document.getElementById(`store-${id}`);
    const quantityElement = document.getElementById(`quantity-${id}`);

    if (checkbox.checked) {
        nameElement.style.textDecoration = "line-through";
        priceElement.style.textDecoration = "line-through";
        storeElement.style.textDecoration = "line-through";
        quantityElement.style.textDecoration = "line-through";
    } else {
        nameElement.style.textDecoration = "none";
        priceElement.style.textDecoration = "none";
        storeElement.style.textDecoration = "none";
        quantityElement.style.textDecoration = "none";
    }
}


// Remove Item
function removeItem(id) {
    groceryItems = groceryItems.filter(item => item.id !== id);
    localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
    loadGroceryList();
}

// Edit Item
function editItem(id) {
    const item = groceryItems.find(item => item.id === id);
    if (!item) return;

    // Populate the edit modal with the item's data
    document.getElementById('edit-product-name').value = item.productName;
    document.getElementById('edit-brand').value = item.brand;
    document.getElementById('edit-price').value = item.price;
    document.getElementById('edit-weight').value = item.weight;
    document.getElementById('edit-quantity').value = item.quantity;
    document.getElementById('edit-store').value = item.store;
    document.getElementById('edit-category').value = item.category;

    // Set the editing item ID
    editingItemId = id;

    // Open the edit modal
    document.getElementById('editItemModal').style.display = "block";
}

// Search Functionality
document.getElementById('search-bar').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const list = document.getElementById('list');
    list.innerHTML = '';

    const filteredItems = groceryItems.filter(item => item.productName.toLowerCase().includes(searchTerm));

    filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <input type="checkbox" class="item-check" id="check-${item.id}">
                ${item.image ? `<img src="${item.image}" alt="${item.productName}" style="max-width: 100px; max-height: 100px;">` : ''} <br>
                <strong class="item-name">${item.productName}</strong><br>
                <span class="item-price">Price: ₱${item.price}</span><br>
                <span class="item-store">Store: ${item.store}</span><br>
                <span class="item-quantity">Quantity: ${item.quantity}</span><br>
            </div>
            <button class="edit" onclick="editItem(${item.id})">Edit</button>
            <button class="delete" onclick="removeItem(${item.id})">Remove</button>
        `;
        list.appendChild(li);
    });
});

// Filter and Sorting Event Listeners
document.getElementById('filter-category').addEventListener('change', loadGroceryList);
document.getElementById('sort-category').addEventListener('change', loadGroceryList);

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == addItemModal) {
        closeAddItemModal();
    } else if (event.target == document.getElementById('editItemModal')) {
        closeEditItemModal();
    }
};
