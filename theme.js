(function () {
  var root = document.documentElement;
  var KEY = 'trtm-theme';
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

  function apply(dark) {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch(e){}
  }

  // Apply immediately before paint (prevents flash)
  var saved;
  try { saved = localStorage.getItem(KEY); } catch(e){}
  if (saved === 'light') { apply(false); }
  else if (saved === 'dark') { apply(true); }
  else { apply(root.getAttribute('data-default-theme') !== 'light'); }

  document.addEventListener('DOMContentLoaded', function () {
    // Theme toggle
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        apply(root.getAttribute('data-theme') === 'light');
      });
    }

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
      if (mobileNav.addEventListener) mobileNav.addEventListener('change', resetMenu);
      else if (mobileNav.addListener) mobileNav.addListener(resetMenu);
    }
  });
})();
