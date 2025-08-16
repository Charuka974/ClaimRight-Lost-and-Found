const API_BASE_FOUNDITEM = 'http://localhost:8080/claimright/found-item';

const reportModal = document.getElementById("reportFoundItemModal");
const reportCloseBtn = document.getElementById("reportFoundCloseBtn");
const reportForm = document.getElementById("reportFoundItemForm");

const categoryOptionsContainer = document.getElementById('categoryOptionsContainer');
const selectedCategoriesContainer = document.getElementById('selectedCategoriesContainer');

let categories = [];  
let selectedCategories = new Set();

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openModal') === 'true') {
        openReportFoundItem();
    }

    loadCategories();
    loadFoundItems();
});



async function loadFoundItems() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("User not logged in");

    const response = await fetch(API_BASE_FOUNDITEM, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Failed to load found items");

    const foundItems = await response.json();
    renderFoundItems(foundItems);

  } catch (error) {
    console.error(error);
  }
}

function renderFoundItems(foundItems) {
  const container = document.querySelector(".main-content-container");
  container.innerHTML = "";

  foundItems.forEach(item => {
    const foundItemCard = document.createElement("div");
    foundItemCard.className = "found-item-card";

    foundItemCard.innerHTML = `
      <img src="${item.imageUrl || '/Front_End/assets/images/ChatGPT Image Jul 24, 2025, 11_16_54 AM.png'}" alt="Found item image" class="found-item-image" />
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
        <button class="respond-btn">Claim Item</button>
      </div>
    `;

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
      headers: {
        "Authorization": `Bearer ${token}`
      },
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

// --- Load categories ---
async function loadCategories() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("User not logged in");

    const response = await fetch('http://localhost:8080/claimright/item-categories', {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch categories');

    categories = await response.json();

    // After loading, render category buttons and selected badges
    renderCategoryOptions();
    renderSelectedCategories();

  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// --- Render category options as clickable buttons ---
function renderCategoryOptions() {
  categoryOptionsContainer.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.name;
    btn.style.margin = '3px';
    btn.style.padding = '5px 10px';
    btn.style.border = '1px solid #ccc';
    btn.style.borderRadius = '5px';
    btn.style.fontSize = '0.8rem';
    btn.style.width = '50%';
    btn.style.backgroundColor = selectedCategories.has(cat.categoryId) ? '#007bff' : '#f0f0f0';
    btn.style.color = selectedCategories.has(cat.categoryId) ? 'white' : 'black';
    btn.style.cursor = 'pointer';

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

// --- Render selected categories as badges with remove "×" ---
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

// --- Modal handlers ---
function openReportFoundItem() {
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

// --- Claimed badge logic (optional static toggle) ---
const isClaimed = false; 
if (isClaimed) {
  const claimedBadge = document.querySelector('.claimed-badge');
  if (claimedBadge) claimedBadge.style.display = 'block';

  const card = document.getElementById("foundItemCard");
  if (card) {
    card.style.opacity = "0.6";
    card.style.pointerEvents = "none";
  }
}
