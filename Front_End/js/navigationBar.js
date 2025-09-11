document.addEventListener("DOMContentLoaded", function () {
  // NAVBAR
  const user = localStorage.getItem("loggedInUser");
  const userObj = user ? JSON.parse(user) : null;

  // Dynamically build navbar based on login status
  const isLoggedIn = !!user;

  const navbar = `
    <nav class="navbar navbar-expand-md custom-navbar shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold text-white" href="/Front_End/html/dashboard.html">ClaimRight</a>
        <button class="navbar-toggler bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
          aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon text-white"></span>
        </button>

        <div class="collapse navbar-collapse justify-content-end" id="navbarContent">
          <ul class="navbar-nav mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link text-white" href="/Front_End/html/dashboard.html"><i class="bi bi-speedometer2"></i> <b>Dashboard</b></a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white" href="/Front_End/html/lost-items.html"><i class="bi bi-search-heart"></i> <b>Lost Items</b></a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white" href="/Front_End/html/found-items.html"><i class="bi bi-binoculars"></i> <b>Found Items</b></a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white" href="/Front_End/html/about-page.html"><i class="bi bi-info-circle"></i> <b>About</b></a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-white" href="/Front_End/html/contact-us-page.html"><i class="bi bi-envelope"></i> <b>Contact Us</b></a>
            </li>

            ${
              isLoggedIn
                ? `

              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle text-white fw-bold position-relative" 
                  href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-lightning-charge-fill"></i> <b>Quick Actions</b>
                  <span id="claims-notification-inline"
                        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style="font-size: 0.65rem;">
                    0
                  </span>
                </a>

                <ul class="dropdown-menu dropdown-menu-end mt-3 wide-dropdown" aria-labelledby="userDropdown">
                  <li>
                    <a class="btn btn-outline-light d-flex align-items-center gap-2 fw-bold" href="/Front_End/html/lost-items.html?openModal=true">
                      <i class="bi bi-exclamation-octagon-fill"></i>
                      Report Lost Item
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>

                  <li>
                    <a class="btn btn-outline-light d-flex align-items-center gap-2 fw-bold" href="/Front_End/html/found-items.html?openModal=true">
                      <i class="bi bi-check2-circle"></i>
                      Report Found Item
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>

                  <li>
                    <a class="btn btn-outline-light d-flex align-items-center gap-2 fw-bold" href="/Front_End/html/chat-page.html">
                      <i class="bi bi-chat-dots-fill"></i>
                      Chat
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>

                  <li>
                    <a class="btn btn-outline-light d-flex align-items-center gap-2 fw-bold position-relative" 
                      href="/Front_End/html/claim-view-verify.html">
                      <i class="bi bi-journal-check"></i>
                      My Claims
                      <span id="claims-notification" 
                            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                            style="font-size: 0.7rem;">
                        0
                      </span>
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>

                  <li>
                    <a class="btn btn-outline-light d-flex align-items-center gap-2 fw-bold" href="/Front_End/html/qr-code-page.html">
                      <i class="bi bi-qr-code"></i>
                      QR Codes
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>

                  <li>
                    <a class="btn btn-outline-light d-flex align-items-center gap-2 fw-bold" href="/Front_End/html/payment-page.html">
                      <i class="bi bi-credit-card"></i>
                      Payments 
                    </a>
                  </li>
                </ul>
              </li>



              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle text-white fw-bold" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-person-circle"></i> <b>${userObj.username}</b>
                </a>
                <ul class="dropdown-menu dropdown-menu-end mt-3" aria-labelledby="userDropdown">
                <li>
                  <a class="btn btn-edit-profile btn-outline-light d-flex align-items-center gap-2 fw-bold" 
                    href="/Front_End/html/my-profile-page.html">
                    <i class="bi bi-person-lines-fill"></i>
                    My Profile
                  </a>
                </li>
                <li>
                  <hr class="dropdown-divider" />
                </li>  
                <li>
                    <a class="btn btn-edit-profile btn-outline-light d-flex align-items-center gap-2 fw-bold" 
                      href="#" data-bs-toggle="modal" data-bs-target="#editProfileModal">
                      <i class="bi bi-person-circle"></i>
                      Edit Profile
                    </a>
                  </li>
                  <li>
                    <hr class="dropdown-divider" />
                  </li>
                  <li>
                    <a class="btn btn-logout btn-outline-light d-flex align-items-center gap-2 fw-bold" 
                      href="#" onclick="logout()">
                      <i class="bi bi-box-arrow-right"></i>
                      Logout
                    </a>
                  </li>
                </ul>
              </li>

              `
                : `
              <li class="nav-item d-flex align-items-center mb-2 mb-lg-0">
                <a class="btn btn-login btn-outline-light ms-lg-3 d-flex align-items-center gap-2 fw-bold" 
                  href="#" data-bs-toggle="modal" data-bs-target="#loginModal">
                  <i class="bi bi-box-arrow-in-right"></i>
                  Login
                </a>
              </li>
              <li class="nav-item d-flex align-items-center mb-2 mb-lg-0">
                <a class="btn btn-login btn-outline-light ms-lg-3 d-flex align-items-center gap-2 fw-bold" 
                  href="#" onclick="signinRedirect()">
                  <i class="bi bi-box-arrow-in-right"></i>
                  SignIn
                </a>
              </li>
              `
            }
          </ul>
        </div>
      </div>
    </nav>
  `;

  document.getElementById("navbar-container").innerHTML = navbar;

  // FOOTER
  const footer = `
        <footer class="claimright-footer">
            <div class="footer-container">
                <div class="footer-section footer-about">
                    <h3>About ClaimRight</h3>
                    <p>ClaimRight is a trusted platform dedicated to reuniting people with their lost belongings. We believe every item has a story and deserve to find its way back home.</p>
                    <div class="social-icons">
                        <a href="#"><i class="fab fa-facebook-f"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
                
                <div class="footer-section footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="#"><i class="fas fa-chevron-right"></i> Dashboard</a></li>
                        <li><a href="#"><i class="fas fa-chevron-right"></i> Lost Items</a></li>
                        <li><a href="#"><i class="fas fa-chevron-right"></i> Found Items</a></li>
                        <li><a href="#"><i class="fas fa-chevron-right"></i> About Us</a></li>
                        <li><a href="#"><i class="fas fa-chevron-right"></i> Contact Us</a></li>
                    </ul>
                </div>
                
                <div class="footer-section footer-contact">
                    <h3>Contact Info</h3>
                    <p><i class="fas fa-map-marker-alt"></i> 123 Recovery Street, Colombo, Sri Lanka</p>
                    <p><i class="fas fa-phone"></i> +94 77 123 4567</p>
                    <p><i class="fas fa-envelope"></i> help@claimright.com</p>
                    <p><i class="fas fa-clock"></i> Mon-Fri: 9:00 AM - 6:00 PM</p>
                </div>
                
                <div class="footer-section footer-newsletter">
                    <h3>Newsletter</h3>
                    <p>Subscribe to our newsletter for updates on recovered items and success stories.</p>
                    <form class="newsletter-form">
                        <input type="email" placeholder="Your Email Address" required>
                        <button type="submit"><i class="fas fa-paper-plane"></i></button>
                    </form>
                    <p>By subscribing, you agree to our <a href="#" style="color: #3498db;">Privacy Policy</a></p>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} ClaimRight. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
                <p>Helping people reconnect with what matters.</p>
            </div>
        </footer>
        `;
        
  // Insert footer into the container
  document.getElementById("footer-container").innerHTML = footer;

  // Edit Profile Popup
    const editProfilePopup = `
    <div class="modal fade" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
        
            <div class="modal-header justify-content-center position-relative">
                <h5 class="modal-title fw-bold" id="editProfileModalLabel">Edit Profile</h5>
                <button type="button" class="btn-close position-absolute end-0 me-2" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body">
            <form id="editProfileForm" enctype="multipart/form-data">
                <div class="text-center mb-3 position-relative" style="width: 100px; margin: 0 auto;">
                  <label for="profilePicture" style="cursor: pointer;">
                    <img
                      src="/Front_End/assets/images/avatar-default-icon.png"
                      id="profilePreview"
                      alt="Profile Picture"
                      class="rounded-circle border"
                      width="100"
                      height="100"
                      title="Click to change profile picture"
                    />
                    <span style="
                      position: absolute;
                      bottom: 0;
                      right: 0;
                      background-color: white;
                      border-radius: 50%;
                      padding: 4px;
                      box-shadow: 0 0 5px rgba(0,0,0,0.2);
                      color: black;
                    ">
                      ✎
                    </span>
                  </label>

                  <input type="file" class="form-control form-control-sm d-none" id="profilePicture" accept="image/*">
                </div>



                <div class="mb-3">
                <label for="username" class="form-label fw-bold">Username</label>
                <input type="text" class="form-control" id="username" name="username" required>
                </div>

                <div class="mb-3">
                <label for="email" class="form-label fw-bold">Email address</label>
                <input type="email" class="form-control" id="email" name="email" required>
                </div>

                <div class="mb-3">
                <label for="phone" class="form-label fw-bold">Phone</label>
                <input type="text" class="form-control" id="phone" name="phoneNumber" placeholder="+123456789">
                </div>

                <div class="mb-3 d-none">
                <label for="editPassword" class="form-label">Enter New Password (optional)</label>
                  <div class="form-group password-container" style="position: relative;">
                    <input type="password" class="form-control" name="password" id="editPassword" placeholder="Password">
                    <span class="password-toggle" onclick="togglePassword('editPassword')" style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); cursor: pointer;">
                      <i class="fas fa-eye" id="editPasswordToggleIcon"></i>
                    </span>
                  </div>
                </div>


                <!-- Hidden fields: userId, createdAt, isActive -->
                <input type="hidden" id="userId" name="userId">
                <input type="hidden" id="createdAt" name="createdAt">
                <input type="hidden" id="isActive" name="isActive">
                <input type="hidden" id="profilePictureUrl" name="profilePictureUrl">
            </form>
            </div>

            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" form="editProfileForm" class="btn btn-primary">Save Changes</button>
            </div>

        </div>
        </div>
    </div>
    `;

    document.getElementById("edit-profile-container").innerHTML = editProfilePopup;


    // Login popup
  const loginPopup = `
    <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

        <div class="modal-header">
            <h5 class="modal-title" id="loginModalLabel">Login to ClaimRight</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
            <form id="loginForm">
            <div class="form-group mb-3">
                <input type="email" class="form-control" name="email" id="loginEmail" placeholder="Email Address" required>
            </div>

            <div class="form-group password-container mb-3" style="position: relative;">
                <input type="password" class="form-control" name="password" id="loginPassword" placeholder="Password" required>
                <span class="password-toggle" onclick="togglePassword('loginPassword')" 
                    style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); cursor: pointer;">
                <i class="fas fa-eye" id="loginPasswordToggleIcon"></i>
                </span>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="form-check">
                <input class="form-check-input" type="checkbox" id="rememberMe">
                <label class="form-check-label" for="rememberMe">Remember me</label>
                </div>
                <a href="#" class="text-primary small">Forgot Password?</a>
            </div>

            <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
        </div>

        </div>
    </div>
    </div>
    `;
    document.getElementById("login-popup-container").innerHTML = loginPopup;


    const loadingAnimation = `
      <div id="loadingOverlay" style="display: none;">
        <div class="spinner-border text-primary" role="status"></div>
        <span class="ms-2">Updating profile...</span>
      </div>
    `;
    document.getElementById("loading-animation").innerHTML = loadingAnimation;


// <i class="bi bi-cash-stack"></i>
// <i class="bi bi-currency-dollar"></i>
// <i class="bi bi-wallet2"></i>

});


