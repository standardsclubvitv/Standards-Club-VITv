import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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
const auth = getAuth(app);

window.sendResetLink = async function () {
    const email = document.getElementById("resetEmail").value;
    if (!email) {
        showAlert("Please enter your email!", "error");
        return;
    }

    document.getElementById("loader").style.display = "flex";

    try {
        await sendPasswordResetEmail(auth, email);
        showAlert("Reset link sent! Check your email.", "success");
    } catch (error) {
        showAlert(error.message, "error");
    }

    document.getElementById("loader").style.display = "none";
};

function showAlert(message, type) {
    const alertBox = document.getElementById("alertBox");
    alertBox.innerText = message;
    alertBox.className = `alert ${type} show`;

    setTimeout(() => {
        alertBox.classList.remove("show");
    }, 3000);
}
