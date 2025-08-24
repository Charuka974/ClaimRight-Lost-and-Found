// ===============================
// Lost & Found Items Management
// ===============================

// === API Endpoints ===
const API_BASE_LOSTITEM = 'http://localhost:8080/claimright/lost-item';
const API_BASE_FOUNDITEM = 'http://localhost:8080/claimright/found-item';

// === Containers & Modals ===
const myLostItemContainer = document.getElementById('myLostItemContainer');
const myFoundItemContainer = document.getElementById('myFoundItemContainer');
const editItemModal = document.getElementById("editMyItemModal");



// ===============================
// LOAD FUNCTIONS
// ===============================
async function loadMyLostItems() {
    try {
        const token = localStorage.getItem("accessToken");
        const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!token || !loggedUser) throw new Error("User not logged in");

        const response = await fetch(`${API_BASE_LOSTITEM}/owner/${loggedUser.userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load your lost items");

        const myLostItems = await response.json();
        renderItems(myLostItems, myLostItemContainer, "lost");
    } catch (error) {
        console.error(error);
    }
}

async function loadMyFoundItems() {
    try {
        const token = localStorage.getItem("accessToken");
        const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!token || !loggedUser) throw new Error("User not logged in");

        const response = await fetch(`${API_BASE_FOUNDITEM}/finder/${loggedUser.userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load your found items");

        const myFoundItems = await response.json();
        renderItems(myFoundItems, myFoundItemContainer, "found");
    } catch (error) {
        console.error(error);
    }
}

// ===============================
// RENDER FUNCTION (Reusable)
// ===============================
// ===============================
// RENDER FUNCTION (Reusable)
// ===============================
function renderItems(items, container, type) {
    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = `<p class="no-items-message">No ${type} items yet.</p>`;
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = `${type}-item-card`;

        card.innerHTML = `
            <img src="${item.imageUrl || '/Front_End/assets/images/ChatGPT Image Jul 24, 2025, 11_16_54 AM.png'}" 
                 alt="${type} item image" class="${type}-item-image" />
            <div class="${type}-item-content">
                <h2 class="${type}-item-title">${item.itemName}</h2>
                <div class="claimed-badge" style="display:${item.isClaimed ? 'block' : 'none'};">Claimed</div>
                <p class="${type}-item-description">${type === "lost" ? item.detailedDescription : item.generalDescription}</p>
                <p class="${type}-item-meta"><strong>${type === "lost" ? "Lost On" : "Found On"}:</strong> ${item.dateLost || item.dateFound ? new Date(item.dateLost || item.dateFound).toLocaleDateString() : 'N/A'}</p>
                <p class="${type}-item-meta"><strong>Location:</strong> ${item.locationLost || item.locationFound}</p>
                <p class="${type}-item-meta"><strong>${type === "lost" ? "Owner" : "Finder"}:</strong> ${item.ownerName || item.finderName || 'Unknown'}</p>
                <div class="categories">
                    ${item.categoryNames.map(cat => `<span class="category-badge">${cat}</span>`).join('')}
                </div>
                <button class="edit-${type}-item-btn">Edit</button>
                <button class="delete-${type}-item-btn">Delete</button>
            </div>
        `;

        container.appendChild(card);

        // Delete
        card.querySelector(`.delete-${type}-item-btn`)
            .addEventListener("click", () => type === "lost" ? deleteLostItem(item.id) : deleteFoundItem(item.id));

        // Edit
        card.querySelector(`.edit-${type}-item-btn`)
            .addEventListener("click", () => openEditModal(item, type));
    });
}


// ===============================
// DELETE FUNCTIONS
// ===============================
async function deleteLostItem(itemId) {
    await deleteItem(itemId, API_BASE_LOSTITEM, loadMyLostItems, "lost item");
}

async function deleteFoundItem(itemId) {
    await deleteItem(itemId, API_BASE_FOUNDITEM, loadMyFoundItems, "found item");
}

