/**
 * Animations Module
 * Handles scroll-based animations and visual effects
 */
class Animations {
    constructor() {
        this.timelineItems = document.querySelectorAll('.timeline li');
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -20% 0px'
        };
        
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
    }

    setupIntersectionObserver() {
        // Use Intersection Observer for better performance than scroll events
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                this.observerOptions
            );

            // Observe timeline items
            this.timelineItems.forEach(item => {
                this.observer.observe(item);
            });
        } else {
            // Fallback for older browsers
            this.setupScrollAnimations();
        }
    }

    handleIntersection(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting && !entry.target.classList.contains('fade-in')) {
                // Add a slight stagger delay based on the element's position
                const delay = this.getElementIndex(entry.target) * 150;
                
                setTimeout(() => {
                    entry.target.classList.add('fade-in');
                }, delay);
            }
        });
    }

    getElementIndex(element) {
        return Array.from(this.timelineItems).indexOf(element);
    }

    setupScrollAnimations() {
        // Fallback scroll-based animation for older browsers
        const checkTimelineVisibility = () => {
            const triggerBottom = window.innerHeight * 0.8;
            
            this.timelineItems.forEach((item, index) => {
                const itemTop = item.getBoundingClientRect().top;
                
                if (itemTop < triggerBottom && !item.classList.contains('fade-in')) {
                    setTimeout(() => {
                        item.classList.add('fade-in');
                    }, index * 150);
                }
            });
        };

        // Throttle scroll events for better performance
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    checkTimelineVisibility();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
        
        // Check on initial load
        checkTimelineVisibility();
    }

    // Method to trigger animations programmatically
    animateElement(element, animationClass = 'fade-in', delay = 0) {
        setTimeout(() => {
            element.classList.add(animationClass);
        }, delay);
    }

    // Cleanup method
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Export for use in main.js
window.Animations = Animations;
