const API_BASE_FOUNDITEM = 'http://localhost:8080/claimright/found-item/item-id';
const API_BASE_LOSTITEM = 'http://localhost:8080/claimright/lost-item/item-id';

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemType = urlParams.get("type"); // "found" or "lost"
  const itemId = urlParams.get("id");

  const headerTitle = document.getElementById("page-header-title");
  const headerSubtitle = document.getElementById("page-header-subtitle");

  if (itemType === "found") {
    headerTitle.textContent = "Claim This Item";
    headerSubtitle.textContent = "You can claim this found item. The finder will be notified.";
  } else if (itemType === "lost") {
    headerTitle.textContent = "Respond to Lost Item";
    headerSubtitle.textContent = "You can respond to this lost item. The owner will be notified.";
  } else {
    headerTitle.textContent = "Item Details";
    headerSubtitle.textContent = "";
  }


  const container = document.querySelector(".main-content-container");

  if (!itemId || !itemType) {
    container.innerHTML = `<div class="alert alert-danger">Invalid request. Missing item information.</div>`;
    return;
  }

  // Show loading spinner
  container.innerHTML = `
    <div class="loading-template text-center">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Loading item details...</p>
    </div>
  `;

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("User not logged in");

    // Choose correct endpoint based on type
    const apiUrl = itemType === "found" 
        ? `${API_BASE_FOUNDITEM}/${itemId}` 
        : `${API_BASE_LOSTITEM}/${itemId}`;

    const response = await fetch(apiUrl, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Failed to fetch item");
    const item = await response.json();

    // Render item details
    container.innerHTML = `
      <div class="claim-respond-card ${itemType}-item-card">
        <img src="${item.imageUrl || '/Front_End/assets/images/noImageAvalable.png'}" 
             alt="${itemType} item image" class="claim-respond-image" />
        <div class="claim-respond-content">
          <h2 class="claim-respond-title">${item.itemName}</h2>
          <div class="claimed-badge" style="display:${item.isClaimed ? 'block' : 'none'};">Claimed</div>
          <p class="claim-respond-description">
            ${itemType === "found" ? item.generalDescription : item.detailedDescription}
          </p>
          <p class="claim-respond-meta"><strong>${itemType === "found" ? "Found On:" : "Lost On:"}</strong> 
            ${item.dateFound || item.dateLost ? new Date(item.dateFound || item.dateLost).toLocaleDateString() : 'N/A'}
          </p>
          <p class="claim-respond-meta"><strong>Location:</strong> 
            ${itemType === "found" ? item.locationFound : item.locationLost}
          </p>
          <p class="claim-respond-meta"><strong>${itemType === "found" ? "Finder:" : "Owner:"}</strong> 
            ${itemType === "found" ? (item.finderName || 'Unknown') : (item.ownerName || 'Unknown')}
          </p>
          <div class="categories">
            ${(item.categoryNames || []).map(cat => `<span class="category-badge ${itemType}-badge">${cat}</span>`).join('')}
          </div>
          <button class="respond-action-btn ${itemType}-btn">
            ${itemType === "found" ? "Proceed to Claim" : "Proceed to Respond"}
          </button>
        </div>
      </div>
    `;

    // Respond button logic
    document.querySelector(".respond-action-btn").addEventListener("click", () => {
      Swal.fire({
        title: itemType === "found" ? "Claim This Item?" : "Respond to This Item?",
        text: "We will notify the other party once you proceed.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Proceed",
        cancelButtonText: "Cancel"
      }).then(async result => {
        if (result.isConfirmed) {
          try {
            const response = await fetch("http://localhost:8080/claimright/claims", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ itemId, itemType })
            });

            if (!response.ok) throw new Error("Failed to submit claim/respond");

            Swal.fire("Success!", "Your request has been sent.", "success");

          } catch (err) {
            Swal.fire("Error", err.message, "error");
          }
        }
      });
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="alert alert-danger">Error loading item details. Please try again later.</div>`;
  }
});

// Floating button -> redirect to chat page
function openFloatOption() {
  window.location.href = "/Front_End/html/chat-page.html";
}
