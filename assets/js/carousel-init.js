/**
 * Carousel Initialization Module
 * Instantiates all carousel modules when DOM is ready.
 *
 * Expected Usage:
 * 1. Include in HTML: <script src="/assets/js/carousel-init.js"></script>
 * 2. Pass carousel config via window.carouselConfig before this script loads
 * 3. Modules will initialize automatically on DOMContentLoaded
 *
 * Example:
 * <script>
 *   window.carouselConfig = {
 *     containerSelector: '#qurbanaCarousel',
 *     carouselType: 'qurbana'
 *   };
 * </script>
 * <script src="/assets/js/carousel-init.js" defer></script>
 */

(function(window) {
  'use strict';

  function initializeCarousel() {
    // Verify all required modules are loaded
    const requiredModules = [
      'CarouselUtils',
      'CarouselManager',
      'SacredItemsModal',
      'CarouselAudio',
      'CarouselDisplay'
    ];

    const missingModules = requiredModules.filter(mod => !window[mod]);
    if (missingModules.length > 0) {
      console.error('Missing carousel modules:', missingModules);
      console.error('Make sure all carousel-*.js files are loaded before carousel-init.js');
      return;
    }

    // Get configuration
    const config = window.carouselConfig || {};
    const containerSelector = config.containerSelector || '#qurbanaCarousel';

    console.log('Initializing carousel:', containerSelector);

    // Initialize carousel manager (handles navigation, data)
    const carouselManager = new window.CarouselManager({
      containerSelector,
      preloadImages: true,
      autoplayVideo: false
    });
    window.carouselManager = carouselManager;

    // Initialize display module (renders visual elements)
    const carouselDisplay = new window.CarouselDisplay({
      containerSelector
    });
    window.carouselDisplay = carouselDisplay;

    // Initialize audio module (handles TTS and hymns)
    const carouselAudio = new window.CarouselAudio({
      containerSelector,
      ttsRate: 0.8,
      ttsVolume: 1.0
    });
    window.carouselAudio = carouselAudio;

    // Initialize sacred items modal
    const sacredItemsModal = new window.SacredItemsModal({
      containerSelector,
      modalSelector: '#sacredItemModal'
    });
    window.sacredItemsModal = sacredItemsModal;

    // Initial render
    const container = document.querySelector(containerSelector);
    if (container) {
      carouselDisplay.renderPhaseTabs();
      carouselManager.updateDisplay();
      carouselDisplay.renderSubstages(carouselManager.getCurrentStage());
      carouselDisplay.renderHotspots(carouselManager.getCurrentStage());
      carouselDisplay.loadVideo(carouselManager.getCurrentStage());
    }

    console.log('Carousel initialized successfully');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCarousel);
  } else {
    initializeCarousel();
  }

  // Export
  window.initializeCarousel = initializeCarousel;

})(window);
