const API_BASE_LOSTITEM = 'http://localhost:8080/claimright/lost-item';
const API_ITEM_CAT = 'http://localhost:8080/claimright/item-categories';
const API_PAYMENTS = 'http://localhost:8080/claimright/payments';

const reportModal = document.getElementById("reportLostItemModal");
const reportCloseBtn = document.getElementById("reportCloseBtn");
const reportForm = document.getElementById("reportLostItemForm");

const categoryOptionsContainer = document.getElementById('categoryOptionsContainer');
const selectedCategoriesContainer = document.getElementById('selectedCategoriesContainer');

let categories = [];  
let selectedCategories = new Set();
let allLostItemsData = [];

let stripe, elements, paymentElement, clientSecret;
let paymentIntentCreated = false;
let currentLostItemId = null; // Store the lost item ID for payment

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userJsonCheck = localStorage.getItem("loggedInUser");
    if (!userJsonCheck) {
        Swal.fire({
            icon: 'info',
            title: 'You are not logged in!',
            text: 'Please log in to access full features.',
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true
        }).then(() => {
            window.location.href = "/Front_End/html/dashboard.html";
        });
        return;
    }

    // Check if modal should be opened from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openModal') === 'true') openReportLostItem();

    // Initialize page components
    loadCategories();
    loadLostItems();

    // Initialize Stripe
    stripe = Stripe("pk_test_51S5j4qQyZBVCuvZZ2fVhQ77PPHSJpucR4pgZvAeVZ6zJMSzwhFkV3ZJyvpJT5iB6fTCoZl391v8vYMI8D3hJGGXt007hyw2a4j");

    // Set up payment modal event listeners
    const modalEl = document.getElementById('securePaymentModal');
    modalEl.addEventListener('hidden.bs.modal', () => {
        // Reset payment state when modal is closed
        paymentIntentCreated = false;
        clientSecret = null;
        currentLostItemId = null;
    });

    // Set up payment form submission
    document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await processPayment();
    });
});

// --- Load Lost Items ---
async function loadLostItems() {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(API_BASE_LOSTITEM, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load lost items");

        const lostItems = await response.json();
        allLostItemsData = lostItems;
        renderLostItems(lostItems);

    } catch (error) {
        console.error(error);
        Swal.fire({ 
            icon: 'error', 
            title: 'Error loading items', 
            text: error.message || "Could not load lost items" 
        });
    }
}

