(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, nodes, animId;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { canvas.style.display = 'none'; return; }

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function mkNode() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        hue: Math.random() < 0.6 ? 245 : 280, // indigo or purple
        o: Math.random() * 0.6 + 0.3
      };
    }

    function init() {
      resize();
      var count = Math.min(90, Math.floor(W * H / 7000));
      nodes = [];
      for (var i = 0; i < count; i++) nodes.push(mkNode());
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LINK = 130;

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + n.hue + ',85%,72%,' + n.o + ')';
        ctx.fill();

        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK) {
            var alpha = (0.22 * (1 - dist / LINK)).toFixed(3);
            var midHue = (n.hue + m.hue) / 2;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = 'hsla(' + midHue + ',80%,72%,' + alpha + ')';
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', function () {
      cancelAnimationFrame(animId);
      init(); draw();
    });
  });
})();
