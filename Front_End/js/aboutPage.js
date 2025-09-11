// About Page Interactivity & Animations

document.addEventListener("DOMContentLoaded", () => {
  // Animate fade-in elements on scroll
  const fadeEls = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.2 });

  fadeEls.forEach(el => observer.observe(el));

  // SweetAlert welcome popup (optional)
  if (!sessionStorage.getItem("aboutVisited")) {
    Swal.fire({
      title: "Welcome to ClaimRight!",
      text: "Discover how we help reunite people with their belongings.",
      icon: "info",
      confirmButtonText: "Got it",
      confirmButtonColor: "#4e73df"
    });
    sessionStorage.setItem("aboutVisited", "true");
  }




});


