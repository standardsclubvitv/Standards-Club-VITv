import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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

// Sidebar Toggle
document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("active");
});
document.getElementById("closeSidebar").addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("active");
});

// Fetch Logged-in Admin Name
async function fetchAdminName(user) {
    if (!user) return;
    
    const userDocRef = doc(db, "Users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const adminName = userDocSnap.data().name || "Admin";
        document.getElementById("adminName").textContent = `Logged in as: ${adminName}`;
    } else {
        document.getElementById("adminName").textContent = "Logged in as: Unknown";
    }
}

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAdminName(user);
    } else {
        document.getElementById("adminName").textContent = "Not Logged In";
    }
});

// Fetch User Data
async function fetchUserCount() {
    document.getElementById("loader").style.display = "flex";

    const usersCollection = collection(db, "Users");
    const usersSnapshot = await getDocs(usersCollection);
    const userCount = usersSnapshot.size;

    document.getElementById("userTotal").textContent = userCount;
    document.getElementById("loader").style.display = "none";

    renderPieChart(userCount);
}

// Render Pie Chart
function renderPieChart(userCount) {
    const ctx = document.getElementById("userChart").getContext("2d");

    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Users", "Remaining Capacity"],
            datasets: [{
                data: [userCount, 1000 - userCount],  // Assuming max capacity is 1000
                backgroundColor: ["#d4af37", "#444"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: "white" }
                }
            }
        }
    });
}


// Fetch Data on Load
fetchUserCount();

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        alert("Logged out successfully!");
        window.location.href = "/login/"; // Redirect to login page
    }).catch((error) => {
        console.error("Logout Error:", error);
        alert("Error logging out. Please try again.");
    });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAdminName(user);
    } else {
        // Redirect to login page if not logged in
        window.location.href = "/login/";
    }
});
