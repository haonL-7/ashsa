/**
 * Starfield Header v4 — premium parallax starfield
 * 3 depth layers, mouse parallax, constellation glows, no game-like interactions
 */
(function () {
  var canvas, ctx, W, H, H2, animId;
  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  // 3 parallax layers
  var layers = [
    { count: 200, speed: 0.06, rMin: 0.4, rMax: 1.2, alpha: 0.6, parallax: 0.5, stars: [] },
    { count: 100, speed: 0.03, rMin: 0.8, rMax: 2.2, alpha: 0.7, parallax: 0.3, stars: [] },
    { count: 40,  speed: 0.01, rMin: 1.5, rMax: 3.0, alpha: 0.8, parallax: 0.12, stars: [] }
  ];

  // Constellations (fixed in sky, subtle glow + twinkle)
  var cons = [
    { name: 'Orion', bx: 0.68, by: 0.33, scale: 0.55,
      pts: [[0,0],[9,2],[16,1],[6,9],[-10,17],[-3,4],[4,-6]],
      lines: [[0,1],[1,2],[3,4],[0,3],[1,4],[5,6]] },
    { name: 'Big Dipper', bx: 0.22, by: 0.22, scale: 0.45,
      pts: [[0,0],[11,-3],[20,1],[31,6],[25,16],[12,13],[3,9]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]] },
    { name: 'Cassiopeia', bx: 0.4, by: 0.58, scale: 0.45,
      pts: [[0,6],[7,0],[14,9],[21,0],[28,6]],
      lines: [[0,1],[1,2],[2,3],[3,4]] },
    { name: 'Pleiades', bx: 0.75, by: 0.28, scale: 0.4,
      pts: [[0,0],[3,3],[-2,5],[6,-2],[3,7],[-4,2],[5,4],[-3,-3],[2,-4]],
      lines: [] },
    { name: 'Andromeda', bx: 0.3, by: 0.48, scale: 0.45,
      pts: [[0,0],[4,2],[8,-1],[12,3],[16,1],[20,4]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5]] }
  ];

  function init() {
    canvas = document.getElementById('sf-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    var header = document.querySelector('.starfield-header');
    (header || canvas).addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / W;
      mouse.ty = (e.clientY - r.top) / H2;
    });

    resize();
    for (var l = 0; l < layers.length; l++) createStars(l);
    window.addEventListener('resize', function () {
      for (var l = 0; l < layers.length; l++) layers[l].stars.length = 0;
      resize();
      for (var l = 0; l < layers.length; l++) createStars(l);
    });
    animate();
  }

  function resize() {
    var hdr = document.querySelector('.starfield-header');
    W = hdr ? hdr.offsetWidth : canvas.parentElement.offsetWidth;
    H2 = hdr ? hdr.offsetHeight : canvas.parentElement.offsetHeight;
    H = Math.round(H2 * 1.5);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }

  function createStars(layerIdx) {
    var layer = layers[layerIdx];
    for (var i = 0; i < layer.count; i++) {
      layer.stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * (layer.rMax - layer.rMin) + layer.rMin,
        twinkle: Math.random() * Math.PI * 2,
        ts: Math.random() * 0.01 + 0.003,
        hue: Math.random() < 0.08 ? 40 + Math.random() * 20 : 210 + Math.random() * 30 // 8% warm gold stars
      });
    }
  }

  function drawGradient() {
    var grad = ctx.createLinearGradient(0, H2 * 0.55, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.5, 'rgba(4,13,26,0.5)');
    grad.addColorStop(1, 'rgba(4,13,26,0.75)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, H2 * 0.55, W, H - H2 * 0.55);
  }

  function drawConstellations(t) {
    var px = (mouse.x - 0.5) * 20;
    var py = (mouse.y - 0.5) * 20;

    for (var k = 0; k < cons.length; k++) {
      var c = cons[k];
      var cx = c.bx * W + px * 0.3;
      var cy = c.by * H + py * 0.3;
      var sc = H * 0.007 * c.scale;
      var pts = [];

      for (var j = 0; j < c.pts.length; j++) {
        pts.push([cx + c.pts[j][0] * sc, cy + c.pts[j][1] * sc]);
      }

      // Very subtle lines
      if (c.lines && c.lines.length) {
        ctx.strokeStyle = 'rgba(140,185,230,0.08)';
        ctx.lineWidth = 0.4;
        for (var j = 0; j < c.lines.length; j++) {
          var l = c.lines[j];
          ctx.beginPath();
          ctx.moveTo(pts[l[0]][0], pts[l[0]][1]);
          ctx.lineTo(pts[l[1]][0], pts[l[1]][1]);
          ctx.stroke();
        }
      }

      // Stars with soft glow
      for (var j = 0; j < pts.length; j++) {
        var sx = pts[j][0], sy = pts[j][1];
        var twinkle = 0.35 + Math.sin(t * 2 + j * 0.7) * 0.06;
        var grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5);
        grad.addColorStop(0, 'rgba(255,255,255,' + (twinkle * 0.9) + ')');
        grad.addColorStop(0.3, 'rgba(190,215,250,' + (twinkle * 0.15) + ')');
        grad.addColorStop(0.7, 'rgba(100,150,200,' + (twinkle * 0.04) + ')');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }
  }

  function animate() {
    var t = performance.now() * 0.001;

    // Smooth mouse interpolation
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    ctx.clearRect(0, 0, W, H);

    // Draw all layers
    for (var l = 0; l < layers.length; l++) {
      var layer = layers[l];
      var parallaxX = (mouse.x - 0.5) * 30 * layer.parallax;
      var parallaxY = (mouse.y - 0.5) * 30 * layer.parallax;

      for (var i = 0; i < layer.stars.length; i++) {
        var s = layer.stars[i];

        // Very slow drift
        s.x += Math.sin(t * 0.3 + i) * 0.008;
        s.y += Math.cos(t * 0.4 + i) * 0.008;
        if (s.x < -20) s.x = W + 20;
        if (s.x > W + 20) s.x = -20;
        if (s.y < -20) s.y = H + 20;
        if (s.y > H + 20) s.y = -20;

        // Render position = real position + parallax offset
        var rx = s.x + parallaxX;
        var ry = s.y + parallaxY;

        s.twinkle += s.ts;
        var alpha = layer.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
        var hue = s.hue;

        // Subtle glow for larger stars in top layers
        if (l >= 1 && s.r > 1.5) {
          var grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, s.r * 2.5);
          grad.addColorStop(0, 'hsla(' + hue + ',40%,85%,' + (alpha * 0.5) + ')');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(rx, ry, s.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = 'hsla(' + hue + ',30%,85%,' + alpha + ')';
        ctx.arc(rx, ry, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Constellation overlay (no parallax, subtly anchored)
    drawConstellations(t);

    // Bottom gradient fade
    drawGradient();

    animId = requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
