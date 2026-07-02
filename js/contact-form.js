/**
 * Contact Form Module
 * Handles single-page form validation and submission (all fields visible at once)
 */
class ContactForm {
    constructor(modalManager) {
        this.modalManager = modalManager;
        this.form = document.getElementById('contact-form-element');

        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
    }

    async handleFormSubmission() {
        // Validate every field up front
        if (!this.validateForm()) return;

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Track successful form submission
                if (window.gtag) {
                    gtag('event', 'Form_Success', {
                        event_category: 'conversion',
                        event_label: 'Contact Form Successfully Submitted',
                        value: 1
                    });

                    // Google Ads conversion tracking
                    gtag('event', 'conversion', {
                        'send_to': 'AW-738689668/Qo67CJa80qYbEISFnuAC'
                    });
                }

                // Close contact form modal and show the thank-you modal
                this.modalManager.closeContactModal();
                this.modalManager.showThankYouModal();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            this.showErrorMessage('Sorry, there was an error sending your message. Please try again or email us directly at jake@honeybeewebdesign.com');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        const fields = ['name', 'email', 'phone', 'message'];
        fields.forEach((name) => this.clearFieldError(name));

        let firstInvalid = null;
        const fail = (name, message) => {
            this.setFieldError(name, message);
            if (!firstInvalid) {
                firstInvalid = this.form.querySelector(`[name="${name}"]`);
            }
        };

        const valueOf = (name) => (this.form.querySelector(`[name="${name}"]`)?.value || '').trim();

        const name = valueOf('name');
        const email = valueOf('email');
        const phone = valueOf('phone');
        const message = valueOf('message');

        if (!name) {
            fail('name', 'Please enter your name');
        }

        if (!email) {
            fail('email', 'Please enter your email');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            fail('email', 'Please enter a valid email address');
        }

        // Phone is optional, but if provided it should look like a phone number
        if (phone && !/^[\+]?[\d\s\-\(\)]+$/.test(phone)) {
            fail('phone', 'Please enter a valid phone number');
        }

        if (!message) {
            fail('message', 'Please tell us a little about your project');
        }

        if (firstInvalid) {
            firstInvalid.focus();
            return false;
        }
        return true;
    }

    setFieldError(name, message) {
        const input = this.form.querySelector(`[name="${name}"]`);
        const errorEl = document.getElementById(`${name}-error`);
        if (input) input.setAttribute('aria-invalid', 'true');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }

    clearFieldError(name) {
        const input = this.form.querySelector(`[name="${name}"]`);
        const errorEl = document.getElementById(`${name}-error`);
        if (input) input.setAttribute('aria-invalid', 'false');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('show');
        }
    }

    showErrorMessage(message) {
        let errorDiv = document.getElementById('form-error-message');

        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'form-error-message';
            errorDiv.className = 'form-error-message';

            // Insert just above the submit button
            const actions = this.form.querySelector('.form-actions');
            if (actions) {
                actions.parentNode.insertBefore(errorDiv, actions);
            } else {
                this.form.appendChild(errorDiv);
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
