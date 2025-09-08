const API_BASE_FOUNDITEM = 'http://localhost:8080/claimright/found-item';
const API_ITEM_CAT = 'http://localhost:8080/claimright/item-categories';

const reportModal = document.getElementById("reportFoundItemModal");
const reportCloseBtn = document.getElementById("reportFoundCloseBtn");
const reportForm = document.getElementById("reportFoundItemForm");

const categoryOptionsContainer = document.getElementById('categoryOptionsContainer');
const selectedCategoriesContainer = document.getElementById('selectedCategoriesContainer');

let categories = [];
let selectedCategories = new Set();
let allFoundItemsData = [];

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openModal') === 'true') {
        openReportFoundItem();
    }

    loadCategories();
    loadFoundItems();
});

// --- Load Found Items ---
async function loadFoundItems() {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(API_BASE_FOUNDITEM, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load found items");

        const foundItems = await response.json();
        allFoundItemsData = foundItems; // Update global data for search/sort
        renderFoundItems(foundItems);

    } catch (error) {
        console.error(error);
    }
}

// --- Render Found Items ---
function renderFoundItems(foundItems) {
  const container = document.querySelector(".main-content-container");
  container.innerHTML = "";

  foundItems.forEach(item => {
    const foundItemCard = document.createElement("div");
    foundItemCard.className = "found-item-card";

    foundItemCard.innerHTML = `
      <img src="${item.imageUrl || '/Front_End/assets/images/noImageAvalable.png'}" alt="Found item image" class="found-item-image" />
      <div class="found-item-content">
        <h2 class="found-item-title">${item.itemName}</h2>
        <div class="claimed-badge" style="display:${item.isClaimed ? 'block' : 'none'};">Claimed</div>
        <p class="found-item-description">${item.generalDescription}</p>
        <p class="found-item-meta"><strong>Found On:</strong> ${item.dateFound ? new Date(item.dateFound).toLocaleDateString() : 'N/A'}</p>
        <p class="found-item-meta"><strong>Location:</strong> ${item.locationFound}</p>
        <p class="found-item-meta"><strong>Finder:</strong> ${item.finderName || 'Unknown'}</p>
        <div class="categories">
          ${item.categoryNames.map(cat => `<span class="category-badge">${cat}</span>`).join('')}
        </div>
        <button class="respond-btn" 
                data-id="${item.id}" 
                data-type="found"
                ${item.isClaimed ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
        Claim Item
        </button>
      </div>
    `;

    // attach event listener per card
    foundItemCard.querySelector(".respond-btn").addEventListener("click", function() {
      const itemId = this.getAttribute("data-id");
      const itemType = this.getAttribute("data-type");
      window.location.href = `/Front_End/html/claim-respond-page.html?type=${itemType}&id=${itemId}`;
    });

    container.appendChild(foundItemCard);
  });
}


// --- Report Found Item Form Submit ---
const loadingOverlay = document.getElementById("loadingOverlay");

reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

    try {
        loadingOverlay.style.display = "flex";

        const foundItemData = {
            itemName: reportForm.foundItemName.value,
            generalDescription: reportForm.generalDescription.value,
            locationFound: reportForm.locationFound.value,
            dateFound: reportForm.dateFound.value ? new Date(reportForm.dateFound.value).toISOString() : null,
            categoryIds: Array.from(selectedCategories),
            finderId: loggedUser ? loggedUser.userId : null
        };

        const formData = new FormData();
        formData.append(
            "foundItem",
            new Blob([JSON.stringify(foundItemData)], { type: "application/json" })
        );

        const fileInput = reportForm.imageFile;
        if (fileInput.files.length > 0) {
            formData.append("imageFile", fileInput.files[0]);
        }

        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(`${API_BASE_FOUNDITEM}/report-found-item`, {
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
            text: 'Your found item report has been successfully submitted.',
            timer: 2000,
            showConfirmButton: false
        });

        reportModal.style.display = "none";
        reportForm.reset();
        selectedCategories.clear();
        renderCategoryOptions();
        renderSelectedCategories();
        loadFoundItems();

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: error.message || "Something went wrong.",
        });
    } finally {
        loadingOverlay.style.display = "none";
    }
});

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
    }
}

