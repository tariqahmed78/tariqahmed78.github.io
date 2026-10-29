/**
 * card-3d.js — 3D Card Tilt, Sheen Overlay & Inner Parallax
 * Adds perspective-based tilt, cursor-tracking sheen, and Z-axis depth
 * to card elements on hover. Spring physics for smooth return.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Skip on touch devices — tilt doesn't make sense without a mouse
  if ('ontouchstart' in window && window.innerWidth < 1024) return;

  document.addEventListener('DOMContentLoaded', function () {
    // Small delay to let GSAP animations set up first
    setTimeout(initCard3D, 300);
  });

  function initCard3D() {
    var SELECTORS = [
      '.article-card',
      '.featured-card',
      '.side-item',
      '.feature-card',
      '.product-card',
      '.stat-card'
    ];
    // NOTE: Intentionally NOT including .contact-card, .about-mission, .blog-card
    // to avoid breaking visibility on content-heavy sections

    var cards = document.querySelectorAll(SELECTORS.join(','));
    if (!cards.length) return;

    cards.forEach(function (card) {
      setupCard(card);
    });
  }

  function setupCard(card) {
    var MAX_TILT = 8; // degrees (reduced for subtlety)
    var PERSPECTIVE = 900;
    var RETURN_SPEED = 0.1; // spring factor

    // Current state
    var current = { rx: 0, ry: 0 };
    var target = { rx: 0, ry: 0 };
    var isHovered = false;
    var rafId = null;

    // Create sheen overlay
    var sheen = document.createElement('div');
    sheen.className = 'card-sheen';
    sheen.style.cssText =
      'position:absolute;inset:0;pointer-events:none;border-radius:inherit;opacity:0;' +
      'transition:opacity 0.3s ease;z-index:2;' +
      'background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 55%);';

    // Only add sheen if card has position set
    var cardPos = window.getComputedStyle(card).position;
    if (cardPos === 'static') {
      card.style.position = 'relative';
    }
    card.appendChild(sheen);

    // Mouse enter
    card.addEventListener('mouseenter', function () {
      isHovered = true;
      sheen.style.opacity = '1';
      if (!rafId) animateCard();
    });

    // Mouse move
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;

      // Calculate tilt (inverted for natural feel)
      target.ry = ((x - centerX) / centerX) * MAX_TILT;
      target.rx = -((y - centerY) / centerY) * MAX_TILT;

      // Move sheen to follow cursor
      var sheenX = (x / rect.width) * 100;
      var sheenY = (y / rect.height) * 100;
      sheen.style.background =
        'radial-gradient(circle at ' + sheenX + '% ' + sheenY + '%, rgba(255,255,255,0.1) 0%, transparent 55%)';
    });

    // Mouse leave
    card.addEventListener('mouseleave', function () {
      isHovered = false;
      target.rx = 0;
      target.ry = 0;
      sheen.style.opacity = '0';
    });

    // Spring animation loop
    function animateCard() {
      // Interpolate toward target
      current.rx += (target.rx - current.rx) * RETURN_SPEED;
      current.ry += (target.ry - current.ry) * RETURN_SPEED;

      // Apply transform — NO perspective on the element itself to avoid backface issues
      card.style.transform =
        'perspective(' + PERSPECTIVE + 'px) ' +
        'rotateX(' + current.rx.toFixed(2) + 'deg) ' +
        'rotateY(' + current.ry.toFixed(2) + 'deg) ' +
        'translateZ(0) ' +
        'scale3d(1.015, 1.015, 1.015)';

      // Check if we need to keep animating
      var dx = Math.abs(target.rx - current.rx);
      var dy = Math.abs(target.ry - current.ry);

      if (isHovered || dx > 0.05 || dy > 0.05) {
        rafId = requestAnimationFrame(animateCard);
      } else {
        // Fully settled — reset
        card.style.transform = '';
        current.rx = 0;
        current.ry = 0;
        rafId = null;
      }
    }
  }
})();
