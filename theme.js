(function () {
  var root = document.documentElement;
  var STORAGE_KEY = 'trtm-theme';

  function applyTheme(isDark) {
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light'); } catch(e){}
  }

  // On every page load: check saved preference first, else follow system
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch(e){}

  if (saved === 'dark') {
    applyTheme(true);
  } else if (saved === 'light') {
    applyTheme(false);
  } else {
    // No saved preference — follow system (dark is default for most tech users)
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      applyTheme(!isDark);
    });
  });
})();
