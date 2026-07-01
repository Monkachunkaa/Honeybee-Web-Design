/**
 * Portfolio Carousel Module
 * Vanilla-JS port of a 3D card carousel for the hero section.
 * Loops infinitely in both directions. Sets CSS custom properties
 * (--offset, --abs-offset, --direction) that drive the 3D transforms
 * defined in sections.css.
 */
class PortfolioCarousel {
    constructor() {
        this.carousel = document.querySelector('.hero-carousel .carousel');
        // How many cards to show on each side of the active one.
        // With 4 cards this keeps a clean 3-card arc and hides the "opposite"
        // card, which avoids the awkward even-count flip when wrapping.
        this.visibleRange = 1;
        this.active = 0;

        this.init();
    }

    init() {
        if (!this.carousel) return;

        this.cards = Array.from(this.carousel.querySelectorAll('.card-container'));
        this.count = this.cards.length;
        if (this.count === 0) return;

        this.leftBtn = this.carousel.querySelector('.carousel-nav.left');
        this.rightBtn = this.carousel.querySelector('.carousel-nav.right');

        if (this.leftBtn) {
            this.leftBtn.addEventListener('click', () => this.go(this.active - 1));
        }
        if (this.rightBtn) {
            this.rightBtn.addEventListener('click', () => this.go(this.active + 1));
        }

        // Arrow-key navigation when the carousel is focused
        this.carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.go(this.active - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.go(this.active + 1);
            }
        });

        this.setupSwipe();
        this.update();
    }

    go(index) {
        // Wrap around infinitely in both directions
        this.active = ((index % this.count) + this.count) % this.count;
        this.update();
    }

    update() {
        const half = this.count / 2;

        this.cards.forEach((card, i) => {
            // Shortest signed distance around the ring, so cards cycle both ways
            let offset = this.active - i;
            if (offset > half) {
                offset -= this.count;
            } else if (offset < -half) {
                offset += this.count;
            }

            const absOffset = Math.abs(offset);
            const visible = absOffset <= this.visibleRange;

            card.style.setProperty('--offset', offset);
            card.style.setProperty('--abs-offset', absOffset);
            card.style.setProperty('--direction', Math.sign(offset));

            card.style.display = visible ? 'block' : 'none';
            card.style.opacity = visible ? '1' : '0';
            card.style.pointerEvents = i === this.active ? 'auto' : 'none';
            card.setAttribute('aria-hidden', i === this.active ? 'false' : 'true');

            // Keep only the active card in the tab order
            const trigger = card.querySelector('.browser-mockup');
            if (trigger) {
                trigger.tabIndex = i === this.active ? 0 : -1;
            }
        });
    }

    setupSwipe() {
        let startX = 0;
        let tracking = false;

        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            tracking = true;
        }, { passive: true });

        this.carousel.addEventListener('touchend', (e) => {
            if (!tracking) return;
            tracking = false;
            const deltaX = e.changedTouches[0].clientX - startX;
            if (Math.abs(deltaX) > 40) {
                this.go(this.active + (deltaX < 0 ? 1 : -1));
            }
        }, { passive: true });
    }
}

// Export for use in main.js
window.PortfolioCarousel = PortfolioCarousel;