document.addEventListener('DOMContentLoaded', function() {
            
});



// Set Current data of the user
document.addEventListener("DOMContentLoaded", function () {
  const editModal = document.getElementById("editProfileModal");

  if (editModal) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    editModal.addEventListener("shown.bs.modal", function () {
      if (!user) return;

      document.getElementById("userId").value = user.userId;
      document.getElementById("username").value = user.username;
      document.getElementById("email").value = user.email;
      document.getElementById("phone").value = user.phoneNumber || "";
      document.getElementById("editPassword").value = ""; // cannot show old password only update the password
      document.getElementById("createdAt").value = user.createdAt;
      document.getElementById("isActive").value = user.active;
      document.getElementById("profilePictureUrl").value = user.profilePictureUrl || "";

      const preview = document.getElementById("profilePreview");
      preview.src = user.profilePictureUrl
      ? user.profilePictureUrl
      : "/Front_End/assets/images/avatar-default-icon.png";

    });
  }


  const newsletterForm = document.querySelector('.newsletter-form');
            if (newsletterForm) {
                newsletterForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const emailInput = this.querySelector('input[type="email"]');
                    alert(`Thank you for subscribing with: ${emailInput.value}`);
                    emailInput.value = '';
                });
  }

  loadUserClaimsNotification();

});

