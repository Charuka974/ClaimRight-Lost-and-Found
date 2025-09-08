const API_BASE_LOSTITEM = 'http://localhost:8080/claimright/lost-item';
const API_ITEM_CAT = 'http://localhost:8080/claimright/item-categories';

const reportModal = document.getElementById("reportLostItemModal");
const reportCloseBtn = document.getElementById("reportCloseBtn");
const reportForm = document.getElementById("reportLostItemForm");

const categoryOptionsContainer = document.getElementById('categoryOptionsContainer');
const selectedCategoriesContainer = document.getElementById('selectedCategoriesContainer');

let categories = [];  
let selectedCategories = new Set();
let allLostItemsData = [];

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openModal') === 'true') openReportLostItem();

    loadCategories();
    loadLostItems();
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
    allLostItemsData = lostItems; // update global array
    renderLostItems(lostItems);

  } catch (error) {
    console.error(error);
  }
}

// --- Render Lost Items ---
function renderLostItems(lostItems) {
  const container = document.querySelector(".main-content-container");
  container.innerHTML = "";

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

    // attach event listener per card
    lostItemCard.querySelector(".respond-btn").addEventListener("click", function() {
      const itemId = this.getAttribute("data-id");
      const itemType = this.getAttribute("data-type");
      window.location.href = `/Front_End/html/claim-respond-page.html?type=${itemType}&id=${itemId}`;
    });

    container.appendChild(lostItemCard);
  });
}

// --- Report Lost Item Form Submit ---
const loadingOverlay = document.getElementById("loadingOverlay");

reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  try {
    loadingOverlay.style.display = "flex";

    const lostItemData = {
      itemName: reportForm.itemName.value,
      detailedDescription: reportForm.detailedDescription.value,
      locationLost: reportForm.locationLost.value,
      dateLost: reportForm.dateLost.value ? new Date(reportForm.dateLost.value).toISOString() : null,
      reward: reportForm.reward.value ? parseFloat(reportForm.reward.value) : null,
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

    Swal.fire({ icon: 'success', title: 'Report Submitted', text: 'Your report was successful.', timer: 2000, showConfirmButton: false });

    reportModal.style.display = "none";
    reportForm.reset();
    selectedCategories.clear();
    renderCategoryOptions();
    renderSelectedCategories();
    loadLostItems();

  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Submission Failed', text: error.message || "Something went wrong." });
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

// --- Image Preview in report item Modal---
const imageUpload = document.getElementById("imageUpload");

// Create a preview container (just once)
const previewContainer = document.createElement("div");
previewContainer.id = "imagePreviewContainer";
previewContainer.style.cssText = `
  margin-top: 10px; 
  text-align: center;
`;

imageUpload.parentElement.appendChild(previewContainer);

imageUpload.addEventListener("change", (event) => {
  previewContainer.innerHTML = ""; // clear old preview

  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.createElement("img");
    img.src = e.target.result;
    img.alt = "Preview";
    img.style.cssText = `
      max-width: 100%;
      max-height: 200px;
      border-radius: 8px;
      margin-bottom: 10px;
      display: block;
    `;
    previewContainer.appendChild(img);

    // Add "Change Image" button
    const changeBtn = document.createElement("button");
    changeBtn.type = "button";
    changeBtn.textContent = "Change Image";
    changeBtn.style.cssText = `
      display:inline-block; 
      background:#4e73df; 
      color:white; 
      border:none; 
      border-radius:6px; 
      padding:6px 12px; 
      cursor:pointer;
    `;
    changeBtn.addEventListener("click", () => imageUpload.click());
    previewContainer.appendChild(changeBtn);
  };

  reader.readAsDataURL(file);
});


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

// --- Open & Close Modal ---
function openReportLostItem() { reportModal.style.display = "block"; }
reportCloseBtn.addEventListener("click", () => reportModal.style.display = "none");
window.addEventListener("click", (event) => { if (event.target === reportModal) reportModal.style.display = "none"; });

// --- Search & Sort ---
function filterItems(searchTerm) {
  const filtered = allLostItemsData.filter(item => {
    const title = item.itemName.toLowerCase();
    const description = (item.detailedDescription || "").toLowerCase();
    return title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
  });
  renderLostItems(filtered);
}

function sortItems(sortBy) {
  let itemsToRender = [...allLostItemsData];

  if (sortBy === "newest") itemsToRender.sort((a, b) => new Date(b.dateLost) - new Date(a.dateLost));
  else if (sortBy === "oldest") itemsToRender.sort((a, b) => new Date(a.dateLost) - new Date(b.dateLost));
  else if (sortBy === "lost") itemsToRender = itemsToRender.filter(item => !item.isFound);
  else if (sortBy === "found") itemsToRender = itemsToRender.filter(item => item.isFound);

  renderLostItems(itemsToRender);
}

// --- Event Listeners ---
const searchInput = document.getElementById("dashboard-search");
const searchBtn = document.getElementById("dashboard-search-btn");
const sortSelect = document.getElementById("dashboard-sort");

searchBtn.addEventListener("click", () => filterItems(searchInput.value));
searchInput.addEventListener("input", () => filterItems(searchInput.value));
sortSelect.addEventListener("change", (e) => sortItems(e.target.value));


// --- Image Upload & Preview ---
// const imageUpload = document.getElementById("imageUpload");
const dropZone = document.getElementById("dropZone");
// const previewContainer = document.getElementById("imagePreviewContainer");
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
    imageUpload.files = files; // Sync dropped file with input
    imageUpload.dispatchEvent(new Event("change")); // Trigger preview
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