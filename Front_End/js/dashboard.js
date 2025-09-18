const API_BASE_FOUNDITEM = 'http://localhost:8080/claimright/found-item';
const API_BASE_LOSTITEM = 'http://localhost:8080/claimright/lost-item';
const API_BASE_CHAT = "http://localhost:8080/claimright/messages";
const API_BASE_CLAIMS = 'http://localhost:8080/claimright/claims';

const API_LANDING_LOSTITEMS = 'http://localhost:8080/claimright-landing-page/lost';
const API_LANDING_FOUNDITEMS = 'http://localhost:8080/claimright-landing-page/found';
const API_LANDING_CATEGORIES = 'http://localhost:8080/claimright-landing-page/category';


const cardContainer = document.querySelector(".main-content-container");

let allItemsData = []; // Store full item list
 
document.addEventListener("DOMContentLoaded", function () {
  const userJson = localStorage.getItem("loggedInUser");

  // if (!userJson) return;
  if (!userJson) {
    // No user logged in / show public landing items
    loadCategoriesDropdown();
    loadAllItemsLanding();
    return; 
  }

  const user = JSON.parse(userJson);

  if ((user.role === "ADMIN" || user.role === "SEMI_ADMIN" || user.role === "USER") && user.active === true) {
    // Chat Button with Notification Badge
    const chatBtn = document.createElement("button");
    chatBtn.className = "floating-page-btn floating-chat-nav-btn";
    chatBtn.innerHTML = `
      <i class="bi bi-chat-fill"></i>&nbsp;&nbsp;Chat
      <span id="chat-notification" 
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style="font-size: 0.75rem;">
          0
      </span>
    `;
    chatBtn.onclick = openChat;
    document.body.appendChild(chatBtn);
  }

  if ((user.role === "ADMIN" || user.role === "SEMI_ADMIN") && user.active === true) {
    // Manage User Button
    const btn = document.createElement("button");
    btn.className = "floating-page-btn floating-user-nav-btn";
    btn.innerHTML = `<i class="bi bi-person-circle"></i>&nbsp;&nbsp;Manage Users`;
    btn.onclick = openUserManage; 
    document.body.appendChild(btn);

    // Claims Button with Notification Badge
    const claimsBtn = document.createElement("button");
    claimsBtn.className = "floating-page-btn floating-claims-nav-btn";
    claimsBtn.innerHTML = `
      <i class="bi bi-file-earmark-text"></i>&nbsp;&nbsp;Claims to Verify
      <span id="admin-claims-notification" 
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style="font-size: 0.75rem;">
        0
      </span>`;
    claimsBtn.onclick = openClaimsPage;
    document.body.appendChild(claimsBtn);

    // Settings Button
    const settingsBtn = document.createElement("button");
    settingsBtn.className = "floating-page-btn floating-settings-nav-btn";
    settingsBtn.innerHTML = `<i class="bi bi bi-gear"></i>&nbsp;&nbsp;Settings`;
    settingsBtn.onclick = openSettings; 
    document.body.appendChild(settingsBtn);

  }
 
  // loadAllItems();
  updateAdminClaimsNotification();
  updateChatNotification();
  loadCategoriesDropdown();
  loadAllItemsLanding();

});


