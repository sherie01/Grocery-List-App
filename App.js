// Save and get data from the browser using localStorage
let users = JSON.parse(localStorage.getItem('users')) || []; // Get users from localStorage or start with an empty list
let currentUser = null; // Holds the user who is currently logged in
let groceryItems = JSON.parse(localStorage.getItem('groceryItems')) || []; // Get grocery items from localStorage or start with an empty list
let editingItemId = null; // Keeps track of which item is being edited

// Check if the user is logged in
// Looks for a saved username. If found, sets the current user and shows the grocery list. If not, shows the login form.
function checkLoginState() {
    const username = localStorage.getItem('username');
    if (username) {
        currentUser = users.find(u => u.username === username); // Find the user with the saved username
        if (currentUser) {
            // User is logged in
            document.getElementById('auth').style.display = 'none'; // Hide the login form
            document.getElementById('grocery-list').style.display = 'block'; // Show the grocery list
            loadGroceryList(); // Load the grocery items
        } else {
            // No matching user found
            showAuth(); // Show the login form
        }
    } else {
        // No username saved
        showAuth(); // Show the login form
    }
}

// Show the login form
// Displays the login form and hides the grocery list and registration form.
function showAuth() {
    document.getElementById('auth').style.display = 'block'; // Show the login form
    document.getElementById('grocery-list').style.display = 'none'; // Hide the grocery list
    document.getElementById('register').style.display = 'none'; // Hide the registration form
}

// Handle login form submission
document.getElementById('auth-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Stop the form from submitting normally
    const username = document.getElementById('username').value; // Get the entered username
    const password = document.getElementById('password').value; // Get the entered password

    const user = users.find(u => u.username === username && u.password === password); // Find a user with matching username and password
    if (user) {
        currentUser = user; // Set the logged-in user
        localStorage.setItem('username', username); // Save the username in localStorage
        document.getElementById('auth').style.display = 'none'; // Hide the login form
        document.getElementById('grocery-list').style.display = 'block'; // Show the grocery list
        loadGroceryList(); // Load the grocery items
    } else {
        alert('Invalid user'); // Show an error if login fails
    }
});

// Switch to the registration form
document.getElementById('toggle-auth').addEventListener('click', function () {
    document.getElementById('auth').style.display = 'none'; // Hide the login form
    document.getElementById('register').style.display = 'block'; // Show the registration form
});

// Switch back to the login form from registration
document.getElementById('toggle-auths').addEventListener('click', function () {
    document.getElementById('auth').style.display = 'block'; // Show the login form
    document.getElementById('register').style.display = 'none'; // Hide the registration form
});

// Handle registration form submission
document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Stop the form from submitting normally
    const username = document.getElementById('new-username').value; // Get the new username
    const password = document.getElementById('new-password').value; // Get the new password

    // Check if the username is already taken
    if (users.find(u => u.username === username)) {
        alert('Username already exists'); // Show an error if username is taken
        return; // Exit the function
    }

    // Add the new user
    users.push({ username, password }); // Add the new user to the list
    localStorage.setItem('users', JSON.stringify(users)); // Save the updated users list
    alert('Registration successful! You can now log in.'); // Inform the user of success
    document.getElementById('register').style.display = 'none'; // Hide the registration form
    document.getElementById('auth').style.display = 'block'; // Show the login form
});

// Handle adding a new grocery item
document.getElementById('add-item-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Stop the form from submitting normally
    const productName = document.getElementById('product-name').value; // Get the product name
    const brand = document.getElementById('brand').value; // Get the brand
    const price = document.getElementById('price').value; // Get the price
    const weight = document.getElementById('weight').value; // Get the weight
    const quantity = document.getElementById('quantity').value; // Get the quantity
    const store = document.getElementById('store').value; // Get the store name
    const category = document.getElementById('category').value; // Get the category
    const image = document.getElementById('image').files[0]; // Get the image file

    const reader = new FileReader();
    reader.onloadend = function () {
        const item = {
            id: Date.now(), // Unique ID based on current time
            productName,
            brand,
            price,
            weight,
            quantity,
            store,
            category,
            image: reader.result, // Save the image as a base64 string
            checked: false // Mark as not checked
        };

        groceryItems.push(item); // Add the new item to the list
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems)); // Save the updated list
        loadGroceryList(); // Refresh the grocery list
        closeAddItemModal(); // Close the add item window
        document.getElementById('add-item-form').reset(); // Clear the form
    };

    if (image) {
        reader.readAsDataURL(image); // Convert the image to base64
    } else {
        alert('Please select an image.'); // Ask the user to select an image
    }
});

// References to the add item modal and button
const addItemModal = document.getElementById("addItemModal"); // The add item popup
const addBtn = document.getElementById("add-item-button"); // The button to open the add item popup

// Open the add item popup
addBtn.onclick = function() {
    if (!currentUser) {
        alert('Please log in to add items to your grocery list.'); // Remind the user to log in
        showAuth(); // Show the login form
        return; // Don't open the popup
    }
    
    editingItemId = null; // Clear any editing ID
    addItemModal.style.display = "block"; // Show the add item popup
}

// Close the add item popup
function closeAddItemModal() {
    addItemModal.style.display = "none"; // Hide the add item popup
}

// Close the edit item popup
function closeEditItemModal() {
    document.getElementById('edit-item-form').reset(); // Clear the edit form
    document.getElementById('editItemModal').style.display = "none"; // Hide the edit item popup
}

