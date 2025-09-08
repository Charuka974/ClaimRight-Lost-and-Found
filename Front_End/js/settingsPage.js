const API_ITEM_CAT = 'http://localhost:8080/claimright/item-categories';

document.addEventListener("DOMContentLoaded", () => {
    loadCategories();

    // Add category form listener
    document.getElementById("addCategoryForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        await addCategory();
    });
});

// --- Load Categories ---
async function loadCategories() {
    const list = document.getElementById("category-list");
    list.innerHTML = `<li class="list-group-item text-center">Loading...</li>`;

    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(API_ITEM_CAT, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch categories");
        const categories = await response.json();

        list.innerHTML = "";
        if (categories.length === 0) {
            list.innerHTML = `<li class="list-group-item text-center">No categories found.</li>`;
            return;
        }

        categories.forEach(cat => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `
                <span>
                    <strong>${cat.name}</strong>
                    <small class="text-muted ms-2">${cat.description || ""}</small>
                </span>
                <span class="category-actions">
                    <button class="btn btn-sm btn-edit me-2" onclick="editCategory(${cat.categoryId}, '${cat.name}', '${cat.description || ""}')">
                    <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteCategory(${cat.categoryId})">
                    <i class="bi bi-trash"></i>
                    </button>
                </span>
                `;

            list.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading categories:", error);
        list.innerHTML = `<li class="list-group-item text-danger text-center">Error loading categories.</li>`;
    }
}

// --- Add New Category ---
async function addCategory() {
    const nameInput = document.getElementById("newCategoryName");
    const descInput = document.getElementById("newCategoryDesc");

    const name = nameInput.value.trim();
    const description = descInput.value.trim();

    if (!name) {
        Swal.fire("Warning", "Category name cannot be empty!", "warning");
        return;
    }

    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(API_ITEM_CAT, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, description })
        });

        if (!response.ok) throw new Error("Failed to add category");

        Swal.fire("Success", "Category added successfully!", "success");
        nameInput.value = "";
        descInput.value = "";
        loadCategories();
    } catch (error) {
        console.error("Error adding category:", error);
        Swal.fire("Error", "Failed to add category", "error");
    }
}

// --- Edit Category ---
async function editCategory(id, currentName, currentDesc) {
    const { value: formValues } = await Swal.fire({
        title: "Edit Category",
        html: `
          <input id="swal-cat-name" class="swal2-input" placeholder="Name" value="${currentName}">
          <input id="swal-cat-desc" class="swal2-input" placeholder="Description" value="${currentDesc}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
            return {
                name: document.getElementById("swal-cat-name").value.trim(),
                description: document.getElementById("swal-cat-desc").value.trim()
            };
        }
    });

    if (!formValues) return;

    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(`${API_ITEM_CAT}/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(formValues)
        });

        if (!response.ok) throw new Error("Failed to update category");

        Swal.fire("Updated!", "Category updated successfully.", "success");
        loadCategories();
    } catch (error) {
        console.error("Error updating category:", error);
        Swal.fire("Error", "Failed to update category", "error");
    }
}

// --- Delete Category ---
async function deleteCategory(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "This category will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel"
    }).then(async (result) => {
        if (!result.isConfirmed) return;

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) throw new Error("User not logged in");

            const response = await fetch(`${API_ITEM_CAT}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.status !== 204) throw new Error("Failed to delete category");

            Swal.fire("Deleted!", "Category removed.", "success");
            loadCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            Swal.fire("Error", "Failed to delete category", "error");
        }
    });
}
