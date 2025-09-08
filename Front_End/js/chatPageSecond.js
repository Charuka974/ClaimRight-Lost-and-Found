const API_BASE_CHAT = "http://localhost:8080/claimright";
const API_CHAT_WEB_SOCKET = "http://localhost:8080/claimright-web-socket";

document.addEventListener("DOMContentLoaded", async function () {
    await loadUsers(); // Load users with unread counts
    const scannedUserId = localStorage.getItem("scannedUserId");

    if (scannedUserId && window.allUsers) {
        const scannedUser = window.allUsers.find(u => u.userId == scannedUserId);
        if (scannedUser) selectUser(scannedUser.username);
        localStorage.removeItem("scannedUserId");
    } else {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (loggedInUser) {
            const self = window.allUsers.find(u => u.username === loggedInUser.username);
            if (self) selectUser(self.username);
        }
    }
});

// Toggle user list UI
function toggleUserList() {
    document.querySelector(".user-list").classList.toggle("open");
}

// Load all users and unread counts
async function loadUsers() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
        // Load all users
        const resUsers = await fetch(`${API_BASE_CHAT}/user/get-all`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!resUsers.ok) throw new Error("Failed to load users");
        const users = await resUsers.json();
        window.allUsers = Array.isArray(users) ? users : users.data || [];

        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

        // Load unread messages grouped by sender
        const resUnreadBySender = await fetch(`${API_BASE_CHAT}/messages/unread-by-sender/${loggedInUser.userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const unreadCounts = await resUnreadBySender.json(); // [{senderId: 1, unreadCount: 2}, ...]

        // Map unread counts to users
        window.allUsers.forEach(user => {
            const senderUnread = unreadCounts.find(u => u.senderId === user.userId);
            user.unreadCount = senderUnread ? senderUnread.unreadCount : 0;
        });

        renderUserList(window.allUsers);

        // Connect WebSocket after users loaded
        connectWebSocket();

    } catch (err) {
        console.error("Failed to load users:", err);
    }
}

// Render users with unread badges
function renderUserList(users) {
    const usersContainer = document.getElementById("usersContainer");
    if (!usersContainer) return;

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    usersContainer.innerHTML = "";

    if (!users.length) {
        usersContainer.innerHTML = "<p class='text-muted'>No users found.</p>";
        return;
    }

    users.forEach(user => {
        const isMe = loggedInUser.username === user.username;
        const roleTag = (user.role === 'ADMIN' || user.role === 'SEMI_ADMIN') ? ' (Admin)' : '';
        const meTag = isMe ? ' <span class="text-primary fw-bold">(Me)</span>' : '';

        const userDiv = document.createElement("div");
        userDiv.className = "user d-flex align-items-center justify-content-between";
        userDiv.onclick = () => selectUser(user.username);

        userDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${user.profilePictureUrl || '/Front_End/assets/images/avatar-default-icon.png'}"
                     class="user-avatar me-2" alt="${user.username}" />
                <span>${user.username}${roleTag}${meTag}</span>
            </div>
            ${user.unreadCount > 0 ? `<span class="badge bg-danger">${user.unreadCount}</span>` : ''}
        `;

        usersContainer.appendChild(userDiv);
    });
}

// Filter users by search
function filterUsers() {
    const searchTerm = document.getElementById("userSearchInput").value.toLowerCase();
    const filtered = window.allUsers.filter(u => 
        u.username.toLowerCase().includes(searchTerm) || (u.role && u.role.toLowerCase().includes(searchTerm))
    );
    renderUserList(filtered);
}

function clearSearch() {
    document.getElementById("userSearchInput").value = "";
    renderUserList(window.allUsers);
}

// Select a user and load conversation
async function selectUser(username) {
    window.selectedChatUser = username;
    const sender = JSON.parse(localStorage.getItem("loggedInUser"));
    const receiver = window.allUsers.find(u => u.username === username);
    if (!sender || !receiver) return;
    window.selectedChatUserId = receiver.userId;

    const chatHeader = document.getElementById("chatHeader");
    chatHeader.innerHTML = `
        <img src="${receiver.profilePictureUrl || '/Front_End/assets/images/avatar-default-icon.png'}"
             class="header-avatar me-2" alt="${receiver.username}" />
        <span>${receiver.username}${(receiver.role === 'ADMIN' || receiver.role === 'EMPLOYEE') ? ' (' + receiver.role + ')' : ''}</span>
    `;

    try {
        const res = await fetch(`${API_BASE_CHAT}/messages/get-messages/conversation/users?userA=${sender.userId}&userB=${receiver.userId}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` }
        });
        const messages = await res.json();
        const chatMessages = document.getElementById("chatMessages");
        chatMessages.innerHTML = "";
        messages.forEach(msg => appendMessageToChat(msg));
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Mark messages as read
        await fetch(`${API_BASE_CHAT}/messages/mark-read/conversation?userA=${sender.userId}&userB=${receiver.userId}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` }
        });

        // Reset unread count for this user
        receiver.unreadCount = 0;
        renderUserList(window.allUsers);

    } catch (err) {
        console.error("Error loading messages:", err);
    }
}

