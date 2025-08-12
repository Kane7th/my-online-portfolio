document.addEventListener("DOMContentLoaded", function () {
    // ===== Typewriter Effect =====
    const text = "Kane Kabena";
    const introEl = document.getElementById("intro-text");
    let index = 0;
    introEl.textContent = ""; // Clear any preloaded text

    function typeWriter() {
        if (index < text.length) {
            introEl.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 100);
        }
    }
    typeWriter();

    // ===== Smooth Scrolling for Nav Links =====
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            const section = document.querySelector(this.getAttribute("href"));
            section.scrollIntoView({ behavior: "smooth" });

            navLinks.forEach((l) => l.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // ===== Active Link on Scroll =====
    const sections = document.querySelectorAll("section[id]");
    function updateActiveLink() {
        let scrollPos = window.scrollY + 100; // offset for nav height
        sections.forEach((section) => {
            if (
                scrollPos >= section.offsetTop &&
                scrollPos < section.offsetTop + section.offsetHeight
            ) {
                navLinks.forEach((link) => link.classList.remove("active"));
                document
                    .querySelector(`.nav-link[href="#${section.id}"]`)
                    ?.classList.add("active");
            }
        });
    }

    // ===== Navbar Style on Scroll (CSS class toggle) =====
    const navbar = document.getElementById("navbar");
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }

    // ===== Throttle scroll updates for performance =====
    let scrollTimeout;
    window.addEventListener("scroll", function () {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(function () {
                updateActiveLink();
                handleNavbarScroll();
                scrollTimeout = null;
            }, 100);
        }
    });

    // Initial check
    updateActiveLink();
    handleNavbarScroll();
});
