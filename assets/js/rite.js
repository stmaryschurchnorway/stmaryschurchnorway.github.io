(function () {
  'use strict';

  // ---- Stepper enhancement ----
  var stepper = document.querySelector('.rite-stepper');
  if (stepper) {
    document.documentElement.classList.add('js-ready');

    var stages = Array.prototype.slice.call(stepper.querySelectorAll('.rite-stage'));
    var bar = stepper.querySelector('.rite-progress-bar');
    var dots = stepper.querySelector('.rite-dots');
    var prevBtn = stepper.querySelector('.rite-prev');
    var nextBtn = stepper.querySelector('.rite-next');
    var total = stages.length;
    var current = 0;

    stages.forEach(function (s, i) {
      var dot = document.createElement('button');
      dot.className = 'rite-dot';
      dot.setAttribute('aria-label', 'Step ' + (i + 1));
      dot.addEventListener('click', function () { show(i); });
      dots.appendChild(dot);
    });

    function show(n) {
      current = Math.max(0, Math.min(total - 1, n));
      stages.forEach(function (s, k) {
        s.hidden = k !== current;
        s.setAttribute('aria-hidden', k !== current);
      });
      var allDots = dots.querySelectorAll('.rite-dot');
      allDots.forEach(function (d, k) {
        d.setAttribute('aria-current', k === current ? 'true' : 'false');
      });
      bar.style.width = ((current + 1) / total * 100) + '%';
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === total - 1;
      var activeMeta = stages[current].querySelector('.rite-stage-meta');
      if (activeMeta) activeMeta.textContent = 'STEP ' + (current + 1) + ' OF ' + total;
    }

    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });
    show(0);

    var riteAudio = null;
    stepper.addEventListener('click', function (e) {
      var btn = e.target.closest('.rite-audio');
      if (!btn) return;
      var src = btn.getAttribute('data-src');
      if (!src) return;
      if (riteAudio) { riteAudio.pause(); riteAudio.currentTime = 0; }
      riteAudio = new Audio(src);
      riteAudio.play().catch(function (err) { console.error('Audio:', err); });
    });
  } else {
    document.documentElement.classList.add('js-ready');
  }

  // ---- Prep tabs enhancement ----
  function enhancePrep(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.rite-prep-tab'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.rite-prep-panel'));
    if (!tabs.length || tabs.length !== panels.length) return;

    function select(i) {
      tabs.forEach(function (tab, j) {
        var on = i === j;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i); });
      tab.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n); tabs[n].focus(); }
      });
    });

    select(0);
  }

  Array.prototype.slice.call(document.querySelectorAll('.rite-prep[data-prep]')).forEach(enhancePrep);
})();
