# JavaScript Refactoring: Carousel Modularization

## Completed: Module Extraction

The carousel JavaScript has been extracted from inline embedded scripts into 6 modular files:

### 1. **carousel-utils.js** (170 lines)
Shared utility functions for all carousels:
- WebP format detection and fallback (toWebP)
- YouTube API lazy loading
- Bible reference linking with auto-detection
- Touch/swipe gesture detection (SwipeDetector class)
- Keyboard event handling (KeyboardHandler class)

**Public API:**
```javascript
window.CarouselUtils = {
  detectWebP(callback),
  toWebP(url),
  ensureYouTubeAPI(callback),
  linkBibleRefs(text),
  SwipeDetector,
  KeyboardHandler
}
```

### 2. **carousel-manager.js** (380 lines)
Core carousel navigation and state management:
- Phase/subpart/stage navigation
- State tracking (currentPhaseIdx, currentSubpartIdx, currentStageIdx)
- Sacred items indexing
- Image preloading
- Event delegation for all nav controls

**Key Methods:**
- `switchPhase(phaseIdx)` - Change active phase
- `switchSubpart(subpartIdx)` - Change active subpart
- `goToStage(index)` - Jump to specific stage
- `nextStage()` / `prevStage()` - Sequential navigation
- `getCurrentStage()` - Get current stage data
- `getTotalStages()` - Count all stages

**Event Delegation:**
- `.phase-tab` clicks → switchPhase()
- `.subpart-label` clicks → switchSubpart()
- `#prevBtn`, `#nextBtn` → prev/nextStage()
- `.progress-dot` clicks → goToStage()
- Arrow key handlers for keyboard nav

### 3. **carousel-audio.js** (170 lines)
Audio playback management:
- TTS pronunciation via Web Speech API
- Hymn audio playback with mutual exclusion
- Visual feedback (playing/stopped states)
- Unified stopAllAudio() for navigation cleanup

**Key Methods:**
- `speakMalayalam(text, lang)` - TTS
- `playHymn(hymnName)` - Play/pause hymn
- `stopAllAudio()` - Stop all audio

**Event Delegation:**
- `#audioBtn` click → speakMalayalam()
- `[data-hymn-icon]` clicks → playHymn()

### 4. **sacred-items-modal.js** (280 lines)
Sacred items zoom modal with navigation:
- Item discovery from current stage substages
- Front/back image flipping
- Swipe navigation (up/down for next/prev)
- Keyboard navigation (arrows, escape)
- Item counter and navigation visibility

**Key Methods:**
- `openModal(itemName)` - Show item in fullscreen
- `closeModal()` - Hide modal
- `nextItem()` / `prevItem()` - Navigate items
- `flipImage()` - Toggle front/back view

**Interactions:**
- Click sacred-item buttons → openModal()
- Swipe up/down → nextItem/prevItem
- Arrow keys → item navigation
- Escape key → closeModal()

### 5. **carousel-display.js** (410 lines)
Rendering of visual elements:
- Substages accordion with content sections
- Hotspots SVG overlay with interactive labels
- YouTube video integration
- Phase tabs rendering
- Safe HTML generation via DOM methods

**Key Methods:**
- `renderSubstages(stage)` - Build accordion
- `renderHotspots(stage)` - Create SVG overlay
- `loadVideo(stage)` - Embed YouTube player
- `renderPhaseTabs()` - Generate phase buttons

### 6. **carousel-setup.js** (70 lines)
Wire-up and initialization:
- Accepts phase data from HTML/Liquid
- Waits for all modules to load
- Instantiates all classes
- Performs initial render
- Exports `window.setupCarouselWithData(phases)`

**Usage:**
```javascript
window.setupCarouselWithData({{ page.phases | jsonify }});
```

## Migration Path: HTML Integration

### Step 1: Update _includes/qurbana-carousel.html

Replace the large embedded script block (lines 214-2054) with:

