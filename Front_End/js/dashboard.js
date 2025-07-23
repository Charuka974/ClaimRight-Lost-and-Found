
// Redirect to login if user is not logged in or when you logout
// const user = localStorage.getItem("loggedInUser");
//   if (!user) {
//     window.location.href = "/Front_End/html/login-signup.html";
// }

function logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser")

    // Optional: Show confirmation
    Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been logged out successfully.'
    }).then(() => {
        // Redirect to login or home page
        window.location.href = "/Front_End/html/login-signup.html";
    });
}
