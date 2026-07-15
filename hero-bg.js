(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, particles, animId;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { canvas.style.display = 'none'; return; }

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function isDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function mkParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        o: Math.random() * 0.5 + 0.2
      };
    }

    function init() {
      resize();
      var count = Math.min(80, Math.floor(W * H / 10000));
      particles = [];
      for (var i = 0; i < count; i++) particles.push(mkParticle());
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var dark = isDark();
      var dotCol = dark ? 'rgba(180,190,220,' : 'rgba(60,70,120,';
      var lineCol = dark ? 'rgba(140,160,220,' : 'rgba(46,79,158,';
      var LINK = 110;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dotCol + p.o + ')';
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = lineCol + (0.18 * (1 - dist / LINK)).toFixed(3) + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', function () { cancelAnimationFrame(animId); init(); draw(); });

    // Re-draw colour when theme changes (MutationObserver on data-theme)
    var mo = new MutationObserver(function () { /* colour applied dynamically in draw() */ });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  });
})();
