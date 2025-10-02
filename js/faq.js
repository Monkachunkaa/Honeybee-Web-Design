/**
 * FAQ Module
 * Handles FAQ accordion functionality
 */
class FAQ {
    constructor() {
        this.faqQuestions = document.querySelectorAll('.faq-question');
        
        this.init();
    }

    init() {
        this.setupAccordion();
    }

    setupAccordion() {
        this.faqQuestions.forEach((question, index) => {
            // Add ARIA attributes for accessibility
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const questionId = `faq-question-${index}`;
            const answerId = `faq-answer-${index}`;
            
            // Set up ARIA attributes
            question.setAttribute('id', questionId);
            question.setAttribute('aria-expanded', 'false');
            question.setAttribute('aria-controls', answerId);
            
            if (answer) {
                answer.setAttribute('id', answerId);
                answer.setAttribute('aria-labelledby', questionId);
            }

            question.addEventListener('click', () => {
                const isActive = faqItem.classList.contains('active');
                
                // Close all FAQ items
                this.closeAllItems();
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    this.openItem(faqItem, question);
                }
            });

            // Add keyboard navigation
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        });
    }

    closeAllItems() {
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
            const button = item.querySelector('.faq-question');
            if (button) {
                button.setAttribute('aria-expanded', 'false');
                // Remove focus to prevent persistent orange border
                if (document.activeElement === button) {
                    button.blur();
                }
            }
        });
    }

    openItem(item, button) {
        item.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
        
        // Smooth scroll to opened item if it's below the fold
        setTimeout(() => {
            const rect = item.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
                item.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }
        }, 300); // Wait for animation to start
    }
}

// Export for use in main.js
window.FAQ = FAQ;
