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
            
            console.log('🐝 Honeybee Web Design website initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing website:', error);
        }
    }

    initializeModules() {
        try {
            // Initialize Navigation
            if (window.Navigation) {
                this.modules.navigation = new window.Navigation();
                console.log('✅ Navigation module initialized');
            }

            // Initialize Modal Manager
            if (window.ModalManager) {
                this.modules.modalManager = new window.ModalManager();
                console.log('✅ Modal Manager initialized');
            }

            // Initialize Contact Form (depends on Modal Manager)
            if (window.ContactForm && this.modules.modalManager) {
                this.modules.contactForm = new window.ContactForm(this.modules.modalManager);
                console.log('✅ Contact Form initialized');
            }

            // Initialize Testimonial Carousel
            if (window.TestimonialCarousel) {
                this.modules.testimonialCarousel = new window.TestimonialCarousel();
                console.log('✅ Testimonial Carousel initialized');
            }

            // Initialize FAQ
            if (window.FAQ) {
                this.modules.faq = new window.FAQ();
                console.log('✅ FAQ module initialized');
            }

            // Initialize Animations
            if (window.Animations) {
                this.modules.animations = new window.Animations();
                console.log('✅ Animations module initialized');
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
        
        console.log('🧹 Honeybee Website modules cleaned up');
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

// Create and initialize the application
const honeybeeWebsite = new HoneybeeWebsite();

// Auto-initialize when script loads
honeybeeWebsite.init();

// Expose to global scope for debugging
window.HoneybeeWebsite = honeybeeWebsite;
