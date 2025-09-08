const API_BASE_CLAIMS = 'http://localhost:8080/claimright/claims';
const API_BASE_CLAIMS_RESPOND = 'http://localhost:8080/claimright/claim-respond';



document.addEventListener("DOMContentLoaded", () => {
    loadAllClaims();
});


async function loadAllClaims() {
    const topContainer = document.querySelector(".main-content-top-container");
    const bottomContainer = document.querySelector(".main-content-bottom-container");

    // Show loading spinner
    topContainer.innerHTML = bottomContainer.innerHTML = `
        <div class="loading-template text-center">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Loading claims...</p>
        </div>
    `;

    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(`${API_BASE_CLAIMS}/admin`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch claims");

        const claims = await response.json();

        // Separate claims that require admin verification
        const claimsToVerify = claims.filter(claim => 
            claim.verificationLevel === "ADMIN_ONLY" || claim.verificationLevel === "DUAL_APPROVAL"
        );

        // Claims that are just general/all claims
        const allOtherClaims = claims;

        renderClaims(topContainer, claimsToVerify, true); // claims to verify (show Verify button)
        renderClaims(bottomContainer, allOtherClaims, false); // all claims (no Verify button needed)

    } catch (error) {
        console.error(error);
        topContainer.innerHTML = bottomContainer.innerHTML =
            `<div class="alert alert-danger text-center">Error loading claims. Please try again later.</div>`;
    }
}

const renderClaims = (container, claimsList, showVerify) => {
    if (!claimsList.length) {
        container.innerHTML = `<div class="alert alert-info text-center">No claims found.</div>`;
        return;
    }

    container.innerHTML = '';

    claimsList.forEach(claim => {
        const claimCard = document.createElement("div");
        claimCard.className = "claim-card mb-3 p-3 border rounded";

        const itemImage = claim.itemImageUrl || '/Front_End/assets/images/noImageAvalable.png';
        const displayRole = claim.claimType.toLowerCase() === "lost" ? "Owner" : "Finder";

        // Action buttons
        const actionButtons = `
            ${showVerify ? `<button class="btn mt-2 verify-claim-btn" data-claim='${JSON.stringify(claim)}'>Verify</button>` : ''}
            <button class="btn mt-2 btn-delete-claim ms-2" data-claim='${JSON.stringify(claim)}'>Delete</button>
        `;

        claimCard.innerHTML = `
            <div class="row">
                <div class="col-md-3">
                    <img src="${itemImage}" class="img-fluid rounded" alt="Item Image">
                </div>
                <div class="col-md-9">
                    <h5 class="fw-bold">${claim.itemName}</h5>
                    <p><strong>Type:</strong> <span class="claim-type-badge ${claim.claimType.toLowerCase()}">${claim.claimType} Item</span></p>
                    <p><strong>Description:</strong> ${claim.itemDescription}</p>
                    <p><strong>${claim.claimType} At:</strong> ${new Date(claim.itemDate).toLocaleString()}</p>
                    <p><strong>Location:</strong> ${claim.itemLocation}</p>
                    <p class="categories"><strong>Categories:</strong> ${(claim.itemCategoryNames || []).map(cat => `<span class="category-badge ${claim.claimType.toLowerCase()}">${cat}</span>`).join('')}</p>
                    <p><strong>Claimant:</strong> ${claim.claimantName}</p>
                    <p><strong>Recipient:</strong> ${claim.recipientName || 'N/A'}</p>
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

    // Attach event listeners only if Verify button exists
    if (showVerify) {
        document.querySelectorAll(".verify-claim-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                const claim = JSON.parse(e.currentTarget.getAttribute("data-claim"));
                openVerifyModal(claim);
            });
        });
    }


    document.querySelectorAll(".btn-delete-claim").forEach(btn => {
        btn.addEventListener("click", e => {
            const claim = JSON.parse(e.currentTarget.getAttribute("data-claim"));
            Swal.fire({
                title: "Are you sure?",
                text: "This will delete the claim permanently.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it",
                cancelButtonText: "Cancel"
            }).then(result => {
                if (result.isConfirmed) {
                    deleteClaim(claim.claimId, { hide: () => {} });
                }
            });
        });
    });
};



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

function openVerifyModal(claim) {
    const modalContent = document.getElementById("verifyClaimContentInner");

    const itemImage = claim.itemImageUrl || '/Front_End/assets/images/noImageAvalable.png';
    const isImage = url => /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(url);

    modalContent.innerHTML = `
        <div class="text-center mb-3">
            <img src="${itemImage}" class="img-fluid rounded" style="max-height: 250px; object-fit: cover;">
        </div>
        <p><strong>Claim ID:</strong> ${claim.claimId}</p>
        <p><strong>Type:</strong> ${claim.claimType}</p>
        <p><strong>Claimer:</strong> ${claim.claimantName}</p>
        <p><strong>Recipient:</strong> ${claim.recipientName || 'N/A'}</p>
        <p><strong>Description:</strong> ${claim.itemDescription}</p>
        <p><strong>Location:</strong> ${claim.itemLocation}</p>
        <p><strong>Categories:</strong> ${(claim.itemCategoryNames || []).join(', ')}</p>
        <p><strong>Exchange Method:</strong> ${claim.exchangeMethod || 'N/A'}</p>
        <p><strong>Exchange Details:</strong> ${claim.exchangeDetails || 'N/A'}</p>
        <hr>
        <p><strong>Claim Proof:</strong></p>
        <div class="d-flex flex-wrap proofs-container">
            ${(claim.proofs || []).map(p => {
                const filePath = p.filePath || "";
                const description = p.description || "No description provided";
                if (isImage(filePath)) {
                    return `<div class="proof-thumbnail"><a href="${filePath}" target="_blank"><img src="${filePath}" alt="${description}"></a><div class="description">${description}</div></div>`;
                } else {
                    return `<div class="proof-text"><a href="${filePath}" target="_blank">${description}</a></div>`;
                }
            }).join('')}
        </div>
    `;

    const verifyModal = new bootstrap.Modal(document.getElementById('verifyClaimModal'));
    verifyModal.show();

    document.getElementById("approveClaimBtn").onclick = () => verifyClaim(claim.claimId, true, verifyModal);
    document.getElementById("rejectClaimBtn").onclick = () => verifyClaim(claim.claimId, false, verifyModal);
}


async function deleteClaim(claimId, modalInstance) {
    try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_CLAIMS_RESPOND}/${claimId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 204) {
            Swal.fire({
                icon: "success",
                title: "Claim deleted successfully!",
                timer: 2000,
                showConfirmButton: false
            });
            modalInstance.hide();
            loadUserClaims(); // refresh claim list
        } 
        else if (response.status === 403) {
            Swal.fire({
                icon: "warning",
                title: "Action not allowed",
                text: "This claim cannot be deleted because it has already been approved or completed."
            });
        } 
        else if (response.status === 404) {
            Swal.fire({
                icon: "error",
                title: "Not Found",
                text: "This claim does not exist or may have been deleted already."
            });
        } 
        else {
            throw new Error("Unexpected response");
        }

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete claim. Please try again later."
        });
    }
}
