/**
 * Starfield Header — constellation starfield with mouse interaction
 * Targets .starfield-header container, uses #sf-canvas
 */
(function () {
  var canvas, ctx, W, H, animId;
  var stars = [], STAR_COUNT = 280;
  var mouse = { x: -999, y: -999, on: false };
  var MAX_DIST = 90, MOUSE_RADIUS = 150;

  // Constellation definitions
  var cons = [
    { name: 'Orion', x: 0.68, y: 0.4, scale: 0.6,
      pts: [[0,0],[9,2],[16,1],[6,9],[-10,17],[-3,4],[4,-6]],
      lines: [[0,1],[1,2],[3,4],[0,3],[1,4],[5,6]] },
    { name: 'Big Dipper', x: 0.22, y: 0.28, scale: 0.5,
      pts: [[0,0],[11,-3],[20,1],[31,6],[25,16],[12,13],[3,9]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]] },
    { name: 'Cassiopeia', x: 0.4, y: 0.65, scale: 0.5,
      pts: [[0,6],[7,0],[14,9],[21,0],[28,6]],
      lines: [[0,1],[1,2],[2,3],[3,4]] },
    { name: 'Pleiades', x: 0.75, y: 0.35, scale: 0.45,
      pts: [[0,0],[3,3],[-2,5],[6,-2],[3,7],[-4,2],[5,4],[-3,-3],[2,-4]],
      lines: [] },
    { name: 'Andromeda', x: 0.3, y: 0.55, scale: 0.5,
      pts: [[0,0],[4,2],[8,-1],[12,3],[16,1],[20,4]],
      lines: [[0,1],[1,2],[2,3],[3,4],[4,5]] }
  ];

  function init() {
    canvas = document.getElementById('sf-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    createStars();
    window.addEventListener('resize', function () { stars.length = 0; resize(); createStars(); });
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mouseleave', function () { mouse.on = false; });
    animate();
  }

  function resize() {
    var hdr = document.querySelector('.starfield-header');
    W = hdr ? hdr.offsetWidth : canvas.parentElement.offsetWidth;
    H = hdr ? hdr.offsetHeight : canvas.parentElement.offsetHeight;
    canvas.width = W; canvas.height = H;
  }

  function onMouse(e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.on = true;
  }

  function createStars() {
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 2 + 0.5,
        bright: Math.random() * 0.5 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005
      });
    }
  }

  function drawConstellations() {
    for (var k = 0; k < cons.length; k++) {
      var c = cons[k];
      var cx = c.x * W, cy = c.y * H, sc = H * 0.011 * c.scale;
      var pts = [];
      for (var j = 0; j < c.pts.length; j++) {
        pts.push([cx + c.pts[j][0] * sc, cy + c.pts[j][1] * sc]);
      }

      // Draw lines
      if (c.lines && c.lines.length) {
        ctx.strokeStyle = 'rgba(140,185,230,0.12)';
        ctx.lineWidth = 0.5;
        for (var j = 0; j < c.lines.length; j++) {
          var l = c.lines[j];
          ctx.beginPath();
          ctx.moveTo(pts[l[0]][0], pts[l[0]][1]);
          ctx.lineTo(pts[l[1]][0], pts[l[1]][1]);
          ctx.stroke();
        }
      }

      // Draw stars
      for (var j = 0; j < pts.length; j++) {
        var sx = pts[j][0], sy = pts[j][1];
        var alpha = 0.35;
        if (mouse.on) {
          var d = Math.hypot(mouse.x - sx, mouse.y - sy);
          if (d < 80) alpha = Math.min(1, alpha + 0.65 * (1 - d / 80));
        }
        var grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 4);
        grad.addColorStop(0, 'rgba(255,255,255,' + (alpha * 0.95) + ')');
        grad.addColorStop(0.5, 'rgba(180,210,250,' + (alpha * 0.2) + ')');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    // Draw background stars with connections
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];

      // Irregular drift
      s.x += s.vx + Math.sin(Date.now() * 0.0003 + i) * 0.04;
      s.y += s.vy + Math.cos(Date.now() * 0.0004 + i) * 0.04;

      // Wrap around
      if (s.x < -10) s.x = W + 10;
      if (s.x > W + 10) s.x = -10;
      if (s.y < -10) s.y = H + 10;
      if (s.y > H + 10) s.y = -10;

      // Twinkle
      s.twinkle += s.twinkleSpeed;
      var alpha = s.bright + Math.sin(s.twinkle) * 0.15;

      // Boost near mouse
      if (mouse.on) {
        var d = Math.hypot(mouse.x - s.x, mouse.y - s.y);
        if (d < MOUSE_RADIUS) {
          alpha = Math.min(1, alpha + 0.4 * (1 - d / MOUSE_RADIUS));
        }
      }

      ctx.beginPath();
      ctx.fillStyle = 'rgba(200,220,255,' + alpha + ')';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw connections near mouse
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
            var a = (1 - dd / MAX_DIST) * (1 - di / MOUSE_RADIUS) * (1 - dj / MOUSE_RADIUS) * 0.4;
            ctx.beginPath();
            ctx.moveTo(si.x, si.y);
            ctx.lineTo(sj.x, sj.y);
            ctx.strokeStyle = 'rgba(160,200,240,' + a + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    // Draw constellations on top
    drawConstellations();

    animId = requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
