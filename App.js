let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;
let groceryItems = JSON.parse(localStorage.getItem('groceryItems')) || [];
let editingItemId = null; // To track the item being edited

// Function to check login state
function checkLoginState() {
    const username = localStorage.getItem('username');
    if (username) {
        currentUser = users.find(u => u.username === username);
        if (currentUser) {
            // User is logged in
            document.getElementById('auth').style.display = 'none';
            document.getElementById('grocery-list').style.display = 'block';
            loadGroceryList();
        } else {
            // No valid user found
            showAuth();
        }
    } else {
        // No username found in localStorage
        showAuth();
    }
}

// Show authentication UI
function showAuth() {
    document.getElementById('auth').style.display = 'block';
    document.getElementById('grocery-list').style.display = 'none';
    document.getElementById('register').style.display = 'none'; // Hide register if it's open
}

// Authentication
document.getElementById('auth-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('username', username); // Store username in localStorage
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
            image: reader.result, // Store Base64 string

            checked: false // Initialize checked property
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
    list.innerHTML = ''; // Clear existing items

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

    // Separate checked and unchecked items
    const checkedItems = filteredItems.filter(item => item.checked);
    const uncheckedItems = filteredItems.filter(item => !item.checked);

    // Display unchecked items first
    [...uncheckedItems, ...checkedItems].forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <input type="checkbox" class="item-check" id="check-${item.id}" onclick="toggleStrikeThrough(this, ${item.id})" ${item.checked ? 'checked' : ''}>
                ${item.image ? `<img src="${item.image}" alt="${item.productName}" style="max-width: 100px; max-height: 100px;">` : ''} <br>
                <strong class="item-name" id="name-${item.id}" style="${item.checked ? 'text-decoration: line-through;' : ''}">${item.productName}</strong><br>
                <span class="item-price" id="price-${item.id}" style="${item.checked ? 'text-decoration: line-through;' : ''}">Price: ₱${item.price}</span><br>
                <span class="item-store" id="store-${item.id}" style="${item.checked ? 'text-decoration: line-through;' : ''}">Store: ${item.store}</span><br>
                <span class="item-quantity" id="quantity-${item.id}" style="${item.checked ? 'text-decoration: line-through;' : ''}">Quantity: ${item.quantity}</span><br><br><br>
            </div>
            <button class="edit" onclick="editItem(${item.id})">Edit</button>
            <button class="delete" onclick="removeItem(${item.id})">Remove</button>
        `;
        list.appendChild(li); // Append item to the list
    });
}

// Toggle Strike Through and Update Checked Status
function toggleStrikeThrough(checkbox, id) {
    // Find the item and update its checked status
    const item = groceryItems.find(item => item.id === id);
    item.checked = checkbox.checked; // Update the checked status

    // Refresh the grocery list to reflect changes
    loadGroceryList();
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
                <input type="checkbox" class="item-check" id="check-${item.id}" onclick="toggleStrikeThrough(this, ${item.id})" ${item.checked ? 'checked' : ''}>

                ${item.image ? `<img src="${item.image}" alt="${item.productName}" style="max-width: 100px; max-height: 100px;">` : ''} <br>

                <strong class="item-name" style="${item.checked ? 'text-decoration: line-through;' : ''}">${item.productName}</strong><br>

                <span class="item-price" style="${item.checked ? 'text-decoration: line-through;' : ''}">Price: ₱${item.price}</span><br>

                <span class="item-store" style="${item.checked ? 'text-decoration: line-through;' : ''}">Store: ${item.store}</span><br>

                <span class="item-quantity" style="${item.checked ? 'text-decoration: line-through;' : ''}">Quantity: ${item.quantity}</span><br>
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

// Logout Functionality
function logout() {
    // Clear user session
    currentUser = null;
    localStorage.removeItem('username'); // Remove username from localStorage

    // Update UI
    document.getElementById('grocery-list').style.display = 'none';
    showAuth(); // Show the authentication section
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == addItemModal) {
        closeAddItemModal();
    } else if (event.target == document.getElementById('editItemModal')) {
        closeEditItemModal();
    }
};

// Load Grocery List on page load
document.addEventListener('DOMContentLoaded', checkLoginState);
