/**
 * Starfield Header v3 — drifting constellations + mouse interaction + gradient bottom
 * Targets .starfield-header container, uses #sf-canvas
 */
(function () {
  var canvas, ctx, W, H, animId;
  var stars = [], STAR_COUNT = 300;
  var mouse = { x: -999, y: -999, on: false };
  var MAX_DIST = 100, MOUSE_RADIUS = 160, time = 0;

  // Constellation definitions with drift
  var cons = [
    { name: 'Orion', bx: 0.68, by: 0.35, scale: 0.6, driftX: 0.003, driftY: 0.002,
      pts: [[0,0],[9,2],[16,1],[6,9],[-10,17],[-3,4],[4,-6]],
      lines: [[0,1],[1,2],[3,4],[0,3],[1,4],[5,6]] },
    { name: 'Big Dipper', bx: 0.22, by: 0.25, scale: 0.5, driftX: -0.002, driftY: 0.003,
      pts: [[0,0],[11,-3],[20,1],[31,6],[25,16],[12,13],[3,9]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]] },
    { name: 'Cassiopeia', bx: 0.4, by: 0.6, scale: 0.5, driftX: 0.004, driftY: -0.001,
      pts: [[0,6],[7,0],[14,9],[21,0],[28,6]],
      lines: [[0,1],[1,2],[2,3],[3,4]] },
    { name: 'Pleiades', bx: 0.75, by: 0.3, scale: 0.45, driftX: -0.003, driftY: -0.002,
      pts: [[0,0],[3,3],[-2,5],[6,-2],[3,7],[-4,2],[5,4],[-3,-3],[2,-4]],
      lines: [] },
    { name: 'Andromeda', bx: 0.3, by: 0.5, scale: 0.5, driftX: 0.002, driftY: 0.004,
      pts: [[0,0],[4,2],[8,-1],[12,3],[16,1],[20,4]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5]] }
  ];

  function init() {
    canvas = document.getElementById('sf-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Capture mouse on entire header, not just canvas
    var header = document.querySelector('.starfield-header');
    (header || canvas).addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.on = true;
    });
    (header || canvas).addEventListener('mouseleave', function () { mouse.on = false; });

    resize();
    createStars();
    window.addEventListener('resize', function () { stars.length = 0; resize(); createStars(); });
    animate();
  }

  function resize() {
    var hdr = document.querySelector('.starfield-header');
    W = hdr ? hdr.offsetWidth : canvas.parentElement.offsetWidth;
    var h = hdr ? hdr.offsetHeight : canvas.parentElement.offsetHeight;
    H = Math.round(h * 1.5); // extend 50% for gradient fade
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }

  function createStars() {
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 2 + 0.5,
        bright: Math.random() * 0.5 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        phase: Math.random() * 0.03
      });
    }
  }

  function drawGradientFade() {
    // Bottom fade: from transparent to fully faded
    var fadeStart = H * 0.6;
    var grad = ctx.createLinearGradient(0, fadeStart, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, fadeStart, W, H - fadeStart);
  }

  function drawConstellations(t) {
    for (var k = 0; k < cons.length; k++) {
      var c = cons[k];
      // Drifting base position
      var cx = (c.bx + Math.sin(t * c.driftX) * 0.04) * W;
      var cy = (c.by + Math.cos(t * c.driftY) * 0.04) * H;
      var sc = H * 0.008 * c.scale;
      var pts = [];
      for (var j = 0; j < c.pts.length; j++) {
        pts.push([cx + c.pts[j][0] * sc, cy + c.pts[j][1] * sc]);
      }

      // Connection lines
      if (c.lines && c.lines.length) {
        ctx.strokeStyle = 'rgba(140,185,230,0.1)';
        ctx.lineWidth = 0.5;
        for (var j = 0; j < c.lines.length; j++) {
          var l = c.lines[j];
          ctx.beginPath();
          ctx.moveTo(pts[l[0]][0], pts[l[0]][1]);
          ctx.lineTo(pts[l[1]][0], pts[l[1]][1]);
          ctx.stroke();
        }
      }

      // Stars with glow
      for (var j = 0; j < pts.length; j++) {
        var sx = pts[j][0], sy = pts[j][1];
        var alpha = 0.3 + Math.sin(t * 1.5 + j) * 0.08;
        if (mouse.on) {
          var d = Math.hypot(mouse.x - sx, mouse.y - sy);
          if (d < 100) alpha = Math.min(1, alpha + 0.7 * (1 - d / 100));
        }
        var grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 4);
        grad.addColorStop(0, 'rgba(255,255,255,' + (alpha * 0.9) + ')');
        grad.addColorStop(0.5, 'rgba(180,210,250,' + (alpha * 0.18) + ')');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }
  }

  function animate() {
    time += 0.016;
    ctx.clearRect(0, 0, W, H);

    // Stars
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.x += s.vx + Math.sin(time * 0.7 + s.phase * 100) * 0.05;
      s.y += s.vy + Math.cos(time * 0.6 + s.phase * 100) * 0.05;
      if (s.x < -10) s.x = W + 10;
      if (s.x > W + 10) s.x = -10;
      if (s.y < -10) s.y = H + 10;
      if (s.y > H + 10) s.y = -10;

      s.twinkle += s.twinkleSpeed;
      var alpha = s.bright + Math.sin(s.twinkle) * 0.12;

      if (mouse.on) {
        var d = Math.hypot(mouse.x - s.x, mouse.y - s.y);
        if (d < MOUSE_RADIUS) {
          alpha = Math.min(1, alpha + 0.45 * (1 - d / MOUSE_RADIUS));
          // Pull toward mouse
          var force = 0.03 * (1 - d / MOUSE_RADIUS);
          s.x += (mouse.x - s.x) * force;
          s.y += (mouse.y - s.y) * force;
        }
      }

      ctx.beginPath();
      ctx.fillStyle = 'rgba(200,225,255,' + alpha + ')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connections near mouse
    if (mouse.on) {
      for (var i = 0; i < stars.length; i++) {
        var si = stars[i];
        var di = Math.hypot(mouse.x - si.x, mouse.y - si.y);
        if (di > MOUSE_RADIUS) continue;
        for (var j = i + 1; j < stars.length; j++) {
          var sj = stars[j];
          var dj = Math.hypot(mouse.x - sj.x, mouse.y - sj.y);
          if (dj > MOUSE_RADIUS) continue;
          var dd = Math.hypot(si.x - sj.x, si.y - sj.y);
          if (dd < MAX_DIST) {
            var a = (1 - dd / MAX_DIST) * (1 - di / MOUSE_RADIUS) * (1 - dj / MOUSE_RADIUS) * 0.5;
            ctx.beginPath();
            ctx.moveTo(si.x, si.y);
            ctx.lineTo(sj.x, sj.y);
            ctx.strokeStyle = 'rgba(160,205,245,' + a + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    // Constellations
    drawConstellations(time);

    // Gradient fade at bottom
    drawGradientFade();

    animId = requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
