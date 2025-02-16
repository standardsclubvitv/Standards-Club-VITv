import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, updateDoc, arrayUnion, onSnapshot } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase Config
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

// Redirect to login if user is not authenticated
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadEventsLive();
    } else {
        window.location.href = "/login/";
    }
});

// Function to format date and time
function formatDateTime(timestamp) {
    let dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const date = dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format
    return `${date} ${hours}:${minutes} ${ampm}`;
}

// Show Loader
function showLoader() {
    document.getElementById("loader").style.display = "flex";
}

// Hide Loader
function hideLoader() {
    document.getElementById("loader").style.display = "none";
}

// Load Events with Live Updates
function loadEventsLive() {
    const eventsList = document.getElementById("events-list");
    showLoader();

    onSnapshot(
        collection(db, "Events"),
        (querySnapshot) => {
            eventsList.innerHTML = "";
            const user = auth.currentUser;

            if (querySnapshot.empty) {
                console.warn("No events found! Check Firestore collection.");
            }

            querySnapshot.forEach((doc) => {
                const event = doc.data();
                const remainingSeats = event.limit - (event.logs?.length || 0);
                const isRegistered = user && event.logs?.includes(user.uid);
                const formattedDateTime = formatDateTime(event.datetime);

                eventsList.innerHTML += `
                    <div class="event-card">
                        <img src="${event.thumbnail}" alt="${event.name}">
                        <h3>${event.name}</h3>
                        <p><strong>Date & Time:</strong> ${formattedDateTime}</p>
                        <p><strong>Venue:</strong> ${event.venue}</p>
                        <p class="seats">Seats: ${remainingSeats} / ${event.limit}</p>
                        <button id="register-${doc.id}" onclick="registerForEvent('${doc.id}')" 
                            ${remainingSeats <= 0 || isRegistered ? "disabled" : ""}>
                            ${isRegistered ? "Registered" : (remainingSeats > 0 ? "Register" : "Full")}
                        </button>
                        <p class="note">⚠️ Please do register on VTOP as well for the OD process.</p>
                    </div>
                `;
            });
            hideLoader();
        },
        (error) => {
            console.error("Error fetching events:", error);
            alert("Failed to fetch events. Please check the console for details.");
            hideLoader();
        }
    );
}

// Register for Event
window.registerForEvent = async function (eventId) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to register for an event.");
        return;
    }

    const button = document.getElementById(`register-${eventId}`);
    button.disabled = true;
    button.textContent = "Registering...";

    try {
        const eventRef = doc(db, "Events", eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
            let eventData = eventSnap.data();
            let remainingSeats = eventData.limit - (eventData.logs?.length || 0);

            if (remainingSeats <= 0) {
                alert("Sorry, this event is full.");
                button.textContent = "Full";
                return;
            }

            if (eventData.logs?.includes(user.uid)) {
                alert("You are already registered for this event.");
                button.textContent = "Registered";
                return;
            }

            await updateDoc(eventRef, {
                logs: arrayUnion(user.uid),
            });

            await fetch("https://test-mu-orpin.vercel.app/send-email", {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    userEmail: user.email, 
                    eventName: eventData.name, 
                    formattedDateTime: formatDateTime(eventData.datetime),
                    eventVenue: eventData.venue
                }),
            });

            alert("Registration successful! Please check your email for confirmation.");
            button.textContent = "Registered";
        }
    } catch (error) {
        console.error("Error registering for event:", error);
        alert("An error occurred. Please try again.");
        button.textContent = "Register";
        button.disabled = false;
    }
};

// Sidebar Toggle
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("active");
}

document.getElementById("menu-btn").addEventListener("click", toggleSidebar);

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            alert("Logged out successfully!");
            window.location.href = "/login/";
        })
        .catch((error) => {
            console.error("Logout Error:", error);
            alert("Error logging out. Please try again.");
        });
});
