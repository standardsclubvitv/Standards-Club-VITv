import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase Configuration
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

// Get User Info and Display
onAuthStateChanged(auth, async (user) => {
    if (user) {
        showLoader(true); // Show loader while fetching data

        try {
            const userId = user.uid;
            const userDocRef = doc(db, "Users", userId);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                document.getElementById("userName").textContent = userData.name;
                document.getElementById("userEmail").textContent = userData.email;
                document.getElementById("userMobile").textContent = userData.mobile;
                document.getElementById("userRegNo").textContent = userData.regNo;
            } else {
                console.log("User data not found!");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            showLoader(false); // Hide loader once data is fetched
        }
    } else {
        window.location.href = "login.html"; // Redirect to login if not logged in
    }
});

// Sidebar Toggle
document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("active");
});
document.getElementById("closeSidebar").addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("active");
});

// Close sidebar when clicking outside
document.addEventListener("click", (event) => {
    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menuBtn");

    if (!sidebar.contains(event.target) && event.target !== menuBtn) {
        sidebar.classList.remove("active");
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
