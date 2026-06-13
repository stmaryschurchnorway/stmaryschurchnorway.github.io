(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.MSOC_reduceMotion = reduceMotion;

  function whenVisible(el, cb) {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.disconnect(); cb(); }
      });
    }, { rootMargin: '200px' });
    io.observe(el);
  }

  var videoGrid = document.getElementById('home-videos');
  if (videoGrid && typeof window.loadHomeVideos === 'function') {
    whenVisible(videoGrid, window.loadHomeVideos);
  }

  if (typeof window.loadNextEvent === 'function') {
    if ('requestIdleCallback' in window) requestIdleCallback(window.loadNextEvent);
    else setTimeout(window.loadNextEvent, 1);
  }
})();
