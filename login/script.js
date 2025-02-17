import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { 
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Elements
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const boardLoginForm = document.getElementById("boardLoginForm");
const loader = document.getElementById("loader");

// Show/Hide Loader
function showLoader(show = true) {
    loader.style.display = show ? "flex" : "none";
}

// Show Animated Alerts (Optimized)
function showAlert(message, type = "success") {
    document.querySelectorAll(".alert").forEach(alert => alert.remove()); // Remove existing alerts

    const alertBox = document.createElement("div");
    alertBox.className = `alert ${type}`;
    alertBox.innerText = message;
    document.body.appendChild(alertBox);

    setTimeout(() => { alertBox.style.opacity = "1"; }, 100);
    setTimeout(() => {
        alertBox.style.opacity = "0";
        setTimeout(() => alertBox.remove(), 500);
    }, 4000);
}

// Function to show the selected form and hide others
function showForm(formToShow) {
    [loginForm, signupForm, boardLoginForm].forEach(form => {
        form.classList.toggle("active", form === formToShow);
    });
}

// Event Listeners for Form Switching
document.getElementById("showLogin").addEventListener("click", () => showForm(loginForm));
document.getElementById("showSignup").addEventListener("click", () => showForm(signupForm));
document.getElementById("boardLoginBtn").addEventListener("click", () => showForm(boardLoginForm));

// Ensure Login Form is Visible on Page Load
window.addEventListener("load", () => {
    showForm(loginForm);
    showLoader(false);
});

// Signup Function (Restricted to @vit.ac.in & @vitstudent.ac.in)
document.getElementById("signupBtn").addEventListener("click", async () => {
    showLoader(true);
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const regNo = document.getElementById("signupRegNo").value.trim();
    const mobile = document.getElementById("signupMobile").value.trim();

    if (!name || !email || !password || !regNo || !mobile) {
        showLoader(false);
        return showAlert("All fields are required!", "error");
    }

    const allowedDomains = ["@gmail.com", "@vitstudent.ac.in"];
    if (!allowedDomains.some(domain => email.endsWith(domain))) {
        showLoader(false);
        return showAlert("Only VIT emails (@vit.ac.in / @vitstudent.ac.in) are allowed!", "error");
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "Users", user.uid), { name, email, regNo, mobile });
        await sendEmailVerification(user);

        await fetch("https://test-mu-orpin.vercel.app/send-welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name })
        });

        showLoader(false);
        showAlert("Verification email sent! Please check your inbox.", "info");
        showForm(loginForm);
    } catch (error) {
        showLoader(false);
        let errorMessage = "Signup failed!";
        if (error.code === "auth/email-already-in-use") errorMessage = "Email already in use.";
        else if (error.code === "auth/weak-password") errorMessage = "Password should be at least 6 characters.";
        else if (error.code === "auth/invalid-email") errorMessage = "Invalid email format.";

        showAlert(errorMessage, "error");
    }
});

// Login Function
document.getElementById("loginBtn").addEventListener("click", async () => {
    showLoader(true);
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showLoader(false);
        return showAlert("Please fill in both fields!", "error");
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            showLoader(false);
            return showAlert("Please verify your email before logging in.", "warning");
        }

        showLoader(false);
        showAlert("Login successful! Redirecting...", "success");
        setTimeout(() => window.location.href = "../VITian/dashboard/", 2000);
    } catch (error) {
        showLoader(false);
        let errorMessage = "Login failed!";
        if (error.code === "auth/wrong-password") errorMessage = "Incorrect password.";
        else if (error.code === "auth/user-not-found") errorMessage = "No account found.";
        else if (error.code === "auth/invalid-email") errorMessage = "Invalid email format.";

        showAlert(errorMessage, "error");
    }
});

// Allowed Emails for Board Access
const allowedEmails = ["kasibhatla.navyatha2023@vitstudent.ac.in", "siddharth.j2023@vitstudent.ac.in", "renoldelsen.s@vit.ac.in", "giridhar.r2022@vitstudent.ac.in", "raybanpranav.mahesh2023@vitstudent.ac.in"];

// Board Login Function
document.getElementById("boardLoginSubmit").addEventListener("click", async () => {
    showLoader(true);
    const email = document.getElementById("boardLoginEmail").value.trim();
    const password = document.getElementById("boardLoginPassword").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            showLoader(false);
            return showAlert("Please verify your email before logging in.", "warning");
        }

        if (allowedEmails.includes(email)) {
            const device = navigator.userAgent;
            const ipResponse = await fetch("https://api64.ipify.org?format=json");
            const { ip } = await ipResponse.json();
            const dateTime = new Date().toLocaleString();

            await fetch("https://test-mu-orpin.vercel.app/send-board-login-alert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, device, ip, dateTime })
            });
            

            showLoader(false);
            showAlert("Board access granted! Redirecting...", "success");
            setTimeout(() => window.location.href = "../board/dashboard/", 2000);
        } else {
            showLoader(false);
            showAlert("Access denied!", "error");
        }
    } catch (error) {
        showLoader(false);
        showAlert("Login failed!", "error");
    }
});
