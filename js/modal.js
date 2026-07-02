/**
 * Modal Module
 * Handles the contact modal, thank-you modal, and portfolio lightbox
 */
class ModalManager {
    constructor() {
        this.contactModal = document.getElementById('contact-modal');
        this.thankYouModal = document.getElementById('thank-you-modal');
        this.portfolioModal = document.getElementById('portfolio-modal');
        this.lastFocusedTrigger = null;

        this.init();
    }

    init() {
        this.setupContactModal();
        this.setupThankYouModal();
        this.setupPortfolioModal();
        this.setupKeyboardHandlers();
    }

    setupContactModal() {
        if (!this.contactModal) return;

        // Modal open buttons
        const openButtons = [
            document.getElementById('open-modal'),
            document.getElementById('nav-open-modal'),
            document.getElementById('pricing-open-modal')
        ].filter(Boolean);

        openButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.openContactModal(e));
        });

        // Close button
        const closeBtn = this.contactModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeContactModal());
        }

        // Click outside to close
        window.addEventListener('click', (e) => {
            if (e.target === this.contactModal) {
                this.closeContactModal();
            }
        });
    }

    setupThankYouModal() {
        if (!this.thankYouModal) return;

        const closeBtn = this.thankYouModal.querySelector('.thank-you-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeThankYouModal());
        }

        // Click outside to close
        window.addEventListener('click', (e) => {
            if (e.target === this.thankYouModal) {
                this.closeThankYouModal();
            }
        });
    }

    setupPortfolioModal() {
        if (!this.portfolioModal) return;

        this.portfolioImg = this.portfolioModal.querySelector('.portfolio-modal-img');
        this.portfolioTitle = this.portfolioModal.querySelector('.portfolio-modal-title');
        this.portfolioBody = this.portfolioModal.querySelector('.portfolio-modal-body');

        // Open the lightbox from any portfolio card
        document.querySelectorAll('.browser-mockup[data-screenshot]').forEach(trigger => {
            trigger.addEventListener('click', () => this.openPortfolioModal(trigger));
        });

        // Close button
        const closeBtn = this.portfolioModal.querySelector('.portfolio-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePortfolioModal());
        }

        // Click outside to close
        window.addEventListener('click', (e) => {
            if (e.target === this.portfolioModal) {
                this.closePortfolioModal();
            }
        });
    }

    openPortfolioModal(trigger) {
        if (!this.portfolioModal) return;

        const src = trigger.getAttribute('data-screenshot');
        const title = trigger.getAttribute('data-title') || '';

        this.lastFocusedTrigger = trigger;

        if (this.portfolioImg && src) {
            this.portfolioImg.src = src;
            this.portfolioImg.alt = title ? `${title} \u2014 full site screenshot` : 'Full site screenshot';
        }
        if (this.portfolioTitle) {
            this.portfolioTitle.textContent = title;
        }

        this.portfolioModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Always start scrolled to the top of the screenshot
        if (this.portfolioBody) this.portfolioBody.scrollTop = 0;

        // Move focus into the modal for keyboard users
        const closeBtn = this.portfolioModal.querySelector('.portfolio-modal-close');
        if (closeBtn) closeBtn.focus();

        if (window.gtag) {
            gtag('event', 'Portfolio_View', {
                event_category: 'engagement',
                event_label: title || 'Portfolio screenshot viewed'
            });
        }
    }

    closePortfolioModal() {
        if (!this.portfolioModal) return;

        this.portfolioModal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Return focus to the card that opened the modal
        if (this.lastFocusedTrigger) {
            this.lastFocusedTrigger.focus();
            this.lastFocusedTrigger = null;
        }
    }

    setupKeyboardHandlers() {
        // Escape closes whichever modal is open
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.portfolioModal && this.portfolioModal.style.display === 'block') {
                    this.closePortfolioModal();
                } else if (this.thankYouModal && this.thankYouModal.style.display === 'block') {
                    this.closeThankYouModal();
                } else if (this.contactModal && this.contactModal.style.display === 'block') {
                    this.closeContactModal();
                }
            }
        });
    }

    openContactModal(e) {
        e.preventDefault();
        if (!this.contactModal) return;

        this.resetContactForm();
        this.contactModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Focus the first field for convenience
        setTimeout(() => {
            const firstField = document.getElementById('name');
            if (firstField) firstField.focus();
        }, 100);

        // Track modal open
        if (window.gtag) {
            gtag('event', 'Modal_Open', {
                event_category: 'engagement',
                event_label: 'Contact Form Modal Opened'
            });
        }
    }

    closeContactModal() {
        if (!this.contactModal) return;

        this.contactModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showThankYouModal() {
        if (!this.thankYouModal) return;

        this.thankYouModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Clear the contact form for next time
        this.resetContactForm();
    }

    closeThankYouModal() {
        if (!this.thankYouModal) return;

        this.thankYouModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    resetContactForm() {
        const form = document.getElementById('contact-form-element');
        if (!form) return;

        form.reset();

        // Clear validation state
        form.querySelectorAll('input, textarea').forEach((el) => {
            el.setAttribute('aria-invalid', 'false');
        });
        form.querySelectorAll('.error-message').forEach((el) => {
            el.textContent = '';
            el.classList.remove('show');
        });

        // Hide the general error banner if it's present
        const banner = document.getElementById('form-error-message');
        if (banner) banner.style.display = 'none';
    }
}

// Export for use in main.js
window.ModalManager = ModalManager;