// Append single message to chat
// Track the currently visible delete button
let activeDeleteBtn = null;

function appendMessageToChat(msg) {
    const chatMessages = document.getElementById("chatMessages");
    const sender = JSON.parse(localStorage.getItem("loggedInUser"));
    const isSentByMe = msg.senderId === sender.userId;

    const msgDiv = document.createElement("div");
    msgDiv.className = isSentByMe ? "message sent" : "message received";
    msgDiv.style.position = "relative";

    // Message content
    if (msg.content.startsWith("@@__claimRight_img__@@:")) {
        const img = document.createElement("img");
        img.src = msg.content.replace("@@__claimRight_img__@@:", "");
        img.className = "chat-image";
        msgDiv.appendChild(img);
    } else {
        const textSpan = document.createElement("span");
        textSpan.innerText = msg.content;
        msgDiv.appendChild(textSpan);
    }

    if (isSentByMe) {
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-danger ms-2 msg-delete-btn";
        deleteBtn.innerText = "Delete";
        deleteBtn.style.display = "none";

        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteMessage(msg.messageId, window.selectedChatUser);
        };

        msgDiv.appendChild(deleteBtn);

        // Toggle visibility on message click
        msgDiv.addEventListener("click", (e) => {
            e.stopPropagation();

            // Hide previous active button
            if (activeDeleteBtn && activeDeleteBtn !== deleteBtn) {
                activeDeleteBtn.style.display = "none";
            }

            // Toggle this button
            deleteBtn.style.display = deleteBtn.style.display === "none" ? "inline-block" : "none";
            activeDeleteBtn = deleteBtn.style.display === "inline-block" ? deleteBtn : null;
        });
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide delete button if clicking outside
document.addEventListener("click", () => {
    if (activeDeleteBtn) {
        activeDeleteBtn.style.display = "none";
        activeDeleteBtn = null;
    }
});


// WebSocket connection
let stompClient = null;
function connectWebSocket() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;

    const socket = new SockJS(`${API_CHAT_WEB_SOCKET}/ws-chat`);
    stompClient = Stomp.over(socket);
    stompClient.debug = () => {};

    stompClient.connect({}, () => {
        console.log("Connected to chat WebSocket");

        stompClient.subscribe(`/topic/messages/${loggedInUser.userId}`, (msg) => {
            const message = JSON.parse(msg.body);
            const receiverId = message.receiverId;
            const senderId = message.senderId;

            if (window.selectedChatUserId === senderId || window.selectedChatUserId === receiverId) {
                appendMessageToChat(message);
            } else {
                // Increment unread count for sender
                const senderUser = window.allUsers.find(u => u.userId === senderId);
                if (senderUser) {
                    senderUser.unreadCount = (senderUser.unreadCount || 0) + 1;
                    renderUserList(window.allUsers);
                }
            }
        });
    });
}

// Send message or image
async function sendMessageOrImage() {
    const messageInput = document.getElementById("messageInput");
    const messageText = messageInput.value.trim();
    const sender = JSON.parse(localStorage.getItem("loggedInUser"));
    const receiver = window.allUsers.find(u => u.username === window.selectedChatUser);
    if (!sender || !receiver) return;
    if (!messageText && !selectedImageFile) return;

    let contentToSend = messageText || "";

    if (selectedImageFile) {
        const formData = new FormData();
        formData.append("imageFile", selectedImageFile);
        const res = await fetch(`${API_BASE_CHAT}/messages/upload-image`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` },
            body: formData
        });
        const result = await res.json();
        contentToSend = "@@__claimRight_img__@@:" + result.imageUrl;
        clearSelectedImage();
    }

    const messageDTO = {
        content: contentToSend,
        claimId: 0,
        senderId: sender.userId,
        receiverId: receiver.userId,
        isMsgRead: false,
        sentAt: new Date().toISOString(),
        readAt: null
    };

    sendWebSocketMessage(messageDTO);
    messageInput.value = "";
}

// Clear selected image
let selectedImageFile = null;
function clearSelectedImage() {
    selectedImageFile = null;
    document.getElementById("modalImagePreview").src = "";
    document.getElementById("fileInput").value = "";
}
function handleFileUpload(event) {
    selectedImageFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById("modalImagePreview").src = e.target.result;
        const modal = new bootstrap.Modal(document.getElementById("imagePreviewModal"));
        modal.show();
    };
    reader.readAsDataURL(selectedImageFile);
}

// Delete message
async function deleteMessage(messageId, receiverUsername) {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete the message.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`${API_BASE_CHAT}/messages/delete-message/${messageId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Message removed.', timer: 1000, showConfirmButton: false });
            selectUser(receiverUsername);
        } else {
            Swal.fire("Error", await res.text() || "Failed to delete message", "error");
        }
    } catch (err) {
        console.error(err);
        Swal.fire("Network Error", "Could not delete message.", "error");
    }
}

// Send message via WebSocket
function sendWebSocketMessage(messageDTO) {
    if (!stompClient || !stompClient.connected) {
        console.error("WebSocket not connected");
        return;
    }
    stompClient.send("/app/send", {}, JSON.stringify(messageDTO));
}