// --- Render Lost Items ---
function renderLostItems(lostItems) {
    const container = document.querySelector(".main-content-container");
    container.innerHTML = "";

    if (lostItems.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <h3 class="mt-3 text-muted">No lost items found</h3>
                <p>Be the first to report a lost item!</p>
            </div>
        `;
        return;
    }

    lostItems.forEach(item => {
        const lostItemCard = document.createElement("div");
        lostItemCard.className = "lost-item-card";

        lostItemCard.innerHTML = `
            <img src="${item.imageUrl || '/Front_End/assets/images/noImageAvalable.png'}" 
                alt="Lost item image" class="lost-item-image" />
            <div class="lost-item-content">
                <h2 class="lost-item-title">${item.itemName}</h2>
                <div class="claimed-badge" style="display:${item.isClaimed ? 'block' : 'none'};">Claimed</div>
                <p class="lost-item-description">${item.detailedDescription}</p>
                
                ${item.reward ? `<p class="lost-item-meta"><strong>Reward:</strong> $${parseFloat(item.reward).toFixed(2)}</p>` : ''}

                <p class="lost-item-meta"><strong>Lost On:</strong> ${item.dateLost ? new Date(item.dateLost).toLocaleDateString() : 'N/A'}</p>
                <p class="lost-item-meta"><strong>Location:</strong> ${item.locationLost}</p>
                <p class="lost-item-meta"><strong>Owner:</strong> ${item.ownerName || 'Unknown'}</p>
                
                <div class="categories">
                ${item.categoryNames.map(cat => `<span class="category-badge">${cat}</span>`).join('')}
                </div>
                <button class="respond-btn" 
                        data-id="${item.id}" 
                        data-type="lost"
                        ${item.isClaimed ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                Respond
                </button>
            </div>
        `;

        // Attach event listener to respond button
        lostItemCard.querySelector(".respond-btn").addEventListener("click", function() {
            const itemId = this.getAttribute("data-id");
            const itemType = this.getAttribute("data-type");
            window.location.href = `/Front_End/html/claim-respond-page.html?type=${itemType}&id=${itemId}`;
        });

        container.appendChild(lostItemCard);
    });
}

// --- Report Lost Item Form Submit ---
reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateReportForm()) return;
    
    const rewardValue = parseFloat(reportForm.reward.value || 0);
    
    if (rewardValue > 0) {
        // First submit the lost item without reward to get the ID
        const lostItemId = await submitLostItemWithoutReward();
        if (!lostItemId) return; // Stop if submission failed
        
        // Store the lost item ID for payment
        currentLostItemId = lostItemId;
        
        // Show payment modal for reward items
        document.getElementById('payment-amount').textContent = `$${rewardValue.toFixed(2)}`;
        
        // Create payment intent with the lost item ID
        const intentCreated = await createPaymentIntent(rewardValue, lostItemId);
        if (!intentCreated) return;
        
        // Show payment modal
        const modal = new bootstrap.Modal(document.getElementById('securePaymentModal'), {
            backdrop: "static",
            keyboard: false
        });
        modal.show();
        
    } else {
        // No reward - submit directly
        await submitLostItem();
    }
});

// --- Submit Lost Item Without Reward (to get ID for payment) ---
async function submitLostItemWithoutReward() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    loadingOverlay.style.display = "flex";

    try {
        const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        
        // Submit without reward initially to get the ID
        const lostItemData = {
            itemName: reportForm.itemName.value,
            detailedDescription: reportForm.itemDescription.value,
            locationLost: reportForm.locationLost.value,
            dateLost: reportForm.dateLost.value ? new Date(reportForm.dateLost.value).toISOString() : null,
            reward: null, // Submit without reward first
            categoryIds: Array.from(selectedCategories),
            ownerId: loggedUser ? loggedUser.userId : null
        };

        const formData = new FormData();
        formData.append("lostItem", new Blob([JSON.stringify(lostItemData)], { type: "application/json" }));

        if (reportForm.imageFile.files.length > 0) {
            formData.append("imageFile", reportForm.imageFile.files[0]);
        }

        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(`${API_BASE_LOSTITEM}/report-lost-item`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to submit report");
        }

        // Get the created lost item from response
        const createdItem = await response.json();
        return createdItem.id;

    } catch (error) {
        console.error("Submission error:", error);
        Swal.fire({ 
            icon: 'error', 
            title: 'Submission Failed', 
            text: error.message || "Something went wrong while submitting your report." 
        });
        return null;
    } finally {
        loadingOverlay.style.display = "none";
    }
}

// --- Create Payment Intent ---
async function createPaymentIntent(amount, lostItemId) {
    const overlay = document.getElementById("loadingOverlay");
    overlay.style.display = "flex";

    try {
        const token = localStorage.getItem("accessToken");
        const userJson = JSON.parse(localStorage.getItem("loggedInUser"));

        const payload = {
            amount: Math.round(amount), // Convert to cents for Stripe
            type: "REWARD",
            payerId: userJson.userId,
            receiverId: null,
            lostItemId: lostItemId, // Include the lost item ID
            foundItemId: null
        };

        const response = await fetch(`${API_PAYMENTS}/create-intent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to create payment intent");
        }

        const data = await response.json();
        clientSecret = data.clientSecret;
        paymentIntentCreated = true;
        
        // Initialize Stripe Elements
        if (elements) {
            elements.unmount();
            elements = null;
        }
        
        elements = stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
        
        if (paymentElement) {
            paymentElement.unmount();
        }
        
        paymentElement = elements.create("payment", {
            layout: {
                type: 'tabs',
                defaultCollapsed: false
            }
        });
        
        paymentElement.mount("#payment-element");
        
        return true;

    } catch (err) {
        console.error(err);
        Swal.fire({ 
            icon: "error", 
            title: "Payment Error", 
            text: err.message || "Payment initialization failed" 
        });
        return false;
    } finally {
        overlay.style.display = "none";
    }
}

// --- Process Payment ---
async function processPayment() {
    const submitButton = document.getElementById('submit-payment');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

    try {
        // Call elements.submit() FIRST before any async operations
        const { error: submitError } = await elements.submit();
        if (submitError) {
            Swal.fire({ 
                icon: "error", 
                title: "Validation failed", 
                text: submitError.message 
            });
            submitButton.disabled = false;
            submitButton.innerHTML = 'Pay <span id="payment-amount"></span>';
            return false;
        }

        // Now call confirmPayment
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required'
        });

        if (error) {
            Swal.fire({ 
                icon: "error", 
                title: "Payment failed", 
                text: error.message 
            });
            return false;
        }

        if (paymentIntent.status === 'succeeded') {
            // Payment succeeded - update the lost item with reward
            await updateLostItemWithReward();
            
            // Close the payment modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('securePaymentModal'));
            modal.hide();
            
            return true;
        } else {
            Swal.fire({ 
                icon: "info", 
                title: "Payment status", 
                text: `Payment status: ${paymentIntent.status}` 
            });
            return false;
        }
    } catch (err) {
        console.error(err);
        Swal.fire({ 
            icon: "error", 
            title: "Error", 
            text: err.message || "Payment processing failed" 
        });
        return false;
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Pay <span id="payment-amount"></span>';
    }
}

