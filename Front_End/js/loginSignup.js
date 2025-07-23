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
        
document.addEventListener("DOMContentLoaded", function () {
  // ==== SIGNUP FUNCTION ====
  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = signupForm.username.value.trim();
      const email = signupForm.email.value.trim();
      const password = signupForm.password.value.trim();
      const phoneNumber = signupForm.phoneNumber.value.trim();
      const role = signupForm.role.value;

      if (!username || !email || !password || !role) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Information',
          text: 'Please fill in all the required fields.',
        });
        return;
      }

      const registerDTO = { username, email, password, phoneNumber, role };

      try {
        const response = await fetch("http://localhost:8080/claimrightauth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(registerDTO)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Registration failed');
        }

        Swal.fire({
          icon: 'success',
          title: 'Registered Successfully',
          text: 'You can now log in with your new account.',
          confirmButtonText: 'Go to Login'
        }).then(() => {
          flipCard(); // Flip to login view
          signupForm.reset();
        });

      } catch (error) {
        console.error("Registration error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: error.message || 'Something went wrong. Please try again.',
        });
      }
    });
  }

  // ==== LOGIN FUNCTION ====
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
        const response = await fetch("http://localhost:8080/claimrightauth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        const token = result.data.accessToken;
        const user = result.data.user;

        if (!response.ok) {
          throw new Error(result.message || "Invalid email or password");
        }

        

        localStorage.setItem("accessToken", token);
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          window.location.href = "/Front_End/html/dashboard.html";
        });

      } catch (error) {
        console.error("Login error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: error.message || "Something went wrong"
        });
      }
    });
  }



});

        

