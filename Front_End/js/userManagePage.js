document.addEventListener("DOMContentLoaded", function () {
  redirectIfNotAdmin();
  
});

function redirectIfNotAdmin() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || user.role !== "ADMIN" || user.active !== true) {
    window.location.href = "/Front_End/html/dashboard.html";
  }
}

// Manage Users

const API_BASE = "http://localhost:8080/claimright/user";
const token = localStorage.getItem("accessToken");
const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
let currentPage = 0;
let debounceTimer;

document.addEventListener("DOMContentLoaded", () => {
  if (!loggedUser || loggedUser.role !== "ADMIN") {
    window.location.href = "/Front_End/html/dashboard.html";
    return;
  }

  fetchUsers(currentPage);

  document.getElementById("searchInput").addEventListener("input", (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (query) {
        searchUsers(query);
      } else {
        fetchUsers(0);
      }
    }, 300);
  });

  document.getElementById("clearSearch").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    fetchUsers(0);
  });
});

async function fetchUsers(page) {
  currentPage = page;
  try {
    const res = await fetch(`${API_BASE}/paginatedusers?page=${page}&size=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data } = await res.json();
    renderUsers(data.content);
    renderPagination(data.totalPages, page);
  } catch (err) {
    console.error("Failed to fetch users", err);
  }
}

async function searchUsers(keyword) {
  try {
    const res = await fetch(`${API_BASE}/search/${encodeURIComponent(keyword)}?page=0&size=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data } = await res.json();
    renderUsers(data.content);
    renderPagination(data.totalPages, 0);
  } catch {
    Swal.fire("Error", "Search failed", "error");
  }
}

// function renderUsers(users) {
//   const tbody = document.getElementById("userTableBody");
//   tbody.innerHTML = users.map(user => `
//     <tr>
//       <td><img src="${user.profilePictureUrl || '/Front_End/assets/images/avatar-default-icon.png'}" class="rounded-circle shadow" width="40" height="40" /></td>
//       <td class="fw-semibold">${user.username}</td>
//       <td>${user.email}</td>
//       <td>${user.phoneNumber || '-'}</td>
//       <td><span class="badge bg-${user.active ? 'success' : 'secondary'}">${user.active ? 'Active' : 'Inactive'}</span></td>
//       <td><span class="text-primary">${user.role}</span></td>
//       <td>
//         <button class="btn btn-sm btn-outline-warning me-2" 
//                 onclick="toggleStatus(${user.userId}, ${user.active})" 
//                 ${user.userId === loggedUser.userId ? 'disabled title="You cannot change your own status"' : ''}>
//           ${user.active ? 'Deactivate' : 'Activate'}
//         </button>
//       </td> 
//     </tr>
//   `).join('');
// }

function renderUsers(users) {
  const container = document.getElementById("userTablesByRole");
  container.innerHTML = "";

  const usersByRole = {};

  users.forEach(user => {
    const role = user.role || "UNKNOWN";
    if (!usersByRole[role]) {
      usersByRole[role] = [];
    }
    usersByRole[role].push(user);
  });

  // Define custom role order with ADMIN first
  const roleOrder = ["ADMIN", ...Object.keys(usersByRole).filter(r => r !== "ADMIN")];

  roleOrder.forEach(role => {
    if (!usersByRole[role]) return; // Skip roles not in data

    const tableHTML = `
      <h4 class="mt-4 text-center">${role.charAt(0) + role.slice(1).toLowerCase()}s</h4>
      <table class="table table-striped table-bordered">
        <thead class="table-light">
          <tr>
            <th>Avatar</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${usersByRole[role].map(user => `
            <tr>
              <td><img src="${user.profilePictureUrl || '/Front_End/assets/images/avatar-default-icon.png'}" class="rounded-circle shadow" width="40" height="40" /></td>
              <td class="fw-semibold">${user.username}</td>
              <td>${user.email}</td>
              <td>${user.phoneNumber || '-'}</td>
              <td><span class="badge bg-${user.active ? 'success' : 'secondary'}">${user.active ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button class="btn btn-sm ${user.active ? 'btn-warning' : 'btn-success'} me-2 d-flex align-items-center gap-1" 
                        onclick="toggleStatus(${user.userId}, ${user.active})" 
                        ${user.userId === loggedUser.userId ? 'disabled title="You cannot change your own status"' : ''}>
                  <i class="bi ${user.active ? 'bi-person-dash' : 'bi-person-check'}"></i>
                  <span class="fw-bold">${user.active ? 'Deactivate' : 'Activate'}</span>
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    container.innerHTML += tableHTML;
  });
}


// <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.userId})">Delete</button>

function renderPagination(totalPages, activePage) {
  const pagination = document.getElementById("paginationContainer");
  pagination.innerHTML = "";

  for (let i = 0; i < totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === activePage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
    li.onclick = () => fetchUsers(i);
    pagination.appendChild(li);
  }
}

async function toggleStatus(userId, isActive) {
  if (loggedUser && userId === loggedUser.userId) {
    Swal.fire("Warning", "You cannot change your own status.", "warning");
    return;
  }

  const endpoint = `${API_BASE}/${isActive ? 'changestatusdeactivate' : 'changestatusactivate'}/${userId}`;
  try {
    await fetch(endpoint, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    Swal.fire("Success", "User status updated", "success");
    fetchUsers(currentPage);
  } catch {
    Swal.fire("Error", "Status change failed", "error");
  }
}


// async function deleteUser(userId) {
//   const confirm = await Swal.fire({
//     icon: "warning",
//     title: "Delete User?",
//     text: "This action is irreversible.",
//     showCancelButton: true,
//     confirmButtonColor: "#d33",
//     confirmButtonText: "Yes, delete",
//   });

//   if (confirm.isConfirmed) {
//     try {
//       await fetch(`${API_BASE}/deleteUser/${userId}`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       Swal.fire("Deleted", "User removed", "success");
//       fetchUsers(currentPage);
//     } catch {
//       Swal.fire("Error", "User deletion failed", "error");
//     }
//   }
// }


