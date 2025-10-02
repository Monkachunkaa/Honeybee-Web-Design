/**
 * YouTube Lazy Load Module
 * Delays loading YouTube iframe until user clicks play
 * Improves initial page load performance
 */
class YouTubeLazyLoad {
    constructor() {
        this.videoWrappers = document.querySelectorAll('.video-wrapper[data-video-id]');
        this.init();
    }

    init() {
        if (!this.videoWrappers.length) return;

        this.videoWrappers.forEach(wrapper => {
            this.setupVideoWrapper(wrapper);
        });
    }

    setupVideoWrapper(wrapper) {
        const videoId = wrapper.dataset.videoId;
        const placeholder = wrapper.querySelector('.video-placeholder');
        const playButton = wrapper.querySelector('.video-play-button');

        if (!videoId || !placeholder || !playButton) return;

        // Click event on the entire placeholder
        placeholder.addEventListener('click', () => {
            this.loadVideo(wrapper, videoId);
        });

        // Keyboard accessibility
        playButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.loadVideo(wrapper, videoId);
            }
        });
    }

    loadVideo(wrapper, videoId) {
        // Create the iframe
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1`);
        iframe.setAttribute('title', 'YouTube video player');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('allowfullscreen', '');

        // Remove placeholder and add iframe
        const placeholder = wrapper.querySelector('.video-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        wrapper.appendChild(iframe);
    }
}

// Export for use in main.js
window.YouTubeLazyLoad = YouTubeLazyLoad;
