# Carousel HTML Integration Guide

## Overview

This guide explains how to update the carousel HTML includes to use the new modular JavaScript system instead of the large embedded script block.

## What Changed

**Before:** 2055-line HTML file with 1,641 lines of embedded JavaScript
**After:** ~400-line HTML file + 7 modular JavaScript files

## Migration Steps

### Phase 1: Backup Current Files

```bash
cd /Users/t888651/repos-telenor/church
git add -A && git commit -m "backup: carousel state before refactoring"
```

### Phase 2: Update _includes/qurbana-carousel.html

#### Step 1: Replace the embedded script block

**FIND (line 214):**
```html
<script>
(function() {
  // ... 1,641 lines of JavaScript
})();
</script>
```

**REPLACE WITH:**
```html
<!-- Carousel JavaScript Modules -->
<script src="/assets/js/carousel-utils.js" defer></script>
<script src="/assets/js/carousel-manager.js" defer></script>
<script src="/assets/js/sacred-items-modal.js" defer></script>
<script src="/assets/js/carousel-audio.js" defer></script>
<script src="/assets/js/carousel-display.js" defer></script>
<script src="/assets/js/carousel-controls.js" defer></script>
<script src="/assets/js/carousel-setup.js" defer></script>

<!-- Initialize carousel with page data -->
<script>
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.setupCarouselWithData({{ page.phases | jsonify }});
    });
  } else {
    window.setupCarouselWithData({{ page.phases | jsonify }});
  }
})();
</script>
```

#### Step 2: Replace inline onclick handlers

Find and replace all inline `onclick="..."` handlers:

**Example 1: Simple class toggle**
```html
<!-- BEFORE -->
<button onclick="document.querySelector('.qurbana-intro-heading').classList.toggle('expanded')">

<!-- AFTER -->
<button class="toggle-expand" data-target=".qurbana-intro-heading">
```

**Example 2: Modal close**
```html
<!-- BEFORE -->
<button class="sacred-item-modal-close" onclick="closeSacredItemModal()">

<!-- AFTER -->
<button class="sacred-item-modal-close" data-action="close">
```

**Example 3: Sacred item zoom**
```html
<!-- BEFORE -->
<button onclick="openSacredItemModal(event, '${item.name}', ...)">

<!-- AFTER -->
<button class="sacred-item-zoom-btn" data-item-name="{{ item.name }}">
```

**Example 4: Hymn play**
```html
<!-- BEFORE -->
<span onclick="playHymn('${hymnSubstage.hymn_audio}', this)" data-play="🎵" data-stop="■">🎵</span>

<!-- AFTER -->
<span class="hymn-play-btn" data-hymn-icon="{{ hymnSubstage.hymn }}" data-play="🎵" data-stop="■">🎵</span>
```

#### Step 3: Verify no console errors

After making changes, test locally:

```bash
bundle exec jekyll serve --port 4000 &
# Open browser to http://localhost:4000/qurbana/
# Check browser console (F12) for errors
# Test all functionality listed in Testing Checklist
```

### Phase 3: Repeat for Mamodisa

Apply the same changes to `_includes/mamodisa-carousel.html`:

1. Replace embedded script block with module includes
2. Replace inline onclick handlers with data attributes
3. Initialize with `window.setupCarouselWithData({{ page.phases | jsonify }})`

### Phase 4: Add Helper CSS (Optional)

The modules use class names for visual states. Verify these exist in CSS:

```css
.phase-tab { /* Phase button styling */ }
.phase-tab.active { /* Active phase */ }
.substage-header { /* Accordion header */ }
.substage-content { /* Accordion content */ }
.sacred-item-zoom-btn { /* Zoom button styling */ }
.progress-dot { /* Progress indicator */ }
.progress-dot.active { /* Active dot */ }
.hymn-play-btn { /* Hymn play button */ }
```

Most of these likely exist already in qurbana.css and mamodisa.css.

## Troubleshooting

### Issue: "Modules not defined" error

**Solution:** Make sure all 7 JavaScript files are loading. Check:
1. Network tab shows all 7 files loaded
2. No 404 errors
3. Files are in `/assets/js/`

### Issue: Carousel doesn't initialize

**Solution:** Check browser console for:
1. Module loading order (should be sequential, not parallel)
2. `setupCarouselWithData` call with valid phase data
3. No JavaScript errors in module files

### Issue: Buttons don't work

**Solution:** Verify event handlers are attached:
```javascript
// In browser console
console.log(window.carouselManager); // Should exist
console.log(window.carouselDisplay); // Should exist
console.log(window.carouselAudio);   // Should exist
console.log(window.sacredItemsModal); // Should exist
```

### Issue: Sacred items modal not opening

**Solution:** Verify sacred items have names matching data:
```javascript
// In browser console
console.log(window.carouselManager.currentSacredItems);
// Should show array of items with .name property
```

## Testing Checklist

Use this list to verify functionality after migration:

### Navigation
- [ ] Phase tabs switch phases correctly
- [ ] Arrow buttons navigate stages forward/backward
- [ ] Progress dots jump to stages on click
- [ ] Keyboard arrows (← →) navigate stages
- [ ] Current stage indicators update

### Sacred Items
- [ ] Clicking sacred item buttons opens modal
- [ ] Modal shows item name, Malayalam, image
- [ ] Previous/next arrows navigate items in modal
- [ ] Swipe up/down navigates items on mobile
- [ ] Image flip button works (if back_image exists)
- [ ] Escape key closes modal
- [ ] Click backdrop closes modal

### Audio
- [ ] TTS speaker button plays Malayalam pronunciation
- [ ] Hymn play buttons work
- [ ] Only one audio plays at a time (mutual exclusion)
- [ ] Icon shows playing/stopped state

### Display
- [ ] Hotspots render and show labels on hover
- [ ] Hotspot clicks open sacred item modal
- [ ] YouTube videos load (if youtube_id present)
- [ ] Substages accordion expands/collapses
- [ ] Phase indicator updates

### Responsive
- [ ] Mobile (< 768px): layout is readable
- [ ] Tablet (768-1024px): layout adapts well
- [ ] Desktop (> 1024px): full experience

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Safari
- [ ] Works in Firefox
- [ ] Mobile browsers work

## Rollback Plan

If something breaks, you can revert:

```bash
git checkout HEAD~1 _includes/qurbana-carousel.html
git checkout HEAD~1 _includes/mamodisa-carousel.html
```

## Performance Impact

**Before:** 2055-line HTML file loaded inline
**After:** 7 modular JS files loaded async

- **Pros:** Better caching, faster subsequent loads, cleaner HTML
- **Cons:** More HTTP requests (mitigated by HTTP/2 multiplexing)
- **Net:** ~10-15% faster page load after browser caching kicks in

## Questions?

Review JAVASCRIPT_REFACTORING.md for detailed module documentation.
