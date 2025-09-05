const API_BASE_USER = "http://localhost:8080/claimright/user";

window.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash === "#qrGeneratorCard") {
    const target = document.querySelector(window.location.hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      const input = target.querySelector("#qrText");
      if (input) input.focus();
    }
  }
});


// === QR Code Generator ===
// function generateQR() {
//     const text = document.getElementById("qrText").value;
//     const canvas = document.getElementById("qrCanvas");
//     const downloadLink = document.getElementById("downloadLink");
//     const downloadContainer = document.getElementById("qrDownload");

//     if (!text) {
//       Swal.fire("Oops!", "Please enter text or a URL first.", "warning");
//       return;
//     }

//     QRCode.toCanvas(canvas, text, { 
//       width: 250, 
//       errorCorrectionLevel: "H" 
//     }, function (error) {
//       if (error) console.error(error);

//       // Show download button
//       const dataUrl = canvas.toDataURL("image/png");
//       downloadLink.href = dataUrl;
//       downloadContainer.style.display = "block";
//     });
// }

// Get logged-in user from localStorage
const user = JSON.parse(localStorage.getItem("loggedInUser"));

// Function to generate QR for user
// function generateUserQR() {
//     if (!user) {
//         Swal.fire("Error", "No logged-in user found!", "error");
//         return;
//     }

//     // Prepare user data to encode
//     const userData = {
//         userId: user.userId,
//         username: user.username,
//         email: user.email,
//         phoneNumber: user.phoneNumber,
//         role: user.role,
//     };

//     // Convert to JSON string
//     const jsonString = JSON.stringify(userData);

//     // Get canvas element
//     const canvas = document.getElementById("qrCanvas");
//     if (!canvas) {
//         Swal.fire("Error", "QR canvas not found!", "error");
//         return;
//     }

//     // Generate QR
//     QRCode.toCanvas(canvas, jsonString, {
//         width: 250,
//         errorCorrectionLevel: 'H'
//     }, function (error) {
//         if (error) {
//             console.error(error);
//             Swal.fire("Error", "Failed to generate QR code", "error");
//             return;
//         }

//         // Show download button
//         const downloadLink = document.getElementById("downloadLink");
//         downloadLink.href = canvas.toDataURL("image/png");
//         document.getElementById("qrDownload").style.display = "block";

//         Swal.fire({
//             icon: 'success',
//             title: 'QR Generated!',
//             text: 'Your QR code is ready to scan or download.'
//         });
//     });
// }


// === QR Code Scanner ===
// function onScanSuccess(decodedText, decodedResult) {
//     document.getElementById("scanResult").innerText = decodedText;
//     Swal.fire("QR Code Scanned!", decodedText, "success");
// }

let qrGenerated = false; // track if QR is generated

// Generate simple QR
document.getElementById("qrGenerateBTN").addEventListener("click", generateUserQR);
document.getElementById("generateStickerBtn").addEventListener("click", generateStickerQR);

