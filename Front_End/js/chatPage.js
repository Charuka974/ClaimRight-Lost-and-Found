const API_BASE_CHAT = "http://localhost:8080/claimright";
const API_CHAT_WEB_SOCKET = "http://localhost:8080/claimright-web-socket";

document.addEventListener("DOMContentLoaded", async function () {
  await loadUsers(); // Wait until users are loaded and window.allUsers is set

  const token = localStorage.getItem("accessToken");
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const scannedUserId = localStorage.getItem("scannedUserId");

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

  // If we have a scanned user, select them
  if (scannedUserId && window.allUsers) {
    const scannedUser = window.allUsers.find(u => u.userId == scannedUserId);
    if (scannedUser) {
      // Select scanned user and update chat header
      selectUser(scannedUser.username);
    }

    // Clear after use
    localStorage.removeItem("scannedUserId");
  } else if (loggedInUser && loggedInUser.username) {
    // Otherwise, optionally select self for default view
    const self = window.allUsers.find(u => u.username === loggedInUser.username);
    if (self) {
      selectUser(self.username);
    }
  }

  // connectWebSocket();

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
    const response = await fetch(`${API_BASE_CHAT}/user/get-all`, {
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

    renderUserList(users);
    connectWebSocket();

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
    const roleTag = (user.role === 'ADMIN' || user.role === 'SEMI_ADMIN') ? ' (Admin)' : '';
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

  console.log("Users Loaded");
}

// Select users
async function selectUser(username, isPolling = false) {
  window.selectedChatUser = username;// keep for display

  const sender = JSON.parse(localStorage.getItem("loggedInUser"));
  const receiver = window.allUsers.find(user => user.username === username);
  if (!sender || !receiver) return;

  window.selectedChatUserId = receiver.userId;

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
      msgDiv.className = msg.senderId === sender.userId ? "message sent position-relative" : "message received position-relative";

      // Message content
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

      // Only add delete button for own messages
      if (msg.senderId === sender.userId) {
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "msg-delete-btn";
        deleteBtn.innerText = "🗑";
        deleteBtn.onclick = () => deleteMessage(msg.messageId, receiver.username);

        // Initially hidden
        deleteBtn.style.display = "none";

        msgDiv.appendChild(deleteBtn);

        // Show delete button when message is clicked
        msgDiv.addEventListener("click", (e) => {
          // Prevent this click from propagating to the document
          e.stopPropagation();
          
          // hide all other delete buttons
          document.querySelectorAll(".msg-delete-btn").forEach(btn => btn.style.display = "none");
          deleteBtn.style.display = "block";
        });

      }

      chatMessages.appendChild(msgDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (err) {
    console.error("Error loading messages:", err);
  }
}


// Web Socket
//----------------------------------------------------------------------------------------------------------------//
let stompClient = null;

function connectWebSocket() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) return;

  const socket = new SockJS(`${API_CHAT_WEB_SOCKET}/ws-chat`);
  stompClient = Stomp.over(socket);

  // Stop writing logs
  stompClient.debug = () => {};

  stompClient.connect({}, () => {
    console.log("Connected to ClaimRight Chat");

    // Subscribe to messages for this user
    stompClient.subscribe(`/topic/messages/${loggedInUser.userId}`, (msg) => {
      const message = JSON.parse(msg.body);

      // Show message if it's part of the current chat
      if (
        (window.selectedChatUserId === message.senderId) || 
        (window.selectedChatUserId === message.receiverId)
      ) {
          appendMessageToChat(message);
      } else {
          showNewMessageNotification(message);
      }
    });

  });
}

function sendWebSocketMessage(messageDTO, imageFile = null) {
  if (!stompClient || !stompClient.connected) {
    console.error("WebSocket not connected");
    return;
  }

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64 = e.target.result;
      messageDTO.content = "@@__claimRight_img__@@:" + base64;
      stompClient.send("/app/send", {}, JSON.stringify(messageDTO));
    };
    reader.readAsDataURL(imageFile);
  } else {
    stompClient.send("/app/send", {}, JSON.stringify(messageDTO));
  }
}

