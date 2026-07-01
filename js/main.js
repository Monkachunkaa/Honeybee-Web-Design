/**
 * Main Application Entry Point
 * Initializes all modules and coordinates application startup
 */
class HoneybeeWebsite {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize all modules in order
            this.initializeModules();
            
            // Mark as initialized
            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Error initializing website:', error);
        }
    }

    initializeModules() {
        try {
            // Initialize Navigation
            if (window.Navigation) {
                this.modules.navigation = new window.Navigation();
            }

            // Initialize Modal Manager
            if (window.ModalManager) {
                this.modules.modalManager = new window.ModalManager();
            }

            // Initialize Contact Form (depends on Modal Manager)
            if (window.ContactForm && this.modules.modalManager) {
                this.modules.contactForm = new window.ContactForm(this.modules.modalManager);
            }

            // Initialize Testimonial Carousel
            if (window.TestimonialCarousel) {
                this.modules.testimonialCarousel = new window.TestimonialCarousel();
            }

            // Initialize FAQ
            if (window.FAQ) {
                this.modules.faq = new window.FAQ();
            }

            // Initialize Animations
            if (window.Animations) {
                this.modules.animations = new window.Animations();
            }

            // Initialize YouTube Lazy Load
            if (window.YouTubeLazyLoad) {
                this.modules.youtubeLazyLoad = new window.YouTubeLazyLoad();
            }

            // Initialize Portfolio Carousel
            if (window.PortfolioCarousel) {
                this.modules.portfolioCarousel = new window.PortfolioCarousel();
            }

            // Initialize Analytics Tracker
            if (window.AnalyticsTracker) {
                this.modules.analyticsTracker = new window.AnalyticsTracker();
            }

        } catch (error) {
            console.error('Error initializing modules:', error);
        }
    }

    // Public API for accessing modules
    getModule(moduleName) {
        return this.modules[moduleName] || null;
    }

    // Cleanup method for SPA navigation or testing
    destroy() {
        Object.values(this.modules).forEach(module => {
            if (typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        
        this.modules = {};
        this.isInitialized = false;
    }

    // Method to reinitialize if needed
    async reinitialize() {
        this.destroy();
        await this.init();
    }
}

// Global error handler for uncaught JavaScript errors
window.addEventListener('error', (event) => {
    console.error('🚨 JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

// Update footer copyright year dynamically
const footerYear = document.getElementById('footer-year');
if (footerYear) {
    const year = new Date().getFullYear();
    footerYear.innerHTML = `&copy; ${year} Honeybee Web Design. All rights reserved.`;
}

// Create and initialize the application
const honeybeeWebsite = new HoneybeeWebsite();

// Auto-initialize when script loads
honeybeeWebsite.init();

// Expose to global scope for debugging
window.HoneybeeWebsite = honeybeeWebsite;
