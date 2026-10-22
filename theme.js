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
  else { apply(true); } // default dark

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      apply(root.getAttribute('data-theme') === 'light');
    });
  });
})();
