// localStorage object allows you to save key/value pairs in the browser.
let users = JSON.parse(localStorage.getItem('users')) || []; // Retrieve users from localStorage or initialize as empty array
let currentUser = null; // To store the currently logged-in user
let groceryItems = JSON.parse(localStorage.getItem('groceryItems')) || []; // Retrieve grocery items or initialize as empty array
let editingItemId = null; // To track the item being edited

// Function to check login state
// Checks if a username is stored in localStorage. If found, it sets currentUser and displays the grocery list; otherwise, it shows the authentication form.
function checkLoginState() {
    const username = localStorage.getItem('username');
    if (username) {
        currentUser = users.find(u => u.username === username); // Find the user by username
        if (currentUser) {
            // User is logged in
            document.getElementById('auth').style.display = 'none'; // Hide authentication UI
            document.getElementById('grocery-list').style.display = 'block'; // Show grocery list
            loadGroceryList(); // Load the grocery list
        } else {
            // No valid user found
            showAuth(); // Show authentication UI
        }
    } else {
        // No username found in localStorage
        showAuth(); // Show authentication UI
    }
}

// Show authentication UI
// Displays the login form and hides the grocery list and registration form.
function showAuth() {
    document.getElementById('auth').style.display = 'block'; // Show authentication UI
    document.getElementById('grocery-list').style.display = 'none'; // Hide grocery list
    document.getElementById('register').style.display = 'none'; // Hide register if it's open
}

// Authentication
document.getElementById('auth-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
    const username = document.getElementById('username').value; // Get username input
    const password = document.getElementById('password').value; // Get password input

    const user = users.find(u => u.username === username && u.password === password); // Find user by username and password
    if (user) {
        currentUser = user; // Set current user
        localStorage.setItem('username', username); // Store username in localStorage
        document.getElementById('auth').style.display = 'none'; // Hide authentication UI
        document.getElementById('grocery-list').style.display = 'block'; // Show grocery list
        loadGroceryList(); // Load the grocery list
    } else {
        alert('Invalid user'); // Show error for invalid credentials
    }
});

// Toggle between login and register forms
document.getElementById('toggle-auth').addEventListener('click', function () {
    document.getElementById('auth').style.display = 'none'; // Hide authentication UI
    document.getElementById('register').style.display = 'block'; // Show registration UI
});

document.getElementById('toggle-auths').addEventListener('click', function () {
    document.getElementById('auth').style.display = 'block'; // Show authentication UI
    document.getElementById('register').style.display = 'none'; // Hide registration UI
});

// Registration
document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
    const username = document.getElementById('new-username').value; // Get new username input
    const password = document.getElementById('new-password').value; // Get new password input

    // Check if username already exists
    if (users.find(u => u.username === username)) {
        alert('Username already exists'); // Alert if username is taken
        return; // Exit function
    }

    // Add new user to users array
    users.push({ username, password }); // Store new user
    localStorage.setItem('users', JSON.stringify(users)); // Save users to localStorage
    alert('Registration successful! You can now log in.'); // Show success message
    document.getElementById('register').style.display = 'none'; // Hide registration UI
    document.getElementById('auth').style.display = 'block'; // Show authentication UI
});

// Grocery List Management for Adding Item
document.getElementById('add-item-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
    const productName = document.getElementById('product-name').value; // Get product name
    const brand = document.getElementById('brand').value; // Get brand
    const price = document.getElementById('price').value; // Get price
    const weight = document.getElementById('weight').value; // Get weight
    const quantity = document.getElementById('quantity').value; // Get quantity
    const store = document.getElementById('store').value; // Get store
    const category = document.getElementById('category').value; // Get category
    const image = document.getElementById('image').files[0]; // Get image file

    const reader = new FileReader();
    reader.onloadend = function () {
        const item = {
            id: Date.now(), // New ID for new items
            productName,
            brand,
            price,
            weight,
            quantity,
            store,
            category,
            image: reader.result, // Store Base64 string of the image
            checked: false // Initialize checked property
        };

        groceryItems.push(item); // Add item to grocery items
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems)); // Save grocery items to localStorage
        loadGroceryList(); // Load updated grocery list
        closeAddItemModal(); // Hide modal after adding
        document.getElementById('add-item-form').reset(); // Reset the form after adding
    };

    if (image) {
        reader.readAsDataURL(image); // Convert to Base64
    } else {
        alert('Please select an image.'); // Alert if no image is selected
    }
});

// Add Item Modal
const addItemModal = document.getElementById("addItemModal"); // Reference to the add item modal
const addBtn = document.getElementById("add-item-button"); // Reference to the add item button

addBtn.onclick = function() {
    if (!currentUser) {
        alert('Please log in to add items to your grocery list.'); // Alert if user is not logged in
        showAuth(); // Show the authentication section
        return; // Prevent opening the modal
    }
    
    editingItemId = null; // Reset editing ID when opening the modal for adding
    addItemModal.style.display = "block"; // Show add item modal
}

