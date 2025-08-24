const API_BASE_FOUNDITEM = 'http://localhost:8080/claimright/found-item';
const API_BASE_LOSTITEM = 'http://localhost:8080/claimright/lost-item';

const cardContainer = document.querySelector(".main-content-container");

let allItemsData = []; // Store full item list

document.addEventListener("DOMContentLoaded", function () {
  const userJson = localStorage.getItem("loggedInUser");

  if (!userJson) return;

  const user = JSON.parse(userJson);

  if ((user.role === "ADMIN" || user.role === "SEMI_ADMIN") && user.active === true) {
    const btn = document.createElement("button");
    btn.className = "floating-page-btn floating-user-nav-btn";
    btn.innerHTML = `<i class="bi bi-person-circle"></i>&nbsp;&nbsp;Manage Users`;
    btn.onclick = openUserManage; 
    document.body.appendChild(btn);
  }

  loadAllItems();
});

async function loadAllItems() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("User not logged in");

    const [foundRes, lostRes] = await Promise.all([
      fetch(API_BASE_FOUNDITEM, { headers: { "Authorization": `Bearer ${token}` } }),
      fetch(API_BASE_LOSTITEM, { headers: { "Authorization": `Bearer ${token}` } })
    ]);

    if (!foundRes.ok || !lostRes.ok) throw new Error("Failed to load items");

    const [foundItems, lostItems] = await Promise.all([foundRes.json(), lostRes.json()]);

    allItemsData = [
      ...foundItems.map(item => ({ ...item, type: "found", date: item.dateFound })),
      ...lostItems.map(item => ({ ...item, type: "lost", date: item.dateLost }))
    ];

    // Default sort: newest to oldest
    allItemsData.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderAllItems(allItemsData);

  } catch (error) {
    console.error(error);
  }
}

function renderAllItems(items) {
  cardContainer.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = item.type === "found" ? "found-item-card" : "lost-item-card";
    card.dataset.date = item.date;

    card.innerHTML = `
      <div class="item-type-tag ${item.type}-tag">${item.type === "found" ? "Found" : "Lost"}</div>
      <img src="${item.imageUrl || '/Front_End/assets/images/ChatGPT Image Jul 24, 2025, 11_16_54 AM.png'}" 
           alt="${item.type} item image" class="${item.type}-item-image" />
      <div class="${item.type}-item-content">
        <h2 class="${item.type}-item-title">${item.itemName}</h2>
        <div class="claimed-badge" style="display:${item.isClaimed ? 'block' : 'none'};">Claimed</div>
        <p class="${item.type}-item-description">${item.type === "found" ? item.generalDescription : item.detailedDescription}</p>
        <p class="${item.type}-item-meta"><strong>${item.type === "found" ? "Found On:" : "Lost On:"}</strong> ${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</p>
        <p class="${item.type}-item-meta"><strong>Location:</strong> ${item.type === "found" ? item.locationFound : item.locationLost}</p>
        <p class="${item.type}-item-meta"><strong>${item.type === "found" ? "Finder:" : "Owner:"}</strong> ${item.type === "found" ? item.finderName : item.ownerName || 'Unknown'}</p>
        <div class="categories">
          ${item.categoryNames.map(cat => `<span class="category-badge">${cat}</span>`).join('')}
        </div>
        <button class="respond-btn">${item.type === "found" ? "Claim Item" : "Respond"}</button>
      </div>
    `;
    cardContainer.appendChild(card);
  });
}

function filterItems(searchTerm) {
  const filtered = allItemsData.filter(item => {
    const title = item.itemName.toLowerCase();
    const description = (item.generalDescription || item.detailedDescription || "").toLowerCase();
    return title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
  });

  renderAllItems(filtered);
}

function sortItems(sortBy) {
  let itemsToRender = [...allItemsData];

  if (sortBy === "newest") {
    itemsToRender.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === "oldest") {
    itemsToRender.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortBy === "lost") {
    itemsToRender = itemsToRender.filter(item => item.type === "lost");
  } else if (sortBy === "found") {
    itemsToRender = itemsToRender.filter(item => item.type === "found");
  }

  renderAllItems(itemsToRender);
}

// Listeners
const searchInput = document.getElementById("dashboard-search");
const searchBtn = document.getElementById("dashboard-search-btn");
const sortSelect = document.getElementById("dashboard-sort");

searchBtn.addEventListener("click", () => filterItems(searchInput.value));
searchInput.addEventListener("input", () => filterItems(searchInput.value));
sortSelect.addEventListener("change", (e) => sortItems(e.target.value));


function openChat() {
    window.location.href = "/Front_End/html/chat-page.html";
}

function openUserManage() {
    window.location.href = "/Front_End/html/manage-users.html";
}