const API_BASE_CLAIMS = 'http://localhost:8080/claimright/claims';
const API_BASE_CLAIMS_RESPOND = 'http://localhost:8080/claimright/claim-respond';



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


// const renderClaims = (container, claimsList, isRecipientView) => {
//     if (claimsList.length === 0) {
//         container.innerHTML = `<div class="alert alert-info text-center">No claims found.</div>`;
//         return;
//     }

//     container.innerHTML = '';
//     claimsList.forEach(claim => {
//         const claimCard = document.createElement("div");
//         claimCard.className = "claim-card mb-3 p-3 border rounded";

//         const itemImage = claim.itemImageUrl || '/Front_End/assets/images/noImageAvalable.png';

//         const displayName = isRecipientView
//             ? claim.claimantName
//             : claim.recipientName;

//         const displayRole = isRecipientView
//             ? "Claimer"
//             : (claim.claimType.toLowerCase() === "lost" ? "Owner" : "Finder");

//         // Buttons
//         let actionButtons = '';
//         if (isRecipientView) {
//             actionButtons = `<button class="btn mt-2 verify-claim-btn" data-claim='${JSON.stringify(claim)}'>
//                                 Verify Claim
//                              </button>`;

//         } else {
//             actionButtons = `
//                 <button class="btn mt-2 btn-update-claim" data-claim='${JSON.stringify(claim)}'>
//                     Update
//                 </button>
//                 <button class="btn mt-2 btn-delete-claim ms-2" data-claim='${JSON.stringify(claim)}'>
//                     Delete
//                 </button>
//             `;
//         }

//         claimCard.innerHTML = `
//             <div class="row">
//                 <div class="col-md-3">
//                     <img src="${itemImage}" class="img-fluid rounded" alt="Item Image">
//                 </div>
//                 <div class="col-md-9">
//                     <h5 class="fw-bold">${claim.itemName}</h5>
//                     <p><strong>Type:</strong> 
//                         <span class="claim-type-badge ${claim.claimType.toLowerCase()}">
//                             ${claim.claimType} Item
//                         </span>
//                     </p>
//                     <p><strong>Description:</strong> ${claim.itemDescription}</p>
//                     <p><strong>${claim.claimType} At:</strong> ${new Date(claim.itemDate).toLocaleString()}</p>
//                     <p><strong>Location:</strong> ${claim.itemLocation}</p>
//                     <p class="categories"><strong>Categories:</strong> ${(claim.itemCategoryNames || [])
//                         .map(cat => `<span class="category-badge ${claim.claimType.toLowerCase()}">${cat}</span>`)
//                         .join('')}
//                     </p>
//                     <br>
//                     <p><strong>${displayRole}:</strong> ${displayName}</p>
//                     <p><strong>Claimed At:</strong> ${new Date(claim.createdAt).toLocaleString()}</p>
//                     <p><strong>Status:</strong> ${claim.claimStatus}</p>
//                     <p><strong>Exchange Method:</strong> ${claim.exchangeMethod || 'N/A'}</p>
//                     <p><strong>Exchange Details:</strong> ${claim.exchangeDetails || 'N/A'}</p>
//                     ${actionButtons}
//                 </div>
//             </div>
//         `;

//         container.appendChild(claimCard);
//     });


//     // Attach event listeners
//     if (isRecipientView) {
//         document.querySelectorAll(".verify-claim-btn").forEach(btn => {
//             btn.addEventListener("click", (e) => {
//                 const claim = JSON.parse(e.currentTarget.getAttribute("data-claim"));
//                 openVerifyModal(claim);
//             });
//         });

//     } else {
//         // Update button
//         document.querySelectorAll(".btn-update-claim").forEach(btn => {
//             btn.addEventListener("click", (e) => {
//                 const claim = JSON.parse(e.currentTarget.getAttribute("data-claim"));
//                 openUpdateModal(claim); // implement your modal
//             });
//         });
//         // Delete button
//         document.querySelectorAll(".btn-delete-claim").forEach(btn => {
//             btn.addEventListener("click", (e) => {
//                 const claim = JSON.parse(e.currentTarget.getAttribute("data-claim"));
                
//                 Swal.fire({
//                     title: "Are you sure?",
//                     text: "This will delete the claim permanently.",
//                     icon: "warning",
//                     showCancelButton: true,
//                     confirmButtonText: "Yes, delete it",
//                     cancelButtonText: "Cancel"
//                 }).then((result) => {
//                     if (result.isConfirmed) {
//                         deleteClaim(claim.claimId, { hide: () => {} }); 
//                     }
//                 });
//             });
//         });

//     }

