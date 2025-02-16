import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { 
    getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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
const auth = getAuth();

// Display Logged-in User's Name
async function fetchUserName(user) {
    if (!user) return;
    
    const userDocRef = doc(db, "Users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userName = userDocSnap.data().name || "User";
        document.getElementById("user-name").textContent = `Logged in as: ${userName}`;
    } else {
        document.getElementById("user-name").textContent = "Logged in as: Unknown";
    }
}

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchUserName(user);
    } else {
        document.getElementById("user-name").textContent = "Not Logged In";
    }
});

// Handle Sidebar Toggle
window.toggleSidebar = function() {
    document.getElementById("sidebar").classList.toggle("active");
};

// Function to Add or Update Event
document.getElementById("event-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent page reload

    const eventId = document.getElementById("event-id").value.trim();
    const eventName = document.getElementById("event-name").value.trim();
    const eventDatetime = document.getElementById("event-datetime").value;
    const eventLimit = parseInt(document.getElementById("event-limit").value);
    const eventVenue = document.getElementById("event-venue").value.trim();
    const eventType = document.getElementById("event-type").value;
    const eventImage = document.getElementById("event-thumbnail").files[0];

    if (!eventName || !eventDatetime || !eventLimit || !eventVenue || !eventType || !eventImage) {
        alert("Please fill all fields.");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(eventImage);
    reader.onload = async function () {
        const base64Image = reader.result;
        let logs = [];

        if (eventId) {
            // If updating, preserve existing logs
            const eventDocRef = doc(db, "Events", eventId);
            const eventDocSnap = await getDoc(eventDocRef);
            if (eventDocSnap.exists()) {
                logs = eventDocSnap.data().logs || [];
            }
        }

        const eventData = {
            name: eventName,
            datetime: eventDatetime,
            limit: eventLimit,
            venue: eventVenue,
            type: eventType,
            thumbnail: base64Image,
            logs: logs // Maintain registered users' UIDs
        };

        try {
            if (eventId) {
                await updateDoc(doc(db, "Events", eventId), eventData);
                alert("Event updated successfully!");
            } else {
                await addDoc(collection(db, "Events"), eventData);
                alert("Event created successfully!");
            }
            document.getElementById("event-form").reset(); // Clear form
            loadEvents();
        } catch (error) {
            console.error("Error saving event: ", error);
            alert("Error saving event. Please try again.");
        }
    };
});

// Load Events from Firestore
async function loadEvents() {

    // Show loader
    document.getElementById("loader").style.display = "flex";

    const eventsList = document.getElementById("events-list");
    eventsList.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "Events"));
    
    // Ensure loader stops after all events are loaded
    querySnapshot.forEach((doc) => {
        const event = doc.data();
        eventsList.innerHTML += `
            <tr>
                <td>${event.name}</td>
                <td>${event.datetime}</td>
                <td><img src="${event.thumbnail}" width="50"></td>
                <td>${event.limit}</td>
                <td>${event.venue}</td>
                <td>${event.type}</td>
                <td>
                    <button onclick="editEvent('${doc.id}')">Edit</button>
                    <button onclick="deleteEvent('${doc.id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    // Hide loader once all data is loaded
    document.getElementById("loader").style.display = "none";
}

// Edit Event
window.editEvent = async function(eventId) {
    const eventDocRef = doc(db, "Events", eventId);
    const eventDocSnap = await getDoc(eventDocRef);

    if (eventDocSnap.exists()) {
        const event = eventDocSnap.data();
        document.getElementById("event-id").value = eventId;
        document.getElementById("event-name").value = event.name;
        document.getElementById("event-datetime").value = event.datetime;
        document.getElementById("event-limit").value = event.limit;
        document.getElementById("event-venue").value = event.venue;
        document.getElementById("event-type").value = event.type;
    }
    // Hide loader after events are loaded
    document.getElementById("loader").style.display = "none";
};

// Delete Event
window.deleteEvent = async function(eventId) {
    if (confirm("Are you sure you want to delete this event?")) {
        await deleteDoc(doc(db, "Events", eventId));
        alert("Event deleted successfully!");
        loadEvents();
    }
};

// Load events on page load
loadEvents();

onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAdminName(user);
    } else {
        // Redirect to login page if not logged in
        window.location.href = "/login/";
    }
});
