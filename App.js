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

document.getElementById('toggle-auth').addEventListener('click', function () {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('register').style.display = 'block';
});

document.getElementById('toggle-auths').addEventListener('click', function () {
    document.getElementById('auth').style.display = 'block';
    document.getElementById('register').style.display = 'none';
});

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

// Toggle Modal
const modal = document.getElementById("myModal");
const btn = document.getElementById("add-item-button");
const span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
    editingItemId = null; // Reset editing ID when opening the modal for adding
    modal.style.display = "block";
}

// Close the modal when the user clicks on <span> (x)
span.onclick = function() {
    modal.style.display = "none";
}

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Grocery List Management
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
            id: editingItemId ? editingItemId : Date.now(), // Use existing ID if editing
            productName,
            brand,
            price: parseFloat(price), // Ensure price is a number
            weight,
            quantity,
            store,
            category,
            image: reader.result // Store Base64 string
        };

        if (editingItemId) {
            // Update existing item
            groceryItems = groceryItems.map(groceryItem => groceryItem.id === editingItemId ? item : groceryItem);
        } else {
            // Add new item
            groceryItems.push(item);
        }

        localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
        loadGroceryList();
        document.getElementById('add-item-form').reset();
        modal.style.display = "none"; // Hide modal after adding/editing
    };

    if (image) {
        reader.readAsDataURL(image); // Convert to Base64
    } else {
        alert('Please select an image.');
    }
});

// Filtering functionality
document.getElementById('filter-category').addEventListener('change', function () {
    loadGroceryList();
});

// Sorting functionality
document.getElementById('sort-category').addEventListener('change', function () {
    loadGroceryList();
});

function loadGroceryList() {
    const list = document.getElementById('list');
    const filterValue = document.getElementById('filter-category').value;
    const sortValue = document.getElementById('sort-category').value;
    list.innerHTML = '';

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
                <input type="checkbox" class="item-check" id="check-${item.id}">
                ${item.image ? `<img src="${item.image}" alt="${item.productName}" width="100">` : ''} <br>
                <strong class="item-name">${item.productName}</strong><br>
                <span class="item-price">Price: ₱${item.price}</span><br>
                <span class="item-store">Store: ${item.store}</span><br>
                <span class="item-quantity">Quantity: ${item.quantity}</span><br>
            </div>
            <button class="edit" onclick="editItem(${item.id})">Edit</button>
            <button class="delete" onclick="removeItem(${item.id})">Remove</button>
        `;

        // Add event listener for the checkbox
        const checkbox = li.querySelector('.item-check');
        checkbox.addEventListener('change', function () {
            const itemDetails = li.querySelectorAll('.item-name, .item-price, .item-store, .item-quantity');
            itemDetails.forEach(detail => {
                if (this.checked) {
                    detail.style.textDecoration = 'line-through'; // Add strikethrough
                } else {
                    detail.style.textDecoration = 'none'; // Remove strikethrough
                }
            });
        });

        list.appendChild(li);
    });
}

function removeItem(id) {
    groceryItems = groceryItems.filter(item => item.id !== id);
    localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
    loadGroceryList();
}

function editItem(id) {
    const item = groceryItems.find(item => item.id === id);
    if (!item) return;

    // Populate the modal with the item's data
    document.getElementById('product-name').value = item.productName;
    document.getElementById('brand').value = item.brand;
    document.getElementById('price').value = item.price;
    document.getElementById('weight').value = item.weight;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('store').value = item.store;
    document.getElementById('category').value = item.category;

    // Set the editing item ID
    editingItemId = id;

    // Open the modal
    modal.style.display = "block";
}

document.getElementById('search-bar').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const list = document.getElementById('list');
    list.innerHTML = '';

    // Filter items based on search term
    const filteredItems = groceryItems.filter(item => item.productName.toLowerCase().includes(searchTerm));

    // Display filtered items
    filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <input type="checkbox" class="item-check" id="check-${item.id}">
                ${item.image ? `<img src="${item.image}" alt="${item.productName}" width="100">` : ''} <br>
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