// Show the grocery list
function loadGroceryList() {
    const list = document.getElementById('list'); // The list container
    list.innerHTML = ''; // Clear the current list

    // Get filter and sort choices
    const filterValue = document.getElementById('filter-category').value; // Selected filter
    const sortValue = document.getElementById('sort-category').value; // Selected sort option

    // Filter the items by category
    let filteredItems = groceryItems.filter(item => {
        return filterValue === 'All' || item.category === filterValue; // Show all or specific category
    });

    // Sort the items based on the chosen option
    if (sortValue === 'name') {
        filteredItems.sort((a, b) => a.productName.localeCompare(b.productName)); // Sort by name
    } else if (sortValue === 'price') {
        filteredItems.sort((a, b) => a.price - b.price); // Sort by price
    } else if (sortValue === 'store') {
        filteredItems.sort((a, b) => a.store.localeCompare(b.store)); // Sort by store
    }

    // Separate items that are checked and not checked
    const checkedItems = filteredItems.filter(item => item.checked); // Items that are checked
    const uncheckedItems = filteredItems.filter(item => !item.checked); // Items that are not checked

    // Show unchecked items first, then checked items
    [...uncheckedItems, ...checkedItems].forEach(item => {
        const li = document.createElement('li'); // Create a list item
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
        list.appendChild(li); // Add the item to the list
    });
}

// Mark items as done or not done
function toggleStrikeThrough(checkbox, id) {
    // Find the item and update its status
    const item = groceryItems.find(item => item.id === id);
    if (item) {
        item.checked = checkbox.checked; // Set the checked status
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems)); // Save the changes
    }

    // Update the list display
    loadGroceryList(); // Refresh the grocery list
}

// Delete an item from the list
function removeItem(id) {
    groceryItems = groceryItems.filter(item => item.id !== id); // Remove the item from the list
    localStorage.setItem('groceryItems', JSON.stringify(groceryItems)); // Save the updated list
    loadGroceryList(); // Refresh the grocery list
}

// Handle editing an existing grocery item
document.getElementById('edit-item-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Stop the form from submitting normally
    const productName = document.getElementById('edit-product-name').value; // Get the new product name
    const brand = document.getElementById('edit-brand').value; // Get the new brand
    const price = document.getElementById('edit-price').value; // Get the new price
    const weight = document.getElementById('edit-weight').value; // Get the new weight
    const quantity = document.getElementById('edit-quantity').value; // Get the new quantity
    const store = document.getElementById('edit-store').value; // Get the new store
    const category = document.getElementById('edit-category').value; // Get the new category
    const image = document.getElementById('edit-image').files[0]; // Get the new image

    const reader = new FileReader();
    reader.onloadend = function () {
        const item = {
            id: editingItemId, // Keep the same ID
            productName,
            brand,
            price: parseFloat(price), // Make sure price is a number
            weight,
            quantity,
            store,
            category,
            image: image ? reader.result : groceryItems.find(i => i.id === editingItemId).image // Use new image or keep the old one
        };

        groceryItems = groceryItems.map(groceryItem => groceryItem.id === editingItemId ? item : groceryItem); // Update the item in the list
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems)); // Save the changes
        loadGroceryList(); // Refresh the grocery list
        closeEditItemModal(); // Close the edit popup
    };

    if (image) {
        reader.readAsDataURL(image); // Convert the new image to base64
    } else {
        // If no new image, keep the existing one and update other details
        const existingItem = groceryItems.find(i => i.id === editingItemId); // Get the current item
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

        groceryItems = groceryItems.map(groceryItem => groceryItem.id === editingItemId ? item : groceryItem); // Update the item in the list
        localStorage.setItem('groceryItems', JSON.stringify(groceryItems)); // Save the changes
        loadGroceryList(); // Refresh the grocery list
        closeEditItemModal(); // Close the edit popup
    }
});

// Open the edit item popup with the item's details
function editItem(id) {
    const item = groceryItems.find(item => item.id === id); // Find the item to edit
    if (!item) return; // Do nothing if the item isn't found

    // Fill the edit form with the item's current details
    document.getElementById('edit-product-name').value = item.productName;
    document.getElementById('edit-brand').value = item.brand;
    document.getElementById('edit-price').value = item.price;
    document.getElementById('edit-weight').value = item.weight;
    document.getElementById('edit-quantity').value = item.quantity;
    document.getElementById('edit-store').value = item.store;
    document.getElementById('edit-category').value = item.category;

    // Remember which item is being edited
    editingItemId = id;

    // Show the edit popup
    document.getElementById('editItemModal').style.display = "block"; // Show the edit item popup
}

// Search through the grocery items
document.getElementById('search-bar').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase(); // Get the search text
    const list = document.getElementById('list'); // The list container
    list.innerHTML = ''; // Clear the current list

    // Find items that match the search term
    const filteredItems = groceryItems.filter(item => item.productName.toLowerCase().includes(searchTerm));

    filteredItems.forEach(item => {
        const li = document.createElement('li'); // Create a list item
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
        list.appendChild(li); // Add the matching item to the list
    });
});

// Reload the grocery list when filters or sorting options change
document.getElementById('filter-category').addEventListener('change', loadGroceryList); // When filter changes
document.getElementById('sort-category').addEventListener('change', loadGroceryList); // When sort option changes

// Log the user out
function logout() {
    currentUser = null; // Clear the current user
    localStorage.removeItem('username'); // Remove the saved username

    // Update the display
    document.getElementById('grocery-list').style.display = 'none'; // Hide the grocery list
    showAuth(); // Show the login form
}

// Close popups when clicking outside of them
window.onclick = function(event) {
    if (event.target == addItemModal) {
        closeAddItemModal(); // Close the add item popup
    } else if (event.target == document.getElementById('editItemModal')) {
        closeEditItemModal(); // Close the edit item popup
    }
};

// Check if the user is logged in when the page loads
document.addEventListener('DOMContentLoaded', checkLoginState); 