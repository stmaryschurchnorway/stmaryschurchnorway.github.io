/**
 * Carousel Utilities Module
 * Provides shared helper functions for carousel components:
 * - WebP format detection and fallback
 * - YouTube API lazy loading
 * - Bible reference linking
 * - Touch/swipe gesture handling
 */

(function(window) {
  'use strict';

  // ============================================================================
  // WebP Support Detection & Image Format Optimization
  // ============================================================================

  let supportsWebPCache = null;

  function detectWebP(callback) {
    if (supportsWebPCache !== null) return callback(supportsWebPCache);
    const img = new Image();
    img.onload = () => {
      supportsWebPCache = (img.width > 0 && img.height > 0);
      callback(supportsWebPCache);
    };
    img.onerror = () => {
      supportsWebPCache = false;
      callback(false);
    };
    img.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
  }

  // Pre-detect on module load
  detectWebP(() => {});

  function toWebP(url) {
    if (!supportsWebPCache || !url) return url;
    return url.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  }

  // ============================================================================
  // YouTube API Lazy Loading
  // ============================================================================

  let ytApiLoaded = false;
  const ytApiCallbacks = [];

  function ensureYouTubeAPI(callback) {
    if (window.YT && window.YT.Player) return callback();
    ytApiCallbacks.push(callback);
    if (!ytApiLoaded) {
      ytApiLoaded = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => {
        ytApiCallbacks.forEach(fn => fn());
        ytApiCallbacks.length = 0;
      };
    }
  }

  // ============================================================================
  // Bible Reference Linking
  // ============================================================================

  const biblePattern = /\(([A-Za-z\s]+)\s+(\d+):(\d+(?:-\d+)?)\)/g;

  function linkBibleRefs(text) {
    return text.replace(biblePattern, (match, book, chapter, verses) => {
      const book_param = book.trim().replace(/\s+/g, '+');
      const verses_param = verses.replace('-', '%3A');
      return `<a href="https://www.biblegateway.com/passage/?search=${book_param}+${chapter}:${verses_param}&version=NRSV" target="_blank" rel="noopener">${match}</a>`;
    });
  }

  // ============================================================================
  // Touch & Swipe Gesture Handling
  // ============================================================================

  class SwipeDetector {
    constructor(element) {
      this.element = element;
      this.touchStartX = 0;
      this.touchStartY = 0;
      this.touchEndX = 0;
      this.touchEndY = 0;
      this.handlers = {
        swipeUp: null,
        swipeDown: null,
        swipeLeft: null,
        swipeRight: null
      };

      this.element.addEventListener('touchstart', e => this.handleTouchStart(e), false);
      this.element.addEventListener('touchend', e => this.handleTouchEnd(e), false);
    }

    handleTouchStart(e) {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    }

    handleTouchEnd(e) {
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
      this.detectSwipe();
    }

    detectSwipe() {
      const diffX = this.touchStartX - this.touchEndX;
      const diffY = this.touchStartY - this.touchEndY;
      const threshold = 50;

      if (Math.abs(diffY) > Math.abs(diffX)) {
        // Vertical swipe
        if (diffY > threshold && this.handlers.swipeUp) {
          this.handlers.swipeUp();
        } else if (diffY < -threshold && this.handlers.swipeDown) {
          this.handlers.swipeDown();
        }
      } else {
        // Horizontal swipe
        if (diffX > threshold && this.handlers.swipeLeft) {
          this.handlers.swipeLeft();
        } else if (diffX < -threshold && this.handlers.swipeRight) {
          this.handlers.swipeRight();
        }
      }
    }

    on(direction, handler) {
      if (this.handlers.hasOwnProperty(`swipe${direction}`)) {
        this.handlers[`swipe${direction}`] = handler;
      }
    }
  }

  // ============================================================================
  // Keyboard Event Handling
  // ============================================================================

  class KeyboardHandler {
    constructor() {
      this.handlers = {};
      document.addEventListener('keydown', e => this.handle(e));
    }

    on(key, handler) {
      if (!this.handlers[key]) this.handlers[key] = [];
      this.handlers[key].push(handler);
    }

    handle(e) {
      const key = e.key;
      if (this.handlers[key]) {
        this.handlers[key].forEach(handler => handler(e));
      }
    }
  }

  // ============================================================================
  // Export Public API
  // ============================================================================

  window.CarouselUtils = {
    detectWebP,
    toWebP,
    ensureYouTubeAPI,
    linkBibleRefs,
    SwipeDetector,
    KeyboardHandler
  };

})(window);