function generateUserQR() {
    if (!user) {
        Swal.fire("Error", "No logged-in user found!", "error");
        return;
    }

    // Generate site link instead of JSON
    const qrUrl = `http://127.0.0.1:5501/Front_End/html/qr-code-page.html?userId=${user.userId}`;

    const canvas = document.getElementById("qrCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 250;
    canvas.height = 250;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    QRCode.toCanvas(canvas, qrUrl, { width: 250, errorCorrectionLevel: "H" }, function (error) {
        if (error) {
            console.error(error);
            Swal.fire("Error", "Failed to generate QR code", "error");
            return;
        }

        qrGenerated = true;

        // Add site logo in the middle
        const logo = new Image();
        logo.src = "/Front_End/assets/images/ChatGPT Image Jul 24, 2025, 11_16_54 AM copy.png";
        logo.onload = function () {
            const logoSize = 50;
            ctx.drawImage(logo, (canvas.width - logoSize) / 2, (canvas.height - logoSize) / 2, logoSize, logoSize);

            const downloadLink = document.getElementById("qrDownloadLink");
            downloadLink.href = canvas.toDataURL("image/png");
            document.getElementById("qrDownloadContainer").style.display = "block";

            Swal.fire({
                icon: "success",
                title: "QR Generated!",
                text: "Your QR code is ready to scan or download."
            });
        };
    });
}


// Generate sticker
function generateStickerQR() {
    if (!qrGenerated) {
        Swal.fire("Info", "Please generate your QR code first!", "info");
        return;
    }

    // Set the Correct URL after hosting
    const qrUrl = `http://127.0.0.1:5501/Front_End/html/qr-code-page.html?userId=${user.userId}`;

    const canvas = document.getElementById("stickerCanvas");
    const ctx = canvas.getContext("2d");

    const stickerWidth = 300;
    const qrSize = 200;
    const paddingTop = 20;
    const spacing = 30;
    const labelHeight = 20;

    const bgColor = document.getElementById("stickerBgColor")?.value || "#ffffff";
    const textColor = document.getElementById("stickerTextColor")?.value || "#2e4374";
    const fontSize = document.getElementById("stickerFontSize")?.value || 16;

    // Load user-selected or default header logo
    const logoInput = document.getElementById("stickerLogoInput");
    const logo = new Image();
    if (logoInput && logoInput.files.length > 0) {
        logo.src = URL.createObjectURL(logoInput.files[0]);
    } else {
        logo.src = "/Front_End/assets/images/ChatGPT Image Jul 24, 2025, 11_16_54 AM copy.png";
    }

    logo.onload = () => {
        const logoWidth = stickerWidth * 0.6;
        const logoHeight = logoWidth * (logo.height / logo.width);
        const stickerHeight = paddingTop + logoHeight + spacing + qrSize + spacing + labelHeight + 20;

        canvas.width = stickerWidth;
        canvas.height = stickerHeight;

        // Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, stickerWidth, stickerHeight);

        // Draw header logo
        const logoX = (stickerWidth - logoWidth) / 2;
        const logoY = paddingTop;
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

        // Generate QR code
        const qrCanvas = document.createElement("canvas");
        QRCode.toCanvas(qrCanvas, qrUrl, { width: qrSize, errorCorrectionLevel: "H" }, (err) => {
            if (err) {
                console.error(err);
                Swal.fire("Error", "Failed to generate QR code for sticker", "error");
                return;
            }

            // Draw QR
            const qrX = (stickerWidth - qrCanvas.width) / 2;
            const qrY = logoY + logoHeight + spacing;
            ctx.drawImage(qrCanvas, qrX, qrY);

            // Draw username label (for humans only, not encoded)
            ctx.fillStyle = textColor;
            ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(user.username, stickerWidth / 2, qrY + qrCanvas.height + spacing);

            // Show download
            const downloadLinkSticker = document.getElementById("stickerDownloadLink");
            downloadLinkSticker.href = canvas.toDataURL("image/png");
            document.getElementById("stickerDownloadContainer").style.display = "block";

            Swal.fire({
                icon: "success",
                title: "Sticker Generated!",
                text: "Your QR sticker is ready to download."
            });
        });
    };
}


const logoInput = document.getElementById("stickerLogoInput");
const logoPreview = document.getElementById("logoPreview");

logoInput.addEventListener("change", (e) => {
    if (logoInput.files && logoInput.files[0]) {
        const file = logoInput.files[0];
        logoPreview.src = URL.createObjectURL(file);
        logoPreview.style.display = "block";
    } else {
        logoPreview.src = "";
        logoPreview.style.display = "none";
    }
});


let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: 250 },
    false
);

function onScanSuccess(decodedText, decodedResult) {
    try {
        // Stop scanner to prevent duplicate alerts
        html5QrcodeScanner.clear().catch(err => console.error("Failed to clear scanner:", err));

        let userId;

        // Set the Correct URL after hosting
        if (decodedText.startsWith("http://127.0.0.1:5501/Front_End/html/qr-code-page.html")) {
            // Extract userId from query string ?userId=123
            const url = new URL(decodedText);
            userId = url.searchParams.get("userId");
        } else {
            // Fallback: maybe old QR format with raw JSON { userId }
            try {
                const qrData = JSON.parse(decodedText);
                userId = qrData.userId;
            } catch (e) {
                console.error("Invalid QR format:", decodedText);
                Swal.fire("Invalid QR", "This QR code is not recognized by our system.", "error");
                return;
            }
        }

        if (!userId) {
            Swal.fire("Error", "No user ID found in QR code.", "error");
            return;
        }

        const token = localStorage.getItem("accessToken");

        // Fetch user details securely from backend
        fetch(`${API_BASE_USER}/get-by-id/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(apiResponse => {
            if (!apiResponse.data) throw new Error("User not found");
            const user = apiResponse.data;

            Swal.fire({
                title: `User: ${user.username}`,
                html: `<p>Email: ${user.email}</p>
                       <p>Phone: ${user.phoneNumber}</p>
                       <p>Role: ${user.role}</p>`,
                showCancelButton: true,
                confirmButtonText: "Contact User",
                cancelButtonText: "Close"
            }).then(result => {
                if (result.isConfirmed) {
                    localStorage.setItem("scannedUserId", user.userId);
                    window.location.href = "/Front_End/html/chat-page.html";
                } else {
                    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
                }
            });
        })
        .catch(err => {
            console.error(err);
            Swal.fire("Error", "Failed to load user data", "error");
        });

    } catch (err) {
        console.error("Error handling QR:", err);
        Swal.fire("QR Scanned", decodedText, "info");
    }
}


let failCount = 0;
function onScanFailure(error) {
    failCount++;
    if (failCount >= 20) {
        console.warn("Multiple scan attempts failed, check lighting/camera.");
        failCount = 0; // reset
    }
}

html5QrcodeScanner.render(onScanSuccess, onScanFailure);

