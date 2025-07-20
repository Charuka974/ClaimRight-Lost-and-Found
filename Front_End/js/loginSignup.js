$(document).ready(function () {
  

});

function flipCard() {
    document.getElementById('flipCard').classList.toggle('flipped');
}
 
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = passwordInput.nextElementSibling.querySelector('i');
            
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}
        
// Login process
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
      loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = loginForm.email.value.trim();
        const password = loginForm.password.value.trim();

        if (!email || !password) {
          Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            text: 'Please enter both email and password.'
          });
          return;
        }

        try {
          const response = await fetch("http://localhost:8080/api/claimright/user/validate", {
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

            // Optional: Save user session
            localStorage.setItem("loggedInUser", JSON.stringify(result.data));

            // Redirect or close card
            setTimeout(() => {
              window.location.href = "/Front_End/html/dashboard.html";
            }, 2000);

          } else {
            Swal.fire({
              icon: 'error',
              title: 'Login Failed',
              text: result.message || 'Invalid email or password.',
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

// SignIn process
document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Collect form data
      const formData = {
        username: signupForm.username.value.trim(),
        email: signupForm.email.value.trim(),
        password: signupForm.password.value.trim(),
        phoneNumber: signupForm.phoneNumber.value.trim(),
        role: signupForm.role.value,
        active: true // explicitly setting active true as in backend
      };

      // Basic validation
      if (!formData.username || !formData.email || !formData.password || !formData.role) {
        Swal.fire({
          icon: "warning",
          title: "Missing Fields",
          text: "Please fill in all required fields."
        });
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/api/claimright/user/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Account Created!",
            text: result.message || "Your account has been created successfully.",
            confirmButtonText: "Continue"
          }).then(() => {
            // Optionally flip back to login card or redirect user
            flipCard(); // flips back to login side
            signupForm.reset();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Signup Failed",
            text: result.message || "Something went wrong. Please try again.",
          });
        }
      } catch (error) {
        console.error("Signup error:", error);
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Unable to process request. Please try again later.",
        });
      }
    });
  }
});

        
// Add some interactive effects to form inputs
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
            
    input.addEventListener('blur', function() {
        if (this.value === '') {
                    this.parentElement.classList.remove('focused');
        }
    });
});
