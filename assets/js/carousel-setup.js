/**
 * Carousel Setup Script
 * Wire-up between HTML carousel elements and modular components.
 * 
 * This handles:
 * - Passing page.phases data to CarouselManager
 * - Connecting display updates to carousel refresh
 * - Hooking into existing HTML event listeners
 */

(function(window) {
  'use strict';

  // Called by carousel HTML after phases data is available
  function setupCarouselWithData(phases) {
    // Make phases available to CarouselManager
    window.pages = { phases };

    // Initialize modules after they're loaded
    function initWhenReady() {
      const timeout = setTimeout(() => {
        console.error('Carousel modules failed to load');
      }, 5000);

      const checkInterval = setInterval(() => {
        if (window.CarouselManager && window.CarouselDisplay && window.CarouselAudio && window.SacredItemsModal) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          initializeAllModules();
        }
      }, 100);
    }

    initWhenReady();
  }

  function initializeAllModules() {
    console.log('Setting up carousel modules...');

    try {
      // Initialize manager
      const manager = new window.CarouselManager({
        containerSelector: '#qurbanaCarousel'
      });
      window.carouselManager = manager;

      // Initialize display
      const display = new window.CarouselDisplay({
        containerSelector: '#qurbanaCarousel'
      });
      window.carouselDisplay = display;

      // Initialize audio
      const audio = new window.CarouselAudio({
        containerSelector: '#qurbanaCarousel'
      });
      window.carouselAudio = audio;

      // Initialize modal
      const modal = new window.SacredItemsModal({
        containerSelector: '#qurbanaCarousel'
      });
      window.sacredItemsModal = modal;

      // First render
      display.renderPhaseTabs();
      manager.updateDisplay();

      const stage = manager.getCurrentStage();
      if (stage) {
        display.renderSubstages(stage);
        display.renderHotspots(stage);
        display.loadVideo(stage);
      }

      console.log('Carousel modules initialized successfully');
    } catch (err) {
      console.error('Error initializing carousel:', err);
    }
  }

  window.setupCarouselWithData = setupCarouselWithData;

})(window);