// Utility to append message to chat window
function appendMessageToChat(msg) {
  const chatMessages = document.getElementById("chatMessages");
  const sender = JSON.parse(localStorage.getItem("loggedInUser"));
  const msgDiv = document.createElement("div");
  msgDiv.className = msg.senderId === sender.userId ? "message sent" : "message received";

  if (msg.content.startsWith("@@__claimRight_img__@@:")) {
    const img = document.createElement("img");
    img.src = msg.content.replace("@@__claimRight_img__@@:", "");
    img.className = "chat-image";
    msgDiv.appendChild(img);
  } else {
    msgDiv.innerText = msg.content;
  }

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

//----------------------------------------------------------------------------------------------------------------//



// Hide delete buttons when clicking outside any message
document.addEventListener("click", () => {
  document.querySelectorAll(".msg-delete-btn").forEach(btn => btn.style.display = "none");
});

// Open image in preview
let selectedImageFile = null;

async function sendMessageOrImage() {
  const messageInput = document.getElementById("messageInput");
  const messageText = messageInput.value.trim();
  const sender = JSON.parse(localStorage.getItem("loggedInUser"));
  const receiverUser = window.allUsers.find(u => u.username === window.selectedChatUser);

  if (!sender || !receiverUser) return;
  if (!messageText && !selectedImageFile) return;

  const loadingOverlay = document.getElementById("chatSendingOverlay");
  if (loadingOverlay) loadingOverlay.style.display = "flex";

  try {
    let contentToSend = messageText || "";

    // Upload image if present
    if (selectedImageFile) {
      const formData = new FormData();
      formData.append("imageFile", selectedImageFile);

      const response = await fetch(`${API_BASE_CHAT}/messages/upload-image`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Failed to upload image");
      const result = await response.json();
      contentToSend = "@@__claimRight_img__@@:" + result.imageUrl;

      // Close the image preview modal after uploading
      const imagePreviewModalEl = document.getElementById("imagePreviewModal");
      const modalInstance = bootstrap.Modal.getInstance(imagePreviewModalEl);
      if (modalInstance) modalInstance.hide();
    }

    // Send message via WebSocket
    const messageDTO = {
      content: contentToSend,
      claimId: 0,
      senderId: sender.userId,
      receiverId: receiverUser.userId,
      isMsgRead: false,
      sentAt: new Date().toISOString(),
      readAt: null
    };

    sendWebSocketMessage(messageDTO);

    // Clear input and selected image
    messageInput.value = "";
    if (selectedImageFile) clearSelectedImage();
    if (loadingOverlay) loadingOverlay.style.display = "none";

  } catch (err) {
    if (loadingOverlay) loadingOverlay.style.display = "none";
    console.error(err);
    Swal.fire("Error", err.message, "error");
  }
}


// Clear selected image
function clearSelectedImage() {
  selectedImageFile = null;
  document.getElementById("modalImagePreview").src = "";
  document.getElementById("fileInput").value = "";
}

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

async function deleteMessage(messageId, receiverUsername) {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  Swal.fire({
    title: "Are you sure?",
    text: "This action will permanently delete the message.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_CHAT}/messages/delete-message/${messageId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Message removed successfully.',
            timer: 1000,
            showConfirmButton: false
          });
          // Refresh chat after deletion
          selectUser(receiverUsername);
        } else {
          const errText = await response.text();
          Swal.fire("Error", errText || "Failed to delete message.", "error");
        }
      } catch (err) {
        console.error("Error deleting message:", err);
        Swal.fire("Network error", "Could not delete message.", "error");
      }
    }
  });
}



// // Clean up WebSocket connection when the page is closed or refreshed
// window.addEventListener("beforeunload", () => {
//   if (stompClient && stompClient.connected) {
//     stompClient.disconnect(() => {
//       console.log("WebSocket disconnected before page unload.");
//     });
//   }
// });
