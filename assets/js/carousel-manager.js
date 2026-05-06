/**
 * Carousel Manager Module
 * Handles phase/stage/subpart navigation, data management, and UI updates.
 *
 * Architecture:
 * - currentPhaseIdx: Active phase (0-based)
 * - currentSubpartIdx: Active subpart within phase (-1 = no subpart)
 * - currentStageIdx: Global stage index across all phases/subparts
 * - Uses Liquid template data (window.pages.phases) to render UI
 */

(function(window) {
  'use strict';

  class CarouselManager {
    constructor(options = {}) {
      this.containerSelector = options.containerSelector || '#qurbanaCarousel';
      this.container = document.querySelector(this.containerSelector);

      // State
      this.currentPhaseIdx = 0;
      this.currentSubpartIdx = -1;
      this.currentStageIdx = 0;
      this.phases = window.pages?.phases || [];

      // Cache
      this.sacredItemsIndex = new Map();

      // Configuration
      this.config = {
        preloadImages: true,
        autoplayVideo: false,
        ...options
      };

      this.init();
    }

    init() {
      if (!this.container) {
        console.error('Carousel container not found:', this.containerSelector);
        return;
      }

      this.buildSacredItemsIndex();
      this.setupEventDelegation();
      this.updateDisplay();
      this.preloadCurrentPhaseImages();
    }

    // ========================================================================
    // Data Structure Utilities
    // ========================================================================

    hasSubparts(phaseIdx) {
      const phase = this.phases[phaseIdx];
      return phase && phase.subparts && phase.subparts.length > 0;
    }

    getPhaseStartIndex(phaseIdx) {
      let idx = 0;
      for (let i = 0; i < phaseIdx; i++) {
        const phase = this.phases[i];
        if (this.hasSubparts(i)) {
          phase.subparts.forEach(sp => { idx += sp.stages.length; });
        } else {
          idx += phase.stages.length;
        }
      }
      return idx;
    }

    getSubpartStartIndex(phaseIdx, subpartIdx) {
      let idx = this.getPhaseStartIndex(phaseIdx);
      const phase = this.phases[phaseIdx];
      for (let i = 0; i < subpartIdx; i++) {
        idx += phase.subparts[i].stages.length;
      }
      return idx;
    }

    getStageInPhase(globalIdx) {
      let idx = 0;
      for (let p = 0; p < this.phases.length; p++) {
        const phase = this.phases[p];
        if (this.hasSubparts(p)) {
          for (let sp = 0; sp < phase.subparts.length; sp++) {
            const sp_stages = phase.subparts[sp].stages.length;
            if (idx + sp_stages > globalIdx) {
              return { phaseIdx: p, subpartIdx: sp, stageInSubpartIdx: globalIdx - idx };
            }
            idx += sp_stages;
          }
        } else {
          const p_stages = phase.stages.length;
          if (idx + p_stages > globalIdx) {
            return { phaseIdx: p, subpartIdx: -1, stageInPhaseIdx: globalIdx - idx };
          }
          idx += p_stages;
        }
      }
      return { phaseIdx: 0, subpartIdx: -1, stageInPhaseIdx: 0 };
    }

    // ========================================================================
    // Sacred Items Index
    // ========================================================================

    buildSacredItemsIndex() {
      this.sacredItemsIndex.clear();
      let itemCount = 0;

      this.phases.forEach((phase, phaseIdx) => {
        const stagesArray = this.hasSubparts(phaseIdx)
          ? phase.subparts.flatMap(sp => sp.stages)
          : phase.stages;

        stagesArray.forEach(stage => {
          const substagesArray = stage.substages || [stage];
          substagesArray.forEach(substage => {
            (substage.sacred_items || []).forEach(item => {
              const key = item.name.toLowerCase().replace(/\s+/g, '_');
              this.sacredItemsIndex.set(key, {
                item,
                phaseIdx,
                itemIndex: itemCount++
              });
            });
          });
        });
      });
    }

    getSacredItemByName(name) {
      const key = name.toLowerCase().replace(/\s+/g, '_');
      return this.sacredItemsIndex.get(key);
    }

    // ========================================================================
    // Navigation
    // ========================================================================

    switchPhase(phaseIdx) {
      if (phaseIdx < 0 || phaseIdx >= this.phases.length) return;
      this.currentPhaseIdx = phaseIdx;
      this.currentSubpartIdx = -1;
      this.currentStageIdx = this.getPhaseStartIndex(phaseIdx);
      this.updateDisplay();
      this.preloadCurrentPhaseImages();
      window.stopAllAudio?.();
    }

    switchSubpart(subpartIdx) {
      if (!this.hasSubparts(this.currentPhaseIdx)) return;
      const phase = this.phases[this.currentPhaseIdx];
      if (subpartIdx < 0 || subpartIdx >= phase.subparts.length) return;

      this.currentSubpartIdx = subpartIdx;
      this.currentStageIdx = this.getSubpartStartIndex(this.currentPhaseIdx, subpartIdx);
      this.updateDisplay();
      window.stopAllAudio?.();
    }

    goToStage(index) {
      if (index < 0 || index >= this.getTotalStages()) return;
      this.currentStageIdx = index;
      const pos = this.getStageInPhase(index);
      this.currentPhaseIdx = pos.phaseIdx;
      this.currentSubpartIdx = pos.subpartIdx;
      this.updateDisplay();
      window.stopAllAudio?.();
    }

    nextStage() {
      const total = this.getTotalStages();
      if (this.currentStageIdx < total - 1) {
        this.goToStage(this.currentStageIdx + 1);
      }
    }

    prevStage() {
      if (this.currentStageIdx > 0) {
        this.goToStage(this.currentStageIdx - 1);
      }
    }

    // ========================================================================
    // State Queries
    // ========================================================================

    getTotalStages() {
      let total = 0;
      this.phases.forEach((phase, idx) => {
        if (this.hasSubparts(idx)) {
          phase.subparts.forEach(sp => { total += sp.stages.length; });
        } else {
          total += phase.stages.length;
        }
      });
      return total;
    }

    getCurrentPhase() {
      return this.phases[this.currentPhaseIdx];
    }

    getCurrentStage() {
      const phase = this.getCurrentPhase();
      if (!phase) return null;

      if (this.currentSubpartIdx === -1) {
        return phase.stages[this.getStageInPhase(this.currentStageIdx).stageInPhaseIdx];
      } else {
        const stageIdx = this.getStageInPhase(this.currentStageIdx).stageInSubpartIdx;
        return phase.subparts[this.currentSubpartIdx].stages[stageIdx];
      }
    }

    // ========================================================================
    // Image Preloading
    // ========================================================================

    preloadCurrentPhaseImages() {
      if (!this.config.preloadImages) return;

      const phase = this.getCurrentPhase();
      if (!phase) return;

      const imagesToPreload = [];
      const addImage = (url) => {
        if (url && !imagesToPreload.includes(url)) {
          imagesToPreload.push(window.CarouselUtils.toWebP(url));
        }
      };

      if (this.hasSubparts(this.currentPhaseIdx)) {
        phase.subparts.forEach(subpart => {
          subpart.stages.forEach(stage => {
            addImage(stage.image);
            addImage(stage.back_image);
          });
        });
      } else {
        phase.stages.forEach(stage => {
          addImage(stage.image);
          addImage(stage.back_image);
        });
      }

      imagesToPreload.forEach(url => {
        new Image().src = url;
      });
    }

    // ========================================================================
    // Event Delegation Setup
    // ========================================================================

    setupEventDelegation() {
      // Phase tab clicks
      this.container.addEventListener('click', (e) => {
        if (e.target.classList.contains('phase-tab')) {
          const phaseIdx = parseInt(e.target.dataset.phaseIdx, 10);
          this.switchPhase(phaseIdx);
        }
      });

      // Subpart toggle clicks
      this.container.addEventListener('click', (e) => {
        if (e.target.classList.contains('subpart-label')) {
          const subpartIdx = parseInt(e.target.dataset.subpartIdx, 10);
          this.switchSubpart(subpartIdx);
        }
      });

      // Stage navigation buttons
      this.container.addEventListener('click', (e) => {
        if (e.target.id === 'nextBtn' || e.target.id === 'nextBtnFooter') {
          this.nextStage();
        } else if (e.target.id === 'prevBtn' || e.target.id === 'prevBtnFooter') {
          this.prevStage();
        }
      });

      // Progress dots
      this.container.addEventListener('click', (e) => {
        if (e.target.classList.contains('progress-dot')) {
          const stageIdx = parseInt(e.target.dataset.stageIdx, 10);
          this.goToStage(stageIdx);
        }
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          this.nextStage();
        } else if (e.key === 'ArrowLeft') {
          this.prevStage();
        }
      });
    }

    // ========================================================================
    // Display Updates
    // ========================================================================

    updateDisplay() {
      this.updatePhaseUI();
      this.updateCarouselUI();
    }

    updatePhaseUI() {
      const tabs = this.container.querySelectorAll('.phase-tab');
      tabs.forEach((tab, idx) => {
        tab.classList.toggle('active', idx === this.currentPhaseIdx);
      });

      if (this.hasSubparts(this.currentPhaseIdx)) {
        this.updateSubpartUI();
      }
    }

    updateSubpartUI() {
      const phase = this.getCurrentPhase();
      const container = this.container.querySelector('[data-subpart-toggle]');
      if (!container) return;

      // Clear existing buttons
      container.innerHTML = '';

      // Create new buttons safely
      phase.subparts.forEach((subpart, idx) => {
        const button = document.createElement('button');
        button.className = 'subpart-label';
        if (idx === this.currentSubpartIdx) {
          button.classList.add('active');
        }
        button.dataset.subpartIdx = idx;
        button.textContent = subpart.title;
        container.appendChild(button);
      });
    }

    updateCarouselUI() {
      const stage = this.getCurrentStage();
      if (!stage) return;

      // Update counter/title (safe)
      const counter = this.container.querySelector('#stageCounter');
      const title = this.container.querySelector('#stageTitle');
      const description = this.container.querySelector('#stageDescription');
      const malayalamText = this.container.querySelector('#malayalamText');
      const transliteration = this.container.querySelector('#transliteration');

      if (counter) counter.textContent = stage.title || '';
      if (title) title.textContent = stage.title || '';

      // Update description with linked bible references (safe HTML generation)
      if (description) {
        const linkedDesc = window.CarouselUtils.linkBibleRefs(stage.description || '');
        description.innerHTML = linkedDesc;
      }

      if (malayalamText) malayalamText.textContent = stage.malayalam || '';
      if (transliteration) transliteration.textContent = stage.transliteration ? `Pronunciation: ${stage.transliteration}` : '';

      // Update progress
      this.updateProgressDots();

      // Update card border color
      this.updateCardBorderColor();
    }

    updateProgressDots() {
      const dotsContainer = this.container.querySelector('#progressDots');
      if (!dotsContainer) return;

      const total = this.getTotalStages();
      dotsContainer.innerHTML = '';

      for (let idx = 0; idx < total; idx++) {
        const button = document.createElement('button');
        button.className = 'progress-dot';
        if (idx === this.currentStageIdx) {
          button.classList.add('active');
        }
        button.dataset.stageIdx = idx;
        button.setAttribute('aria-label', `Go to stage ${idx + 1}`);
        dotsContainer.appendChild(button);
      }
    }

    updateCardBorderColor() {
      const card = this.container.querySelector('.carousel-card');
      if (!card) return;

      const phase = this.getCurrentPhase();
      const color = phase?.color || '#d4a017';
      card.style.borderTopColor = color;
    }
  }

  // Export
  window.CarouselManager = CarouselManager;

})(window);
