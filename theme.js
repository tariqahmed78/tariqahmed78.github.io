(function () {
  'use strict';

  var root = document.documentElement;
  var preferenceKey = 'trtm-appearance';
  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  var appearanceNames = { light: 'Light', dark: 'Dark', system: 'System' };
  var appearance = readAppearance();
  var picker;
  var button;
  var options;
  var radios;

  function readAppearance() {
    try {
      var saved = window.localStorage.getItem(preferenceKey);
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch (error) {
      // The site still works when storage is unavailable.
    }
    return 'light';
  }

  function paintAppearance() {
    var dark = appearance === 'dark' || (appearance === 'system' && systemTheme.matches);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    root.setAttribute('data-theme-preference', appearance);

    if (button) {
      button.setAttribute('aria-label', 'Appearance (' + appearanceNames[appearance] + ')');
      radios.forEach(function (radio) { radio.checked = radio.value === appearance; });
    }
  }

  function onMediaChange(query, handler) {
    if (query.addEventListener) query.addEventListener('change', handler);
    else if (query.addListener) query.addListener(handler);
  }

  function setPickerOpen(open) {
    options.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  }

  function setupAppearancePicker() {
    picker = document.getElementById('theme-picker');
    if (!picker) return;

    button = document.getElementById('theme-toggle');
    options = document.getElementById('theme-options');
    radios = Array.from(options.querySelectorAll('input[name="site-appearance"]'));
    paintAppearance();
    picker.hidden = false;

    button.addEventListener('click', function (event) {
      var open = options.hidden;
      setPickerOpen(open);
      if (open && event.detail === 0) {
        radios.find(function (radio) { return radio.checked; }).focus();
      }
    });
    options.addEventListener('change', function (event) {
      appearance = event.target.value;
      try {
        window.localStorage.setItem(preferenceKey, appearance);
      } catch (error) {
        // Keep the applied appearance for this page.
      }
      paintAppearance();
    });
    document.addEventListener('click', function (event) {
      if (!picker.contains(event.target) && !options.hidden) setPickerOpen(false);
    });
    picker.addEventListener('focusout', function (event) {
      if (!picker.contains(event.relatedTarget) && !options.hidden) setPickerOpen(false);
    });
    picker.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !options.hidden) {
        event.stopPropagation();
        setPickerOpen(false);
        button.focus();
      }
    });
  }

  paintAppearance();
  onMediaChange(systemTheme, function () {
    if (appearance === 'system') paintAppearance();
  });
  window.addEventListener('storage', function (event) {
    if (event.key === preferenceKey || event.key === null) {
      appearance = readAppearance();
      paintAppearance();
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    setupAppearancePicker();

    // Shared mobile menu controller; some pages still have a legacy inline toggle.
    var navToggle = document.getElementById('nav-toggle');
    var navLinks = document.getElementById('nav-links');
    if (navToggle && navLinks) {
      function setMenu(open) {
        navLinks.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      }
      navToggle.setAttribute('aria-controls', navLinks.id);
      setMenu(false);
      navToggle.addEventListener('click', function (e) {
        // Stop the legacy bubbling listener from reversing the toggle.
        e.stopImmediatePropagation();
        var open = !navLinks.classList.contains('open');
        setMenu(open);
        var firstLink = navLinks.querySelector('a[href]');
        if (open && e.detail === 0 && firstLink) firstLink.focus();
      }, true);
      document.addEventListener('click', function (e) {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
      });
      document.addEventListener('focusin', function (e) {
        if (e.target !== navToggle && !navLinks.contains(e.target)) setMenu(false);
      });
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () { setMenu(false); });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
          setMenu(false);
          navToggle.focus();
        }
      });
      var mobileNav = window.matchMedia('(max-width: 760px)');
      function resetMenu() { setMenu(false); }
      onMediaChange(mobileNav, resetMenu);
    }

    var GA_ID = 'G-6WJND9M7H9';
    // Google Analytics 4 setup
    if (window && !window.dataLayer) {
      window.dataLayer = window.dataLayer || [];
    }
    function gtag() {
      window.dataLayer.push(arguments);
    }

    if (!window.__trtmGtagLoaded) {
      window.__trtmGtagLoaded = true;
      var gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(gtagScript);

      gtag('js', new Date());
      gtag('config', GA_ID);
    }
  });
})();
