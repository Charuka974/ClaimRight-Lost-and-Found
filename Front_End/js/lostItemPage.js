const API_BASE_LOSTITEM = 'http://localhost:8080/claimright/lost-item';

const reportModal = document.getElementById("reportLostItemModal");
const reportCloseBtn = document.getElementById("reportCloseBtn");
const reportForm = document.getElementById("reportLostItemForm");

const categoryOptionsContainer = document.getElementById('categoryOptionsContainer');
const selectedCategoriesContainer = document.getElementById('selectedCategoriesContainer');

let categories = [];  // will hold categories fetched from backend
let selectedCategories = new Set();

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadLostItems();
});

async function loadLostItems() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("User not logged in");

    const response = await fetch(API_BASE_LOSTITEM, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Failed to load lost items");

    const lostItems = await response.json();
    renderLostItems(lostItems);

  } catch (error) {
    console.error(error);
  }
}


function renderLostItems(lostItems) {
  const container = document.querySelector(".main-content-container");
  container.innerHTML = "";

  lostItems.forEach(item => {
    const lostItemCard = document.createElement("div");
    lostItemCard.className = "lost-item-card";

    lostItemCard.innerHTML = `
      <img src="${item.imageUrl || 'default-image.jpg'}" alt="Lost item image" class="lost-item-image" />
      <div class="lost-item-content">
        <h2 class="lost-item-title">${item.itemName}</h2>
        <div class="claimed-badge" style="display:${item.isClaimed ? 'block' : 'none'};">Claimed</div>
        <p class="lost-item-description">${item.detailedDescription}</p>
        <p class="lost-item-meta"><strong>Lost On:</strong> ${item.dateLost ? new Date(item.dateLost).toLocaleDateString() : 'N/A'}</p>
        <p class="lost-item-meta"><strong>Location:</strong> ${item.locationLost}</p>
        <p class="lost-item-meta"><strong>Owner:</strong> ${item.ownerName || 'Unknown'}</p>
        <div class="categories">
          ${item.categoryNames.map(cat => `<span class="category-badge">${cat}</span>`).join('')}
        </div>
        <button class="respond-btn">Respond</button>
      </div>
    `;

    container.appendChild(lostItemCard);
  });
}

// --- Report Lost Item Form Submit ---
const loadingOverlay = document.getElementById("loadingOverlay");

reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  try {
    // Show loading overlay
    loadingOverlay.style.display = "flex";

    const lostItemData = {
      itemName: reportForm.itemName.value,
      detailedDescription: reportForm.detailedDescription.value,
      locationLost: reportForm.locationLost.value,
      dateLost: reportForm.dateLost.value ? new Date(reportForm.dateLost.value).toISOString() : null,
      categoryIds: Array.from(selectedCategories),
      ownerId: loggedUser ? loggedUser.userId : null
    };

    const formData = new FormData();
    formData.append(
      "lostItem",
      new Blob([JSON.stringify(lostItemData)], { type: "application/json" })
    );

    const fileInput = reportForm.imageFile;
    if (fileInput.files.length > 0) {
      formData.append("imageFile", fileInput.files[0]);
    }

    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("User not logged in");

    const response = await fetch(`${API_BASE_LOSTITEM}/report-lost-item`, {
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
      text: 'Your lost item report has been successfully submitted.',
      timer: 2000,
      showConfirmButton: false
    });

    reportModal.style.display = "none";
    reportForm.reset();
    selectedCategories.clear();
    renderCategoryOptions();
    renderSelectedCategories();
    loadLostItems();

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: error.message || "Something went wrong.",
    });
  } finally {
    // Hide loading overlay no matter what
    loadingOverlay.style.display = "none";
  }
});



// --- Load categories from backend ---
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

// --- Open and Close Modal Handlers ---
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


// --- Image Modal Logic ---

// --- Claimed badge logic ---
const isClaimed = false; // toggle as needed

if (isClaimed) {
  const claimedBadge = document.querySelector('.claimed-badge');
  if (claimedBadge) claimedBadge.style.display = 'block';

  const card = document.getElementById("lostItemCard");
  if (card) {
    card.style.opacity = "0.6";
    card.style.pointerEvents = "none";
  }
}