async function deleteItem(itemId, apiBase, reloadFn, label) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `This ${label} will be permanently deleted!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${apiBase}/${itemId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            Swal.fire({ title: 'Deleted!', text: `${label} deleted successfully.`, icon: 'success', timer: 1500, showConfirmButton: false });
            reloadFn();
        } else {
            Swal.fire({ title: 'Error!', text: `Failed to delete ${label}.`, icon: 'error' });
        }
    } catch (error) {
        console.error(error);
        Swal.fire({ title: 'Error!', text: `An unexpected error occurred while deleting the ${label}.`, icon: 'error' });
    }
}

// ===============================
// EDIT FUNCTIONS
// ===============================

// --- Initialize ---
let categories = [];
let selectedCategories = new Set();

const categoryOptionsContainer = document.getElementById("editCategoryOptionsContainer");
const selectedCategoriesContainer = document.getElementById("editSelectedCategoriesContainer");

// Load categories from backend
async function loadCategories() {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch('http://localhost:8080/claimright/item-categories', {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch categories');

        categories = await response.json();
        renderCategoryOptions();
        renderSelectedCategories();

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render category option buttons
function renderCategoryOptions() {
    categoryOptionsContainer.innerHTML = '';

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat.name;
        btn.type = "button";
        btn.style.cssText = `
            margin:3px; padding:5px 10px; border:1px solid #ccc; border-radius:5px;
            font-size:0.8rem; width:48%; cursor:pointer;
            background-color:${selectedCategories.has(cat.categoryId) ? '#007bff' : '#f0f0f0'};
            color:${selectedCategories.has(cat.categoryId) ? 'white' : 'black'};
        `;

        btn.addEventListener('click', () => {
            selectedCategories.has(cat.categoryId) 
                ? selectedCategories.delete(cat.categoryId) 
                : selectedCategories.add(cat.categoryId);
            renderCategoryOptions();
            renderSelectedCategories();
        });

        categoryOptionsContainer.appendChild(btn);
    });
}

// Show selected categories
// Show selected categories with the ability to remove
function renderSelectedCategories() {
    selectedCategoriesContainer.innerHTML = '';

    selectedCategories.forEach(id => {
        const cat = categories.find(c => c.categoryId === id);
        if (!cat) {
            return;
        }

        const span = document.createElement('span');
        span.textContent = cat.name + ' ×'; // Add an "×" to indicate it's removable
        span.style.cssText = `
            display:inline-block;
            margin:3px;
            padding:3px 8px;
            background:#007bff;
            color:white;
            border-radius:12px;
            font-size:0.8rem;
            cursor:pointer;
            user-select:none;
        `;

        // Remove category when badge is clicked
        span.addEventListener('click', () => {
            selectedCategories.delete(cat.categoryId);
            renderCategoryOptions();  // update option buttons
            renderSelectedCategories(); // update selected badges
        });

        selectedCategoriesContainer.appendChild(span);
    });
}


// Populate modal categories when editing an item
function populateEditModalCategories(itemCategoryIds) {
    selectedCategories = new Set(itemCategoryIds || []);
    renderCategoryOptions();
    renderSelectedCategories();
}




const editMyItemModal = document.getElementById("editMyItemModal");
const editCloseBtn = document.getElementById("editCloseBtn");

// Open modal function (reuse from your previous code)
// Open modal function
async function openEditModal(item, type) {
    editMyItemModal.style.display = "block";

    document.getElementById("editItemId").value = item.id;
    document.getElementById("editItemType").value = type;
    document.getElementById("editItemName").value = item.itemName;
    document.getElementById("editItemDescription").value = type === "lost" ? item.detailedDescription : item.generalDescription;
    document.getElementById("editItemLocation").value = item.locationLost || item.locationFound;
    document.getElementById("editItemDate").value = (item.dateLost || item.dateFound) ? new Date(item.dateLost || item.dateFound).toISOString().split("T")[0] : "";

    // Show image preview if available
    if (item.imageUrl) {
        editImagePreview.src = item.imageUrl;
        editImagePreviewContainer.style.display = "block";
    } else {
        editImagePreviewContainer.style.display = "none";
    }

    // --- Load categories and populate modal ---
    await loadCategories(); // fetch categories from backend

    // Populate selected categories for this item
    populateEditModalCategories(item.categoryIds || []);
}

// Close modal
editCloseBtn.addEventListener("click", () => {
    editMyItemModal.style.display = "none";
});

// Close modal if click outside content
window.addEventListener("click", (e) => {
    if (e.target === editMyItemModal) editMyItemModal.style.display = "none";
});



// === Submit Edit Form ===

document.getElementById("editItemForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const itemId = document.getElementById("editItemId").value;
    const type = document.getElementById("editItemType").value;

    const editApiBase = type === "lost"
        ? `${API_BASE_LOSTITEM}/update-lost-item`
        : `${API_BASE_FOUNDITEM}/update-found-item`;

    const reloadFn = type === "lost" ? loadMyLostItems : loadMyFoundItems;

    const formData = new FormData();

    const itemData = {
        itemName: document.getElementById("editItemName").value,
        detailedDescription: document.getElementById("editItemDescription").value,
        generalDescription: document.getElementById("editItemDescription").value,
        locationLost: type === "lost" ? document.getElementById("editItemLocation").value : undefined,
        locationFound: type === "found" ? document.getElementById("editItemLocation").value : undefined,
        dateLost: type === "lost" ? document.getElementById("editItemDate").value : undefined,
        dateFound: type === "found" ? document.getElementById("editItemDate").value + "T00:00:00" : undefined,
        isClaimed: document.getElementById("editItemIsClaimed") 
            ? document.getElementById("editItemIsClaimed").checked 
            : false
    };

    const partName = type === "lost" ? "lostItem" : "foundItem";
    formData.append(partName, new Blob([JSON.stringify(itemData)], { type: "application/json" }));

    const fileInput = document.getElementById("editImageUpload");
    if (fileInput && fileInput.files.length > 0) {
        formData.append("imageFile", fileInput.files[0]);
    }

    try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${editApiBase}/${itemId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) throw new Error("Update failed");

        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Item updated successfully.', timer: 1500, showConfirmButton: false });
        editItemModal.style.display = "none";
        reloadFn();

    } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update item.' });
    } finally {
        if (loadingScreen) loadingScreen.style.display = "none";
    }
});


// Edit modal Image 

const editImageUpload = document.getElementById("editImageUpload");
const editImagePreviewContainer = document.getElementById("editImagePreviewContainer");
const editImagePreview = document.getElementById("editImagePreview");
const editRemoveImageBtn = document.getElementById("editRemoveImageBtn");
const editChangeImageBtn = document.getElementById("editChangeImageBtn");

// Show preview when user selects a file
editImageUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        editImagePreview.src = URL.createObjectURL(file);
        editImagePreviewContainer.style.display = "block";
    }
});

// Remove image
editRemoveImageBtn.addEventListener("click", () => {
    editImageUpload.value = "";
    editImagePreview.src = "";
    editImagePreviewContainer.style.display = "none";
});

// Change image
editChangeImageBtn.addEventListener("click", () => {
    editImageUpload.click(); // Opens file picker
});
