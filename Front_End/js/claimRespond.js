const API_BASE_FOUNDITEM = 'http://localhost:8080/claimright/found-item/item-id';
const API_BASE_LOSTITEM = 'http://localhost:8080/claimright/lost-item/item-id';
const API_BASE_CLAIM_RESPOND = 'http://localhost:8080/claimright/claim-respond';

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemType = urlParams.get("type"); // "found" or "lost"
  const itemId = urlParams.get("id");


  const userJson = localStorage.getItem("loggedInUser");
    if (!userJson) {
        Swal.fire({
            icon: 'warning',
            title: 'Login Required!',
            text: 'Please log in to submit a claim.',
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true
        }).then(() => {
            // Redirect after alert closes
            window.location.href = "/Front_End/html/dashboard.html";
        });
    }

  const loggedInUser = JSON.parse(userJson);

  const headerTitle = document.getElementById("page-header-title");
  const headerSubtitle = document.getElementById("page-header-subtitle");
  const topContainer = document.querySelector(".main-content-top-container");
  const claimFormTitle = document.getElementById("claimFormTitle");
  const instructionsDiv = document.getElementById("claimInstructions");

  // Set headers
  if (itemType === "found") {
    headerTitle.textContent = "Claim This Item";
    headerSubtitle.textContent = "You can claim this found item. The finder will be notified.";
    claimFormTitle.textContent = "Claim the Item";
    instructionsDiv.innerHTML = `
        <p class="label-instructions">
            Please provide a detailed description of the item. Images are optional but recommended if you have any. You can upload other types of images like bills, or any other documents related to the item to prove your ownership.
        </p>
    `;
  } else if (itemType === "lost") {
    headerTitle.textContent = "Respond to Lost Item";
    headerSubtitle.textContent = "You can respond to this lost item. And help the owner reunite with his item.";
    claimFormTitle.textContent = "Respond to Lost Item Post";
    instructionsDiv.innerHTML = `
        <p class="label-instructions">
            You must provide a detailed description and upload at least one image of the item to prove you have it.
        </p>
    `;
  } else {
    headerTitle.textContent = "Item Details";
    headerSubtitle.textContent = "";
    claimFormTitle.textContent = "Create a Claim";
    instructionsDiv.innerHTML = `
        <p class="label-instructions">
            Please fill in the claim details.
        </p>
    `;
  }

  if (!itemId || !itemType) {
    topContainer.innerHTML = `<div class="alert alert-danger text-center">Invalid request. Missing item information.</div>`;
    return;
  }

  // Show loading spinner
  topContainer.innerHTML = `
    <div class="loading-template text-center">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Loading item details...</p>
    </div>
  `;

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("User not logged in");

    const apiUrl = itemType === "found"
      ? `${API_BASE_FOUNDITEM}/${itemId}`
      : `${API_BASE_LOSTITEM}/${itemId}`;

    const response = await fetch(apiUrl, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Failed to fetch item");

    const item = await response.json();

    // Render item details
    topContainer.innerHTML = `
      <div class="claim-respond-card ${itemType}-item-card">
        <img src="${item.imageUrl || '/Front_End/assets/images/noImageAvalable.png'}" 
             alt="${itemType} item image" class="claim-respond-image" />
        <div class="claim-respond-content">
          <h2 class="claim-respond-title">${item.itemName}</h2>
          <div class="claimed-badge" style="display:${item.isClaimed ? 'block' : 'none'};">Claimed</div>
          <p class="claim-respond-description">${itemType === "found" ? item.generalDescription : item.detailedDescription}</p>
          <p class="claim-respond-meta"><strong>${itemType === "found" ? "Found On:" : "Lost On:"}</strong> ${item.dateFound || item.dateLost ? new Date(item.dateFound || item.dateLost).toLocaleDateString() : 'N/A'}</p>
          <p class="claim-respond-meta"><strong>Location:</strong> ${itemType === "found" ? item.locationFound : item.locationLost}</p>
          <p class="claim-respond-meta"><strong>${itemType === "found" ? "Finder:" : "Owner:"}</strong> ${itemType === "found" ? (item.finderName || 'Unknown') : (item.ownerName || 'Unknown')}</p>
          <div class="categories">${(item.categoryNames || []).map(cat => `<span class="category-badge ${itemType}-badge">${cat}</span>`).join('')}</div>
        </div>
      </div>
    `;

    // Auto-fill form values
    document.querySelector("input[name='claimType']").value = itemType === "found" ? "FOUND" : "LOST";
    document.querySelector("input[name='foundItemId']").value = itemType === "found" ? itemId : "";
    document.querySelector("input[name='lostItemId']").value = itemType === "lost" ? itemId : "";
    document.querySelector("input[name='claimantId']").value = loggedInUser.userId;

    document.getElementById("claimTypeLabel").textContent = itemType === "found" ? "Claim a Found Item" : "Inform About a Lost Item";

  } catch (error) {
    console.error(error);
    topContainer.innerHTML = `<div class="alert alert-danger">Error loading item details. Please try again later.</div>`;
  }
});

