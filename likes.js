(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('.like-btn');
    buttons.forEach(function (btn) {
      var postId = btn.dataset.postId;
      var baseCount = parseInt(btn.dataset.baseCount || '0', 10);
      var likedKey = 'liked_' + postId;
      var countKey = 'like_count_' + postId;

      var liked = localStorage.getItem(likedKey) === 'true';
      var count = parseInt(localStorage.getItem(countKey), 10);
      if (isNaN(count)) count = baseCount;
      render(btn, liked, count);

      btn.addEventListener('click', function () {
        liked = localStorage.getItem(likedKey) === 'true';
        count = parseInt(localStorage.getItem(countKey), 10);
        if (isNaN(count)) count = baseCount;

        if (liked) {
          count = Math.max(baseCount, count - 1);
          localStorage.setItem(likedKey, 'false');
        } else {
          count = count + 1;
          localStorage.setItem(likedKey, 'true');
        }
        localStorage.setItem(countKey, String(count));
        render(btn, !liked, count);
      });
    });
  });

  function render(btn, liked, count) {
    btn.classList.toggle('liked', liked);
    var heart = btn.querySelector('.heart');
    if (heart) heart.textContent = liked ? '♥' : '♡';
    var countEl = btn.querySelector('.like-count');
    if (countEl) countEl.textContent = count;
  }

  // Note: likes are stored per-visitor via localStorage, same as the
  // theme preference in theme.js — there's no backend on GitHub Pages,
  // so this is a local count, not a shared count across all visitors.
})();
