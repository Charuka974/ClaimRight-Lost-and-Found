document.addEventListener("DOMContentLoaded", function () {
  const userJson = localStorage.getItem("loggedInUser");

  if (!userJson) return;

  const user = JSON.parse(userJson);

  if (user.role === "ADMIN" && user.active === true) {
    const btn = document.createElement("button");
    btn.className = "floating-page-btn floating-user-nav-btn";
    btn.innerHTML = `<i class="bi bi-person-circle"></i>&nbsp;&nbsp;Manage Users`;
    btn.onclick = openUserManage; 

    document.body.appendChild(btn);
  }
  
});



function openChat() {
    window.location.href = "/Front_End/html/chat-page.html";
}

function openUserManage() {
    window.location.href = "/Front_End/html/manage-users.html";
}


// Redirect to login if user is not logged in or when you logout
// const user = localStorage.getItem("loggedInUser");
//   if (!user) {
//     window.location.href = "/Front_End/html/login-signup.html";
// }

// function logout() {
//     localStorage.removeItem("loggedInUser");
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("currentUser")

//     // Optional: Show confirmation
//     Swal.fire({
//         icon: 'success',
//         title: 'Logged Out',
//         text: 'You have been logged out successfully.'
//     }).then(() => {
//         // Redirect to login or home page
//         window.location.href = "/Front_End/html/login-signup.html";
//     });
// }