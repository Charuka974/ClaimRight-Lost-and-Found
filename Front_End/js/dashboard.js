
// Redirect to login if user is not logged in or when you logout
// const user = localStorage.getItem("loggedInUser");
//   if (!user) {
//     window.location.href = "/Front_End/html/login-signup.html";
// }

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "/Front_End/html/login-signup.html";
}