// };


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
        const displayName = isRecipientView ? claim.claimantName : claim.recipientName;
        const displayRole = isRecipientView ? "Claimer" : (claim.claimType.toLowerCase() === "lost" ? "Owner" : "Finder");

        // Buttons
        let actionButtons = '';
        if (isRecipientView) {
            actionButtons = `<button class="btn mt-2 verify-claim-btn" data-claim='${JSON.stringify(claim)}'>Verify Claim</button>`;
        } else {
            actionButtons = `
                <button class="btn mt-2 btn-update-claim" data-claim='${JSON.stringify(claim)}'>Update</button>
                <button class="btn mt-2 btn-delete-claim ms-2" data-claim='${JSON.stringify(claim)}'>Delete</button>
            `;

            // Add "Mark as Completed" button if not already completed
            const approvedStatuses = ["FINDER_APPROVED", "ADMIN_APPROVED", "OWNER_APPROVED"];
            if (approvedStatuses.includes(claim.claimStatus) && claim.claimStatus !== "COMPLETED") {
                actionButtons += `
                    <button class="btn mt-2 btn-complete-claim ms-2" data-claim='${JSON.stringify(claim)}'>
                        Mark as Completed
                    </button>
                `;
            }

        }

        claimCard.innerHTML = `
            <div class="row">
                <div class="col-md-3">
                    <img src="${itemImage}" class="img-fluid rounded" alt="Item Image">
                </div>
                <div class="col-md-9">
                    <h5 class="fw-bold">${claim.itemName}</h5>
                    <p><strong>Type:</strong> 
                        <span class="claim-type-badge ${claim.claimType.toLowerCase()}">${claim.claimType} Item</span>
                    </p>
                    <p><strong>Description:</strong> ${claim.itemDescription}</p>
                    <p><strong>${claim.claimType} At:</strong> ${new Date(claim.itemDate).toLocaleString()}</p>
                    <p><strong>Location:</strong> ${claim.itemLocation}</p>
                    <p class="categories"><strong>Categories:</strong> ${(claim.itemCategoryNames || [])
                        .map(cat => `<span class="category-badge ${claim.claimType.toLowerCase()}">${cat}</span>`).join('')}
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

        // Append verification dropdown for recipient view 
        if (isRecipientView) {
            const cardBody = claimCard.querySelector(".col-md-9");

            const dropdownContainer = document.createElement("p");
            dropdownContainer.innerHTML = `<strong>Verification Level:</strong> `;
            dropdownContainer.classList.add("verification-dropdown");

            const verificationDropdown = document.createElement("select");
            ["USER_ONLY", "ADMIN_ONLY", "DUAL_APPROVAL"].forEach(level => {
                const option = document.createElement("option");
                option.value = level;
                option.textContent = level.replace("_", " ");
                if (claim.verificationLevel === level) option.selected = true;
                verificationDropdown.appendChild(option);
            });

            verificationDropdown.addEventListener("change", (e) => {
                const newLevel = e.target.value;
                changeVerificationLevel(claim.claimId, newLevel);
            });

            dropdownContainer.appendChild(verificationDropdown);
            cardBody.appendChild(dropdownContainer);
        }

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
                openUpdateModal(claim);
            });
        });
        // Delete button
        document.querySelectorAll(".btn-delete-claim").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const claim = JSON.parse(e.currentTarget.getAttribute("data-claim"));
                Swal.fire({
                    title: "Are you sure?",
                    text: "This will delete the claim permanently.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete it",
                    cancelButtonText: "Cancel"
                }).then((result) => {
                    if (result.isConfirmed) deleteClaim(claim.claimId, { hide: () => {} });
                });
            });
        });

        // Handle "Mark as Completed"
        document.querySelectorAll(".btn-complete-claim").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const claim = JSON.parse(e.currentTarget.getAttribute("data-claim"));
                Swal.fire({
                    title: "Mark as Completed?",
                    text: "This will finalize the claim process.",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes, complete it",
                    cancelButtonText: "Cancel"
                }).then((result) => {
                    if (result.isConfirmed) verifyClaim(claim.claimId, true, { hide: () => {} }, claim);
                });
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

    document.getElementById("approveClaimBtn").onclick = () => verifyClaim(claim.claimId, true, verifyModal, claim);
    document.getElementById("rejectClaimBtn").onclick = () => verifyClaim(claim.claimId, false, verifyModal, claim);

}


async function changeVerificationLevel(claimId, newLevel) {
    const token = localStorage.getItem("accessToken");
    try {
        const response = await fetch(`${API_BASE_CLAIMS_RESPOND}/update-verification/${claimId}?newLevel=${newLevel}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to update verification level");

        const updatedClaim = await response.json();
        // console.log("Updated Claim:", updatedClaim);
        loadUserClaims();
    } catch (err) {
        console.error(err);
    }
}


async function verifyClaim(claimId, isApproved, modalInstance, claim) {
    try {
        const token = localStorage.getItem("accessToken");
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

        let newStatus;

        // If I'm the recipient → I approve/reject
       if (claim.recipientId === loggedInUser.userId) {
            if (claim.claimType.toLowerCase() === "lost") {
                // Lost item → recipient = Owner
                newStatus = isApproved ? "OWNER_APPROVED" : "OWNER_REJECTED";
            } else {
                // Found item → recipient = Finder
                newStatus = isApproved ? "FINDER_APPROVED" : "FINDER_REJECTED";
            }
        }

        // If I'm the claimant → I can mark it completed
        else if (claim.claimantId === loggedInUser.userId && isApproved) {
            newStatus = "COMPLETED";
        } else {
            throw new Error("You are not allowed to perform this action.");
        }

        const response = await fetch(`${API_BASE_CLAIMS_RESPOND}/update-status/${claimId}?status=${newStatus}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Failed to update claim status");

        Swal.fire({
            icon: "success",
            title: `${newStatus.replace("_", " ")}!`,
            timer: 2000,
            showConfirmButton: false
        });

        modalInstance.hide();
        loadUserClaims();
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "Failed to update claim status."
        });
    }
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