// --- Update Lost Item With Reward ---
async function updateLostItemWithReward() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    loadingOverlay.style.display = "flex";

    try {
        const rewardValue = parseFloat(reportForm.reward.value || 0);

        if (!currentLostItemId) throw new Error("Lost item ID not found");

        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_LOSTITEM}/update-lost-item-reward/${currentLostItemId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(rewardValue) // send reward as JSON number
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to update lost item reward");
        }

        Swal.fire({
            icon: 'success',
            title: 'Payment Successful',
            text: 'Your reward has been successfully added to your lost item report.',
            timer: 2000,
            showConfirmButton: false
        });

        // Reset form and modal
        reportModal.style.display = "none";
        reportForm.reset();
        selectedCategories.clear();
        renderCategoryOptions();
        renderSelectedCategories();

        // Reset image preview
        const previewContainer = document.getElementById("imagePreviewContainer");
        const previewImage = document.getElementById("imagePreview");
        previewImage.src = "";
        previewContainer.style.display = "none";

        // Reload items
        loadLostItems();

    } catch (error) {
        console.error("Update reward error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error.message || "Something went wrong while updating the reward."
        });
    } finally {
        loadingOverlay.style.display = "none";
    }
}


// --- Submit Lost Item (for no reward case) ---
async function submitLostItem() {
    const loadingOverlay = document.getElementById("loadingOverlay");
    loadingOverlay.style.display = "flex";

    try {
        const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        
        const rewardValue = reportForm.reward.value ? parseFloat(reportForm.reward.value) : null;
        
        const lostItemData = {
            itemName: reportForm.itemName.value,
            detailedDescription: reportForm.itemDescription.value,
            locationLost: reportForm.locationLost.value,
            dateLost: reportForm.dateLost.value ? new Date(reportForm.dateLost.value).toISOString() : null,
            reward: rewardValue,
            categoryIds: Array.from(selectedCategories),
            ownerId: loggedUser ? loggedUser.userId : null
        };

        const formData = new FormData();
        formData.append("lostItem", new Blob([JSON.stringify(lostItemData)], { type: "application/json" }));

        if (reportForm.imageFile.files.length > 0) {
            formData.append("imageFile", reportForm.imageFile.files[0]);
        }

        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(`${API_BASE_LOSTITEM}/report-lost-item`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to submit report");
        }

        Swal.fire({
            icon: 'success',
            title: 'Report Submitted',
            text: 'Your lost item report was successfully submitted.',
            timer: 2000,
            showConfirmButton: false
        });

        // Reset form and close modal
        reportModal.style.display = "none";
        reportForm.reset();
        selectedCategories.clear();
        renderCategoryOptions();
        renderSelectedCategories();
        
        // Reset image preview
        const previewContainer = document.getElementById("imagePreviewContainer");
        const previewImage = document.getElementById("imagePreview");
        previewImage.src = "";
        previewContainer.style.display = "none";
        
        // Reload items
        loadLostItems();

    } catch (error) {
        console.error("Submission error:", error);
        Swal.fire({ 
            icon: 'error', 
            title: 'Submission Failed', 
            text: error.message || "Something went wrong while submitting your report." 
        });
    } finally {
        loadingOverlay.style.display = "none";
    }
}

// --- Validate Report Form ---
function validateReportForm() {
    const itemName = document.getElementById('itemName').value.trim();
    const description = document.getElementById('itemDescription').value.trim();
    const location = document.getElementById('lostLocation').value.trim();
    const date = document.getElementById('lostDate').value;
    
    if (!itemName) {
        Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter an item name' });
        return false;
    }
    
    if (!description) {
        Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter a description' });
        return false;
    }
    
    if (!location) {
        Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please enter a location' });
        return false;
    }
    
    if (!date) {
        Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please select a date' });
        return false;
    }
    
    if (selectedCategories.size === 0) {
        Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Please select at least one category' });
        return false;
    }
    
    return true;
}

// --- Load Categories ---
async function loadCategories() {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(API_ITEM_CAT, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch categories');

        categories = await response.json();
        renderCategoryOptions();
        renderSelectedCategories();

    } catch (error) {
        console.error('Error loading categories:', error);
        Swal.fire({ 
            icon: 'error', 
            title: 'Error', 
            text: 'Failed to load categories' 
        });
    }
}

