const API_BASE_UPDATE = "http://localhost:8080/claimright";

document.addEventListener("DOMContentLoaded", function () {
  const editForm = document.getElementById("editProfileForm");

  // Handle profile picture preview
  document.getElementById("profilePicture").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("profilePreview").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  editForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    showLoading(); // Show loading spinner

    const formData = new FormData();
    const existingProfileUrl = document.getElementById("profilePreview").getAttribute("src");

    const userObj = {
      userId: document.getElementById("userId").value,
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      phoneNumber: document.getElementById("phone").value,
      profilePictureUrl: existingProfileUrl
    };

    const passwordInput = document.getElementById("editPassword").value.trim();
    if (passwordInput !== "") {
      userObj.password = passwordInput;
    }

    formData.append("user", new Blob([JSON.stringify(userObj)], { type: "application/json" }));
    const profilePictureInput = document.getElementById("profilePicture");
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
        const editProfileModal = bootstrap.Modal.getInstance(document.getElementById("editProfileModal"));
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

});



function showLoading() {
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}