// --- Render Category Options ---
function renderCategoryOptions() {
    categoryOptionsContainer.innerHTML = '';

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat.name;
        btn.style.cssText = `
            margin: 3px;
            padding: 5px 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 0.8rem;
            width: 50%;
            background-color: ${selectedCategories.has(cat.categoryId) ? '#007bff' : '#f0f0f0'};
            color: ${selectedCategories.has(cat.categoryId) ? 'white' : 'black'};
            cursor: pointer;
        `;

        btn.addEventListener('click', () => {
            if (selectedCategories.has(cat.categoryId)) {
                selectedCategories.delete(cat.categoryId);
            } else {
                selectedCategories.add(cat.categoryId);
            }
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
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 3px 8px;
            margin: 2px;
            border-radius: 12px;
            font-size: 0.8em;
            cursor: pointer;
            user-select: none;
        `;

        badge.addEventListener('click', () => {
            selectedCategories.delete(cat.categoryId);
            renderCategoryOptions();
            renderSelectedCategories();
        });

        selectedCategoriesContainer.appendChild(badge);
    });
}

// --- Modal Handlers ---
function openReportFoundItem() {
    reportModal.style.display = "block";
}

reportCloseBtn.addEventListener("click", () => {
    reportModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === reportModal) reportModal.style.display = "none";
});

// --- Search & Sort ---
function filterItems(searchTerm) {
    const filtered = allFoundItemsData.filter(item => {
        const title = item.itemName.toLowerCase();
        const description = (item.generalDescription || "").toLowerCase();
        return title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
    });
    renderFoundItems(filtered);
}

function sortItems(sortBy) {
    let itemsToRender = [...allFoundItemsData];

    if (sortBy === "newest") {
        itemsToRender.sort((a, b) => new Date(b.dateFound) - new Date(a.dateFound));
    } else if (sortBy === "oldest") {
        itemsToRender.sort((a, b) => new Date(a.dateFound) - new Date(b.dateFound));
    } else if (sortBy === "claimed") {
        itemsToRender = itemsToRender.filter(item => item.isClaimed);
    } else if (sortBy === "unclaimed") {
        itemsToRender = itemsToRender.filter(item => !item.isClaimed);
    }

    renderFoundItems(itemsToRender);
}

// --- Listeners ---
const searchInput = document.getElementById("dashboard-search");
const searchBtn = document.getElementById("dashboard-search-btn");
const sortSelect = document.getElementById("dashboard-sort");

searchBtn.addEventListener("click", () => filterItems(searchInput.value));
searchInput.addEventListener("input", () => filterItems(searchInput.value));
sortSelect.addEventListener("change", (e) => sortItems(e.target.value));


// --- Image Preview in report item Modal---
// --- Found Item Drag & Drop Upload ---
const foundImageUpload = document.getElementById("foundImageUpload");
const foundDropZone = document.getElementById("foundDropZone");
const foundPreviewContainer = document.getElementById("foundImagePreviewContainer");
const foundPreviewImage = document.getElementById("foundImagePreview");
const foundRemoveImageBtn = document.getElementById("foundRemoveImageBtn");

// Show preview on file select
foundImageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    foundPreviewImage.src = e.target.result;
    foundPreviewContainer.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// Drag & Drop events
["dragenter", "dragover"].forEach(eventName => {
  foundDropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    foundDropZone.style.borderColor = "#0d6efd";
    foundDropZone.style.background = "#f0f8ff";
  });
});

["dragleave", "drop"].forEach(eventName => {
  foundDropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    foundDropZone.style.borderColor = "#ccc";
    foundDropZone.style.background = "transparent";
  });
});

// Handle file drop
foundDropZone.addEventListener("drop", (e) => {
  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type.startsWith("image/")) {
    foundImageUpload.files = files; // Sync with input
    foundImageUpload.dispatchEvent(new Event("change")); // Trigger preview
  }
});

// Clicking drop zone opens file picker
foundDropZone.addEventListener("click", () => foundImageUpload.click());

// Remove image
foundRemoveImageBtn.addEventListener("click", () => {
  foundImageUpload.value = "";
  foundPreviewImage.src = "";
  foundPreviewContainer.style.display = "none";
});

// Block future dates
const lostDateInput = document.getElementById("foundDate");
const today = new Date().toISOString().split("T")[0]; 
lostDateInput.max = today;