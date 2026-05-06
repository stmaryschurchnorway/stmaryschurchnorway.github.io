/**
 * Carousel Controls Module
 * Handles keyboard-accessible expand/toggle functionality
 * Supports: Click, Enter key, Space key
 */

(function() {
  'use strict';

  const EXPAND_SELECTOR = '[data-toggle="expand"]';
  const EXPANDED_CLASS = 'expanded';

  /**
   * Initialize all expandable controls
   */
  function initializeControls() {
    const controls = document.querySelectorAll(EXPAND_SELECTOR);
    controls.forEach(control => {
      makeAccessible(control);
    });
  }

  /**
   * Make a control keyboard-accessible
   */
  function makeAccessible(control) {
    // Ensure button has proper ARIA attributes
    if (!control.getAttribute('role')) {
      control.setAttribute('role', 'button');
    }
    if (!control.getAttribute('tabindex')) {
      control.setAttribute('tabindex', '0');
    }

    // Add keyboard support (Enter and Space)
    control.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(this);
      }
    });

    // Add click support
    control.addEventListener('click', function(e) {
      e.preventDefault();
      toggle(this);
    });
  }

  /**
   * Toggle expanded state for a control
   */
  function toggle(control) {
    const targetSelector = control.getAttribute('data-target');
    if (!targetSelector) {
      // Fallback: toggle the immediate parent's expanded class
      const parent = control.closest('[data-expandable]');
      if (parent) {
        parent.classList.toggle(EXPANDED_CLASS);
      }
      return;
    }

    const target = document.querySelector(targetSelector);
    if (target) {
      target.classList.toggle(EXPANDED_CLASS);
      // Update aria-expanded for screen readers
      const isExpanded = target.classList.contains(EXPANDED_CLASS);
      control.setAttribute('aria-expanded', isExpanded);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeControls);
  } else {
    initializeControls();
  }

  // Export for testing/debugging
  window.CarouselControls = { toggle, initializeControls };
})();
