import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js"; // ✅ Correct Import

const firebaseConfig = {
    apiKey: "AIzaSyBbpEZD-Hq0bs44lG7PfSER6fg4wbNgtWY",
    authDomain: "standards-club-vitv-74474.firebaseapp.com",
    projectId: "standards-club-vitv-74474",
    storageBucket: "standards-club-vitv-74474.firebasestorage.app",
    messagingSenderId: "313100673493",
    appId: "1:313100673493:web:4f2ba97f24ed95621fdd5c",
    measurementId: "G-KBKCTVQG5K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(); // ✅ Initialize Firebase Auth
const userTableBody = document.getElementById("userTableBody");
const loader = document.getElementById("loader");
const adminNameSpan = document.getElementById("adminName");
const alertBox = document.getElementById("alertBox");

// Function to show animated alert
function showAlert(message) {
    alertBox.innerText = message;
    alertBox.style.display = "block";
    alertBox.classList.add("show");
    setTimeout(() => {
        alertBox.classList.remove("show");
        alertBox.style.display = "none";
    }, 3500);
}

// Fetch and display users
async function fetchUsers() {
    loader.style.display = "flex";
    const querySnapshot = await getDocs(collection(db, "Users"));
    userTableBody.innerHTML = "";
    let count = 1;
    
    querySnapshot.forEach((doc) => {
        const user = doc.data();
        const row = `
            <tr>
                <td>${count++}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.mobile}</td>
                <td>${user.regNo}</td>
                <td>
                    <button onclick="editUser('${doc.id}', '${user.name}', '${user.email}', '${user.mobile}', '${user.regNo}')">Edit</button>
                    <button onclick="deleteUser('${doc.id}')">Delete</button>
                </td>
            </tr>
        `;
        userTableBody.innerHTML += row;
    });
    loader.style.display = "none";
}

// Function to close the edit popup
window.closePopup = function () {
    document.getElementById("editPopup").style.display = "none";
};

// Function to open the edit popup and fill user data
window.editUser = function (id, name, email, mobile, regNo) {
    document.getElementById("editUserId").value = id;
    document.getElementById("editName").value = name;
    document.getElementById("editEmail").value = email;
    document.getElementById("editMobile").value = mobile;
    document.getElementById("editRegNo").value = regNo;
    document.getElementById("editPopup").style.display = "block";
};

// Fetch users when the page loads
fetchUsers();

// Function to update user details in Firebase
window.updateUser = async function () {
    const userId = document.getElementById("editUserId").value;
    const updatedName = document.getElementById("editName").value;
    const updatedEmail = document.getElementById("editEmail").value;
    const updatedMobile = document.getElementById("editMobile").value;
    const updatedRegNo = document.getElementById("editRegNo").value;

    if (!userId) {
        console.error("User ID is missing!");
        return;
    }

    try {
        const userRef = doc(db, "Users", userId);
        await updateDoc(userRef, {
            name: updatedName,
            email: updatedEmail,
            mobile: updatedMobile,
            regNo: updatedRegNo,
            updatedAt: serverTimestamp() // Track update time
        });

        showAlert("User updated successfully!");
        closePopup(); // Close popup after updating
        fetchUsers(); // Refresh table data
    } catch (error) {
        console.error("Error updating user:", error);
    }
};

// Function to delete a user
window.deleteUser = async function (userId) {
    if (!confirm("Are you sure you want to delete this user?")) {
        return; // If user cancels, exit function
    }

    try {
        await deleteDoc(doc(db, "Users", userId)); // Delete user from Firestore
        showAlert("User deleted successfully!");
        fetchUsers(); // Refresh table after deletion
    } catch (error) {
        console.error("Error deleting user:", error);
    }
};

// Sidebar Toggle
const menuBtn = document.getElementById("menuBtn");
const closeSidebarBtn = document.getElementById("closeSidebar");
const sidebar = document.getElementById("sidebar");
menuBtn.addEventListener("click", () => sidebar.classList.add("active"));
closeSidebarBtn.addEventListener("click", () => sidebar.classList.remove("active"));

// Fetch Logged-in Admin Name
async function fetchAdminName(user) {
    if (!user) return;
    const userDocRef = doc(db, "Users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const adminName = userDocSnap.data().name || "Admin";
        adminNameSpan.textContent = `Logged in as: ${adminName}`;
    } else {
        adminNameSpan.textContent = "Logged in as: Unknown";
    }
}

// Check if User is Logged In
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAdminName(user);
    } else {
        adminNameSpan.textContent = "Not Logged In";
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAdminName(user);
    } else {
        // Redirect to login page if not logged in
        window.location.href = "/login/";
    }
});
