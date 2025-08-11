const API_BASE_LOSTITEM = 'http://localhost:8080/claimright/lost-item';
const myLostItemContainer = document.getElementById('myLostItemContainer');

document.addEventListener('DOMContentLoaded', () => {
   
});

async function loadLostItems() {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not logged in");

        const response = await fetch(API_BASE_LOSTITEM, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load lost items");

        const lostItems = await response.json();
        renderLostItems(lostItems, document.querySelector(".main-content-container"));
    } catch (error) {
        console.error(error);
    }
}

async function loadMyLostItems() {
    try {
        const token = localStorage.getItem("accessToken");
        const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!token || !loggedUser) throw new Error("User not logged in");

        const response = await fetch(`${API_BASE_LOSTITEM}/owner/${loggedUser.userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load your lost items");

        const myLostItems = await response.json();
        renderLostItems(myLostItems, myLostItemContainer);
    } catch (error) {
        console.error(error);
    }
}

function renderLostItems(lostItems, container) {
    container.innerHTML = "";

    lostItems.forEach(item => {
        const lostItemCard = document.createElement("div");
        lostItemCard.className = "lost-item-card";

        lostItemCard.innerHTML = `
            <img src="${item.imageUrl || 'default-image.jpg'}" alt="Lost item image" class="lost-item-image" />
            <div class="lost-item-content">
                <h2 class="lost-item-title">${item.itemName}</h2>
                <div class="claimed-badge" style="display:${item.isClaimed ? 'block' : 'none'};">Claimed</div>
                <p class="lost-item-description">${item.detailedDescription}</p>
                <p class="lost-item-meta"><strong>Lost On:</strong> ${item.dateLost ? new Date(item.dateLost).toLocaleDateString() : 'N/A'}</p>
                <p class="lost-item-meta"><strong>Location:</strong> ${item.locationLost}</p>
                <p class="lost-item-meta"><strong>Owner:</strong> ${item.ownerName || 'Unknown'}</p>
                <div class="categories">
                    ${item.categoryNames.map(cat => `<span class="category-badge">${cat}</span>`).join('')}
                </div>
                <button class="edit-lost-item-btn">Edit</button>
                <button class="delete-lost-item-btn">Delete</button>
            </div>
        `;

        container.appendChild(lostItemCard);

        // Attach delete button listener
        lostItemCard.querySelector(".delete-lost-item-btn")
            .addEventListener("click", () => deleteLostItem(item.id));

        // (Optional) Attach edit button listener
        lostItemCard.querySelector(".edit-lost-item-btn")
            .addEventListener("click", () => editLostItem(item));
    });
}



async function deleteLostItem(itemId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This lost item will be permanently deleted!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_LOSTITEM}/${itemId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            Swal.fire({
                title: 'Deleted!',
                text: 'Lost item deleted successfully.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            loadMyLostItems(); // reload list
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete lost item.',
                icon: 'error'
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            title: 'Error!',
            text: 'An unexpected error occurred while deleting the lost item.',
            icon: 'error'
        });
    }
}

