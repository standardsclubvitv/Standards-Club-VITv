document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav a");

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navLinks.forEach(nav => nav.classList.remove("active"));
            link.classList.add("active");
        });
    });

    // Ensure 'join-club-form' exists before adding event listener
    const joinClubForm = document.getElementById("join-club-form");
    if (joinClubForm) {
        joinClubForm.addEventListener("submit", async function(event) {
            event.preventDefault(); // Prevent page refresh

            const email = document.getElementById("email").value;
            const responseMessage = document.getElementById("response-message");

            // Regex to check if the email is from @vitstudent.ac.in or @vit.ac.in
            const emailRegex = /^[a-zA-Z0-9._%+-]+@(vitstudent\.ac\.in|vit\.ac\.in)$/;

            if (!emailRegex.test(email)) {
                responseMessage.textContent = "❌ Please enter a valid VIT email";
                responseMessage.style.color = "red";
                return;
            }

            try {
                const response = await fetch("https://test-mu-orpin.vercel.app/join-club", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                responseMessage.textContent = data.message; // Show success/error message
                responseMessage.style.color = data.message.includes("Check your inbox") ? "green" : "red";
            } catch (error) {
                responseMessage.textContent = "Something went wrong. Try again!";
                responseMessage.style.color = "red";
            }
        });
    }
});

// Ensure the slideshow index is declared only once
let slideIndex = 0;

function changeSlide(n) {
    showSlide(slideIndex += n);
}

function showSlide(n) {
    let slides = document.querySelectorAll(".slide");
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;
    
    slides.forEach(slide => slide.style.display = "none");
    slides[slideIndex].style.display = "block";
}

// Ensure the first slide is displayed
document.addEventListener("DOMContentLoaded", function () {
    showSlide(slideIndex);
});

function toggleMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('show-menu');
}
