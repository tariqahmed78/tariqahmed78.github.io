(function () {
  // ⚠️ SETUP REQUIRED: replace this with your own Worker URL after you
  // deploy worker.js to Cloudflare (see the setup steps at the top of
  // that file). Until you do, like buttons will show an error state.
  var WORKER_URL = 'https://REPLACE-ME.workers.dev';

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.like-btn').forEach(function (btn) {
      var postId = btn.dataset.postId;
      var countEl = btn.querySelector('.like-count');
      var heartEl = btn.querySelector('.heart');

      fetch(WORKER_URL + '?post=' + encodeURIComponent(postId))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          render(data.count, data.liked);
        })
        .catch(function () {
          if (countEl) countEl.textContent = '—';
        });

      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        btn.disabled = true;
        fetch(WORKER_URL + '?post=' + encodeURIComponent(postId), { method: 'POST' })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            render(data.count, data.liked);
          })
          .catch(function () {
            btn.disabled = false;
          });
      });

      function render(count, liked) {
        if (countEl) countEl.textContent = count;
        if (heartEl) heartEl.textContent = liked ? '♥' : '♡';
        btn.classList.toggle('liked', !!liked);
        if (liked) btn.disabled = true; // one like per visitor, enforced server-side too
      }
    });
  });
})();
