document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".nav a");

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navLinks.forEach(nav => nav.classList.remove("active"));
            link.classList.add("active");
        });
    });
});

function toggleMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('show-menu');
}

function scrollBoardLeft() {
    document.querySelector('.board-members').scrollBy({
        left: -200,
        behavior: 'smooth'
    });
}

function scrollBoardRight() {
    document.querySelector('.board-members').scrollBy({
        left: 200,
        behavior: 'smooth'
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".nav a, .dropdown-menu a");

    navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link action

            const targetId = this.getAttribute("href").substring(1); // Get section ID
            const targetSection = document.getElementById(targetId); // Find section

            if (targetSection) {
                // Apply fade-out effect
                targetSection.classList.add("fade-out");

                setTimeout(() => {
                    targetSection.classList.remove("fade-out");
                    targetSection.classList.add("fade-in");

                    // Scroll smoothly to section
                    targetSection.scrollIntoView({ behavior: "smooth" });
                }, 300); // Delay for animation
            }
        });
    });
});


document.getElementById("join-club-form").addEventListener("submit", async function(event) {
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

document.querySelectorAll('.dropdown-menu a').forEach(link => {
    link.addEventListener('click', function(event) {
        if (this.getAttribute("href").startsWith("#")) {
            event.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        }
    });
});
