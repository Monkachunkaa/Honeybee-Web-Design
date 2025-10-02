/**
 * Modal Module
 * Handles contact modal, thank you modal, and multi-step form functionality
 */
class ModalManager {
    constructor() {
        this.contactModal = document.getElementById('contact-modal');
        this.thankYouModal = document.getElementById('thank-you-modal');
        this.currentStep = 1;
        this.totalSteps = 4;
        
        this.init();
    }

    init() {
        this.setupContactModal();
        this.setupThankYouModal();
        this.setupMultiStepForm();
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

        // Add event listeners to all modal open buttons
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

    setupMultiStepForm() {
        const nextBtn = document.getElementById('form-next');
        const backBtn = document.getElementById('form-back');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.validateCurrentStep() && this.currentStep < this.totalSteps) {
                    this.currentStep++;
                    this.updateFormStep(this.currentStep);
                }
            });
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (this.currentStep > 1) {
                    this.currentStep--;
                    this.updateFormStep(this.currentStep);
                }
            });
        }
    }

    setupKeyboardHandlers() {
        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.thankYouModal && this.thankYouModal.style.display === 'block') {
                    this.closeThankYouModal();
                } else if (this.contactModal && this.contactModal.style.display === 'block') {
                    this.closeContactModal();
                }
            }
        });

        // Enter key handler for form progression
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.contactModal && this.contactModal.style.display === 'block') {
                e.preventDefault();
                if (this.currentStep < this.totalSteps) {
                    if (this.validateCurrentStep()) {
                        this.currentStep++;
                        this.updateFormStep(this.currentStep);
                    }
                } else {
                    // Submit the form
                    const submitBtn = document.getElementById('form-submit');
                    if (submitBtn) submitBtn.click();
                }
            }
        });
    }

    openContactModal(e) {
        e.preventDefault();
        if (!this.contactModal) return;

        this.contactModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.resetMultiStepForm();
        
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
        
        // Reset contact form
        const contactForm = document.getElementById('contact-form-element');
        if (contactForm) {
            contactForm.reset();
        }
    }

    closeThankYouModal() {
        if (!this.thankYouModal) return;

        this.thankYouModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    updateFormStep(step) {
        const formSteps = document.querySelectorAll('.form-step');
        const progressFill = document.querySelector('.progress-fill');
        const backBtn = document.getElementById('form-back');
        const nextBtn = document.getElementById('form-next');
        const submitBtn = document.getElementById('form-submit');
        
        // Hide all steps
        formSteps.forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'prev');
            if (index + 1 < step) {
                stepEl.classList.add('prev');
            } else if (index + 1 === step) {
                stepEl.classList.add('active');
            }
        });
        
        // Update progress bar
        const progressPercent = (step / this.totalSteps) * 100;
        if (progressFill) {
            progressFill.style.width = progressPercent + '%';
        }
        
        // Update button visibility
        if (backBtn) backBtn.style.display = step > 1 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = step < this.totalSteps ? 'block' : 'none';
        if (submitBtn) submitBtn.style.display = step === this.totalSteps ? 'block' : 'none';
        
        // Focus on the current input
        setTimeout(() => {
            const activeStep = document.querySelector('.form-step.active');
            const input = activeStep?.querySelector('input, textarea');
            if (input) {
                input.focus();
            }
        }, 300);
    }

    validateCurrentStep() {
        const activeStep = document.querySelector('.form-step.active');
        const input = activeStep?.querySelector('input, textarea');
        const errorMessage = activeStep?.querySelector('.error-message');
        
        if (!input || !errorMessage) return true;
        
        // Clear previous error
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
        
        if (input.hasAttribute('required')) {
            if (!input.value.trim()) {
                this.showFieldError(input, errorMessage, 'This field is required');
                return false;
            }
            
            // Email validation
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    this.showFieldError(input, errorMessage, 'Please enter a valid email address');
                    return false;
                }
            }

            // Phone validation (optional but if provided, should be valid)
            if (input.type === 'tel' && input.value.trim()) {
                const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
                if (!phoneRegex.test(input.value)) {
                    this.showFieldError(input, errorMessage, 'Please enter a valid phone number');
                    return false;
                }
            }
        }
        
        // Clear error state if validation passes
        input.style.borderColor = '#E5E5E7';
        input.setAttribute('aria-invalid', 'false');
        return true;
    }

    showFieldError(input, errorMessage, message) {
        input.style.borderColor = '#E53E3E';
        input.setAttribute('aria-invalid', 'true');
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        input.focus();
    }

    resetMultiStepForm() {
        this.currentStep = 1;
        this.updateFormStep(this.currentStep);
        
        // Clear all inputs and errors
        const form = document.getElementById('contact-form-element');
        if (form) {
            form.reset();
            
            // Reset border colors and error messages
            const inputs = form.querySelectorAll('input, textarea');
            const errorMessages = form.querySelectorAll('.error-message');
            
            inputs.forEach(input => {
                input.style.borderColor = '#E5E5E7';
                input.setAttribute('aria-invalid', 'false');
            });
            
            errorMessages.forEach(error => {
                error.textContent = '';
                error.classList.remove('show');
            });
        }
    }
}

// Export for use in main.js
window.ModalManager = ModalManager;
