const API_PAYMENTS = 'http://localhost:8080/claimright/payments';
let stripe, elements, paymentElement, clientSecret;

document.addEventListener("DOMContentLoaded", async () => {
  stripe = Stripe("pk_test_51S5j4qQyZBVCuvZZ2fVhQ77PPHSJpucR4pgZvAeVZ6zJMSzwhFkV3ZJyvpJT5iB6fTCoZl391v8vYMI8D3hJGGXt007hyw2a4j");

  const modalEl = document.getElementById('securePaymentModal');
  modalEl.addEventListener('shown.bs.modal', async () => {
    await createPaymentIntent();
    if (!clientSecret) return;

    if (!elements) {
      elements = stripe.elements({ clientSecret });
    }

    if (!paymentElement) {
      // Force country to US for testing to avoid processing errors
      paymentElement = elements.create("payment", {
        fields: { billingDetails: "auto" },
        defaultValues: { billingDetails: { address: { country: "US" } } }
      });
      paymentElement.mount("#payment-element");
    }
  });

  document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await pay();
  });
});


async function createPaymentIntent(amount, type, payerId, receiverId, lostItemId, foundItemId) {
  const overlay = document.getElementById("loadingOverlay");
  overlay.style.display = "flex"; // show loading overlay

  try {
    const token = localStorage.getItem("accessToken");
    const userJsonStr = localStorage.getItem("loggedInUser");
    const userJson = JSON.parse(userJsonStr);

    const payload = {
      amount: 10,
      type: "REWARD",
      payerId: userJson.userId,
      receiverId: receiverId || null,
      lostItemId: lostItemId || null,
      foundItemId: null
    };

    // const amountInput = document.getElementById('amount-input').value;
    // const payload = {
    //   amount: parseFloat(amountInput),
    //   type: "REWARD",
    //   payerId: userJson.userId,
    //   receiverId: receiverId || null,
    //   lostItemId: lostItemId || null,
    //   foundItemId: null
    // };

    const response = await fetch(`${API_PAYMENTS}/create-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed to create payment intent");
    const data = await response.json();
    clientSecret = data.clientSecret;

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: err.message || "Payment initialization failed" });
  } finally {
    overlay.style.display = "none"; // hide loading overlay
  }
}
  
 
async function pay() {
  const overlay = document.getElementById("loadingOverlay");
  overlay.style.display = "flex"; // show loading overlay

  try {
    if (!clientSecret) throw new Error("Payment not initialized");

    // Validate first
    const { error: submitError } = await elements.submit();
    if (submitError) {
      Swal.fire({ icon: "error", title: "Validation failed", text: submitError.message });
      return;
    }

    // Confirm payment (stay on same page for test)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      redirect: "if_required"
    });

    // Handle errors
    if (error) {
      let message = error.message || "Payment failed";
      switch (error.code) {
        case "card_declined": message = "Your card was declined."; break;
        case "insufficient_funds": message = "Your card has insufficient funds."; break;
        case "incorrect_cvc": message = "The CVC code is incorrect."; break;
        case "expired_card": message = "This card has expired."; break;
        case "processing_error": message = "A processing error occurred. Please try again."; break;
      }
      Swal.fire({ icon: "error", title: "Payment failed", text: message });
      return;
    }

    // Payment succeeded
    if (paymentIntent?.status === "succeeded") {
      Swal.fire({ icon: "success", title: "Payment successful", timer: 2000, showConfirmButton: false });
    } 
    else if (paymentIntent?.status === "requires_action") {
      Swal.fire({ icon: "info", title: "Authentication required", text: "Please complete 3D Secure authentication." });
    } 
    else {
      Swal.fire({ icon: "info", title: "Payment status", text: `Status: ${paymentIntent?.status}` });
    }

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: err.message || "Payment failed" });
  } finally {
    overlay.style.display = "none"; // hide overlay after completion
  }
}



function openPaymentModal() {
  const amount = document.getElementById('amount-input').value; // get input value
  if (!amount || amount <= 0) {
    Swal.fire({ icon: 'error', title: 'Invalid amount', text: 'Please enter a valid payment amount' });
    return;
  }

  const modal = new bootstrap.Modal(document.getElementById('securePaymentModal'), {
    backdrop: false,   // no backdrop created
    keyboard: true     // allow Esc key to close
  });

  // const modal = new bootstrap.Modal(document.getElementById('securePaymentModal'));
  document.getElementById('payment-amount').textContent = `$${amount}`; // display in modal
  modal.show();
}


function openFloatOptionHelp() {
  window.location.href = "/Front_End/html/chat-page.html";
}

function openFloatOptionSecure() {
  const modal = new bootstrap.Modal(document.getElementById('securePaymentDetailModal'));
  modal.show();
}

