const API_BASE = "http://localhost:8080/claimrightauth";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const resetForm = document.getElementById("resetPasswordForm");
  const loadingOverlay = document.getElementById("loadingOverlay");

  // FORGOT PASSWORD
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('input[name="email"]').value;

      loginForm.querySelector('button[type="submit"]').disabled = true;
      loadingOverlay.classList.add("show");

      try {
        const res = await fetch(`${API_BASE}/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ email })
        });

        const data = await res.json();

        loadingOverlay.classList.remove("show");
        loginForm.querySelector('button[type="submit"]').disabled = false;

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: data.data
        }).then(() => {
          if (data.token) {
            window.location.href = `/Front_End/html/reset-new-password.html?token=${encodeURIComponent(data.token)}`;
          } else {
            window.location.href = "/Front_End/html/login-signup.html";
          }
        });

      } catch (error) {
        loadingOverlay.classList.remove("show");
        loginForm.querySelector('button[type="submit"]').disabled = false;

        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: error.message || "Something went wrong."
        });
      }
    });
  }

  // RESET PASSWORD
  if (resetForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Invalid Link",
        text: "Reset token is missing or invalid."
      });
      resetForm.querySelector('button[type="submit"]').disabled = true;
      return;
    }

    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById("newPassword").value;

      if (!newPassword || newPassword.length < 6) {
        Swal.fire({
          icon: "warning",
          title: "Weak Password",
          text: "Password should be at least 6 characters."
        });
        return;
      }

      resetForm.querySelector('button[type="submit"]').disabled = true;
      loadingOverlay.classList.add("show");

      try {
        const res = await fetch(`${API_BASE}/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            token,
            newPassword
          })
        });

        const data = await res.json();

        loadingOverlay.classList.remove("show");
        resetForm.querySelector('button[type="submit"]').disabled = false;

        Swal.fire({
          icon: "success",
          title: "Password Reset",
          text: data.data
        });

        setTimeout(() => {
          window.location.href = "/Front_End/html/login-signup.html";
        }, 3000);

      } catch (error) {
        loadingOverlay.classList.remove("show");
        resetForm.querySelector('button[type="submit"]').disabled = false;

        Swal.fire({
          icon: "error",
          title: "Failed",
          text: error.message || "Something went wrong."
        });
      }
    });
  }
});





  function togglePassword(inputId) {
      const input = document.getElementById(inputId);
      const icon = input.nextElementSibling.querySelector('i');
      if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
      } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
      }
  }



