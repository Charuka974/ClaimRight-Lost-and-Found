// const API_BASE_UPDATE = "http://localhost:8080/claimright";

document.addEventListener("DOMContentLoaded", function () {
    
    const modalMap = {
        "Edit Profile": "update-profile-modal",
        "Change Password": "change-password-modal",
        // "My Claims": "my-claims-modal",
        "My Lost Items": "my-lost-items-modal",
        "Items I Found": "my-found-items-modal"
    };

    const buttons = document.querySelectorAll(".menu-actions .btn");
    const modals = document.querySelectorAll(".custom-modal");

    // Load profile card immediately
    loadProfileCard();

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const buttonText = button.textContent.trim();
            const modalId = modalMap[buttonText];

            // Hide all modals
            modals.forEach(modal => modal.classList.add("d-none"));

            if (modalId) {
                const targetModal = document.getElementById(modalId);
                if (targetModal) {
                    targetModal.classList.remove("d-none");

                    // Populate hidden userId input
                    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
                    if (loggedInUser && loggedInUser.userId) {
                        let hiddenIdInput = targetModal.querySelector("#updateUserId");

                        if (hiddenIdInput) {
                            hiddenIdInput.value = loggedInUser.userId;
                        } else {
                            hiddenIdInput = document.createElement("input");
                            hiddenIdInput.type = "hidden";
                            hiddenIdInput.id = "updateUserId";
                            hiddenIdInput.name = "userId";
                            hiddenIdInput.value = loggedInUser.userId;
                            targetModal.appendChild(hiddenIdInput);
                        }
                    }

                    // Special cases
                    if (modalId === "update-profile-modal") populateUpdateProfile();
                    if (modalId === "my-lost-items-modal") loadMyLostItems();
                    if (modalId === "my-found-items-modal") loadMyFoundItems();
                }
            }
        });
    });

    function loadProfileCard() {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!user) return;

        const profileImg = document.querySelector(".profile-header .profile-img");
        const profileName = document.querySelector(".profile-header h2");
        const profileEmail = document.querySelector(".profile-header .profile-email");

        if (profileImg) profileImg.src = user.profilePictureUrl || "/Front_End/assets/images/avatar-default-icon.png";
        if (profileName) profileName.textContent = user.username || user.fullName || "Unnamed User";
        if (profileEmail) profileEmail.textContent = user.email || "No email provided";

        const phoneField = document.querySelector(".profile-info div:nth-child(1)");
        const memberSinceField = document.querySelector(".profile-info div:nth-child(2)");
        const statusBadge = document.querySelector(".profile-info .badge");

        if (phoneField) phoneField.innerHTML = `<strong>Phone:</strong> ${user.phoneNumber || "N/A"}`;
        if (memberSinceField) memberSinceField.innerHTML = `<strong>Member since:</strong> ${user.createdAt || "Unknown"}`;
        if (statusBadge) {
            statusBadge.textContent = user.active ? "Active" : "Inactive";
            statusBadge.classList.toggle("active", user.active);
        }
    }

    ////////////////////////////////////// Edit Profile //////////////////////////////////////

    function populateUpdateProfile() {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!user) return;

        // Fill visible fields
        document.getElementById("updateUsername").value = user.username || user.fullName || "";
        document.getElementById("updateEmail").value = user.email || "";
        document.getElementById("updatePhone").value = user.phoneNumber || "";

        // Fill hidden fields
        document.getElementById("updateUserId").value = user.userId || "";
        document.getElementById("updateCreatedAt").value = user.createdAt || "";
        document.getElementById("updateIsActive").value = user.isActive !== undefined ? user.isActive : true;
        document.getElementById("updateProfilePictureUrl").value = user.profilePictureUrl || "";

        // Profile picture preview
        const preview = document.getElementById("updateProfilePreview");
        if (preview) {
            preview.src = user.profilePictureUrl || "/Front_End/assets/images/avatar-default-icon.png";
        }
    }

    document.addEventListener("change", function (e) {
        if (e.target.id === "profilePictureEditUpdate") {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    document.getElementById("profilePreviewUpdate").src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        }
    });

    const editForm = document.getElementById("editMyProfileForm");

    // Handle profile picture preview
    document.getElementById("updateProfilePicture").addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("updateProfilePreview").src = e.target.result;
        };
        reader.readAsDataURL(file);
        }
    });

    editForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        showLoading(); // Show loading spinner

        const formData = new FormData();
        const existingProfileUrl = document.getElementById("updateProfilePreview").getAttribute("src");

        const userObj = {
            userId: document.getElementById("updateUserId").value,
            username: document.getElementById("updateUsername").value,
            email: document.getElementById("updateEmail").value,
            phoneNumber: document.getElementById("updatePhone").value,
            profilePictureUrl: existingProfileUrl
        };

        const passwordInput = document.getElementById("updatePassword")?.value?.trim();
        if (passwordInput && passwordInput !== "") {
            userObj.password = passwordInput;
        }

        formData.append("user", new Blob([JSON.stringify(userObj)], { type: "application/json" }));

        const profilePictureInput = document.getElementById("updateProfilePicture");
        if (profilePictureInput.files.length > 0) {
            formData.append("profilePicture", profilePictureInput.files[0]);
        }

        const token = localStorage.getItem("accessToken");
        if (!token) {
            hideLoading();
            await Swal.fire({
                icon: "error",
                title: "Unauthorized",
                text: "You must be logged in to update your profile.",
                confirmButtonColor: "#d33",
            });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_UPDATE}/user/update`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            let result = {};
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            }

            if (response.ok) {
                if (result.data?.accessToken) {
                    localStorage.setItem("accessToken", result.data.accessToken);
                }
                if (result.data?.user) {
                    localStorage.setItem("loggedInUser", JSON.stringify(result.data.user));
                }
                hideLoading();
                await Swal.fire({
                    icon: "success",
                    title: "Profile Updated",
                    text: "Your profile has been updated successfully.",
                    confirmButtonColor: "#3085d6",
                });
                const modalEl = document.getElementById("update-profile-modal");
                let editProfileModal = bootstrap.Modal.getInstance(modalEl);

                if (!editProfileModal) {
                    editProfileModal = new bootstrap.Modal(modalEl); // create instance if missing
                }
                editProfileModal.hide();
                location.reload();

            } else {
                hideLoading();
                Swal.fire({
                    icon: "error",
                    title: "Update Failed",
                    text: result.message || "Could not update your profile.",
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            console.error("Update error:", error);
            hideLoading();
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Something went wrong while updating your profile.",
                confirmButtonColor: "#d33",
            });
        } finally {
            hideLoading(); // Hide loading spinner regardless of result
        }
    });


    ////////////////////////////////////// Change Password //////////////////////////////////////

    const changePasswordForm = document.getElementById("changePasswordForm");

    changePasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        showLoading();

        // Ensure userId is set
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (loggedInUser && loggedInUser.userId) {
            const hiddenIdInput = document.getElementById("updateUserId");
            if (hiddenIdInput) {
                hiddenIdInput.value = loggedInUser.userId;
            } else {
                const input = document.createElement("input");
                input.type = "hidden";
                input.id = "updateUserId";
                input.name = "userId";
                input.value = loggedInUser.userId;
                changePasswordForm.appendChild(input);
            }
        }

        const payload = {
            userId: document.getElementById("updateUserId").value,
            currentPassword: document.getElementById("current-password").value.trim(),
            newPassword: document.getElementById("new-password").value.trim()
        };

        const token = localStorage.getItem("accessToken");

        try {
            const response = await fetch(`${API_BASE_UPDATE}/user/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            hideLoading();

            if (response.ok) {
                await Swal.fire({
                    icon: "success",
                    title: "Password Updated",
                    text: "Your password has been updated successfully.",
                    confirmButtonColor: "#3085d6"
                });
                changePasswordForm.reset();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Update Failed",
                    text: result.message || "Could not update your password.",
                    confirmButtonColor: "#d33"
                });
            }
        } catch (err) {
            hideLoading();
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Something went wrong.",
                confirmButtonColor: "#d33"
            });
        }
    });

});


function openChat() {
    window.location.href = "/Front_End/html/chat-page.html";
}

function openQRGenerator() {
  window.location.href = "/Front_End/html/qr-code-page.html#qrGeneratorCard";
}

function redirectToMyClaims() {
  window.location.href = "/Front_End/html/claim-view-verify.html";
}