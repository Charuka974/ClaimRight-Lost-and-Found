document.addEventListener("DOMContentLoaded", function () {
    const modalMap = {
        "Edit Profile": "update-profile-modal",
        "Change Password": "change-password-modal",
        "My Claims": "my-claims-modal",
        "My Lost Items": "my-lost-items-modal",
        "My Found Items": "my-found-items-modal"
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

                    // Special cases for modals
                    if (modalId === "update-profile-modal") {
                        populateUpdateProfile();
                    }

                    if (modalId === "my-lost-items-modal") {
                        loadMyLostItems(); // Load only when opening My Lost Items
                    }
                }
            }
        });
    });

    function populateUpdateProfile() {
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!user) return;

        document.getElementById("edit-name-update").value = user.username || user.fullName || "";
        document.getElementById("edit-email-update").value = user.email || "";
        document.getElementById("edit-phone-update").value = user.phoneNumber || "";

        const preview = document.getElementById("profilePreviewUpdate");
        if (preview) {
            preview.src = user.profilePictureUrl || "/Front_End/assets/images/avatar-default-icon.png";
        }
    }

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
});
