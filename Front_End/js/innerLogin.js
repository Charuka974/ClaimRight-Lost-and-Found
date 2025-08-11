const API_BASE = "http://localhost:8080/claimrightauth";

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!email || !password) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Fields',
          text: 'Please enter both email and password.',
        });
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: `Welcome, ${result.data.username}!`,
            timer: 2000,
            showConfirmButton: false
          });

          // Save session (optional)
          localStorage.setItem("loggedInUser", JSON.stringify(result.data));

          // Close modal after delay
          setTimeout(() => {
            const modalEl = document.getElementById("loginModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            // Optional: redirect
            // window.location.href = "/Front_End/html/dashboard.html";
          }, 2000);

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: result.message || "Invalid credentials.",
          });
        }
      } catch (error) {
        console.error("Login error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'Something went wrong. Please try again later.',
        });
      }
    });
  }
});