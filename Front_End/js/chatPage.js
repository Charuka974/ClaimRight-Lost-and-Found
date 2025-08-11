const API_BASE_CHAT = "http://localhost:8080/claimright";

document.addEventListener("DOMContentLoaded", async function () {
  await loadUsers(); // Wait until users are loaded and window.allUsers is set

  const token = localStorage.getItem("accessToken");
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  // if (!token && !loggedInUser) {
  //   console.warn("Login first");

  //   Swal.fire({
  //     icon: 'error',
  //     title: 'User not Found',
  //     text: 'Login First',
  //     timer: 1000,
  //     showConfirmButton: false,
  //     allowOutsideClick: false,
  //     allowEscapeKey: false,
  //     didClose: () => {
  //       window.location.href = "/Front_End/html/login-signup.html";
  //     }
  //   });

  //   return;
  // }

  
  if (loggedInUser && loggedInUser.username) {
    const self = window.allUsers?.find(u => u.username === loggedInUser.username);
    if (self) {
      selectUser(self.username);
    }
  }

});


function toggleUserList() {
  document.querySelector(".user-list").classList.toggle("open");
}

// Load all users
async function loadUsers() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.warn("No access token found."); 
    return;
  }

  try {
    const response = await fetch(`${API_BASE_CHAT}/user/get-all`, {  // get API_BASE - from parent
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        console.error("Unauthorized or token expired.");

        Swal.fire({
          icon: 'error',
          title: 'Unauthorized!',
          text: 'Your session has expired. Please log in again.',
          timer: 2500,
          showConfirmButton: false
        });
        return;
      } else {
        console.error(`Error loading users: ${response.status}`);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to load users.',
        });
      }
      return;
    }

    const result = await response.json();
    const users = Array.isArray(result) ? result : result.data || [];

    window.allUsers = users;

    // Call the new rendering function
    renderUserList(users);

  } catch (err) {
    console.error("Failed to load users:", err);
    Swal.fire({
      icon: 'error',
      title: 'Network Error!',
      text: 'Could not connect to the server.',
    });
  }
}


// Search users
function filterUsers() {
  const input = document.getElementById("userSearchInput");
  const searchTerm = input.value.toLowerCase();

  const filteredUsers = window.allUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm) || 
    (user.role && user.role.toLowerCase().includes(searchTerm))
  );

  renderUserList(filteredUsers);
}
function clearSearch() {
  const input = document.getElementById("userSearchInput");
  input.value = "";
  renderUserList(window.allUsers);
}


// Render users
function renderUserList(users) {
  const usersContainer = document.getElementById("usersContainer");
  if (!usersContainer) {
    console.error("Users container not found in DOM.");
    return;
  }

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  usersContainer.innerHTML = "";

  if (users.length === 0) {
    usersContainer.innerHTML = "<p class='text-muted'>No users found.</p>";
    return;
  }

  users.forEach(user => {
    const isMe = loggedInUser && user.username === loggedInUser.username;
    const roleTag = (user.role === 'ADMIN' || user.role === 'EMPLOYEE') ? ` (${user.role})` : '';
    const meTag = isMe ? ' <span class="text-primary fw-bold">(Me)</span>' : '';

    const userDiv = document.createElement("div");
    userDiv.className = "user d-flex align-items-center";
    userDiv.onclick = () => selectUser(user.username);

    userDiv.innerHTML = `
      <img src="${user.profilePictureUrl || '/Front_End/assets/images/avatar-default-icon.png'}" 
           class="user-avatar me-2" alt="${user.username}" />
      <span>
        ${user.username}${roleTag}${meTag}
      </span>
    `;

    usersContainer.appendChild(userDiv);
  });
}


