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
const loadingOverlay = document.getElementById("loadingOverlay");

// API endpoints for sending emails
const API_EMAIL_HTML = "http://localhost:8080/claimright/sendemail/send-html";
const ADMIN_EMAIL = "gourmetdelight24@gmail.com";

contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contactUsYourName").value.trim();
    const email = document.getElementById("contactUsYourEmail").value.trim();
    const subject = document.getElementById("contactUsSubject").value.trim();
    const message = document.getElementById("contactUsMessage").value.trim();

    if (!name || !email || !subject || !message) {
        Swal.fire({
            icon: "warning",
            title: "Incomplete Form",
            text: "Please fill out all fields before sending."
        });
        return;
    }

    if (loadingOverlay) loadingOverlay.style.display = "flex"; // show overlay

    const token = localStorage.getItem("accessToken");
    if (!token) {
        if (loadingOverlay) loadingOverlay.style.display = "none";
        await Swal.fire({
            icon: "error",
            title: "Unauthorized",
            text: "You must be logged in to contact the admin.",
            confirmButtonColor: "#d33",
        });
        return;
    }

    try {
        // Include sender's name and email in the HTML message
        const htmlMessage = `
            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
        `;

        const payload = {
            to: ADMIN_EMAIL,
            subject: subject,
            htmlBody: htmlMessage,   // include sender info
            fromUser: `${name} <${email}>`
        };

        const response = await fetch(API_EMAIL_HTML, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Failed to send email");

        Swal.fire({
            icon: "success",
            title: "Message Sent!",
            text: "Thanks for reaching out. We'll get back to you soon.",
            timer: 2000,
            showConfirmButton: false
        });

        contactForm.reset();
    } catch (error) {
        console.error("Error sending contact message:", error);
        Swal.fire({
            icon: "error",
            title: "Oops!",
            text: "Something went wrong. Please try again later."
        });
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = "none";
    }
});

function openChat() {
    window.location.href = "/Front_End/html/chat-page.html";
}