/**
 * Contact Form Module
 * Handles form submission, validation, and email sending
 */
class ContactForm {
    constructor(modalManager) {
        this.modalManager = modalManager;
        this.form = document.getElementById('contact-form-element');
        
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.setupFormSubmission();
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
    }

    async handleFormSubmission() {
        // Validate the final step
        if (!this.modalManager.validateCurrentStep()) {
            return;
        }

        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        // Validate required fields
        if (!this.validateFormData(data)) {
            return;
        }

        // Show loading state
        const submitBtn = document.getElementById('form-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Send email using Netlify Function with AWS SES
            const response = await fetch('/.netlify/functions/send-contact-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    message: data.message
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log('SUCCESS!', result.messageId);
                
                // Close contact form modal
                this.modalManager.closeContactModal();
                
                // Show thank you modal
                this.modalManager.showThankYouModal();
                
                // Reset the multi-step form for next time
                this.modalManager.resetMultiStepForm();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('FAILED...', error);
            
            // Show user-friendly error message
            this.showErrorMessage('Sorry, there was an error sending your message. Please try again or contact us directly at jake@honeybeewebdesign.com');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateFormData(data) {
        const requiredFields = ['name', 'email', 'message'];
        let isValid = true;

        requiredFields.forEach(field => {
            const input = this.form.querySelector(`[name="${field}"]`);
            if (input && input.hasAttribute('required') && !data[field]) {
                isValid = false;
                input.style.borderColor = '#E53E3E';
                input.setAttribute('aria-invalid', 'true');
            } else if (input) {
                input.style.borderColor = '#E5E5E7';
                input.setAttribute('aria-invalid', 'false');
            }
        });

        if (!isValid) {
            this.showErrorMessage('Please fill in all required fields.');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            const emailInput = this.form.querySelector('[name="email"]');
            if (emailInput) {
                emailInput.style.borderColor = '#E53E3E';
                emailInput.setAttribute('aria-invalid', 'true');
            }
            this.showErrorMessage('Please enter a valid email address.');
            return false;
        }

        return true;
    }

    showErrorMessage(message) {
        // Create or update error message display
        let errorDiv = document.getElementById('form-error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'form-error-message';
            errorDiv.className = 'form-error-message';
            errorDiv.style.cssText = `
                background: #fee;
                border: 1px solid #fcc;
                color: #c33;
                padding: 1rem;
                border-radius: 6px;
                margin: 1rem 0;
                text-align: center;
                font-size: 14px;
            `;
            
            // Insert before form navigation
            const navigation = this.form.querySelector('.form-navigation');
            if (navigation) {
                navigation.parentNode.insertBefore(errorDiv, navigation);
            }
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 10000);
    }
}

// Export for use in main.js
window.ContactForm = ContactForm;
