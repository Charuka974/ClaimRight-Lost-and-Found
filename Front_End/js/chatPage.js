document.addEventListener("DOMContentLoaded", function () {
  loadUsers();
  // selectUser(receiverUsername);
});

function toggleUserList() {
  document.querySelector(".user-list").classList.toggle("open");
}

async function loadUsers() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.warn("No access token found.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/claimright/user/getall", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        console.error("Unauthorized or token expired.");
        await Swal.fire({
          icon: "error",
          title: "Unauthorized",
          text: "Your session has expired. Please log in again.",
        });
        // Redirect to login or take appropriate action
      } else {
        console.error(`Error loading users: ${response.status}`);
      }
      return;
    }

    const result = await response.json();
    const users = Array.isArray(result) ? result : result.data || [];

    window.allUsers = users;

    const userListContainer = document.querySelector(".user-list");
    if (!userListContainer) {
      console.error("User list container not found in DOM.");
      return;
    }

    // Clear old user list
    userListContainer.innerHTML = "";

    users.forEach(user => {
      const userDiv = document.createElement("div");
      userDiv.className = "user";
      userDiv.innerText = user.username;
      userDiv.onclick = () => selectUser(user.username);
      userListContainer.appendChild(userDiv);
    });

  } catch (err) {
    console.error("Failed to load users:", err);
  }
}



async function selectUser(username) {
  // Set chat header
  document.getElementById("chatHeader").innerText = username;
  document.getElementById("chatMessages").innerHTML = ""; // Clear old messages

  window.selectedChatUser = username;

  const sender = JSON.parse(localStorage.getItem("loggedInUser"));
  const receiver = window.allUsers.find(user => user.username === username);
  if (!sender || !receiver) return;

  const claimId = null; // Replace with dynamic claim ID if needed

  try {
    const response = await fetch(`http://localhost:8080/claimright/messages/getmessages/conversation/users?userA=${sender.userId}&userB=${receiver.userId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      }
    });


    if (!response.ok) {
      console.error("Failed to fetch messages");
      return;
    }

    const messages = await response.json();

    // Render messages
    const chatMessages = document.getElementById("chatMessages");

    messages.forEach(msg => {
      const msgDiv = document.createElement("div");
      msgDiv.className = msg.senderId === sender.userId ? "message sent" : "message received";
      msgDiv.innerText = msg.content;
      chatMessages.appendChild(msgDiv);
    });

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
    return;
  }

  const messageDTO = {
    content: messageText,
    claimId: 1, // Replace with dynamic claim ID if needed
    senderId: sender.userId,
    receiverId: receiverUser.userId,
    isMsgRead: false,
    sentAt: new Date().toISOString(),
    readAt: null
  };

  try {
    const response = await fetch("http://localhost:8080/claimright/messages/sendmessage", {
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
      return;
    }

    const result = await response.json();
    console.log("Message sent:", result);
    messageInput.value = "";
    selectUser(receiverUsername);


  } catch (err) {
    console.error("Network or server error:", err);
  }
}


