import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbpEZD-Hq0bs44lG7PfSER6fg4wbNgtWY",
    authDomain: "standards-club-vitv-74474.firebaseapp.com",
    projectId: "standards-club-vitv-74474",
    storageBucket: "standards-club-vitv-74474.firebasestorage.app",
    messagingSenderId: "313100673493",
    appId: "1:313100673493:web:4f2ba97f24ed95621fdd5c",
    measurementId: "G-KBKCTVQG5K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Show/hide loader function
function showLoader(show = true) {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = show ? "flex" : "none";
    }
}

// Fetch notices from Firestore
async function fetchNotices() {
    const noticesContainer = document.getElementById("noticesContainer");

    if (!noticesContainer) {
        console.error("Error: #noticesContainer not found in the document.");
        return;
    }

    showLoader(true); // Show loader

    try {
        const querySnapshot = await getDocs(collection(db, "Notices"));
        noticesContainer.innerHTML = ""; // Clear existing data

        if (querySnapshot.empty) {
            noticesContainer.innerHTML = `<div class="no-notice">No notices available</div>`;
        } else {
            const fragment = document.createDocumentFragment(); // Improves performance

            querySnapshot.forEach((doc) => {
                const data = doc.data();

                // Convert Firestore timestamp to readable format
                const formattedDate = data.date
                    ? new Date(data.date.seconds * 1000).toLocaleString()
                    : "N/A";

                const noticeBox = document.createElement("div");
                noticeBox.classList.add("notice-box");

                noticeBox.innerHTML = `
                    <p class="notice-text">${data.notice || "No Notice"}</p>
                    <p class="notice-admin">Posted by: <b>${data.admin || "Unknown"}</b></p>
                    <p class="notice-date">${formattedDate}</p>
                `;

                fragment.appendChild(noticeBox);
            });

            noticesContainer.appendChild(fragment);
        }
    } catch (error) {
        console.error("Error fetching notices:", error);
        noticesContainer.innerHTML = `<div class="error-message">Failed to load notices</div>`;
    } finally {
        showLoader(false); // Hide loader
    }
}

// Fetch notices when page loads
document.addEventListener("DOMContentLoaded", fetchNotices);


// Sidebar Toggle
document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("active");
});
document.getElementById("closeSidebar").addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("active");
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAdminName(user);
    } else {
        // Redirect to login page if not logged in
        window.location.href = "/login/";
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "/login/"; // Redirect to login page
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
});