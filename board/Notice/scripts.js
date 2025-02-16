import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, doc, deleteDoc, getDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbpEZD-Hq0bs44lG7PfSER6fg4wbNgtWY",
    authDomain: "standards-club-vitv-74474.firebaseapp.com",
    projectId: "standards-club-vitv-74474",
    storageBucket: "standards-club-vitv-74474.appspot.com",
    messagingSenderId: "313100673493",
    appId: "1:313100673493:web:4f2ba97f24ed95621fdd5c",
    measurementId: "G-KBKCTVQG5K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Ensure DOM is fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {
    const postNoticeBtn = document.getElementById("post-notice");
    const noticeText = document.getElementById("notice-text");

    if (postNoticeBtn) {
        postNoticeBtn.addEventListener("click", async () => {
            if (!noticeText.value.trim()) return alert("Enter a notice!");

            const user = auth.currentUser;
            if (!user) return alert("Please log in to post a notice.");

            showLoader(true);

            const userDocRef = doc(db, "Users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            const adminName = userDocSnap.exists() ? userDocSnap.data().name || "Admin" : "Unknown";

            await addDoc(collection(db, "Notices"), {
                notice: noticeText.value,
                admin: adminName,
                date: serverTimestamp()
            });

            noticeText.value = ""; // Clear input field
            loadNotices(); // Refresh notices dynamically
        });
    }

    // Fetch Notices
    loadNotices();
});

// Get Logged-in Admin Name
onAuthStateChanged(auth, async (user) => {
    const adminNameElement = document.getElementById("admin-name");

    if (user) {
        const userDocRef = doc(db, "Users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const adminName = userDocSnap.data().name || "Admin";
            adminNameElement.innerText = `Logged in as: ${adminName}`;
        } else {
            adminNameElement.innerText = "Logged in as: Unknown";
        }
    } else {
        adminNameElement.innerText = "Not Logged In";
    }
});

// Function to show/hide loader
function showLoader(show = true) {
    document.getElementById("loader").style.display = show ? "flex" : "none";
}

// Fetch Notices
async function loadNotices() {
    showLoader(true);
    const noticesSnapshot = await getDocs(collection(db, "Notices"));
    const noticeList = document.getElementById("notice-list");
    noticeList.innerHTML = ""; // Clear existing data

    noticesSnapshot.forEach((doc) => {
        const data = doc.data();
        const formattedDate = data.date 
            ? new Date(data.date.seconds * 1000).toLocaleDateString("en-GB")  // Format as DD/MM/YYYY
            : "Unknown Date";

        noticeList.innerHTML += `
            <tr>
                <td>${data.notice}</td>
                <td>${data.admin}</td>
                <td>${formattedDate}</td>
                <td>
                    <button onclick="deleteNotice('${doc.id}')">Delete</button>
                </td>
            </tr>`;
    });

    showLoader(false);
}

// Delete Notice Function
window.deleteNotice = async (id) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    showLoader(true);
    await deleteDoc(doc(db, "Notices", id));
    loadNotices(); // Refresh the table dynamically
};

// Sidebar Toggle Function
window.toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
};

// Close Sidebar on Button Click
document.getElementById("closeSidebar").addEventListener("click", toggleSidebar);

onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAdminName(user);
    } else {
        // Redirect to login page if not logged in
        window.location.href = "/login/";
    }
});
