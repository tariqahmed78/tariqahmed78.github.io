(function () {
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: light)');
  var manualOverride = false;

  function applyTheme(isLight) {
    root.setAttribute('data-theme', isLight ? 'light' : 'dark');
  }

  // Auto: follow system preference on load.
  applyTheme(media.matches);

  // Keep following the system unless the visitor manually toggles.
  media.addEventListener('change', function (e) {
    if (!manualOverride) applyTheme(e.matches);
  });

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      manualOverride = true;
      var isLight = root.getAttribute('data-theme') === 'light';
      applyTheme(!isLight);
    });
  });

  // Note: this is intentionally session-only (no localStorage/sessionStorage).
  // If you deploy this outside an artifact preview and want the choice to
  // persist across visits, you can store it with localStorage yourself:
  //   localStorage.setItem('theme', ...) / localStorage.getItem('theme')
})();