// Close Add Item Modal
function closeAddItemModal() {
    addItemModal.style.display = "none"; // Hide add item modal
}

// Close Edit Item Modal
function closeEditItemModal() {
    document.getElementById('edit-item-form').reset(); // Reset the form
    document.getElementById('editItemModal').style.display = "none"; // Hide edit item modal
}

// Load Grocery List
function loadGroceryList() {
    const list = document.getElementById('list'); // Reference to the grocery list
    list.innerHTML = ''; // Clear existing items

    // Get filter and sort values
    const filterValue = document.getElementById('filter-category').value; // Get selected filter
    const sortValue = document.getElementById('sort-category').value; // Get selected sort option

    // Filter items based on selected category
    let filteredItems = groceryItems.filter(item => {
        return filterValue === 'All' || item.category === filterValue; // Show all or filter by category
    });

    // Sort items based on selected criteria
    if (sortValue === 'name') {
        filteredItems.sort((a, b) => a.productName.localeCompare(b.productName)); // Sort by name
    } else if (sortValue === 'price') {
        filteredItems.sort((a, b) => a.price - b.price); // Sort by price
    } else if (sortValue === 'store') {
        filteredItems.sort((a, b) => a.store.localeCompare(b.store)); // Sort by store
    }

    // Separate checked and unchecked items
    const checkedItems = filteredItems.filter(item => item.checked); // Get checked items
    const uncheckedItems = filteredItems.filter(item => !item.checked); // Get unchecked items

    // Display unchecked items first
    [...uncheckedItems, ...checkedItems].forEach(item => {
        const li = document.createElement('li'); // Create list item element
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
    if (item) {
        item.checked = checkbox.checked; // Update the checked status
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems)); // Save changes to localStorage
    }

    // Refresh the grocery list to reflect changes
    loadGroceryList(); // Reload the grocery list
}

// Remove Item
function removeItem(id) {
    groceryItems = groceryItems.filter(item => item.id !== id); // Remove item from grocery items
    localStorage.setItem('groceryItems', JSON.stringify(groceryItems)); // Save updated grocery items to localStorage
    loadGroceryList(); // Reload the grocery list
}

// Grocery List Management for Editing Item
document.getElementById('edit-item-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
    const productName = document.getElementById('edit-product-name').value; // Get edited product name
    const brand = document.getElementById('edit-brand').value; // Get edited brand
    const price = document.getElementById('edit-price').value; // Get edited price
    const weight = document.getElementById('edit-weight').value; // Get edited weight
    const quantity = document.getElementById('edit-quantity').value; // Get edited quantity
    const store = document.getElementById('edit-store').value; // Get edited store
    const category = document.getElementById('edit-category').value; // Get edited category
    const image = document.getElementById('edit-image').files[0]; // Get edited image file

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

        groceryItems = groceryItems.map(groceryItem => groceryItem.id === editingItemId ? item : groceryItem); // Update the grocery item
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems)); // Save updated grocery items to localStorage
        loadGroceryList(); // Reload the grocery list
        closeEditItemModal(); // Hide modal after editing
    };

    if (image) {
        reader.readAsDataURL(image); // Convert to Base64
    } else {
        // If no new image, keep the existing data and close the modal
        const existingItem = groceryItems.find(i => i.id === editingItemId); // Get existing item
        const item = {
            id: editingItemId,
            productName,
            brand,
            price: parseFloat(price),
            weight,
            quantity,
            store,
            category,
            image: existingItem.image // Keep the old image
        };

        groceryItems = groceryItems.map(groceryItem => groceryItem.id === editingItemId ? item : groceryItem); // Update the grocery item
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems)); // Save updated grocery items to localStorage
        loadGroceryList(); // Reload the grocery list
        closeEditItemModal(); // Hide modal after editing
    }
});

// Edit Item
function editItem(id) {
    const item = groceryItems.find(item => item.id === id); // Find the item to edit
    if (!item) return; // Exit if item not found

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
    document.getElementById('editItemModal').style.display = "block"; // Show edit item modal
}

// Search Functionality
document.getElementById('search-bar').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase(); // Get search term
    const list = document.getElementById('list'); // Reference to the grocery list
    list.innerHTML = ''; // Clear existing items

    // Filter items based on search term
    const filteredItems = groceryItems.filter(item => item.productName.toLowerCase().includes(searchTerm));

    filteredItems.forEach(item => {
        const li = document.createElement('li'); // Create list item element
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
        list.appendChild(li); // Append filtered item to the list
    });
});

// Filter and Sorting Event Listeners
document.getElementById('filter-category').addEventListener('change', loadGroceryList); // Reload list on filter change
document.getElementById('sort-category').addEventListener('change', loadGroceryList); // Reload list on sort change

// Logout Functionality
function logout() {
    // Clear user session
    currentUser = null; // Reset current user
    localStorage.removeItem('username'); // Remove username from localStorage

    // Update UI
    document.getElementById('grocery-list').style.display = 'none'; // Hide grocery list
    showAuth(); // Show authentication UI
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