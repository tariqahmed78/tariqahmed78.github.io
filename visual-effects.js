/* Decorative libraries load after the first rendering opportunity, never before content. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function load(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  function start() {
    if (document.getElementById('three-canvas')) {
      load('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
        .then(function () { return load('three-bg.js?v=fast-1'); })
        .catch(function () { /* CSS ambient background remains available. */ });
    }
    if (document.querySelector('.reveal, .scroll-progress, .legal, .contact-card')) {
      load('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js')
        .then(function () { return load('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'); })
        .then(function () { return load('gsap-animations.js?v=fast-1'); })
        .catch(function () { /* Content is visible without animation libraries. */ });
    }
  }
  function schedule() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { setTimeout(start, 0); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
})();
