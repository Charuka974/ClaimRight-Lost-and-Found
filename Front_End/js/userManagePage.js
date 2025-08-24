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
async function fetchUsers() {
  try {
    const res = await apiFetch(`${API_BASE_USER}/get-all`);

    const { data } = await res.json();
    renderUsers(data);
  } catch (err) {
    console.error("Failed to fetch users", err);
  }
}

async function searchUsers(keyword) {
  try {
    const res = await apiFetch(`${API_BASE_USER}/search/${encodeURIComponent(keyword)}`);
    const { data } = await res.json();
    renderUsers(data);  // ✅ data is already an array
  } catch {
    Swal.fire("Error", "Search failed", "error");
  }
}

/* -----------------------
   RENDER USERS
----------------------- */
function renderUsers(users) {
  // Clear each container separately
  document.getElementById("adminUserTable").innerHTML = "";
  document.getElementById("semiAdminUserTable").innerHTML = "";
  document.getElementById("NormalUserTable").innerHTML = "";

  // Group users by role
  const usersByRole = { ADMIN: [], SEMI_ADMIN: [], USER: [] };
  users.forEach(user => {
    const role = user.role || "USER";
    if (usersByRole[role]) {
      usersByRole[role].push(user);
    }
  });

  const isSemiAdmin = loggedUser.role === "SEMI_ADMIN";

  // Render into separate divs
  if (usersByRole["ADMIN"].length > 0) {
    renderTable("Admins", usersByRole["ADMIN"], document.getElementById("adminUserTable"), isSemiAdmin);
  }
  if (usersByRole["SEMI_ADMIN"].length > 0) {
    renderTable("Semi Admins", usersByRole["SEMI_ADMIN"], document.getElementById("semiAdminUserTable"), isSemiAdmin);
  }
  if (usersByRole["USER"].length > 0) {
    renderTable("Users", usersByRole["USER"], document.getElementById("NormalUserTable"), isSemiAdmin);
  }
}

/* -----------------------
   HELPERS
----------------------- */
function formatRoleName(role) {
  return role
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') + 's';
}

function getRoleOptions(user, isSemiAdmin) {
  if (isSemiAdmin) {
    if (user.role === "USER") {
      return `
        <option value="USER" ${user.role === "USER" ? "selected" : ""}>User</option>
        <option value="SEMI_ADMIN" ${user.role === "SEMI_ADMIN" ? "selected" : ""}>Semi Admin</option>
      `;
    } else {
      return `<option value="${user.role}" selected>${formatRoleName(user.role).slice(0, -1)}</option>`;
    }
  } else {
    return `
      <option value="ADMIN" ${user.role === "ADMIN" ? "selected" : ""}>Admin</option>
      <option value="SEMI_ADMIN" ${user.role === "SEMI_ADMIN" ? "selected" : ""}>Semi Admin</option>
      <option value="USER" ${user.role === "USER" ? "selected" : ""}>User</option>
    `;
  }
}

function renderTable(title, users, container, isSemiAdmin) {
  const tableHTML = `
    <h4 class="mt-4 text-center"><b>${title}</b></h4>
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
        ${users.map(user => {
          let disableActions = false;

          if (user.userId === loggedUser.userId) {
            disableActions = true;
          } else if (isSemiAdmin && (user.role === "ADMIN" || user.role === "SEMI_ADMIN")) {
            disableActions = true;
          }

          const roleOptions = getRoleOptions(user, isSemiAdmin);

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