// --- Render Category Options ---
function renderCategoryOptions() {
  categoryOptionsContainer.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.name;
    btn.style.cssText = `
      margin:3px; padding:5px 10px; border:1px solid #ccc; border-radius:5px;
      font-size:0.8rem; width:50%; cursor:pointer;
      background-color:${selectedCategories.has(cat.categoryId) ? '#007bff' : '#f0f0f0'};
      color:${selectedCategories.has(cat.categoryId) ? 'white' : 'black'};
    `;

    btn.addEventListener('click', () => {
      selectedCategories.has(cat.categoryId) ? selectedCategories.delete(cat.categoryId) : selectedCategories.add(cat.categoryId);
      renderCategoryOptions();
      renderSelectedCategories();
    });

    categoryOptionsContainer.appendChild(btn);
  });
}

// --- Render Selected Categories ---
function renderSelectedCategories() {
  selectedCategoriesContainer.innerHTML = '';

  selectedCategories.forEach(id => {
    const cat = categories.find(c => c.categoryId === id);
    if (!cat) return;

    const badge = document.createElement('span');
    badge.textContent = cat.name + ' ×';
    badge.style.cssText = `
      display:inline-block; background-color:#007bff; color:white; padding:3px 8px; 
      margin:2px; border-radius:12px; font-size:0.8em; cursor:pointer; user-select:none;
    `;

    badge.addEventListener('click', () => {
      selectedCategories.delete(cat.categoryId);
      renderCategoryOptions();
      renderSelectedCategories();
    });

    selectedCategoriesContainer.appendChild(badge);
  });
}

// --- Image Upload & Preview ---
const imageUpload = document.getElementById("imageUpload");
const dropZone = document.getElementById("dropZone");
const previewContainer = document.getElementById("imagePreviewContainer");
const previewImage = document.getElementById("imagePreview");
const removeImageBtn = document.getElementById("removeImageBtn");

// Show preview when selecting an image
imageUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.style.display = "block";
    };
    reader.readAsDataURL(file);
});

// Drag & Drop events
["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = "#0d6efd";
        dropZone.style.background = "#f0f8ff";
    });
});

["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = "#ccc";
        dropZone.style.background = "transparent";
    });
});

// Handle file drop
dropZone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
        imageUpload.files = files;
        imageUpload.dispatchEvent(new Event("change"));
    }
});

// Clicking drop zone opens file picker
dropZone.addEventListener("click", () => imageUpload.click());

// Remove image
removeImageBtn.addEventListener("click", () => {
    imageUpload.value = "";
    previewImage.src = "";
    previewContainer.style.display = "none";
});

// Block future dates
const lostDateInput = document.getElementById("lostDate");
const today = new Date().toISOString().split("T")[0]; 
lostDateInput.max = today;

// --- Open & Close Modal ---
function openReportLostItem() { 
    reportModal.style.display = "block"; 
}

reportCloseBtn.addEventListener("click", () => {
    reportModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === reportModal) {
        reportModal.style.display = "none";
    }
});

// --- Search & Sort ---
function filterItems(searchTerm) {
    const filtered = allLostItemsData.filter(item => {
        const title = item.itemName.toLowerCase();
        const description = (item.detailedDescription || "").toLowerCase();
        const location = (item.locationLost || "").toLowerCase();
        
        return title.includes(searchTerm.toLowerCase()) || 
               description.includes(searchTerm.toLowerCase()) ||
               location.includes(searchTerm.toLowerCase());
    });
    renderLostItems(filtered);
}

function sortItems(sortBy) {
    let itemsToRender = [...allLostItemsData];

    if (sortBy === "newest") {
        itemsToRender.sort((a, b) => new Date(b.dateReported || b.dateLost) - new Date(a.dateReported || a.dateLost));
    } else if (sortBy === "oldest") {
        itemsToRender.sort((a, b) => new Date(a.dateReported || a.dateLost) - new Date(b.dateReported || b.dateLost));
    }

    renderLostItems(itemsToRender);
}

// --- Event Listeners ---
const searchInput = document.getElementById("dashboard-search");
const searchBtn = document.getElementById("dashboard-search-btn");
const sortSelect = document.getElementById("dashboard-sort");

searchBtn.addEventListener("click", () => filterItems(searchInput.value));
searchInput.addEventListener("input", () => {
    if (searchInput.value === "") {
        renderLostItems(allLostItemsData);
    } else {
        filterItems(searchInput.value);
    }
});
sortSelect.addEventListener("change", (e) => sortItems(e.target.value));