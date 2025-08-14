const API_BASE_USER = "http://localhost:8080/claimright/user";
const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
let currentPage = 0;
let debounceTimer;

/* -----------------------
   TOKEN + FETCH HANDLER
----------------------- */
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.exp * 1000) < Date.now();
  } catch (e) {
    return true; // invalid or missing token
  }
}

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("accessToken");

  // Token missing or expired → alert + redirect
  if (!token || isTokenExpired(token)) { 
    await Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      text: 'Please log in again to continue.',
      confirmButtonText: 'Login'
    });
    localStorage.removeItem("accessToken");
    window.location.href = "/Front_End/html/login-signup.html";
    throw new Error("Token expired or missing");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  // If server rejects token (403)
  if (response.status === 403) {
    await Swal.fire({
      icon: 'warning',
      title: 'Session Expired',
      text: 'Please log in again to continue.',
      confirmButtonText: 'Login'
    });
    localStorage.removeItem("accessToken");
    window.location.href = "/Front_End/html/login-signup.html";
    throw new Error("Forbidden - token invalid");
  }

  return response;
}

/* -----------------------
   PAGE INIT
----------------------- */
document.addEventListener("DOMContentLoaded", () => {
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

/* -----------------------
   FETCH USERS
----------------------- */
async function fetchUsers(page) {
  currentPage = page;
  try {
    const res = await apiFetch(`${API_BASE_USER}/paginated-users?page=${page}&size=5`);
    const { data } = await res.json();
    renderUsers(data.content);
    renderPagination(data.totalPages, page);
  } catch (err) {
    console.error("Failed to fetch users", err);
  }
}

async function searchUsers(keyword) {
  try {
    const res = await apiFetch(`${API_BASE_USER}/search/${encodeURIComponent(keyword)}?page=0&size=5`);
    const { data } = await res.json();
    renderUsers(data.content);
    renderPagination(data.totalPages, 0);
  } catch {
    Swal.fire("Error", "Search failed", "error");
  }
}

/* -----------------------
   RENDER USERS
----------------------- */
function renderUsers(users) {
  const container = document.getElementById("userTablesByRole");
  container.innerHTML = "";

  // Group users by role
  const usersByRole = {};
  users.forEach(user => {
    const role = user.role || "UNKNOWN";
    if (!usersByRole[role]) usersByRole[role] = [];
    usersByRole[role].push(user);
  });

  // Role display formatter (ADMIN → Admins, SEMI_ADMIN → Semi Admins)
  const formatRoleName = role =>
    role
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + 's';

  const roleOrder = ["ADMIN", ...Object.keys(usersByRole).filter(r => r !== "ADMIN")];
  const isSemiAdmin = loggedUser.role === "SEMI_ADMIN";

  roleOrder.forEach(role => {
    if (!usersByRole[role]) return;

    const tableHTML = `
      <h4 class="mt-4 text-center">${formatRoleName(role)}</h4>
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
          ${usersByRole[role].map(user => {
            let disableActions = false;

            if (user.userId === loggedUser.userId) {
              // Can't change yourself
              disableActions = true;
            } else if (isSemiAdmin) {
              // SEMI_ADMIN restrictions
              if (user.role === "ADMIN" || user.role === "SEMI_ADMIN") {
                // Can't change admin or other semi admins
                disableActions = true;
              }
            }

            // Role dropdown options based on restrictions
            let roleOptions = "";
            if (isSemiAdmin) {
              if (user.role === "USER") {
                // Can only change USER -> USER or SEMI_ADMIN
                roleOptions = `
                  <option value="USER" ${user.role === "USER" ? "selected" : ""}>User</option>
                  <option value="SEMI_ADMIN" ${user.role === "SEMI_ADMIN" ? "selected" : ""}>Semi Admin</option>
                `;
              } else {
                // No role change allowed
                roleOptions = `<option value="${user.role}" selected>${formatRoleName(user.role).slice(0, -1)}</option>`;
              }
            } else {
              // Admin or higher: full control
              roleOptions = `
                <option value="ADMIN" ${user.role === "ADMIN" ? "selected" : ""}>Admin</option>
                <option value="SEMI_ADMIN" ${user.role === "SEMI_ADMIN" ? "selected" : ""}>Semi Admin</option>
                <option value="USER" ${user.role === "USER" ? "selected" : ""}>User</option>
              `;
            }

            return `
              <tr>
                <td><img src="${user.profilePictureUrl || '/Front_End/assets/images/avatar-default-icon.png'}" 
                         class="rounded-circle shadow" width="40" height="40" /></td>
                <td class="fw-semibold">${user.username}</td>
                <td>${user.email}</td>
                <td>${user.phoneNumber || '-'}</td>
                <td><span class="badge bg-${user.active ? 'success' : 'secondary'}">
                      ${user.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                  <div class="action-column d-flex flex-row align-items-stretch justify-content-center gap-2">
                    
                    <!-- Status Toggle -->
                    <div class="status-action">
                      <div class="small text-muted mb-1">Status</div>
                      <button class="btn btn-sm ${user.active ? 'btn-warning' : 'btn-success'} 
                                     d-flex align-items-center gap-1" 
                              onclick="toggleStatus(${user.userId}, ${user.active})" 
                              ${disableActions ? 'disabled' : ''}>
                        <i class="bi ${user.active ? 'bi-person-dash' : 'bi-person-check'}"></i>
                        <span class="fw-bold">${user.active ? 'Deactivate' : 'Activate'}</span>
                      </button>
                    </div>

                    <div style="width: 2px; background-color: rgba(10, 10, 10, 0.644);"></div>

                    <!-- Role Change -->
                    <div class="role-action">
                      <div class="small text-muted mb-1">Change Role</div>
                      <div class="d-flex flex-row">
                        <select class="form-select form-select-sm role-select"
                                id="role-select-${user.userId}"
                                ${disableActions ? 'disabled' : ''}>
                          ${roleOptions}
                        </select>
                        <button class="action-btn confirm-role-change"
                                onclick="confirmRoleChange(${user.userId})"
                                ${disableActions ? 'disabled' : ''}>
                          <i class="bi bi-check-circle"></i>
                        </button>
                      </div>
                    </div>

                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
    container.innerHTML += tableHTML;
  });
}




/* -----------------------
   PAGINATION
----------------------- */
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

/* -----------------------
   ACTIONS
----------------------- */
async function toggleStatus(userId, isActive) {
  if (loggedUser && userId === loggedUser.userId) {
    Swal.fire("Warning", "You cannot change your own status.", "warning");
    return;
  }

  const endpoint = `${API_BASE_USER}/${isActive ? 'change-status-deactivate' : 'change-status-activate'}/${userId}`;
  try {
    await apiFetch(endpoint, { method: "PATCH" });
    Swal.fire("Success", "User status updated", "success");
    fetchUsers(currentPage);
  } catch {
    Swal.fire("Error", "Status change failed", "error");
  }
}

async function confirmRoleChange(userId) {
  const select = document.getElementById(`role-select-${userId}`);
  const newRole = select.value;

  try {
    const response = await apiFetch(`${API_BASE_USER}/change-job-role/${userId}?newRole=${newRole}`, {
      method: "PATCH"
    });

    if (!response.ok) throw new Error("Failed to change role");

    Swal.fire("Success", "User role updated", "success");
    fetchUsers(currentPage); 
  } catch (error) {
    Swal.fire("Error", error.message || "Role change failed", "error");
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
//       await fetch(`${API_BASE_USER}/delete/${userId}`, {
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


