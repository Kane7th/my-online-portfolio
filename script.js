document.addEventListener("DOMContentLoaded", function() {
    // Typewriter effect for the intro text
    const text = "Kane Kabena";
    let index = 0;
    function typeWriter() {
        if (index < text.length) {
            document.getElementById("intro-text").innerHTML += text.charAt(index);
            index++;
            setTimeout(typeWriter, 100);
        }
    }
    typeWriter();

    // Smooth scrolling for nav links
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const section = document.querySelector(this.getAttribute("href"));
            section.scrollIntoView({ behavior: "smooth" });

            // Highlight active link
            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Change navbar style on scroll
    window.addEventListener("scroll", function() {
        const navbar = document.getElementById("navbar");
        if (window.scrollY > 50) {
            navbar.style.background = "#111";
        } else {
            navbar.style.background = "#222";
        }
    });
});
