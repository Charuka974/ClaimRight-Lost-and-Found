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

// Hide delete buttons when clicking outside any message
document.addEventListener("click", () => {
  document.querySelectorAll(".msg-delete-btn").forEach(btn => btn.style.display = "none");
});


// POLLING: Every 3 seconds, fetch new messages if a user is selected
setInterval(() => {
  if (window.selectedChatUser) {
    selectUser(window.selectedChatUser, true); // true = polling mode
  }
}, 2000);


// Open image in preview
let selectedImageFile = null;

async function sendMessageOrImage() {
  const messageInput = document.getElementById("messageInput");
  const messageText = messageInput.value.trim();
  const sender = JSON.parse(localStorage.getItem("loggedInUser"));
  const receiverUser = window.allUsers.find(u => u.username === window.selectedChatUser);

  if (!sender || !receiverUser) return;

  // Prevent sending empty message if no image is selected
  if (!messageText && !selectedImageFile) return;

  const loadingOverlay = document.getElementById("chatSendingOverlay");

  // Show overlay only when actually sending
  if (loadingOverlay) loadingOverlay.style.display = "flex";

  try {
    const messageDTO = {
      content: messageText || "",
      claimId: 0,
      senderId: sender.userId,
      receiverId: receiverUser.userId,
      isMsgRead: false,
      sentAt: new Date().toISOString(),
      readAt: null
    };

    const formData = new FormData();
    formData.append("message", new Blob([JSON.stringify(messageDTO)], { type: "application/json" }));
    if (selectedImageFile) {
      formData.append("imageFile", selectedImageFile);
    }

    const response = await fetch(`${API_BASE_CHAT}/messages/send-message`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: formData
    });

    if (loadingOverlay) loadingOverlay.style.display = "none"; // hide overlay after send attempt

    if (response.ok) {
      messageInput.value = "";
      if (selectedImageFile) {
        const modal = bootstrap.Modal.getInstance(document.getElementById("imagePreviewModal"));
        modal.hide();
        clearSelectedImage();
      }
      selectUser(receiverUser.username);
    } else {
      const errorText = await response.text();
      Swal.fire("Error", errorText || "Failed to send message.", "error");
    }
  } catch (err) {
    if (loadingOverlay) loadingOverlay.style.display = "none";
    console.error(err);
    Swal.fire("Network error", "Could not send message.", "error");
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
