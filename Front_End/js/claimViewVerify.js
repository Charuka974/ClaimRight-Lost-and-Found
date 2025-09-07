const API_BASE_CLAIMS = 'http://localhost:8080/claimright/claims';

document.addEventListener("DOMContentLoaded", () => {
    loadUserClaims();
});

async function loadUserClaims() {
    const userJson = localStorage.getItem("loggedInUser");
    if (!userJson) return;

    const loggedInUser = JSON.parse(userJson);
    const topContainer = document.querySelector(".main-content-top-container");
    const bottomContainer = document.querySelector(".main-content-bottom-container");

    // Show loading spinners
    topContainer.innerHTML = bottomContainer.innerHTML = `
        <div class="loading-template text-center">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Loading claims...</p>
        </div>
    `;

    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(`${API_BASE_CLAIMS}/user/${loggedInUser.userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch claims");

        const claims = await response.json();

        // Separate received vs sent claims
        const receivedClaims = claims.filter(claim => claim.recipientId === loggedInUser.userId);
        const sentClaims = claims.filter(claim => claim.claimantId === loggedInUser.userId);

        // Render top container (received claims)
        renderClaims(topContainer, receivedClaims, true);
        // Render bottom container (sent claims)
        renderClaims(bottomContainer, sentClaims, false);

    } catch (error) {
        console.error(error);
        topContainer.innerHTML = bottomContainer.innerHTML =
            `<div class="alert alert-danger text-center">Error loading claims. Please try again later.</div>`;
    }
}


const renderClaims = (container, claimsList, isRecipientView) => {
    if (claimsList.length === 0) {
        container.innerHTML = `<div class="alert alert-info text-center">No claims found.</div>`;
        return;
    }

    container.innerHTML = '';
    claimsList.forEach(claim => {
        const claimCard = document.createElement("div");
        claimCard.className = "claim-card mb-3 p-3 border rounded";

        const itemImage = claim.itemImageUrl || '/Front_End/assets/images/noImageAvalable.png';

        const displayName = isRecipientView
            ? claim.claimantName
            : claim.recipientName;

        const displayRole = isRecipientView
            ? "Claimer"
            : (claim.claimType.toLowerCase() === "lost" ? "Owner" : "Finder");

        // Buttons
        let actionButtons = '';
        if (isRecipientView) {
            actionButtons = `<button class="btn mt-2 verify-claim-btn" data-claim='${JSON.stringify(claim)}'>
                                Verify Claim
                             </button>`;
        } else {
            actionButtons = `
                <button class="btn mt-2 btn-update-claim" data-claim='${JSON.stringify(claim)}'>
                    Update
                </button>
                <button class="btn mt-2 btn-delete-claim ms-2" data-claim='${JSON.stringify(claim)}'>
                    Delete
                </button>
            `;
        }

        claimCard.innerHTML = `
            <div class="row">
                <div class="col-md-3">
                    <img src="${itemImage}" class="img-fluid rounded" alt="Item Image">
                </div>
                <div class="col-md-9">
                    <h5 class="fw-bold">${claim.itemName}</h5>
                    <p><strong>Type:</strong> 
                        <span class="claim-type-badge ${claim.claimType.toLowerCase()}">
                            ${claim.claimType} Item
                        </span>
                    </p>
                    <p><strong>Description:</strong> ${claim.itemDescription}</p>
                    <p><strong>${claim.claimType} At:</strong> ${new Date(claim.itemDate).toLocaleString()}</p>
                    <p><strong>Location:</strong> ${claim.itemLocation}</p>
                    <p class="categories"><strong>Categories:</strong> ${(claim.itemCategoryNames || [])
                        .map(cat => `<span class="category-badge ${claim.claimType.toLowerCase()}">${cat}</span>`)
                        .join('')}
                    </p>
                    <br>
                    <p><strong>${displayRole}:</strong> ${displayName}</p>
                    <p><strong>Claimed At:</strong> ${new Date(claim.createdAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> ${claim.claimStatus}</p>
                    <p><strong>Exchange Method:</strong> ${claim.exchangeMethod || 'N/A'}</p>
                    <p><strong>Exchange Details:</strong> ${claim.exchangeDetails || 'N/A'}</p>
                    ${actionButtons}
                </div>
            </div>
        `;

        container.appendChild(claimCard);
    });

    // Attach event listeners
    if (isRecipientView) {
        document.querySelectorAll(".verify-claim-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const claim = JSON.parse(e.currentTarget.getAttribute("data-claim"));
                openVerifyModal(claim);
            });
        });
    } else {
        // Update button
        document.querySelectorAll(".btn-update-claim").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const claim = JSON.parse(e.currentTarget.getAttribute("data-claim"));
                openUpdateModal(claim); // implement your modal
            });
        });
        // Delete button
        document.querySelectorAll(".btn-delete-claim").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const claim = JSON.parse(e.currentTarget.getAttribute("data-claim"));
                openDeleteModal(claim); // implement your modal
            });
        });
    }
};


function openVerifyModal(claim) {
    const modalContent = document.getElementById("verifyClaimContent");

    const itemImage = claim.itemImageUrl || '/Front_End/assets/images/noImageAvalable.png';

    // Helper to check if a file is an image
    const isImage = (url) => {
        return /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(url);
    };

    modalContent.innerHTML = `
        <div class="text-center mb-3">
            <img src="${itemImage}" alt="Item Image" class="img-fluid rounded" style="max-height: 250px; object-fit: cover;">
        </div>

        <p class="d-none"><strong>Claim ID:</strong> ${claim.claimId}</p>
        <p><strong>Type:</strong> ${claim.claimType}</p>
        <p><strong>Claimer:</strong> ${claim.claimantName}</p>
        <hr>
        <p><strong>Item Name:</strong> ${claim.itemName}</p>
        <p><strong>Description:</strong> ${claim.itemDescription}</p>
        <p><strong>Location:</strong> ${claim.itemLocation}</p>
        <p><strong>Categories:</strong> ${(claim.itemCategoryNames || []).join(', ')}</p>
        <hr>
        <p><strong>Exchange Method:</strong> ${claim.exchangeMethod || 'N/A'}</p>
        <p><strong>Exchange Details:</strong> ${claim.exchangeDetails || 'N/A'}</p>
        <hr>
        <p><strong>Proofs:</strong></p>
        <div class="d-flex flex-wrap proofs-container">
            ${(claim.proofs || []).map(p => {
                const filePath = p.filePath || "";
                const description = p.description || 'No description provided';
                if (isImage(filePath)) {
                    return `
                        <div class="proof-thumbnail">
                            <a href="${filePath}" target="_blank">
                                <img src="${filePath}" alt="${description}">
                            </a>
                            <div class="description">${description}</div>
                        </div>
                    `;
                } else if (filePath.startsWith('http') || filePath.startsWith('/')) {
                    return `
                        <div class="proof-text">
                            <a href="${filePath}" target="_blank">${description}</a>
                        </div>
                    `;
                } else {
                    return `
                        <div class="proof-text">${description}: ${filePath}</div>
                    `;
                }
            }).join('')}
        </div>

    `;

    const verifyModal = new bootstrap.Modal(document.getElementById('verifyClaimModal'));
    verifyModal.show();

    document.getElementById("approveClaimBtn").onclick = () => verifyClaim(claim.claimId, true, verifyModal);
    document.getElementById("rejectClaimBtn").onclick = () => verifyClaim(claim.claimId, false, verifyModal);
}



async function verifyClaim(claimId, isApproved, modalInstance) {
    try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_CLAIMS}/verify/${claimId}`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ approved: isApproved })
        });

        if (!response.ok) throw new Error("Failed to verify claim");

        Swal.fire({
            icon: "success",
            title: isApproved ? "Claim Approved!" : "Claim Rejected!",
            timer: 2000,
            showConfirmButton: false
        });

        modalInstance.hide();
        loadUserClaims(); // reload claims to update status
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to verify claim. Try again later."
        });
    }
}