document.addEventListener("change", function (e) {
  if (e.target.id === "profilePicture") {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        document.getElementById("profilePreview").src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
});


// Make password visible
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + 'ToggleIcon'); // so 'loginPasswordToggleIcon' or 'editPasswordToggleIcon'

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Logout
function logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser")

    Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been logged out successfully.',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true
    }).then(() => {
        window.location.href = "/Front_End/html/login-signup.html";
    });
}

// Signin redirect
function signinRedirect() {
  window.location.href = "/Front_End/html/login-signup.html";
}



// Claims Notification

async function loadUserClaimsNotification() {
    const userJson = localStorage.getItem("loggedInUser");
    if (!userJson) return;

    try {
        const loggedInUser = JSON.parse(userJson);
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

        // Calculate notification count
        const notifCount =
            sentClaims.filter(c => c.claimStatus !== "PENDING").length +
            receivedClaims.filter(c => c.claimStatus === "PENDING").length;

        updateClaimsNotification(notifCount);

    } catch (error) {
        console.error("Notification load failed:", error);
        updateClaimsNotification(0); // fallback: hide badges
    }
}

function updateClaimsNotification(count) {
    const badge1 = document.getElementById("claims-notification");
    const badge2 = document.getElementById("claims-notification-inline");

    if (badge1) badge1.textContent = count;
    if (badge2) badge2.textContent = count;

    // Hide both if 0
    [badge1, badge2].forEach(badge => {
        if (badge) badge.style.display = count > 0 ? "inline-block" : "none";
    });

    // Hide Quick Actions badge when dropdown is expanded
    const quickActions = document.getElementById("userDropdown");
    if (quickActions) {
        quickActions.addEventListener("show.bs.dropdown", () => {
            if (badge2) badge2.style.display = "none";
        });
        quickActions.addEventListener("hide.bs.dropdown", () => {
            if (badge2 && count > 0) badge2.style.display = "inline-block";
        });
    }
}


