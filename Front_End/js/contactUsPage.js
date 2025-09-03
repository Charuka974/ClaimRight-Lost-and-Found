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


// =============================== Contact page js Functions ===============================

// ===============================
// Contact Page JS
// ===============================

// Containers
const contactForm = document.getElementById("contactForm");
const loadingScreen = document.getElementById("loading-animation"); // optional loading overlay

// API endpoint for sending contact messages
const API_CONTACT = "http://localhost:8080/claimright/contact"; // replace with your real endpoint

// ===============================
// FORM SUBMISSION
// ===============================
contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form values
    const name = document.getElementById("contactUsYourName").value.trim();
    const email = document.getElementById("contactUsYourEmail").value.trim();
    const subject = document.getElementById("contactUsSubject").value.trim();
    const message = document.getElementById("contactUsMessage").value.trim();

    // Basic validation
    if (!name || !email || !subject || !message) {
        Swal.fire({
            icon: "warning",
            title: "Incomplete Form",
            text: "Please fill out all fields before sending."
        });
        return;
    }

    // Optional: Show loading screen
    if (loadingScreen) loadingScreen.style.display = "flex";

    try {
        const response = await fetch(API_CONTACT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, subject, message })
        });

        if (!response.ok) throw new Error("Failed to send message");

        // Success
        Swal.fire({
            icon: "success",
            title: "Message Sent!",
            text: "Thanks for reaching out. We'll get back to you soon.",
            timer: 2000,
            showConfirmButton: false
        });

        // Reset form
        contactForm.reset();

    } catch (error) {
        console.error("Error sending contact message:", error);
        Swal.fire({
            icon: "error",
            title: "Oops!",
            text: "Something went wrong. Please try again later."
        });
    } finally {
        if (loadingScreen) loadingScreen.style.display = "none";
    }
});

function openChat() {
    window.location.href = "/Front_End/html/chat-page.html";
}