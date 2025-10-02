/**
 * Navigation Module
 * Handles mobile menu, smooth scrolling, and navbar scroll effects
 */
class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.navMenu = document.querySelector('.nav-menu');
        this.isHomepage = document.querySelector('#home'); // Hero section only exists on homepage
        
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupNavbarScrollEffect();
    }

    setupMobileMenu() {
        if (!this.mobileMenuBtn || !this.navMenu) return;

        // Toggle mobile menu
        this.mobileMenuBtn.addEventListener('click', () => {
            const isOpen = this.navMenu.classList.contains('mobile-open');
            this.navMenu.classList.toggle('mobile-open');
            
            // Update ARIA attributes for accessibility
            this.mobileMenuBtn.setAttribute('aria-expanded', !isOpen);
        });

        // Close mobile menu when clicking nav links
        const navLinks = this.navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('mobile-open');
                this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const nav = document.querySelector('.navbar');
            if (!nav.contains(e.target) && this.navMenu.classList.contains('mobile-open')) {
                this.navMenu.classList.remove('mobile-open');
                this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close mobile menu when window is resized to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.navMenu.classList.contains('mobile-open')) {
                this.navMenu.classList.remove('mobile-open');
                this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const navbarHeight = this.navbar.offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight - 5; // Add 5px offset
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupNavbarScrollEffect() {
        if (!this.navbar) return;

        // Enhanced navbar scroll effect with logo centering (only on homepage)
        if (this.isHomepage) {
            const updateNavbar = () => {
                if (window.scrollY > 50) {
                    this.navbar.classList.remove('at-top');
                    this.navbar.classList.add('scrolled');
                    this.navbar.style.backgroundColor = 'rgba(37, 40, 61, 0.95)';
                } else {
                    this.navbar.classList.remove('scrolled');
                    this.navbar.classList.add('at-top');
                    this.navbar.style.backgroundColor = '#25283D';
                }
            };
            
            // Set initial state
            if (window.scrollY <= 50) {
                this.navbar.classList.add('at-top');
            } else {
                this.navbar.classList.add('scrolled');
            }
            
            window.addEventListener('scroll', updateNavbar);
        } else {
            // Standard navbar behavior for other pages
            this.navbar.classList.add('scrolled');
        }
    }
}

// Export for use in main.js
window.Navigation = Navigation;
