import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDoc, doc, getFirestore, collection, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
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

// Monitor Authentication State **after** initializing auth
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchUserName(user);
    } else {
        // Redirect to login page if not logged in
        window.location.href = "/login/";
    }
});

// Display Logged-in User's Name
const fetchUserName = async (user) => {
    if (!user) {
        document.getElementById("adminName").textContent = "Not Logged In";
        return;
    }

    const userDocRef = doc(db, "Users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userName = userDocSnap.data().name || "User";
        document.getElementById("adminName").textContent = `Logged in as: ${userName}`;
    } else {
        document.getElementById("adminName").textContent = "Logged in as: Unknown";
    }
};

// Function to fetch events and update UI in real-time
const fetchEventDataLive = () => {
    console.clear();
    document.getElementById("loader").style.display = "flex";
    const eventsContainer = document.getElementById("eventsContainer");

    onSnapshot(collection(db, "Events"), async (eventsSnapshot) => {
        eventsContainer.innerHTML = ""; // Clear previous data

        const tabsContainer = document.createElement("div");
        tabsContainer.classList.add("tabs-container");
        const contentContainer = document.createElement("div");
        contentContainer.classList.add("content-container");

        let isFirst = true;

        for (const eventDoc of eventsSnapshot.docs) {
            const eventData = eventDoc.data();
            const userUIDs = eventData.logs || [];

            // Create tab button
            const tabButton = document.createElement("button");
            tabButton.classList.add("tab-button");
            tabButton.textContent = eventData.name;
            tabButton.dataset.eventId = eventDoc.id;
            tabButton.addEventListener("click", () => {
                document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
                document.getElementById(`tab-${eventDoc.id}`).style.display = "block";
                document.querySelectorAll(".tab-button").forEach(el => el.classList.remove("active"));
                tabButton.classList.add("active");
            });

            if (isFirst) tabButton.classList.add("active");
            tabsContainer.appendChild(tabButton);

            // Create tab content
            const tabContent = document.createElement("div");
            tabContent.classList.add("tab-content");
            tabContent.id = `tab-${eventDoc.id}`;
            if (!isFirst) tabContent.style.display = "none";
            isFirst = false;

            const tableContainer = document.createElement("div");
            tableContainer.classList.add("table-container");

            const eventTable = document.createElement("table");
            eventTable.classList.add("event-table");
            eventTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Date & Time</th>
                        <th>Name</th>
                        <th>Registration No</th>
                        <th>Email</th>
                        <th>Mobile</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = eventTable.querySelector("tbody");

            for (const userUID of userUIDs) {
                const userDocRef = doc(db, "Users", userUID);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const eventDate = eventData.datetime ? new Date(eventData.datetime) : new Date();
                    const formattedDate = eventDate.toLocaleDateString("en-GB");
                    const formattedTime = eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${eventData.name}</td>
                        <td>${formattedDate} ${formattedTime}</td>
                        <td>${userData.name}</td>
                        <td>${userData.regNo}</td>
                        <td>${userData.email}</td>
                        <td>${userData.mobile}</td>
                    `;
                    tbody.appendChild(row);
                }
            }

            tableContainer.appendChild(eventTable);
            const downloadButton = document.createElement("button");
            downloadButton.innerText = "Download CSV";
            downloadButton.classList.add("download-btn");
            downloadButton.addEventListener("click", () => downloadCSV(eventTable, eventData.name));
            tableContainer.appendChild(downloadButton);
            tabContent.appendChild(tableContainer);
            contentContainer.appendChild(tabContent);
        }

        eventsContainer.appendChild(tabsContainer);
        eventsContainer.appendChild(contentContainer);
        document.getElementById("loader").style.display = "none";
    });
};

// Call the real-time function
fetchEventDataLive();

const downloadCSV = (table, eventName) => {
    let csvContent = "";
    
    // Extract table headers
    const headers = Array.from(table.querySelectorAll("thead th"))
        .map(th => `"${th.innerText}"`)
        .join(",");
    csvContent += headers + "\n";

    // Extract table rows
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    rows.forEach(row => {
        const rowData = Array.from(row.querySelectorAll("td"))
            .map(td => `"${td.innerText}"`)
            .join(",");
        csvContent += rowData + "\n";
    });

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${eventName.replace(/\s+/g, "_")}_Registrations.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
