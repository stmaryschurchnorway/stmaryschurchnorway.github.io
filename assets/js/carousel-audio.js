/**
 * Carousel Audio Module
 * Manages TTS pronunciation audio, hymn audio, and mutual exclusion of audio streams.
 *
 * Architecture:
 * - One audio stream plays at a time (mutual exclusion)
 * - Supports TTS for Malayalam pronunciation
 * - Supports hymn playback with visual feedback
 * - Normalized to -14 LUFS for consistent volume
 */

(function(window) {
  'use strict';

  class CarouselAudio {
    constructor(options = {}) {
      this.containerSelector = options.containerSelector || '#qurbanaCarousel';
      this.container = document.querySelector(this.containerSelector);

      this.currentAudio = null;
      this.ttsUtterance = null;
      this.config = {
        ttsRate: 0.8,
        ttsVolume: 1.0,
        ...options
      };

      this.init();
    }

    init() {
      if (!this.container) {
        console.error('Container not found:', this.containerSelector);
        return;
      }

      this.setupEventDelegation();
    }

    // ========================================================================
    // TTS Audio (Pronunciation)
    // ========================================================================

    speakMalayalam(text, malayalamLang = 'ml-IN') {
      this.stopAllAudio();

      if (!window.speechSynthesis) {
        console.warn('Speech synthesis not supported');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = malayalamLang;
      utterance.rate = this.config.ttsRate;
      utterance.volume = this.config.ttsVolume;

      utterance.onstart = () => {
        const audioBtn = this.container.querySelector('#audioBtn');
        if (audioBtn) audioBtn.classList.add('playing');
      };

      utterance.onend = () => {
        const audioBtn = this.container.querySelector('#audioBtn');
        if (audioBtn) audioBtn.classList.remove('playing');
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        const audioBtn = this.container.querySelector('#audioBtn');
        if (audioBtn) audioBtn.classList.remove('playing');
      };

      this.ttsUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }

    // ========================================================================
    // Hymn Audio Playback
    // ========================================================================

    playHymn(hymnName) {
      this.stopAllAudio();

      const hymnIcon = this.container.querySelector(`[data-hymn-icon="${hymnName}"]`);
      if (!hymnIcon) {
        console.warn('Hymn not found:', hymnName);
        return;
      }

      // Find audio element
      const audioEl = hymnIcon.closest('[data-hymn-audio]')?.querySelector('audio');
      if (!audioEl) {
        console.warn('Audio element not found for hymn:', hymnName);
        return;
      }

      this.currentAudio = audioEl;

      // Visual feedback
      hymnIcon.classList.add('playing');
      hymnIcon.textContent = hymnIcon.dataset.stop || '■';

      audioEl.onplay = () => {
        hymnIcon.classList.add('playing');
        hymnIcon.textContent = hymnIcon.dataset.stop || '■';
      };

      audioEl.onpause = () => {
        hymnIcon.classList.remove('playing');
        hymnIcon.textContent = hymnIcon.dataset.play || '🎵';
      };

      audioEl.onended = () => {
        hymnIcon.classList.remove('playing');
        hymnIcon.textContent = hymnIcon.dataset.play || '🎵';
        this.currentAudio = null;
      };

      audioEl.onerror = () => {
        console.error('Error loading audio:', hymnName);
        hymnIcon.classList.remove('playing');
        hymnIcon.textContent = hymnIcon.dataset.play || '🎵';
      };

      // Play or pause
      if (audioEl.paused) {
        audioEl.play().catch(err => {
          console.error('Error playing audio:', err);
          hymnIcon.classList.remove('playing');
          hymnIcon.textContent = hymnIcon.dataset.play || '🎵';
        });
      } else {
        audioEl.pause();
      }
    }

    // ========================================================================
    // Audio Control
    // ========================================================================

    stopAllAudio() {
      // Stop TTS
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const audioBtn = this.container.querySelector('#audioBtn');
        if (audioBtn) audioBtn.classList.remove('playing');
      }

      // Stop hymn audio
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      // Reset all hymn icons
      const hymnIcons = this.container.querySelectorAll('[data-hymn-icon]');
      hymnIcons.forEach(icon => {
        icon.classList.remove('playing');
        icon.textContent = icon.dataset.play || '🎵';
      });

      this.currentAudio = null;
    }

    // ========================================================================
    // Event Delegation
    // ========================================================================

    setupEventDelegation() {
      // TTS audio button
      const audioBtn = this.container.querySelector('#audioBtn');
      if (audioBtn) {
        audioBtn.addEventListener('click', () => {
          const malayalamText = this.container.querySelector('#malayalamText')?.textContent || '';
          this.speakMalayalam(malayalamText);
        });
      }

      // Hymn buttons (delegated)
      this.container.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-hymn-icon')) {
          const hymnName = e.target.dataset.hymnIcon;
          this.playHymn(hymnName);
        }
      });
    }
  }

  // Export
  window.CarouselAudio = CarouselAudio;

  // Global stopAllAudio for carousel-manager to call
  window.stopAllAudio = function() {
    const audioInstance = window.carouselAudio;
    if (audioInstance) {
      audioInstance.stopAllAudio();
    }
  };

})(window);
