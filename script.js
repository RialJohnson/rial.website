// Load Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Load navigation from external file
    fetch('/nav.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('afterbegin', data);

            // Set active navigation item based on current page
            setActiveNavItem();

            // Initialize mobile navigation toggle
            initMobileNav();
        })
        .catch(error => console.error('Error loading navigation:', error));
});

// Set active navigation item based on current page
function setActiveNavItem() {
    function normalizePath(path) {
        if (!path) return '/';
        let normalized = path;
        normalized = normalized.replace(/\/index\.html$/i, '/');
        normalized = normalized.replace(/\/{2,}/g, '/');
        if (normalized.length > 1 && normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
        return normalized || '/';
    }

    const currentPath = normalizePath(window.location.pathname);
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkPath = normalizePath(new URL(href, window.location.origin).pathname);
        const isExactMatch = linkPath === currentPath;
        const isSectionMatch = linkPath !== '/' && currentPath.startsWith(linkPath + '/');
        if (isExactMatch || isSectionMatch) {
            link.classList.add('active');
        }
    });
}

// Mobile Navigation Toggle
function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}