// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('mobile-open');
        });
        
        // Close mobile menu when clicking nav links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('mobile-open');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            const nav = document.querySelector('.navbar');
            if (!nav.contains(e.target) && navMenu.classList.contains('mobile-open')) {
                navMenu.classList.remove('mobile-open');
            }
        });
        
        // Close mobile menu when window is resized to desktop size
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navMenu.classList.contains('mobile-open')) {
                navMenu.classList.remove('mobile-open');
            }
        });
    }

    // Testimonial Carousel functionality
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');
    let currentSlide = 0;
    let testimonialInterval;
    let autoRotateEnabled = true; // Track if auto-rotation should continue

    function showTestimonialSlide(index) {
        // Hide all slides
        testimonialSlides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Hide all dots
        testimonialDots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show current slide and dot
        if (testimonialSlides[index]) {
            testimonialSlides[index].classList.add('active');
        }
        if (testimonialDots[index]) {
            testimonialDots[index].classList.add('active');
        }
    }

    function nextTestimonialSlide() {
        currentSlide = (currentSlide + 1) % testimonialSlides.length;
        showTestimonialSlide(currentSlide);
    }

    function startTestimonialCarousel() {
        if (autoRotateEnabled) {
            testimonialInterval = setInterval(nextTestimonialSlide, 7000); // Change slide every 7 seconds
        }
    }

    function stopTestimonialCarousel() {
        clearInterval(testimonialInterval);
    }

    // Add click event listeners to dots
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showTestimonialSlide(currentSlide);
            
            // Stop auto-rotation permanently when user manually selects
            autoRotateEnabled = false;
            stopTestimonialCarousel();
        });
    });

    // Start the carousel if there are slides
    if (testimonialSlides.length > 1) {
        startTestimonialCarousel();
        
        // Pause carousel on hover (only if auto-rotation is still enabled)
        const testimonialContainer = document.querySelector('.hero-testimonial');
        if (testimonialContainer) {
            testimonialContainer.addEventListener('mouseenter', () => {
                if (autoRotateEnabled) {
                    stopTestimonialCarousel();
                }
            });
            testimonialContainer.addEventListener('mouseleave', () => {
                if (autoRotateEnabled) {
                    startTestimonialCarousel();
                }
            });
        }
    }

    // Modal functionality
    const modal = document.getElementById('contact-modal');
    const openModalBtn = document.getElementById('open-modal');
    const navOpenModalBtn = document.getElementById('nav-open-modal');
    const pricingOpenModalBtn = document.getElementById('pricing-open-modal');
    const closeModalBtn = document.querySelector('.close');
    
    // Function to open modal
    function openModal(e) {
        e.preventDefault();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Auto-focus on the first input field
        setTimeout(() => {
            const firstInput = modal.querySelector('input[name="name"]');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100); // Small delay to ensure modal is fully rendered
    }
    
    // Add event listeners to all modal open buttons
    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', openModal);
    }
    if (navOpenModalBtn && modal) {
        navOpenModalBtn.addEventListener('click', openModal);
    }
    if (pricingOpenModalBtn && modal) {
        pricingOpenModalBtn.addEventListener('click', openModal);
    }
    
    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        });
    }
    
    // Close modal when clicking outside of it
    if (modal) {
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // FAQ functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    // Contact form functionality
    const contactForms = document.querySelectorAll('#contact-form-element, #contact-form');
    
    contactForms.forEach(form => {
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Simple validation
                const requiredFields = ['name', 'firstName', 'lastName', 'email', 'message'];
                let isValid = true;
                
                requiredFields.forEach(field => {
                    const input = form.querySelector(`[name="${field}"]`);
                    if (input && input.hasAttribute('required') && !data[field]) {
                        isValid = false;
                        input.style.borderColor = '#E53E3E';
                    } else if (input) {
                        input.style.borderColor = '#E5E5E7';
                    }
                });
                
                if (!isValid) {
                    alert('Please fill in all required fields.');
                    return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.email)) {
                    alert('Please enter a valid email address.');
                    return;
                }
                
                // Show success message
                alert('Thank you for your message! We will get back to you within 2 hours.');
                
                // Reset form
                form.reset();
            });
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Enhanced navbar scroll effect with logo centering (only on homepage)
    const navbar = document.querySelector('.navbar');
    const isHomepage = document.querySelector('#home'); // Hero section only exists on homepage
    
    if (isHomepage) {
        function updateNavbar() {
            if (window.scrollY > 50) {
                navbar.classList.remove('at-top');
                navbar.classList.add('scrolled');
                navbar.style.backgroundColor = 'rgba(37, 40, 61, 0.95)';
            } else {
                navbar.classList.remove('scrolled');
                navbar.classList.add('at-top');
                navbar.style.backgroundColor = '#25283D';
            }
        }
        
        // Set initial state
        if (window.scrollY <= 50) {
            navbar.classList.add('at-top');
        } else {
            navbar.classList.add('scrolled');
        }
        
        window.addEventListener('scroll', updateNavbar);
    } else {
        // Standard navbar behavior for other pages
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = 'rgba(37, 40, 61, 0.95)';
            } else {
                navbar.style.backgroundColor = '#25283D';
            }
        });
    }
});