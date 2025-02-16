import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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
const auth = getAuth();

// Function to show/hide loader
function showLoader(show = true) {
    document.getElementById("loader").style.display = show ? "flex" : "none";
}

// Fetch Firestore Data
async function fetchData() {
    showLoader(true); // Start loader

    const tableBody = document.querySelector("#dataTable tbody");
    tableBody.innerHTML = ""; // Clear table before adding new data

    try {
        const querySnapshot = await getDocs(collection(db, "Enrollment"));
        let index = 1;

        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No data available</td></tr>`;
        } else {
            const fragment = document.createDocumentFragment(); // Improve performance

            querySnapshot.forEach(doc => {
                const data = doc.data();
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${index++}</td>
                    <td>${data["Student Name"] || "N/A"}</td>
                    <td>${data["Register Number"] || "N/A"}</td>
                    <td>${data.EmailId || "N/A"}</td>
                    <td>${data["Mobile No"] || "N/A"}</td>
                    <td>${data["Enroll Year"] || "N/A"}</td>
                `;

                fragment.appendChild(row);
            });

            tableBody.appendChild(fragment); // Append all rows at once (better performance)
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        tableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Failed to load data</td></tr>`;
    } finally {
        showLoader(false); // Stop loader **only after** all data is rendered
    }
}

// Display Logged-in Admin's Name
async function fetchAdminName(user) {
    if (!user) {
        document.getElementById("adminName").textContent = "Not Logged In";
        return;
    }

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
    fetchAdminName(user);
});

// Export table data to Excel (CSV Format)
function exportToExcel(tableID, filename = "export") {
    let table = document.getElementById(tableID);
    let rows = table.querySelectorAll("tr");
    let csvContent = "";

    rows.forEach(row => {
        let rowData = [];
        row.querySelectorAll("td, th").forEach(cell => {
            rowData.push(cell.innerText);
        });
        csvContent += rowData.join(",") + "\n";
    });

    // Create CSV Blob
    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event listener for download button
document.getElementById("downloadExcel").addEventListener("click", () => {
    exportToExcel("dataTable", "Firestore_Data");
});

// Fetch data when page loads
document.addEventListener("DOMContentLoaded", fetchData);

onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAdminName(user);
    } else {
        // Redirect to login page if not logged in
        window.location.href = "/login/";
    }
});