```html
<!-- Carousel module scripts -->
<script src="/assets/js/carousel-utils.js" defer></script>
<script src="/assets/js/carousel-manager.js" defer></script>
<script src="/assets/js/sacred-items-modal.js" defer></script>
<script src="/assets/js/carousel-audio.js" defer></script>
<script src="/assets/js/carousel-display.js" defer></script>
<script src="/assets/js/carousel-controls.js" defer></script>
<script src="/assets/js/carousel-setup.js" defer></script>

<!-- Initialize carousel with Liquid data -->
<script>
(function() {
  // Wait for DOM ready and modules to load
  function init() {
    window.setupCarouselWithData({{ page.phases | jsonify }});
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
```

### Step 2: Remove inline onclick handlers

Replace:
```html
<button class="sacred-item-modal-close" onclick="closeSacredItemModal()">
```

With:
```html
<button class="sacred-item-modal-close" data-action="close-modal">
```

The event delegation in SacredItemsModal will handle the click.

### Step 3: Update sacred item cards

Current complex onclick with IIFE can be simplified to:
```html
<button class="sacred-item-zoom-btn" data-item-name="{{ item.name }}">⤢</button>
```

CarouselDisplay.setupEventDelegation handles the click.

### Step 4: Update simple expanders

Replace:
```html
<button onclick="document.querySelector('.qurbana-intro-heading').classList.toggle('expanded')">
```

With:
```html
<button class="toggle-expand" data-target=".qurbana-intro-heading">
```

And add to carousel-controls.js:
```javascript
this.container.addEventListener('click', (e) => {
  if (e.target.classList.contains('toggle-expand')) {
    const target = e.target.dataset.target;
    document.querySelector(target)?.classList.toggle('expanded');
  }
});
```

## Architecture Benefits

1. **Modularity**: Each file has a single responsibility
2. **Reusability**: Can be used in any carousel (Qurbana, Mamodisa, future sacraments)
3. **Testability**: Classes can be tested independently
4. **Maintainability**: Changes to one module don't affect others
5. **Performance**: Smaller individual files, better caching
6. **Security**: Centralized HTML generation with proper escaping
7. **Accessibility**: Event delegation supports keyboard navigation

## Current Status

✅ All modules created and exported to window
✅ No dependencies on external libraries (pure JS)
✅ Uses standard Web APIs (WebP detection, WebSpeech, YouTube IFrame)
✅ Security: HTML generation via DOM methods (not innerHTML for user input)
✅ Ready for integration into carousel HTML files

## Next Steps

1. Update `_includes/qurbana-carousel.html` to load new scripts
2. Remove embedded `<script>` block
3. Replace inline onclick handlers with data attributes
4. Test locally with `bundle exec jekyll serve`
5. Apply same pattern to `_includes/mamodisa-carousel.html`
6. Test both carousels for functionality

## Testing Checklist

- [ ] Phase navigation works
- [ ] Stage navigation (arrows, dots, keyboard)
- [ ] Sacred items modal opens/closes
- [ ] Image flipping works
- [ ] Swipe navigation on mobile
- [ ] Keyboard navigation (arrows, escape)
- [ ] TTS pronunciation plays
- [ ] Hymn audio plays (mutual exclusion)
- [ ] Hotspots render and click correctly
- [ ] Progress indicators update
- [ ] YouTube videos load on demand
- [ ] Responsive design maintained
- [ ] No console errors

## Files Created

```
assets/js/
├── carousel-utils.js       (170 lines)
├── carousel-manager.js     (380 lines)
├── sacred-items-modal.js   (280 lines)
├── carousel-audio.js       (170 lines)
├── carousel-display.js     (410 lines)
├── carousel-setup.js       (70 lines)
├── carousel-controls.js    (existing - 80 lines)
└── carousel-init.js        (alternative init - 80 lines)
```

**Total extracted:** ~1,840 lines of embedded JavaScript → ~1,560 lines of modular JavaScript
**Reduction:** 280 lines saved through modularization
**HTML cleanup:** 2055 lines → ~400 lines (removing 1,641 lines of embedded script)