// Select users
async function selectUser(username, isPolling = false) {
  window.selectedChatUser = username;

  const sender = JSON.parse(localStorage.getItem("loggedInUser"));
  const receiver = window.allUsers.find(user => user.username === username);
  if (!sender || !receiver) return;

  // Move this AFTER receiver is defined
  if (!isPolling) {
    const chatHeader = document.getElementById("chatHeader");
    const isMe = receiver.username === sender.username;

    chatHeader.innerHTML = `
      <img src="${receiver.profilePictureUrl || '/Front_End/assets/images/avatar-default-icon.png'}" 
          class="header-avatar me-2" alt="${receiver.username}" />
      <span>
        ${isMe 
          ? 'My Contact' 
          : `${receiver.username}${(receiver.role === 'ADMIN' || receiver.role === 'EMPLOYEE') ? ' (' + receiver.role + ')' : ''}`
        }
      </span>
    `;
      // <span>${receiver.username}${'('+receiver.role+')'}${isMe ? ' (Me)' : ''}</span>

  }

  try {
    const response = await fetch(`${API_BASE_CHAT}/messages/get-messages/conversation/users?userA=${sender.userId}&userB=${receiver.userId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch messages");
      return;
    }

    const messages = await response.json();
    const chatMessages = document.getElementById("chatMessages");

    if (!isPolling) {
      chatMessages.innerHTML = "";
    } else {
      if (messages.length === chatMessages.children.length) return;
      chatMessages.innerHTML = "";
    }

    messages.forEach(msg => {
      const msgDiv = document.createElement("div");
      msgDiv.className = msg.senderId === sender.userId ? "message sent" : "message received";

      if (msg.content.startsWith("@@__claimRight_img__@@:")) {
        const img = document.createElement("img");
        const imgUrl = msg.content.replace("@@__claimRight_img__@@:", "");
        img.src = imgUrl;
        img.alt = "Sent Image";
        img.className = "chat-image";
        img.style.cursor = "pointer";
        img.addEventListener("click", () => {
          document.getElementById("chatModalImage").src = imgUrl;
          const modal = new bootstrap.Modal(document.getElementById("chatImageViewModal"));
          modal.show();
        });

        msgDiv.appendChild(img);
      } else {
        msgDiv.innerText = msg.content;
      }

      chatMessages.appendChild(msgDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (err) {
    console.error("Error loading messages:", err);
  }
}


async function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const messageText = messageInput.value.trim();

  const sender = JSON.parse(localStorage.getItem("loggedInUser"));
  const receiverUsername = window.selectedChatUser;

  if (!messageText || !sender || !receiverUsername) {
    console.error("Missing message text, sender info, or selected user.");
    return;
  }

  const receiverUser = window.allUsers.find(user => user.username === receiverUsername);
  if (!receiverUser) {
    console.error("Receiver user not found.");
    Swal.fire({
      icon: 'error',
      title: 'User not found',
      text: 'Could not find the selected user.',
    });
    return;
  }

  const messageDTO = {
    content: messageText,
    claimId: 0, // change dynamically if needed
    senderId: sender.userId,
    receiverId: receiverUser.userId,
    isMsgRead: false,
    sentAt: new Date().toISOString(),
    readAt: null
  };

  try {
    const response = await fetch(`${API_BASE_CHAT}/messages/send-message`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messageDTO)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Failed to send message:", errText);
      Swal.fire({
        icon: 'error',
        title: 'Failed to send',
        text: errText || 'Server error while sending the message.',
      });
      return;
    }

    const result = await response.json();
    // console.log("Message sent:", result);
    messageInput.value = "";
    selectUser(receiverUsername); // Refresh chat

  } catch (err) {
    console.error("Network or server error:", err);
    Swal.fire({
      icon: 'error',
      title: 'Network Error',
      text: 'Message could not be sent. Try again later.',
    });
  }
}

// POLLING: Every 3 seconds, fetch new messages if a user is selected
setInterval(() => {
  if (window.selectedChatUser) {
    selectUser(window.selectedChatUser, true); // true = polling mode
  }
}, 2000);


// Open image in preview
let selectedImageFile = null;

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedImageFile = file;

  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById("modalImagePreview");
    preview.src = e.target.result;

    const modal = new bootstrap.Modal(document.getElementById("imagePreviewModal"));
    modal.show();
  };
  reader.readAsDataURL(file);
}


// Clear selected image
function clearSelectedImage() {
  selectedImageFile = null;
  document.getElementById("modalImagePreview").src = "";
  document.getElementById("fileInput").value = "";
}

// Send image
async function sendSelectedImage() {
  if (!selectedImageFile) return;

  const imgUrl = await uploadToImgBB(selectedImageFile);
  if (!imgUrl) {
    Swal.fire("Upload failed", "Could not upload the image.", "error");
    return;
  }

  const sender = JSON.parse(localStorage.getItem("loggedInUser"));
  const receiverUsername = window.selectedChatUser;
  const receiverUser = window.allUsers.find(u => u.username === receiverUsername);
  if (!sender || !receiverUser) return;

  const messageDTO = {
    content: `@@__claimRight_img__@@:${imgUrl}`, // Use marker to identify image content
    claimId: 0,
    senderId: sender.userId,
    receiverId: receiverUser.userId,
    isMsgRead: false,
    sentAt: new Date().toISOString(),
    readAt: null
  };


  try {
    const response = await fetch(`${API_BASE_CHAT}/messages/send-message`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messageDTO)
    });

    if (response.ok) {
      const modal = bootstrap.Modal.getInstance(document.getElementById("imagePreviewModal"));
      modal.hide();
      clearSelectedImage();
      selectUser(receiverUsername); // reload chat
    } else {
      const errorText = await response.text();
      Swal.fire("Error", errorText || "Failed to send image.", "error");
    }
  } catch (error) {
    console.error("Error sending image:", error);
    Swal.fire("Network error", "Could not send image.", "error");
  }
}


// Upload image to imgBB
async function uploadToImgBB(file) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("No access token");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_CHAT}/api/image/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed:", errorText);
      return null;
    }

    const result = await response.text(); // Controller returns plain text (image URL)
    return result;

  } catch (error) {
    console.error("Error uploading to backend:", error);
    return null;
  }
}

