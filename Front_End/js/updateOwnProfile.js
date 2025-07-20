// Edit Profile
document.addEventListener("DOMContentLoaded", function () {
  const editForm = document.getElementById("editProfileForm");

  editForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const userData = {
      userId: document.getElementById("userId").value,
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      phoneNumber: document.getElementById("phone").value,
      password: document.getElementById("editPassword").value,
      createdAt: document.getElementById("createdAt").value,
      active: document.getElementById("isActive").value === "true",
      profilePictureUrl: document.getElementById("profilePictureUrl").value,
    };

    try {
      const response = await fetch("http://localhost:8080/api/claimright/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        // Update local storage
        localStorage.setItem("loggedInUser", JSON.stringify(result.data));

        // Show SweetAlert success
        await Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your profile has been updated successfully.",
          confirmButtonColor: "#3085d6",
        });

        // Close modal and reload
        const editProfileModal = bootstrap.Modal.getInstance(document.getElementById("editProfileModal"));
        editProfileModal.hide();
        location.reload();

      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: result.message || "Could not update your profile.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong while updating your profile.",
        confirmButtonColor: "#d33",
      });
    }
  });
});





