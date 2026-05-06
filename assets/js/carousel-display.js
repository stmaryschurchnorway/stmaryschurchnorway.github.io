/**
 * Carousel Display Module
 * Handles rendering of carousel visual elements:
 * - Substages accordion
 * - Hotspots overlay with interactive labels
 * - Video loading and YouTube integration
 * - Phase tabs and progress indicators
 */

(function(window) {
  'use strict';

  class CarouselDisplay {
    constructor(options = {}) {
      this.containerSelector = options.containerSelector || '#qurbanaCarousel';
      this.container = document.querySelector(this.containerSelector);
      this.carouselManager = window.carouselManager;

      this.currentYTPlayer = null;
      this.config = {
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
    // Substages Rendering
    // ========================================================================

    renderSubstages(stage) {
      const container = this.container.querySelector('#substagesPanel');
      if (!container) return;

      container.innerHTML = '';

      const substagesArray = stage.substages || [stage];

      substagesArray.forEach((substage, idx) => {
        const substageEl = document.createElement('div');
        substageEl.className = 'substage-item';
        substageEl.dataset.substageIdx = idx;

        // Header
        const header = document.createElement('div');
        header.className = 'substage-header';
        header.innerHTML = `
          <h4 class="substage-title">${this.escapeHtml(substage.title || '')}</h4>
          <span class="substage-toggle-arrow">▼</span>
        `;

        // Content (initially hidden)
        const content = document.createElement('div');
        content.className = 'substage-content';
        content.style.display = 'none';

        // Render content safely using DOM methods
        this.renderSubstageContent(substage, content);

        substageEl.appendChild(header);
        substageEl.appendChild(content);

        // Click handler for toggle
        header.addEventListener('click', () => {
          const isOpen = content.style.display !== 'none';
          content.style.display = isOpen ? 'none' : 'block';
          header.classList.toggle('open', !isOpen);
        });

        container.appendChild(substageEl);
      });
    }

    renderSubstageContent(substage, contentEl) {
      // Significance section
      if (substage.significance) {
        const section = this.createSection('Significance:', window.CarouselUtils.linkBibleRefs(substage.significance));
        contentEl.appendChild(section);
      }

      // Ritual gesture section
      if (substage.ritual_gesture) {
        const section = this.createSection('Ritual Gesture:', substage.ritual_gesture);
        contentEl.appendChild(section);
      }

      // Malayalam section
      if (substage.malayalam) {
        const section = document.createElement('div');
        section.className = 'substage-section substage-malayalam';
        const word = document.createElement('span');
        word.className = 'malayalam-word';
        word.textContent = substage.malayalam;
        section.appendChild(word);

        if (substage.transliteration) {
          const trans = document.createElement('span');
          trans.className = 'transliteration';
          trans.textContent = substage.transliteration;
          section.appendChild(trans);
        }

        contentEl.appendChild(section);
      }

      // Sacred items section
      if (substage.sacred_items && substage.sacred_items.length > 0) {
        const section = document.createElement('div');
        section.className = 'substage-section substage-sacred-items';

        const title = document.createElement('strong');
        title.className = 'substage-section-title';
        title.textContent = 'Sacred Items:';
        section.appendChild(title);

        substage.sacred_items.forEach(item => {
          const button = document.createElement('button');
          button.className = 'sacred-item-link';
          button.dataset.itemName = item.name;
          button.textContent = item.name;
          section.appendChild(button);
        });

        contentEl.appendChild(section);
      }

      // Theological meaning section
      if (substage.theological_meaning) {
        const section = this.createSection('Theological Meaning:', window.CarouselUtils.linkBibleRefs(substage.theological_meaning));
        contentEl.appendChild(section);
      }

      // Hymn section
      if (substage.hymn) {
        const section = document.createElement('div');
        section.className = 'substage-section hymn-section';

        const title = document.createElement('strong');
        title.className = 'substage-section-title';
        title.textContent = `Hymn: ${substage.hymn}`;
        section.appendChild(title);

        if (substage.hymn_malayalam) {
          const malayalamDiv = document.createElement('div');
          malayalamDiv.className = 'hymn-malayalam';
          malayalamDiv.textContent = substage.hymn_malayalam;
          section.appendChild(malayalamDiv);
        }

        if (substage.hymn_audio) {
          const button = document.createElement('button');
          button.className = 'hymn-play-btn';
          button.dataset.hymnIcon = substage.hymn;
          button.dataset.play = '🎵';
          button.dataset.stop = '■';
          button.textContent = '🎵';
          section.appendChild(button);
        }

        contentEl.appendChild(section);
      }

      // Biblical reference section
      if (substage.biblical_remembrance) {
        const section = this.createSection('Biblical Remembrance:', window.CarouselUtils.linkBibleRefs(substage.biblical_remembrance));
        contentEl.appendChild(section);
      }
    }

    createSection(title, htmlContent) {
      const section = document.createElement('div');
      section.className = 'substage-section';

      const titleEl = document.createElement('strong');
      titleEl.className = 'substage-section-title';
      titleEl.textContent = title;
      section.appendChild(titleEl);

      const textEl = document.createElement('p');
      textEl.className = 'substage-text';
      // Safe: linkBibleRefs generates properly escaped HTML, or plain text from substage properties
      textEl.innerHTML = htmlContent;
      section.appendChild(textEl);

      return section;
    }

    // ========================================================================
    // Hotspots Rendering
    // ========================================================================

    renderHotspots(stage) {
      const imageContainer = this.container.querySelector('#videoPlaceholder');
      if (!imageContainer) return;

      // Remove existing SVG
      const existingSvg = imageContainer.querySelector('svg.hotspots-overlay');
      if (existingSvg) existingSvg.remove();

      // Check if stage has hotspots
      if (!stage.hotspots || stage.hotspots.length === 0) {
        return;
      }

      const imageEl = imageContainer.querySelector('img');
      if (!imageEl || !imageEl.src) {
        return;
      }

      // Create SVG overlay
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'hotspots-overlay');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

      stage.hotspots.forEach((hotspot, idx) => {
        const x = hotspot.x || 50;
        const y = hotspot.y || 50;
        const radius = hotspot.radius || 8;

        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.setAttribute('class', 'hotspot-circle');
        circle.setAttribute('data-hotspot-idx', idx);

        // Label group
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.setAttribute('class', 'hotspot-label');
        labelGroup.setAttribute('data-label-idx', idx);

        const labelX = hotspot.label_x || x;
        const labelY = hotspot.label_y || y - radius - 3;

        // Label background
        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        labelBg.setAttribute('x', labelX - 8);
        labelBg.setAttribute('y', labelY - 6);
        labelBg.setAttribute('width', '16');
        labelBg.setAttribute('height', '12');
        labelBg.setAttribute('rx', '2');
        labelBg.setAttribute('class', 'label-bg');

        // Label text
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', labelX);
        labelText.setAttribute('y', labelY);
        labelText.setAttribute('class', 'label-text');
        labelText.setAttribute('text-anchor', 'middle');
        labelText.setAttribute('dominant-baseline', 'middle');
        labelText.setAttribute('font-size', '3');
        labelText.setAttribute('font-weight', '500');
        labelText.textContent = hotspot.label || `Item ${idx + 1}`;

        labelGroup.appendChild(labelBg);
        labelGroup.appendChild(labelText);

        // Interaction
        circle.addEventListener('mouseenter', () => {
          labelGroup.classList.add('visible');
        });
        circle.addEventListener('mouseleave', () => {
          labelGroup.classList.remove('visible');
        });

        circle.addEventListener('click', (e) => {
          e.stopPropagation();
          const item = stage.hotspots[idx];
          if (item.item) {
            window.sacredItemsModal?.openModal(item.item);
          }
        });

        svg.appendChild(circle);
        svg.appendChild(labelGroup);
      });

      imageContainer.appendChild(svg);
    }

    // ========================================================================
    // Video Loading
    // ========================================================================

    loadVideo(stage) {
      const container = this.container.querySelector('#youtubeContainer');
      if (!container) return;

      container.innerHTML = '';

      // Check if stage has video
      if (!stage.youtube_id) {
        return;
      }

      window.CarouselUtils.ensureYouTubeAPI(() => {
        this.currentYTPlayer = new window.YT.Player(container, {
          width: '100%',
          height: '100%',
          videoId: stage.youtube_id,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1
          }
        });
      });
    }

    // ========================================================================
    // Phase Tabs Rendering
    // ========================================================================

    renderPhaseTabs() {
      const container = this.container.querySelector('#phaseTabs');
      if (!container) return;

      container.innerHTML = '';

      this.carouselManager.phases.forEach((phase, idx) => {
        const button = document.createElement('button');
        button.className = 'phase-tab';
        if (idx === this.carouselManager.currentPhaseIdx) {
          button.classList.add('active');
        }
        button.dataset.phaseIdx = idx;
        button.textContent = phase.title || `Phase ${idx + 1}`;
        button.style.borderBottomColor = phase.color || '#d4a017';

        container.appendChild(button);
      });
    }

    // ========================================================================
    // Utility
    // ========================================================================

    escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // ========================================================================
    // Event Delegation
    // ========================================================================

    setupEventDelegation() {
      // Sacred item links in substages
      this.container.addEventListener('click', (e) => {
        if (e.target.classList.contains('sacred-item-link')) {
          const itemName = e.target.dataset.itemName;
          window.sacredItemsModal?.openModal(itemName);
        }
      });

      // Hymn play buttons
      this.container.addEventListener('click', (e) => {
        if (e.target.classList.contains('hymn-play-btn')) {
          const hymnName = e.target.dataset.hymnIcon;
          window.carouselAudio?.playHymn(hymnName);
        }
      });
    }
  }

  // Export
  window.CarouselDisplay = CarouselDisplay;

})(window);
