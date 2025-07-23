document.addEventListener("DOMContentLoaded", function () {
  const editForm = document.getElementById("editProfileForm");

editForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData();

  // Create a user object with all the necessary fields
  const userObj = {
    userId: document.getElementById("userId").value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    phoneNumber: document.getElementById("phone").value,
  };

  const passwordInput = document.getElementById("editPassword").value.trim();
  if (passwordInput !== "") {
    userObj.password = passwordInput;
  }

  // Append the user object as a JSON blob to the form data
  formData.append("user", new Blob([JSON.stringify(userObj)], { type: "application/json" }));

  // Append the image file if selected
  const profilePictureInput = document.getElementById("profilePicture");
  if (profilePictureInput.files.length > 0) {
    formData.append("profilePicture", profilePictureInput.files[0]);
  }

  const token = localStorage.getItem("accessToken");

  if (!token) {
    await Swal.fire({
      icon: "error",
      title: "Unauthorized",
      text: "You must be logged in to update your profile.",
      confirmButtonColor: "#d33",
    });
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/claimright/user/update", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`, // do NOT set Content-Type; browser handles it for FormData
      },
      body: formData,
    });

    let result = {};
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    }

    if (response.ok) {
      if (result.data && result.data.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
      }
      if (result.data && result.data.user) {
        localStorage.setItem("loggedInUser", JSON.stringify(result.data.user));
      }
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