async function updateAdminClaimsNotification() {
  // console.log("Updating claims notification...");

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("No access token found, skipping claims notification");
      return;
    }

    const response = await fetch(`${API_BASE_CLAIMS}/admin`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch claims: ${response.status} ${response.statusText}`);
    }

    let claims = await response.json();

    // Deduplicate by claimId (safety)
    claims = Array.from(new Map(claims.map(c => [c.claimId, c])).values());

    // Debug: show a sample claim
    // if (claims.length > 0) {
    //   console.log("Sample claim from server:", claims[0]);
    // } else {
    //   console.log("No claims received from server.");
    // }

    // Filter only admin-relevant claims
    const adminClaims = claims.filter(c => {
      // claimStatus comes from backend as a STRING (e.g. "PENDING")
      const status = (c.claimStatus || "").toString().trim().toUpperCase();
      const level = (c.verificationLevel || "").trim().toUpperCase();

      const needsAdmin = (level === "ADMIN_ONLY" || level === "DUAL_APPROVAL");
      const isPending = (status === "PENDING" || status === "OWNER_APPROVED" || status === "FINDER_APPROVED");
      // const isPending = true; // Show all statuses for admin review

      return needsAdmin && isPending;
    });

    const pendingCount = adminClaims.length;

    const badge = document.getElementById("admin-claims-notification");
    if (!badge) {
      // console.warn("Admin claims badge element not found in DOM");
      return;
    }

    badge.textContent = String(pendingCount);
    badge.style.display = pendingCount > 0 ? "inline-block" : "none";

    // Debug logging
    // console.log("Total claims:", claims.length);
    // console.log("Admin claims needing attention:", pendingCount, adminClaims);

  } catch (err) {
    console.error("Failed to load claims count:", err);
  }
}


async function updateChatNotification() {
  const userJson = localStorage.getItem("loggedInUser");
  if (!userJson) return;

  const user = JSON.parse(userJson);
  const userId = user.userId;

  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_CHAT}/unread/${userId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Failed to fetch chat notifications");

    const unreadCount = await response.json(); // backend returns a number

    const badge = document.getElementById("chat-notification");
    if (!badge) return; // in case the button doesn't exist yet
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "inline-block" : "none";

  } catch (err) {
    console.error("Failed to load chat notifications", err);
  }
}


// Category Filter
async function loadCategoriesDropdown() {
  try {
    const response = await fetch(API_LANDING_CATEGORIES); // public endpoint
    if (!response.ok) throw new Error('Failed to fetch categories');

    const categories = await response.json(); // [{categoryId, name}, ...]

    const categorySelect = document.getElementById("dashboard-category");
    // Clear old options (except "All Categories")
    categorySelect.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.name;  // use name for filtering
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });

  } catch (err) {
    console.error("Error loading categories:", err);
  }
}

const categorySelect = document.getElementById("dashboard-category");
categorySelect.addEventListener("change", (e) => sortItemsByCategory(e.target.value));

function sortItemsByCategory(category) {
  if (!category || category.toLowerCase() === "all") {
    renderAllItems(allItemsData);
    return;
  }

  const filteredItems = allItemsData.filter(item => {
    const categories = item.categoryNames || [];
    return categories.some(cat => cat.toLowerCase() === category.toLowerCase());
  });

  renderAllItems(filteredItems);
}




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


// Landing page Data Load
async function loadAllItemsLanding() {
  try {
    // Public landing page does NOT require token
    const [foundRes, lostRes] = await Promise.all([
      fetch(API_LANDING_FOUNDITEMS), // public endpoint
      fetch(API_LANDING_LOSTITEMS)   // public endpoint
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
    console.error("Error loading items for landing page:", error);
  }
}


function renderAllItems(items) {
  cardContainer.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = item.type === "found" ? "found-item-card" : "lost-item-card";

    card.innerHTML = `
      <div class="item-type-tag ${item.type}-tag">${item.type === "found" ? "Found" : "Lost"}</div>
      <img src="${item.imageUrl || '/Front_End/assets/images/noImageAvalable.png'}" 
           alt="${item.type} item image" class="${item.type}-item-image" />
      <div class="${item.type}-item-content">
        <h2 class="${item.type}-item-title">${item.itemName}</h2>
        <div class="claimed-badge" style="display:${item.isClaimed ? 'block' : 'none'};">Claimed</div>
        <p class="${item.type}-item-description">${item.type === "found" ? (item.generalDescription || "") : (item.detailedDescription || "")}</p>
        
        <!-- Reward display for lost items -->
        ${item.type === "lost" && item.reward ? `<p class="${item.type}-item-meta"><strong>Reward:</strong> $${parseFloat(item.reward).toFixed(2)}</p>` : ''}

        <p class="${item.type}-item-meta"><strong>${item.type === "found" ? "Found On:" : "Lost On:"}</strong> ${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</p>
        <p class="${item.type}-item-meta"><strong>Location:</strong> ${item.type === "found" ? item.locationFound || 'N/A' : item.locationLost || 'N/A'}</p>
        <p class="${item.type}-item-meta"><strong>${item.type === "found" ? "Finder:" : "Owner:"}</strong> ${item.type === "found" ? (item.finderName || 'Unknown') : (item.ownerName || 'Unknown')}</p>
        <div class="categories">
          ${(item.categoryNames || []).map(cat => `<span class="category-badge">${cat}</span>`).join('')}
        </div>

        <button class="respond-btn"  
                data-id="${item.id}" 
                data-type="${item.type}"
                ${item.isClaimed ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
          ${item.type === "found" ? "Claim Item" : "Respond"}
        </button>

      </div>
    `;

    cardContainer.appendChild(card);

    // Attach click listener directly
    const button = card.querySelector(".respond-btn");
    button.addEventListener("click", function() {
      const itemId = this.getAttribute("data-id");
      const itemType = this.getAttribute("data-type");
      window.location.href = `/Front_End/html/claim-respond-page.html?type=${itemType}&id=${itemId}`;
    });
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

function openClaimsPage() {
    window.location.href = "/Front_End/html/admin-claim-view.html";
}

function openSettings() {
    window.location.href = "/Front_End/html/admin-settings-page.html";
}

