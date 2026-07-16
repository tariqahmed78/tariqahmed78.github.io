(function () {
  var canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = [];
  var W, H, DPR;
  var mouse = { x: null, y: null, active: false };

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function hexToRgb(hex) {
    var m = hex.replace('#', '');
    if (m.length === 3) m = m.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(m, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeNodes() {
    var count = Math.max(24, Math.min(52, Math.floor((W * H) / 26000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.85,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: 1.1 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function step(t) {
    var rgb = hexToRgb(cssVar('--cyan') || '#3ED2FF');
    var col = rgb.join(',');
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!reduced) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H * 0.85) n.vy *= -1;
      }

      // Mouse interactive link
      if (mouse.active) {
        var dxM = n.x - mouse.x;
        var dyM = n.y - mouse.y;
        var distM = Math.sqrt(dxM * dxM + dyM * dyM);
        var MOUSE_LINK = 150;
        if (distM < MOUSE_LINK) {
          var opM = (0.45 * (1 - distM / MOUSE_LINK)).toFixed(3);
          ctx.strokeStyle = 'rgba(' + col + ',' + opM + ')';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();

          // Gentle pull attraction
          var pull = (MOUSE_LINK - distM) / MOUSE_LINK;
          n.x -= (dxM / distM) * pull * 0.35;
          n.y -= (dyM / distM) * pull * 0.35;
        }
      }
    }

    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var dx = nodes[a].x - nodes[b].x;
        var dy = nodes[a].y - nodes[b].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var maxDist = 140;
        if (dist < maxDist) {
          var op = (1 - dist / maxDist) * 0.35;
          ctx.strokeStyle = 'rgba(' + col + ',' + op.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[a].x, nodes[a].y);
          ctx.lineTo(nodes[b].x, nodes[b].y);
          ctx.stroke();
        }
      }
    }

    for (var j = 0; j < nodes.length; j++) {
      var node = nodes[j];
      var pulse = reduced ? 0.75 : 0.55 + 0.45 * Math.sin(t / 900 + node.phase);
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + col + ',' + (0.55 + pulse * 0.4).toFixed(3) + ')';
      ctx.shadowColor = 'rgba(' + col + ',0.9)';
      ctx.shadowBlur = 8 * pulse;
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    if (!reduced) requestAnimationFrame(step);
  }

  function init() {
    resize();
    makeNodes();
    step(0);
  }

  window.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', function () {
    mouse.active = false;
  });

  window.addEventListener('resize', function () {
    resize();
    makeNodes();
    if (reduced) step(0);
  });

  init();
})();
