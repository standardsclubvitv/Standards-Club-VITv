document.addEventListener("DOMContentLoaded", function () {
    const text = document.querySelector(".animated-text");
    let index = 0;
    let textContent = "Welcome to the VIT Standards Club – Elevating Excellence with VITV";

    function animateText() {
        if (index < textContent.length) {
            text.innerHTML += textContent.charAt(index);
            index++;
            setTimeout(animateText, 200);
        }
    }

    text.innerHTML = "";
    animateText();
});

document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".container");

    function revealOnScroll() {
        sections.forEach(section => {
            const top = section.getBoundingClientRect().top;
            if (top < window.innerHeight * 0.85) {
                section.style.animation = "slideIn 1.2s ease-in-out forwards";
            }
        });
    }

    window.addEventListener("scroll", revealOnScroll);
});
