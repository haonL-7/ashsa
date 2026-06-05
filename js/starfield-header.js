/**
 * Starfield Header v5 — amplified parallax + supernova click
 */
(function () {
  var canvas, ctx, W, H, H2, animId;
  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, clickX: 0, clickY: 0 };
  var explosions = [];

  var layers = [
    { count: 200, rMin: 0.4, rMax: 1.2, alpha: 0.6, parallax: 0.6, stars: [] },
    { count: 100, rMin: 0.8, rMax: 2.2, alpha: 0.7, parallax: 0.4, stars: [] },
    { count: 40,  rMin: 1.5, rMax: 3.0, alpha: 0.8, parallax: 0.18, stars: [] }
  ];

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
    var el = header || canvas;

    el.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / W;
      mouse.ty = (e.clientY - r.top) / H2;
    });

    el.addEventListener('click', function (e) {
      var r = canvas.getBoundingClientRect();
      var cx = e.clientX - r.left;
      var cy = e.clientY - r.top;
      triggerSupernova(cx, cy);
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
    canvas.width = W; canvas.height = H;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }

  function createStars(layerIdx) {
    var layer = layers[layerIdx];
    for (var i = 0; i < layer.count; i++) {
      layer.stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * (layer.rMax - layer.rMin) + layer.rMin,
        twinkle: Math.random() * Math.PI * 2,
        ts: Math.random() * 0.01 + 0.003,
        hue: Math.random() < 0.08 ? 40 + Math.random() * 20 : 210 + Math.random() * 30
      });
    }
  }

  function triggerSupernova(cx, cy) {
    // Find nearest star across all layers
    var best = null, bestDist = 40;
    for (var l = 0; l < layers.length; l++) {
      for (var i = 0; i < layers[l].stars.length; i++) {
        var s = layers[l].stars[i];
        var px = (mouse.x - 0.5) * 80 * layers[l].parallax;
        var py = (mouse.y - 0.5) * 80 * layers[l].parallax;
        var d = Math.hypot(cx - (s.x + px), cy - (s.y + py));
        if (d < bestDist && s.r > 1.2) { bestDist = d; best = { star: s, layer: l }; }
      }
    }
    if (best) {
      var px = (mouse.x - 0.5) * 80 * layers[best.layer].parallax;
      var py = (mouse.y - 0.5) * 80 * layers[best.layer].parallax;
      explosions.push({
        x: best.star.x + px, y: best.star.y + py,
        life: 0, maxLife: 1.8,
        particles: createExplosionParticles(best.star.x + px, best.star.y + py, best.star.hue)
      });
      // Respawn star elsewhere
      best.star.x = Math.random() * W;
      best.star.y = Math.random() * H;
    }
  }

  function createExplosionParticles(x, y, hue) {
    var p = [];
    for (var i = 0; i < 40; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 120 + 40;
      p.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, decay: Math.random() * 0.6 + 0.4,
        r: Math.random() * 2.5 + 1,
        hue: hue + (Math.random() - 0.5) * 30
      });
    }
    return p;
  }

  function drawExplosions(t) {
    for (var e = explosions.length - 1; e >= 0; e--) {
      var ex = explosions[e];
      ex.life += 0.016;
      var progress = ex.life / ex.maxLife;
      if (progress > 1) { explosions.splice(e, 1); continue; }

      var alpha = 1 - progress;
      var radius = progress * 150;

      // Expanding ring
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,220,180,' + (alpha * 0.6) + ')';
      ctx.lineWidth = 2 * (1 - progress);
      ctx.stroke();

      // Inner glow
      var grad = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, radius);
      grad.addColorStop(0, 'rgba(255,240,220,' + (alpha * 0.8) + ')');
      grad.addColorStop(0.3, 'rgba(255,180,100,' + (alpha * 0.4) + ')');
      grad.addColorStop(0.7, 'rgba(100,150,220,' + (alpha * 0.1) + ')');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, radius * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Particles
      for (var i = 0; i < ex.particles.length; i++) {
        var p = ex.particles[i];
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= p.decay * 0.016;
        if (p.life <= 0) continue;
        ctx.beginPath();
        ctx.fillStyle = 'hsla(' + p.hue + ',60%,80%,' + (p.life * alpha) + ')';
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
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
    var px = (mouse.x - 0.5) * 30;
    var py = (mouse.y - 0.5) * 30;
    for (var k = 0; k < cons.length; k++) {
      var c = cons[k];
      var cx = c.bx * W + px * 0.3;
      var cy = c.by * H + py * 0.3;
      var sc = H * 0.007 * c.scale;
      var pts = [];
      for (var j = 0; j < c.pts.length; j++) pts.push([cx + c.pts[j][0] * sc, cy + c.pts[j][1] * sc]);
      if (c.lines && c.lines.length) {
        ctx.strokeStyle = 'rgba(140,185,230,0.08)';
        ctx.lineWidth = 0.4;
        for (var j = 0; j < c.lines.length; j++) {
          var l = c.lines[j];
          ctx.beginPath(); ctx.moveTo(pts[l[0]][0], pts[l[0]][1]); ctx.lineTo(pts[l[1]][0], pts[l[1]][1]); ctx.stroke();
        }
      }
      for (var j = 0; j < pts.length; j++) {
        var sx = pts[j][0], sy = pts[j][1];
        var twinkle = 0.35 + Math.sin(t * 2 + j * 0.7) * 0.06;
        var grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5);
        grad.addColorStop(0, 'rgba(255,255,255,' + (twinkle * 0.9) + ')');
        grad.addColorStop(0.3, 'rgba(190,215,250,' + (twinkle * 0.15) + ')');
        grad.addColorStop(0.7, 'rgba(100,150,200,' + (twinkle * 0.04) + ')');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
      }
    }
  }

  function animate() {
    var t = performance.now() * 0.001;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    ctx.clearRect(0, 0, W, H);

    for (var l = 0; l < layers.length; l++) {
      var layer = layers[l];
      var px = (mouse.x - 0.5) * 100 * layer.parallax;
      var py = (mouse.y - 0.5) * 100 * layer.parallax;
      for (var i = 0; i < layer.stars.length; i++) {
        var s = layer.stars[i];
        s.x += Math.sin(t * 0.3 + i) * 0.008;
        s.y += Math.cos(t * 0.4 + i) * 0.008;
        if (s.x < -20) s.x = W + 20; if (s.x > W + 20) s.x = -20;
        if (s.y < -20) s.y = H + 20; if (s.y > H + 20) s.y = -20;
        var rx = s.x + px, ry = s.y + py;
        s.twinkle += s.ts;
        var alpha = layer.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
        if (l >= 1 && s.r > 1.5) {
          var grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, s.r * 2.5);
          grad.addColorStop(0, 'hsla(' + s.hue + ',40%,85%,' + (alpha * 0.5) + ')');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(rx, ry, s.r * 2.5, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
        }
        ctx.beginPath();
        ctx.fillStyle = 'hsla(' + s.hue + ',30%,85%,' + alpha + ')';
        ctx.arc(rx, ry, s.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    drawConstellations(t);
    drawExplosions(t);
    drawGradient();
    animId = requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
