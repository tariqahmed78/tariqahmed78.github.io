(function () {
  var root = document.documentElement;
  var KEY = 'trtm-theme';

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
      apply(root.getAttribute('data-theme') !== 'light');
    });
  });
})();
