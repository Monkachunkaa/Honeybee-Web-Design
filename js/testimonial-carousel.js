/**
 * Testimonial Carousel Module
 * Handles automatic and manual testimonial rotation
 */
class TestimonialCarousel {
    constructor() {
        this.slides = document.querySelectorAll('.testimonial-slide');
        this.dots = document.querySelectorAll('.testimonial-dots .dot');
        this.container = document.querySelector('.testimonial-carousel');
        this.currentSlide = 0;
        this.interval = null;
        this.autoRotateEnabled = true;
        this.rotationDelay = 7000; // 7 seconds
        
        this.init();
    }

    init() {
        if (this.slides.length <= 1) return; // No need for carousel with single slide
        
        this.setupEventListeners();
        this.startAutoRotation();
        this.setupHoverPause();
    }

    setupEventListeners() {
        // Click handler for testimonial container
        if (this.container) {
            this.container.addEventListener('click', () => {
                this.nextSlide();
                this.stopAutoRotation(); // Stop auto-rotation permanently when user clicks
            });
            
            // Add cursor pointer style to indicate clickability
            this.container.style.cursor = 'pointer';
        }

        // Add click event listeners to dots
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the container click
                this.goToSlide(index);
                this.stopAutoRotation(); // Stop auto-rotation permanently when user manually selects
            });
        });
    }

    setupHoverPause() {
        const testimonialSection = document.querySelector('.hero-testimonial');
        if (!testimonialSection) return;

        testimonialSection.addEventListener('mouseenter', () => {
            if (this.autoRotateEnabled) {
                this.pauseAutoRotation();
            }
        });

        testimonialSection.addEventListener('mouseleave', () => {
            if (this.autoRotateEnabled) {
                this.startAutoRotation();
            }
        });
    }

    showSlide(index) {
        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Hide all dots
        this.dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show current slide and dot
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }
        if (this.dots[index]) {
            this.dots[index].classList.add('active');
        }
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(this.currentSlide);
    }

    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.currentSlide = index;
            this.showSlide(this.currentSlide);
        }
    }

    startAutoRotation() {
        if (!this.autoRotateEnabled) return;
        
        this.pauseAutoRotation(); // Clear any existing interval
        this.interval = setInterval(() => {
            this.nextSlide();
        }, this.rotationDelay);
    }

    pauseAutoRotation() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    stopAutoRotation() {
        this.autoRotateEnabled = false;
        this.pauseAutoRotation();
    }

    // Public method to resume auto-rotation if needed
    resumeAutoRotation() {
        this.autoRotateEnabled = true;
        this.startAutoRotation();
    }
}

// Export for use in main.js
window.TestimonialCarousel = TestimonialCarousel;