// Submit a Claim
document.getElementById("claimForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const itemType = document.querySelector("input[name='claimType']").value; // FOUND or LOST
  const desc = document.querySelector("textarea[name='proofDescriptions']").value.trim();
  const files = document.querySelector("input[name='proofFiles']").files;

  // Validation based on item type
  if (!desc) { 
    Swal.fire({
      icon: "warning",
      title: "Missing Description",
      text: "Please provide a description of the item.",
      confirmButtonColor: "#3085d6"
    });
    return;
  }

  if (itemType === "LOST" && files.length < 1) {
    Swal.fire({
      icon: "warning",
      title: "Upload Required",
      text: "Please upload at least one image of the item to inform the owner.",
      confirmButtonColor: "#3085d6"
    });
    return;
  }

  const formData = new FormData();
  const claimDTO = {
    claimType: document.querySelector("input[name='claimType']").value,
    // claimStatus: "PENDING",
    // verificationLevel: document.querySelector("select[name='verificationLevel']").value,
    foundItemId: document.querySelector("input[name='foundItemId']").value || null,
    lostItemId: document.querySelector("input[name='lostItemId']").value || null,
    claimantId: document.querySelector("input[name='claimantId']").value,
    // createdAt: new Date().toISOString(),
  };

  formData.append("claim", new Blob([JSON.stringify(claimDTO)], { type: "application/json" }));

  if (desc) formData.append("proofDescription", desc);
  for (let i = 0; i < files.length; i++) formData.append("proofFiles", files[i]);

  document.getElementById("loadingOverlay").style.display = "flex";

  try {
    const response = await fetch(`${API_BASE_CLAIM_RESPOND}/create`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken") || ""}` },
      body: formData
    });

    document.getElementById("loadingOverlay").style.display = "none";

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to submit claim");
    }

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Your claim has been submitted successfully!",
      confirmButtonColor: "#3085d6"
    });

    this.reset();
    selectedFiles = [];
    showPreviews();

  } catch (err) {
    document.getElementById("loadingOverlay").style.display = "none";
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: err.message || "Something went wrong. Please try again!",
      confirmButtonColor: "#d33"
    });
  }
});

// Floating button -> redirect to chat
function openFloatOption() {
  window.location.href = "/Front_End/html/chat-page.html";
}

// Drag & drop image selector
const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("proofFiles");
const previewContainer = document.getElementById("previewImages");

let selectedFiles = [];

dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => addFiles(Array.from(e.target.files)));

dropArea.addEventListener("dragover", (e) => { 
  e.preventDefault(); 
  dropArea.classList.add("bg-light"); 
});

dropArea.addEventListener("dragleave", (e) => { 
  dropArea.classList.remove("bg-light"); 
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("bg-light");
  addFiles(Array.from(e.dataTransfer.files));
});

function addFiles(files) {
  files.forEach(file => {
    if (file.type.startsWith("image/")) selectedFiles.push(file);
  });
  updateFileInput();
  showPreviews();
}

function updateFileInput() {
  const dt = new DataTransfer();
  selectedFiles.forEach(file => dt.items.add(file));
  fileInput.files = dt.files;
}

function showPreviews() {
  previewContainer.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "100px";
      img.style.height = "100px";
      img.style.objectFit = "cover";
      img.classList.add("border", "p-1", "me-2", "mb-2");
      
      // Create remove button
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "×";
      removeBtn.style.position = "absolute";
      removeBtn.style.top = "1px";
      removeBtn.style.right = "2px";
      removeBtn.style.background = "rgba(0,0,0,0.6)";
      removeBtn.style.color = "white";
      removeBtn.style.border = "none";
      removeBtn.style.borderRadius = "50%";
      removeBtn.style.width = "20px";
      removeBtn.style.height = "20px";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.display = "flex";
      removeBtn.style.alignItems = "center";
      removeBtn.style.justifyContent = "center";
      removeBtn.style.padding = "0";
      removeBtn.style.fontSize = "14px"; // adjust if needed
      removeBtn.addEventListener("click", () => {
        selectedFiles.splice(index, 1); // Remove from array
        updateFileInput();
        showPreviews();
      }); 


      wrapper.appendChild(img);
      wrapper.appendChild(removeBtn);
      previewContainer.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
  });
}
