/**
 * Analytics Tracking Module
 * Tracks user interactions with Google Analytics
 * - YouTube video views and watch duration
 * - CTA button clicks and form opens
 * - Section visibility (scroll tracking)
 */
class AnalyticsTracker {
    constructor() {
        this.trackedSections = new Set();
        this.videoStartTime = null;
        this.videoWatchDuration = 0;
        this.videoCheckInterval = null;
        
        // Check if gtag is available
        this.isGtagAvailable = typeof gtag !== 'undefined';
        
        this.init();
    }

    init() {
        if (!this.isGtagAvailable) {
            console.warn('Google Analytics (gtag) not loaded');
            return;
        }

        this.trackCTAClicks();
        this.trackSectionViews();
        this.trackYouTubeEvents();
    }

    /**
     * Track all CTA button clicks and modal opens
     */
    trackCTAClicks() {
        // Track all "Let's Talk" / "Start Today" CTA buttons
        const ctaButtons = [
            { id: 'open-modal', label: 'Hero CTA - Start Today' },
            { id: 'nav-open-modal', label: 'Nav CTA - Lets Talk' },
            { id: 'pricing-open-modal', label: 'Pricing CTA - Start Today' }
        ];

        ctaButtons.forEach(({ id, label }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    this.trackEvent('CTA_Click', {
                        cta_location: label,
                        event_category: 'engagement',
                        event_label: label
                    });
                });
            }
        });

        // Track contact form submission
        const contactForm = document.getElementById('contact-form-element');
        if (contactForm) {
            contactForm.addEventListener('submit', () => {
                this.trackEvent('Form_Submit', {
                    form_name: 'Contact Form',
                    event_category: 'conversion',
                    event_label: 'Contact Form Submitted'
                });
            });
        }

        // Track FAQ interactions
        const faqButtons = document.querySelectorAll('.faq-question');
        faqButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const questionText = button.querySelector('span')?.textContent || `FAQ ${index + 1}`;
                this.trackEvent('FAQ_Click', {
                    question: questionText,
                    event_category: 'engagement',
                    event_label: questionText
                });
            });
        });
    }

    /**
     * Track when sections come into view
     */
    trackSectionViews() {
        const sections = [
            { id: 'home', name: 'Hero Section' },
            { id: 'what-to-expect', name: 'What to Expect Section' },
            { id: 'pricing', name: 'Pricing Section' },
            { id: 'faq', name: 'FAQ Section' }
        ];

        // Use Intersection Observer for efficient scroll tracking
        const observerOptions = {
            threshold: 0.5, // 50% of section must be visible
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionName = entry.target.dataset.analyticsName;
                    
                    // Only track each section once per session
                    if (!this.trackedSections.has(sectionName)) {
                        this.trackedSections.add(sectionName);
                        
                        this.trackEvent('Section_View', {
                            section_name: sectionName,
                            event_category: 'engagement',
                            event_label: `Viewed ${sectionName}`
                        });
                    }
                }
            });
        }, observerOptions);

        // Observe each section
        sections.forEach(({ id, name }) => {
            const section = document.getElementById(id);
            if (section) {
                section.dataset.analyticsName = name;
                observer.observe(section);
            }
        });
    }

    /**
     * Track YouTube video interactions
     */
    trackYouTubeEvents() {
        // Track when video play button is clicked (video starts loading)
        const videoWrappers = document.querySelectorAll('.video-wrapper[data-video-id]');
        
        videoWrappers.forEach(wrapper => {
            const placeholder = wrapper.querySelector('.video-placeholder');
            const playButton = wrapper.querySelector('.video-play-button');
            
            if (placeholder && playButton) {
                const handleVideoClick = () => {
                    const videoId = wrapper.dataset.videoId;
                    
                    // Track video start
                    this.trackEvent('Video_Play', {
                        video_id: videoId,
                        video_title: 'Honeybee Web Design Introduction',
                        event_category: 'engagement',
                        event_label: 'YouTube Video Started'
                    });
                    
                    // Start tracking watch duration
                    this.startVideoTracking(videoId);
                    
                    // Remove listener after first click
                    placeholder.removeEventListener('click', handleVideoClick);
                };
                
                placeholder.addEventListener('click', handleVideoClick);
            }
        });

        // Track when user leaves page (to capture watch duration)
        window.addEventListener('beforeunload', () => {
            if (this.videoStartTime !== null) {
                this.stopVideoTracking();
            }
        });

        // Track when user switches tabs/windows
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.videoStartTime !== null) {
                // Pause tracking when tab is hidden
                this.pauseVideoTracking();
            } else if (!document.hidden && this.videoCheckInterval !== null) {
                // Resume tracking when tab is visible
                this.resumeVideoTracking();
            }
        });
    }

    /**
     * Start tracking video watch duration
     */
    startVideoTracking(videoId) {
        this.videoStartTime = Date.now();
        this.videoWatchDuration = 0;
        
        // Check every 10 seconds and track milestones
        this.videoCheckInterval = setInterval(() => {
            const currentDuration = Math.floor((Date.now() - this.videoStartTime) / 1000);
            
            // Track milestones: 10s, 30s, 60s, 120s
            const milestones = [10, 30, 60, 120];
            milestones.forEach(milestone => {
                if (currentDuration >= milestone && this.videoWatchDuration < milestone) {
                    this.trackEvent('Video_Milestone', {
                        video_id: videoId,
                        milestone: `${milestone}s`,
                        event_category: 'engagement',
                        event_label: `Watched ${milestone} seconds`,
                        value: milestone
                    });
                }
            });
            
            this.videoWatchDuration = currentDuration;
        }, 1000);
    }

    /**
     * Pause video tracking (when tab is hidden)
     */
    pauseVideoTracking() {
        if (this.videoCheckInterval) {
            clearInterval(this.videoCheckInterval);
            this.videoCheckInterval = null;
        }
    }

    /**
     * Resume video tracking (when tab is visible again)
     */
    resumeVideoTracking() {
        if (this.videoStartTime !== null && this.videoCheckInterval === null) {
            this.startVideoTracking('resumed');
        }
    }

    /**
     * Stop video tracking and send final duration
     */
    stopVideoTracking() {
        if (this.videoCheckInterval) {
            clearInterval(this.videoCheckInterval);
            this.videoCheckInterval = null;
        }
        
        if (this.videoStartTime !== null) {
            const totalDuration = Math.floor((Date.now() - this.videoStartTime) / 1000);
            
            this.trackEvent('Video_Watch_Duration', {
                duration_seconds: totalDuration,
                event_category: 'engagement',
                event_label: `Total watch time: ${totalDuration}s`,
                value: totalDuration
            });
            
            this.videoStartTime = null;
            this.videoWatchDuration = 0;
        }
    }

    /**
     * Send event to Google Analytics
     */
    trackEvent(eventName, params = {}) {
        if (!this.isGtagAvailable) return;
        
        try {
            gtag('event', eventName, params);
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    }

    /**
     * Track a custom conversion
     */
    trackConversion(conversionName, value = null) {
        if (!this.isGtagAvailable) return;
        
        const params = {
            event_category: 'conversion',
            event_label: conversionName
        };
        
        if (value !== null) {
            params.value = value;
        }
        
        this.trackEvent('conversion', params);
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.videoCheckInterval) {
            clearInterval(this.videoCheckInterval);
        }
    }
}

// Export for use in main.js
window.AnalyticsTracker = AnalyticsTracker;
